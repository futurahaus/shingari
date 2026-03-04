# Shingari

Monorepo for Shingari: NestJS backend API + Next.js frontend.

## Prerequisites

- Node.js 18+
- Yarn
- PostgreSQL
- Redis (for backend cache)
- Supabase account

## Quick Start

1. **Clone and install**

   ```bash
   git clone https://github.com/futurahaus/shingari.git
   cd shingari
   yarn install
   ```

2. **Environment setup**

   - Copy root `.env.example` to `apps/backend/.env`
   - Copy frontend section from `.env.example` to `apps/frontend/.env.local`
   - Fill in required variables (see [Environment Variables](#environment-variables))

3. **Database migrations**

   ```bash
   cd apps/backend && npx prisma migrate dev
   cd ../..
   ```

4. **Start development**

   ```bash
   yarn dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Swagger docs: http://localhost:3001/api-docs

## Commands

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `yarn dev`        | Run frontend + backend in dev mode   |
| `yarn dev:frontend` | Run frontend only (port 3000)      |
| `yarn dev:backend`  | Run backend only (port 3001)       |
| `yarn build`      | Build all workspaces                 |
| `yarn test`       | Run tests in all workspaces          |

### Backend (apps/backend)

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run start:dev` | Start with watch mode        |
| `npm run start:prod` | Start production build      |
| `npx prisma migrate dev` | Run migrations           |
| `npx prisma generate` | Regenerate Prisma client |

### Frontend (apps/frontend)

| Command   | Description        |
| --------- | ------------------ |
| `npm run dev`  | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production |

## Environment Variables

See [.env.example](.env.example) for the full list. Required variables:

### Backend (apps/backend/.env)

| Variable                 | Required | Description                    |
| ------------------------ | -------- | ------------------------------ |
| DATABASE_URL             | Yes      | PostgreSQL connection string   |
| SUPABASE_URL             | Yes      | Supabase project URL           |
| SUPABASE_ANON_KEY        | Yes      | Supabase anon/public key       |
| SUPABASE_SERVICE_ROLE_KEY| Yes      | Supabase service role key      |
| JWT_ACCESS_SECRET        | Yes      | JWT access token secret       |
| JWT_REFRESH_SECRET       | Yes      | JWT refresh token secret       |
| SENDGRID_API_KEY         | Yes      | SendGrid API key for email     |
| SENDGRID_SENDER_EMAIL    | Yes      | Verified sender email          |
| FRONTEND_URL             | Yes      | Frontend URL (e.g. http://localhost:3000) |

Optional: `EVOLUTION_API_*`, `ADMIN_WHATSAPP_NUMBER` (WhatsApp), `REDIS_HOST`, `REDIS_PORT`, `PORT`.

### Frontend (apps/frontend/.env.local)

| Variable                      | Required | Description           |
| ----------------------------- | -------- | --------------------- |
| NEXT_PUBLIC_API_URL           | Yes      | Backend API URL       |
| NEXT_PUBLIC_SUPABASE_URL      | Yes      | Supabase project URL  |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes      | Supabase anon key     |

The app validates env vars at startup and fails fast with a clear error if any required variable is missing.

## Project Structure

```
shingari/
├── apps/
│   ├── backend/     # NestJS API (auth, products, orders, rewards, etc.)
│   └── frontend/    # Next.js app (storefront + admin)
├── .env.example     # Template for all env vars
└── package.json     # Workspace root
```

## Links

- [Backend API docs](http://localhost:3001/api-docs) (Swagger, dev only)
- [Supabase](https://supabase.com/docs)
- [NestJS](https://docs.nestjs.com)
- [Next.js](https://nextjs.org/docs)
