# cf-saas-template

A reusable SaaS starter template built on Cloudflare's edge platform. Provides authentication, database, session management, and a modern UI out of the box.

## Getting Started

```bash
pnpm install          # Install dependencies
pnpm db:migrate       # Apply database migrations locally
pnpm db:seed          # Seed local DB with admin user
pnpm dev              # Start backend (8788) + frontend (3000)
```

## Seed Data

The seed script creates a default admin user in the local D1 database for development:

| Field    | Value              |
| -------- | ------------------ |
| Email    | `admin@localhost`  |
| Password | `admin`            |
| Role     | `admin`            |

### Commands

```bash
pnpm db:seed          # Seed admin user (from root)
pnpm db:reset         # Wipe local DB, re-apply migrations, and re-seed
```

`db:reset` removes the local `.wrangler/state` directory, re-runs all migrations, and seeds the admin user in a single step.

> **Note:** The seed script is for local development only. Never run it against production.