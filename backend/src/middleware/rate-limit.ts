import { createMiddleware } from 'hono/factory';
import type { Bindings } from '../index.js';

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimit(config: RateLimitConfig) {
  return createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
    const ip = getClientIp(c.req.raw);
    const key = `${config.keyPrefix || 'rl'}:${ip}`;

    const data = await c.env.SESSIONS.get(key);
    let count = 0;
    let windowStart = Date.now();

    if (data) {
      const parsed = JSON.parse(data);
      count = parsed.count;
      windowStart = parsed.windowStart;

      if (Date.now() - windowStart > config.windowMs) {
        count = 0;
        windowStart = Date.now();
      }
    }

    if (count >= config.maxRequests) {
      const retryAfter = Math.ceil((windowStart + config.windowMs - Date.now()) / 1000);
      c.header('Retry-After', retryAfter.toString());
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', Math.ceil((windowStart + config.windowMs) / 1000).toString());

      return c.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        },
        429
      );
    }

    count++;
    const ttlSeconds = Math.ceil(config.windowMs / 1000);
    await c.env.SESSIONS.put(key, JSON.stringify({ count, windowStart }), {
      expirationTtl: ttlSeconds,
    });

    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', (config.maxRequests - count).toString());
    c.header('X-RateLimit-Reset', Math.ceil((windowStart + config.windowMs) / 1000).toString());

    await next();
  });
}

export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 1000,
  keyPrefix: 'rate_limiting:login',
});

export const registerRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 1000,
  keyPrefix: 'rate_limiting:register',
});
