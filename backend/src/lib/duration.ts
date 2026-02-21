// Duration string parser for token expiration configuration
// Supports: "15m" (minutes), "1h" (hours), "30d" (days)

const DURATION_RE = /^(\d+)\s*(m|h|d)$/;

const MULTIPLIERS: Record<string, number> = {
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

export function parseDuration(value: string): number {
  const match = value.trim().match(DURATION_RE);
  if (!match) {
    throw new Error(
      `Invalid duration format: "${value}". Expected format: <number><unit> where unit is m (minutes), h (hours), or d (days).`,
    );
  }
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  return amount * MULTIPLIERS[unit];
}

export function getTokenTTLs(env: {
  ACCESS_TOKEN_EXPIRES_IN?: string;
  REFRESH_TOKEN_EXPIRES_IN?: string;
}) {
  return {
    accessTTL: parseDuration(env.ACCESS_TOKEN_EXPIRES_IN || '15m'),
    refreshTTL: parseDuration(env.REFRESH_TOKEN_EXPIRES_IN || '30d'),
  };
}
