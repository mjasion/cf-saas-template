import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { Bindings } from '../index.js';
import type { Session } from '@/shared/types';
import {
  verifyAccessToken,
  verifyRefreshToken,
  createAccessToken,
  createAccessCookie,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
} from '../lib/jwt.js';
import { getTokenTTLs } from '../lib/duration.js';

export type AuthContext = {
  Variables: {
    session: Session;
    user: Session;
  };
};

function getCookiePrefix(env: Bindings): string {
  return env.APP_COOKIE_PREFIX || 'app';
}

async function authenticateRequest(
  c: Context<{ Bindings: Bindings } & AuthContext>,
): Promise<Session | null> {
  const prefix = getCookiePrefix(c.env);

  // 1. Try access token (stateless)
  const accessToken = getAccessTokenFromRequest(c.req.raw, prefix);
  if (accessToken) {
    const payload = await verifyAccessToken(c.env.JWT_SECRET, accessToken);
    if (payload) {
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  // 2. Try refresh token (KV-backed)
  const refreshToken = getRefreshTokenFromRequest(c.req.raw, prefix);
  if (!refreshToken) return null;

  const refreshData = await verifyRefreshToken(c.env.SESSIONS, refreshToken);
  if (!refreshData) return null;

  // Look up email from D1 (only hit once per access token expiry)
  const { createDb } = await import('../db/index.js');
  const { users } = await import('../db/schema.js');
  const { eq } = await import('drizzle-orm');

  const db = createDb(c.env.DB);
  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, refreshData.userId))
    .get();

  if (!user) return null;

  // 3. Issue new access token
  const { accessTTL } = getTokenTTLs(c.env);
  const newAccessToken = await createAccessToken(c.env.JWT_SECRET, {
    sub: refreshData.userId,
    email: user.email,
    role: refreshData.role,
  }, accessTTL);

  c.header('Set-Cookie', createAccessCookie(prefix, newAccessToken, accessTTL), { append: true });

  return {
    userId: refreshData.userId,
    email: user.email,
    role: refreshData.role,
  };
}

export const requireAuth = createMiddleware<{ Bindings: Bindings } & AuthContext>(
  async (c, next) => {
    const session = await authenticateRequest(c);

    if (!session) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401,
      );
    }

    c.set('session', session);
    c.set('user', session);

    await next();
  },
);

export const requireAdmin = createMiddleware<{ Bindings: Bindings } & AuthContext>(
  async (c, next) => {
    const session = await authenticateRequest(c);

    if (!session) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401,
      );
    }

    if (session.role !== 'admin') {
      return c.json(
        {
          error: 'Forbidden',
          message: 'Administrator access required',
        },
        403,
      );
    }

    c.set('session', session);
    c.set('user', session);

    await next();
  },
);

export const optionalAuth = createMiddleware<{ Bindings: Bindings } & AuthContext>(
  async (c, next) => {
    const session = await authenticateRequest(c);

    if (session) {
      c.set('session', session);
      c.set('user', session);
    }

    await next();
  },
);

export function getSession(c: Context<{ Bindings: Bindings } & AuthContext>): Session {
  return c.get('session');
}

export function getUser(c: Context<{ Bindings: Bindings } & AuthContext>): Session {
  return c.get('user');
}
