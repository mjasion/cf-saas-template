# CLAUDE.md

## Project Overview

cf-saas-template is a reusable SaaS starter template built on Cloudflare's edge platform. It provides authentication, database, session management, and a modern UI out of the box. Clone it and extend it for new SaaS projects.

## Architecture

```
cf-saas-template/
├── backend/                  # Hono API Worker
│   ├── src/
│   │   ├── index.ts          # App entry, Bindings type, routes
│   │   ├── db/
│   │   │   ├── index.ts      # createDb() / getDb()
│   │   │   └── schema.ts     # Drizzle schema (users table)
│   │   ├── lib/
│   │   │   ├── auth.ts       # Argon2id hashing, password validation
│   │   │   ├── jwt.ts        # JWT + refresh tokens + cookies
│   │   │   └── duration.ts   # Duration parser ("15m" → 900)
│   │   ├── middleware/
│   │   │   ├── auth.ts       # requireAuth / optionalAuth / requireAdmin
│   │   │   ├── error-handler.ts
│   │   │   └── rate-limit.ts # KV-based rate limiting
│   │   ├── routes/
│   │   │   └── auth.ts       # register, login, logout, refresh, validate-session
│   │   └── shared/
│   │       └── types.ts      # Session interface
│   ├── drizzle.config.ts
│   ├── wrangler.jsonc
│   └── package.json
├── frontend/                 # TanStack Start Worker
│   ├── src/
│   │   ├── components/
│   │   │   ├── bento/        # BentoGrid + BentoCard
│   │   │   ├── layout/       # AuthLayout
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── nav-user.tsx
│   │   │   └── landing-header.tsx
│   │   ├── lib/
│   │   │   ├── api-client.ts     # Service binding API client
│   │   │   ├── auth-session.ts   # getServerSession() SSR
│   │   │   ├── cookie-forward.ts # SSR cookie forwarding
│   │   │   ├── use-theme.ts      # Dark/light theme hook
│   │   │   ├── use-mobile.ts     # Mobile detection
│   │   │   └── utils.ts          # cn() helper
│   │   ├── routes/
│   │   │   ├── __root.tsx        # Root layout
│   │   │   ├── index.tsx         # Landing page
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx     # Auth guard + sidebar layout
│   │   │   └── dashboard.index.tsx
│   │   └── styles/
│   │       └── global.css        # Tailwind 4 + theme tokens
│   ├── public/robots.txt
│   ├── app.config.ts
│   ├── vite.config.ts
│   ├── wrangler.jsonc
│   └── package.json
├── scripts/
│   ├── lib/utils.sh          # Naming, logging, resource helpers
│   ├── deploy.sh             # Full deployment pipeline
│   └── setup-env.sh          # Create D1, KV, configure wrangler
├── e2e/
│   └── auth.spec.ts          # Playwright auth flow tests
├── .github/workflows/
│   └── deploy.yml            # CI/CD with semantic versioning
├── eslint.config.js
├── playwright.config.ts
├── pnpm-workspace.yaml
├── renovate.json5
└── package.json
```

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
- **Monorepo**: pnpm workspaces
- **E2E Testing**: Playwright
- **CI/CD**: GitHub Actions + 1Password for secrets

## Development Commands

```bash
# Root
pnpm install                   # Install all workspace deps
pnpm dev                       # Start backend (8788) + frontend (3000)
pnpm build                     # Build both workers
pnpm deploy                    # Deploy both workers
pnpm typecheck                 # TypeScript check across all packages
pnpm lint                      # ESLint
pnpm format                    # Prettier

# Database
pnpm db:generate               # Generate Drizzle migration from schema
pnpm db:migrate                # Apply migrations locally
pnpm db:migrate:prod           # Apply migrations to remote D1
pnpm db:studio                 # Open Drizzle Studio

# E2E tests (auto-starts dev servers)
pnpm test:e2e                  # Headed
pnpm test:e2e:headless         # Headless
pnpm test:e2e:ui               # Playwright UI mode
```

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

Components in `frontend/src/components/ui/`:

button, card, input, label, separator, tooltip, skeleton, sheet,
dropdown-menu, sidebar, theme-toggle, logo

### Conventions

- Import: `import { Button } from "@/components/ui/button"`
- Class merging: `import { cn } from "@/lib/utils"`
- Never modify shadcn base components directly — create wrapper components
- Add new components: `npx shadcn@latest add <name>` (from `frontend/`)

### Sidebar Pattern

- `SidebarProvider` wraps dashboard layout in `dashboard.tsx`
- `AppSidebar` has navigation groups (Overview: Dashboard, System: Settings)
- `NavUser` renders user email, theme toggle, settings, logout
- Test IDs: `app-sidebar`, `nav-user-trigger`, `logout-button`

## Code Conventions

### TypeScript

- Strict mode everywhere
- Path aliases: `@/*` → `src/*`
- Prefer `interface` over `type` for object shapes
- Never use `any` — prefer `unknown` with type guards

### Error Handling

- Backend returns `{ user: ... }` on success, `{ error: "message" }` on failure
- Frontend shows errors in inline alert boxes within forms
- Never expose stack traces or internal details to the client

### File Naming

- Components: kebab-case (`app-sidebar.tsx`)
- Utilities: camelCase (`utils.ts`)
- Routes: kebab-case matching URLs (`dashboard.index.tsx`)
- Schema: camelCase in code, snake_case in SQL columns

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

### Initial Setup

```bash
./scripts/setup-env.sh <env-name>   # Creates D1, KV, updates wrangler configs
cd backend && wrangler secret put JWT_SECRET
pnpm db:migrate:prod
```

### Deploy

```bash
./scripts/deploy.sh <env-name>      # Migrations + build + deploy both workers
```

### Environment Checklist

- [ ] D1 database created, ID in `backend/wrangler.jsonc`
- [ ] KV namespace created, ID in `backend/wrangler.jsonc`
- [ ] `JWT_SECRET` set via `wrangler secret put`
- [ ] `APP_COOKIE_PREFIX` set in both wrangler configs
- [ ] Migrations applied
- [ ] Service binding name matches backend worker name
