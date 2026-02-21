#!/usr/bin/env node
// Seed local D1 with admin user
// Usage: node scripts/seed.mjs (from backend/)

import { argon2id } from '@noble/hashes/argon2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { execSync } from 'node:child_process';

const ARGON2_PARAMS = { t: 3, m: 8193, p: 1 };

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

const password = 'admin';
const salt = randomBytes(16);
const hash = argon2id(password, salt, ARGON2_PARAMS);
const combined = new Uint8Array(salt.length + hash.length);
combined.set(salt, 0);
combined.set(hash, salt.length);
const passwordHash = bytesToBase64(combined);

const now = Math.floor(Date.now() / 1000);
const sql = `INSERT OR REPLACE INTO users (email, password_hash, role, created_at, updated_at) VALUES ('admin@localhost', '${passwordHash}', 'admin', ${now}, ${now});`;

console.log('Seeding local D1 with admin@localhost / admin ...');
execSync(`wrangler d1 execute cf-saas-template --local --command "${sql}"`, {
  stdio: 'inherit',
});
console.log('Done.');
