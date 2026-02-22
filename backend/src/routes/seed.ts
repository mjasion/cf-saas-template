import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../index.js';
import { createDb } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword } from '../lib/auth.js';

const app = new Hono<{ Bindings: Bindings }>();

const SEED_USERS = [
  { email: 'admin@example.com', password: 'admin', role: 'admin' as const },
  { email: 'user@example.com', password: 'user', role: 'user' as const },
  { email: 'demo@example.com', password: 'demo', role: 'user' as const },
];

// POST /a/seed — insert seed users (skips existing)
app.post('/', async (c) => {
  const db = createDb(c.env.DB);
  const now = new Date();
  const created: string[] = [];
  const skipped: string[] = [];

  for (const seed of SEED_USERS) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, seed.email))
      .get();

    if (existing) {
      skipped.push(seed.email);
      continue;
    }

    const passwordHash = await hashPassword(seed.password);
    await db.insert(users).values({
      email: seed.email,
      passwordHash,
      role: seed.role,
      createdAt: now,
      updatedAt: now,
    });
    created.push(seed.email);
  }

  return c.json({ created, skipped });
});

export default app;
