// JWT authentication using Web Crypto API (HMAC-SHA256)
// Access tokens are stateless; refresh tokens are stored in KV for revocation
// Cookie names are configurable via APP_COOKIE_PREFIX env var

import { generateSecureToken } from './auth.js';

export function getAccessCookieName(prefix: string) {
  return `${prefix}-access-token`;
}

export function getRefreshCookieName(prefix: string) {
  return `${prefix}-refresh-token`;
}

export interface JWTPayload {
  sub: number;       // userId
  email: string;
  role: 'user' | 'admin';
  iat: number;       // issued at (seconds)
  exp: number;       // expiration (seconds)
}

interface RefreshTokenData {
  userId: number;
  role: 'user' | 'admin';
  createdAt: number;
  expiresAt: number;
}

// --- Base64url helpers ---

function base64UrlEncode(data: Uint8Array): string {
  const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binString = atob(padded);
  return Uint8Array.from(binString, (char) => char.codePointAt(0)!);
}

function encodeJSON(obj: unknown): string {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)));
}

// --- HMAC-SHA256 signing/verification ---

async function getSigningKey(secret: string): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const key = await getSigningKey(secret);
  const sigBytes = base64UrlDecode(signature);
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
}

// --- Access Token (JWT) ---

export async function createAccessToken(
  secret: string,
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  ttlSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = encodeJSON({ alg: 'HS256', typ: 'JWT' });
  const body = encodeJSON(fullPayload);
  const unsigned = `${header}.${body}`;
  const sig = await sign(unsigned, secret);

  return `${unsigned}.${sig}`;
}

export async function verifyAccessToken(
  secret: string,
  token: string,
): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const unsigned = `${header}.${body}`;

    const valid = await verify(unsigned, sig, secret);
    if (!valid) return null;

    const payload: JWTPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(body)),
    );

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// --- Refresh Token (KV-backed) ---

export async function createRefreshToken(
  kv: KVNamespace,
  userId: number,
  role: 'user' | 'admin',
  ttlSeconds: number,
): Promise<string> {
  const token = generateSecureToken(32);
  const now = Math.floor(Date.now() / 1000);

  const data: RefreshTokenData = {
    userId,
    role,
    createdAt: now,
    expiresAt: now + ttlSeconds,
  };

  await kv.put(`refresh:${token}`, JSON.stringify(data), {
    expirationTtl: ttlSeconds,
  });

  return token;
}

export async function verifyRefreshToken(
  kv: KVNamespace,
  token: string,
): Promise<RefreshTokenData | null> {
  if (!token) return null;

  try {
    const raw = await kv.get(`refresh:${token}`, 'text');
    if (!raw) return null;

    const data: RefreshTokenData = JSON.parse(raw);

    const now = Math.floor(Date.now() / 1000);
    if (now > data.expiresAt) {
      await kv.delete(`refresh:${token}`);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function invalidateRefreshToken(
  kv: KVNamespace,
  token: string,
): Promise<void> {
  await kv.delete(`refresh:${token}`);
}

// --- Cookie helpers ---

function buildCookie(name: string, value: string, maxAge: number): string {
  return [
    `${name}=${value}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

function buildDeleteCookie(name: string): string {
  return [
    `${name}=`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ].join('; ');
}

export function createAccessCookie(prefix: string, token: string, ttlSeconds: number): string {
  return buildCookie(getAccessCookieName(prefix), token, ttlSeconds);
}

export function createRefreshCookie(prefix: string, token: string, ttlSeconds: number): string {
  return buildCookie(getRefreshCookieName(prefix), token, ttlSeconds);
}

export function clearAuthCookies(prefix: string): [string, string] {
  return [
    buildDeleteCookie(getAccessCookieName(prefix)),
    buildDeleteCookie(getRefreshCookieName(prefix)),
  ];
}

// --- Cookie extraction ---

export function getAccessTokenFromRequest(request: Request, prefix: string): string | null {
  return getTokenFromCookie(request, getAccessCookieName(prefix));
}

export function getRefreshTokenFromRequest(request: Request, prefix: string): string | null {
  return getTokenFromCookie(request, getRefreshCookieName(prefix));
}

function getTokenFromCookie(request: Request, cookieName: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(`${cookieName}=`));
  if (!match) return null;

  return match.substring(cookieName.length + 1);
}
