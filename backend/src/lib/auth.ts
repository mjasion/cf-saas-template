// Authentication utilities — Argon2id password hashing
// OWASP recommended, optimized for Cloudflare Workers CPU limits

import { argon2id } from '@noble/hashes/argon2.js';
import { randomBytes } from '@noble/hashes/utils.js';

// Argon2id parameters tuned for Cloudflare Workers
// t: time cost (iterations) = 3 (OWASP standard)
// m: memory cost in KiB = 8192 (8 MB) — balanced for Workers CPU limits
// p: parallelism = 1 (Workers are single-threaded)
const ARGON2_PARAMS = {
  t: 3,
  m: 8193,
  p: 1,
};

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 1) {
    throw new Error('Password is required');
  }

  const salt = randomBytes(16);
  const hash = argon2id(password, salt, ARGON2_PARAMS);

  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt, 0);
  combined.set(hash, salt.length);

  return bytesToBase64(combined);
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const combined = base64ToBytes(storedHash);
    const salt = combined.subarray(0, 16);
    const originalHash = combined.subarray(16);

    const testHash = argon2id(password, salt, ARGON2_PARAMS);

    // Constant-time comparison to prevent timing attacks
    if (testHash.length !== originalHash.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < testHash.length; i++) {
      result |= testHash[i] ^ originalHash[i];
    }

    return result === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < 1) {
    errors.push('Password is required');
  }

  if (password.length > 128) {
    errors.push('Password must be at most 128 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function generateSecureToken(bytes = 32): string {
  return bytesToBase64Url(randomBytes(bytes));
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (char) => char.codePointAt(0)!);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
