# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

cf-saas-template is a reusable SaaS starter template built on Cloudflare's edge platform. It provides authentication, database, session management, and a modern UI out of the box. Clone it and extend it for new SaaS projects.

## Architecture

**Monorepo with two Cloudflare Workers** managed by pnpm workspaces:

- `backend/` — Hono API Worker (port 8788). Handles auth, database, and business logic. Routes are prefixed `/a/`.
- `frontend/` — TanStack Start Worker (port 3000). React 19 SSR with file-based routing. Calls backend via Cloudflare service binding (no HTTP round-trip).

**Frontend → Backend communication**: The frontend worker calls the backend worker directly using a Cloudflare service binding (`env.API.fetch()`). In SSR server functions, `env` is imported from `cloudflare:workers`. The base URL `http://api.internal` is used (hostname is ignored by the service binding; only the path matters). Cookies are forwarded from the browser request to the backend and `Set-Cookie` headers are forwarded back.

**Key architectural files**:
- `backend/src/index.ts` — App entry, `Bindings` type, route mounting
- `backend/src/db/schema.ts` — Drizzle schema (users table)
- `backend/src/lib/jwt.ts` — JWT + refresh tokens + cookie management
- `backend/src/middleware/auth.ts` — `requireAuth` / `optionalAuth` / `requireAdmin`
- `frontend/src/lib/api-client.ts` — Service binding API client
- `frontend/src/lib/auth-session.ts` — `getServerSession()` SSR function
- `frontend/src/routes/__root.tsx` — Root layout, FOUC prevention script
- `frontend/src/routes/dashboard.tsx` — Auth guard + sidebar layout

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Backend**: Hono v4 + Zod validation
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Sessions**: Cloudflare KV (refresh tokens)
- **Frontend**: TanStack Start (React 19, file-based routing, SSR)
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **UI**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Auth**: JWT access tokens (stateless) + KV refresh tokens (stateful)
- **Password Hashing**: Argon2id (t=3, m=8193, p=1) via @noble/hashes
- **E2E Testing**: Playwright
- **CI/CD**: GitHub Actions + 1Password for secrets

## Development Commands

```bash
# Development
pnpm install                   # Install all workspace deps
pnpm dev                       # Start backend (8788) + frontend (3000) concurrently
pnpm dev:backend               # Start backend only
pnpm dev:frontend              # Start frontend only
pnpm build                     # Build both workers
pnpm typecheck                 # TypeScript check across all packages
pnpm lint                      # ESLint
pnpm lint:fix                  # ESLint with auto-fix
pnpm format                    # Prettier write
pnpm format:check              # Prettier check only

# Database
pnpm db:generate               # Generate Drizzle migration from schema changes
pnpm db:migrate                # Apply migrations locally
pnpm db:migrate:prod           # Apply migrations to remote D1
pnpm db:seed                   # Seed local DB with admin user
pnpm db:reset                  # Wipe local DB, re-apply migrations, and re-seed
pnpm db:studio                 # Open Drizzle Studio

# E2E tests (auto-starts dev servers via webServer config)
pnpm test:e2e                  # Headed (all browsers)
pnpm test:e2e:headless         # Headless (all browsers)
pnpm test:e2e:ui               # Playwright UI mode
pnpm test:e2e:report           # View last test report

# Run a single E2E test file
npx playwright test e2e/auth.spec.ts
# Run a specific test by name
npx playwright test -g "test name"
# Run in a specific browser
npx playwright test --project=chromium
```

### Seed Data (local dev only)

`pnpm db:seed` creates a default admin user:

| Field    | Value             |
| -------- | ----------------- |
| Email    | `admin@localhost` |
| Password | `admin`           |
| Role     | `admin`           |

## Environment Variables & Bindings

### Backend (`backend/wrangler.jsonc`)

| Binding/Variable          | Type   | Description                         |
| ------------------------- | ------ | ----------------------------------- |
| `DB`                      | D1     | Cloudflare D1 database              |
| `SESSIONS`                | KV     | KV namespace for refresh tokens     |
| `JWT_SECRET`              | Secret | HMAC-SHA256 JWT signing key         |
| `APP_COOKIE_PREFIX`       | Var    | Cookie name prefix (default: `app`) |
| `ACCESS_TOKEN_EXPIRES_IN` | Var    | Access token TTL (default: `15m`)   |
| `REFRESH_TOKEN_EXPIRES_IN`| Var    | Refresh token TTL (default: `30d`)  |
| `APP_VERSION`             | Var    | Set by deploy script                |

### Frontend (`frontend/wrangler.jsonc`)

| Binding/Variable    | Type    | Description                           |
| ------------------- | ------- | ------------------------------------- |
| `API`               | Service | Service binding to backend worker     |
| `APP_URL`           | Var     | Public URL (default: `localhost:3000`) |
| `APP_COOKIE_PREFIX` | Var     | Must match backend prefix             |

### Setting Secrets

```bash
cd backend && wrangler secret put JWT_SECRET
```

For local dev, create `backend/.dev.vars`:
```
JWT_SECRET=your-local-dev-secret-minimum-32-chars
```

## Cookie Prefix Configuration

`APP_COOKIE_PREFIX` controls all cookie and localStorage key names:

- Cookies: `{prefix}-access-token`, `{prefix}-refresh-token`
- localStorage: `{prefix}-theme`, `{prefix}-sidebar`
- Default: `app` (producing `app-access-token`, etc.)
- FOUC script in `__root.tsx` reads `{prefix}-theme`

To customize for a new project, change `APP_COOKIE_PREFIX` in **both** `backend/wrangler.jsonc` and `frontend/wrangler.jsonc`.

## Authentication Flow

1. **Register/Login**: `POST /a/auth/register` or `POST /a/auth/login`
   - Validates credentials, issues JWT access token + random refresh token
   - Refresh token stored in KV as `refresh:{token}` → `{userId, role}`
   - Both tokens set as `HttpOnly; Secure; SameSite=Lax; Path=/` cookies

2. **Authenticated Requests**: Frontend SSR calls `GET /a/auth/validate-session` via service binding
   - Verifies access token; if expired, auto-refreshes from KV refresh token

3. **Token Refresh**: `POST /a/auth/refresh`
   - Validates KV token, issues new access token

4. **Logout**: `POST /a/auth/logout`
   - Deletes refresh token from KV, clears both cookies

| Token          | Storage    | TTL    | Format      |
| -------------- | ---------- | ------ | ----------- |
| Access Token   | Cookie     | 15 min | JWT HS256   |
| Refresh Token  | Cookie+KV  | 30 days| Random hex  |

## API Endpoints

| Method | Path                       | Auth   | Description              |
| ------ | -------------------------- | ------ | ------------------------ |
| POST   | `/a/auth/register`         | Public | Create account           |
| POST   | `/a/auth/login`            | Public | Sign in                  |
| POST   | `/a/auth/logout`           | Cookie | End session              |
| POST   | `/a/auth/refresh`          | Cookie | Refresh access token     |
| GET    | `/a/auth/validate-session` | Cookie | SSR session validation   |
| GET    | `/a/health`                | Public | Health check             |
| GET    | `/a/status`                | Public | Status + DB connectivity |
| GET    | `/a/config`                | Public | Public config            |

## Database

### Schema (`backend/src/db/schema.ts`)

```
users: id (int PK), email (text unique), passwordHash (text),
       role (user|admin), privacyAcceptedAt (timestamp?),
       createdAt (timestamp), updatedAt (timestamp)
```

### Migrations

```bash
# 1. Edit schema.ts
# 2. Generate SQL
pnpm db:generate
# 3. Apply locally
pnpm db:migrate
# 4. Apply to production
pnpm db:migrate:prod
```

Never modify a migration file after it has been applied.

## Design System — Bento Grid

**All dashboard and landing page layouts MUST use the bento grid system.**

### Layout

```tsx
<BentoGrid columns={3}>  {/* or columns={4} */}
  <BentoCard index={0}>Standard 1x1</BentoCard>
  <BentoCard colSpan={2} index={1}>Featured 2x1</BentoCard>
  <BentoCard rowSpan={2} index={2}>Tall 1x2</BentoCard>
  <BentoCard colSpan={2} rowSpan={2} index={3}>Hero 2x2</BentoCard>
</BentoGrid>
```

### Card Variants

| Variant     | Props               | Use Case                         |
| ----------- | ------------------- | -------------------------------- |
| Standard    | (default)           | Stats, quick actions             |
| Featured    | `colSpan={2}`       | Charts, summaries                |
| Tall        | `rowSpan={2}`       | Lists, activity feeds            |
| Hero        | `colSpan={2} rowSpan={2}` | Main widget, onboarding    |
| Interactive | `interactive`       | Clickable cards with hover       |
| Glass       | `glass`             | Glassmorphism effect             |

### Responsive: 3 → 2 → 1 column pattern

- Desktop (≥1024px): full columns
- Tablet (≥768px): 2 columns
- Mobile (<768px): 1 column

### Animation

Cards use `bento-fade-in` with stagger animation (100ms increments via `index` prop). Animations respect `prefers-reduced-motion`.

### Anti-Patterns (NEVER)

- Gap other than `gap-6` (1.5rem)
- Sharp corners — always `rounded-2xl`
- Solid/opaque card backgrounds
- Spans exceeding 2×2
- More than 8 cards per grid section

## UI Components (shadcn/ui)

Components in `frontend/src/components/ui/`. Add new ones with `npx shadcn@latest add <name>` from the `frontend/` directory.

### Conventions

- Import: `import { Button } from "@/components/ui/button"`
- Class merging: `import { cn } from "@/lib/utils"`
- Never modify shadcn base components directly — create wrapper components
- `SidebarProvider` wraps dashboard layout in `dashboard.tsx`
- Test IDs: `app-sidebar`, `nav-user-trigger`, `logout-button`

## Code Conventions

### TypeScript

- Strict mode everywhere
- Path aliases: `@/*` → `src/*`
- Prefer `interface` over `type` for object shapes
- Never use `any` — prefer `unknown` with type guards
- Use `type` imports when importing only types (`import type { Foo }`)  — enforced by ESLint `consistent-type-imports`
- Unused vars prefixed with `_` are allowed

### File Naming

- Components: kebab-case (`app-sidebar.tsx`)
- Utilities: camelCase (`utils.ts`)
- Routes: kebab-case matching URLs (`dashboard.index.tsx`)
- Schema: camelCase in code, snake_case in SQL columns

### Error Handling

- Backend returns `{ user: ... }` on success, `{ error: "message" }` on failure
- Frontend shows errors in inline alert boxes within forms

## Critical Rules

### NEVER

- Hardcode secrets — use `wrangler secret put`
- Skip auth middleware on protected routes
- Use `any` type
- Commit `.dev.vars` or wrangler configs with real credentials
- Modify applied migration files
- Use `innerHTML` or `dangerouslySetInnerHTML`
- Store sensitive data in localStorage — use HttpOnly cookies
- Break the bento grid layout system
- Modify shadcn base components in `components/ui/` directly
- Remove `data-testid` attributes (E2E tests depend on them)

### ALWAYS

- Validate user input on both frontend and backend
- Use parameterized queries via Drizzle ORM (never raw SQL interpolation)
- Run `pnpm db:generate` after modifying schema.ts
- Test auth flows after modifying auth code (`pnpm test:e2e`)
- Use the bento grid system for new page layouts
- Set `HttpOnly; Secure; SameSite=Lax; Path=/` on auth cookies
- Delete old refresh token from KV before issuing new one (rotation)
- Use `credentials: "include"` in frontend fetch calls

## Deployment

```bash
# Initial setup
./scripts/setup-env.sh <env-name>   # Creates D1, KV, updates wrangler configs
cd backend && wrangler secret put JWT_SECRET
pnpm db:migrate:prod

# Deploy
./scripts/deploy.sh <env-name>      # Migrations + build + deploy both workers
```
