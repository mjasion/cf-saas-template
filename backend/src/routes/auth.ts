import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z, type ZodType } from 'zod';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../index.js';
import { createDb } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../lib/auth.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  createAccessCookie,
  createRefreshCookie,
  clearAuthCookies,
  getRefreshTokenFromRequest,
  verifyAccessToken,
  getAccessTokenFromRequest,
} from '../lib/jwt.js';
import { getTokenTTLs } from '../lib/duration.js';
import { requireAuth, type AuthContext } from '../middleware/auth.js';
import { loginRateLimit, registerRateLimit } from '../middleware/rate-limit.js';

const app = new Hono<{ Bindings: Bindings }>();

function getCookiePrefix(env: Bindings): string {
  return env.APP_COOKIE_PREFIX || 'app';
}

/** zValidator wrapper that returns `{ error: "..." }` on failure instead of raw Zod issues. */
function jsonValidator<T extends ZodType>(schema: T) {
  return zValidator('json' as keyof ValidationTargets, schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      return c.json({ error: messages.join('. ') }, 400);
    }
  });
}

// Accepts user@host (no TLD required) for local dev compatibility
const email = z.string().regex(/^[^\s@]+@[^\s@]+$/, 'Please enter a valid email address');

// POST /a/auth/register
const registerSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

app.post('/register', registerRateLimit, jsonValidator(registerSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const prefix = getCookiePrefix(c.env);

  const db = createDb(c.env.DB);

  // Check if user already exists
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).get();
  if (existing) {
    return c.json({ error: 'An account with this email already exists' }, 409);
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const result = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    role: 'user',
    createdAt: now,
    updatedAt: now,
  }).returning({ id: users.id, email: users.email, role: users.role });

  const user = result[0];
  if (!user) {
    return c.json({ error: 'Failed to create account' }, 500);
  }

  // Issue tokens
  const { accessTTL, refreshTTL } = getTokenTTLs(c.env);

  const accessToken = await createAccessToken(c.env.JWT_SECRET, {
    sub: user.id,
    email: user.email,
    role: user.role as 'user' | 'admin',
  }, accessTTL);

  const refreshToken = await createRefreshToken(
    c.env.SESSIONS,
    user.id,
    user.role as 'user' | 'admin',
    refreshTTL,
  );

  c.header('Set-Cookie', createAccessCookie(prefix, accessToken, accessTTL), { append: true });
  c.header('Set-Cookie', createRefreshCookie(prefix, refreshToken, refreshTTL), { append: true });

  return c.json({
    user: { id: user.id, email: user.email, role: user.role },
  }, 201);
});

// POST /a/auth/login
const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

app.post('/login', loginRateLimit, jsonValidator(loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const prefix = getCookiePrefix(c.env);

  const db = createDb(c.env.DB);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .get();

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  // Issue tokens
  const { accessTTL, refreshTTL } = getTokenTTLs(c.env);

  const accessToken = await createAccessToken(c.env.JWT_SECRET, {
    sub: user.id,
    email: user.email,
    role: user.role as 'user' | 'admin',
  }, accessTTL);

  const refreshToken = await createRefreshToken(
    c.env.SESSIONS,
    user.id,
    user.role as 'user' | 'admin',
    refreshTTL,
  );

  c.header('Set-Cookie', createAccessCookie(prefix, accessToken, accessTTL), { append: true });
  c.header('Set-Cookie', createRefreshCookie(prefix, refreshToken, refreshTTL), { append: true });

  return c.json({
    user: { id: user.id, email: user.email, role: user.role },
  });
});

// POST /a/auth/logout
app.post('/logout', async (c) => {
  const prefix = getCookiePrefix(c.env);

  // Invalidate refresh token if present
  const refreshToken = getRefreshTokenFromRequest(c.req.raw, prefix);
  if (refreshToken) {
    await invalidateRefreshToken(c.env.SESSIONS, refreshToken);
  }

  const [clearAccess, clearRefresh] = clearAuthCookies(prefix);
  c.header('Set-Cookie', clearAccess, { append: true });
  c.header('Set-Cookie', clearRefresh, { append: true });

  return c.json({ success: true });
});

// POST /a/auth/refresh
app.post('/refresh', async (c) => {
  const prefix = getCookiePrefix(c.env);

  const refreshToken = getRefreshTokenFromRequest(c.req.raw, prefix);
  if (!refreshToken) {
    return c.json({ error: 'No refresh token' }, 401);
  }

  const refreshData = await verifyRefreshToken(c.env.SESSIONS, refreshToken);
  if (!refreshData) {
    return c.json({ error: 'Invalid refresh token' }, 401);
  }

  // Look up email
  const db = createDb(c.env.DB);
  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, refreshData.userId))
    .get();

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const { accessTTL } = getTokenTTLs(c.env);
  const accessToken = await createAccessToken(c.env.JWT_SECRET, {
    sub: refreshData.userId,
    email: user.email,
    role: refreshData.role,
  }, accessTTL);

  c.header('Set-Cookie', createAccessCookie(prefix, accessToken, accessTTL), { append: true });

  return c.json({ success: true });
});

// GET /a/auth/validate-session — for frontend SSR session check
app.get('/validate-session', async (c) => {
  const prefix = getCookiePrefix(c.env);

  // Try access token first
  const accessToken = getAccessTokenFromRequest(c.req.raw, prefix);
  if (accessToken) {
    const payload = await verifyAccessToken(c.env.JWT_SECRET, accessToken);
    if (payload) {
      return c.json({
        user: { email: payload.email },
      });
    }
  }

  // Try refresh token
  const refreshToken = getRefreshTokenFromRequest(c.req.raw, prefix);
  if (!refreshToken) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const refreshData = await verifyRefreshToken(c.env.SESSIONS, refreshToken);
  if (!refreshData) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Look up email and issue new access token
  const db = createDb(c.env.DB);
  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, refreshData.userId))
    .get();

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const { accessTTL } = getTokenTTLs(c.env);
  const newAccessToken = await createAccessToken(c.env.JWT_SECRET, {
    sub: refreshData.userId,
    email: user.email,
    role: refreshData.role,
  }, accessTTL);

  c.header('Set-Cookie', createAccessCookie(prefix, newAccessToken, accessTTL), { append: true });

  return c.json({
    user: { email: user.email },
  });
});

export default app;
