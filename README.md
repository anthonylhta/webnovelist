# 📚 WebNovelist

> An AniList-style tracker for web novels — log what you're reading, rate and review, build a library, and share a public profile.

**Live:** [novel.anthonyta.dev](https://novel.anthonyta.dev)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)
![CI](https://github.com/anthonylhta/webnovelist/actions/workflows/ci.yml/badge.svg)

---

## Screenshots

| Home | Novel | Profile |
|------|-------|---------|
| ![Home](docs/screenshots/home.png) | ![Novel](docs/screenshots/novel.png) | ![Profile](docs/screenshots/profile.png) |

## Features

- **Reading list** — track novels across five statuses (Reading, Completed, On Hold, Dropped, Plan to Read), with per-entry rating, current chapter, reread count, notes, and a reading link.
- **Stats dashboard** — aggregate metrics across your library: totals by status, chapters read, average rating, and genre breakdown.
- **Activity heatmap** — a GitHub-style contribution graph of your reading activity over the past year.
- **Public profiles** — shareable `/user/<username>` pages featuring favorite novels, authors, and characters, with a blurred cover art banner.
- **Browse & search** — find novels by title, author, or genre with live filtering.
- **Admin panel** — role-based user management and full novel catalog CRUD.
- **Authentication** — email/password sign-in via Clerk with secure sessions and webhook-based user sync.
- **Image uploads** — avatars and novel covers via Cloudinary; customizable profile banners.

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| Language | TypeScript |
| Auth | Clerk |
| Database / ORM | PostgreSQL + Prisma |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Media | Cloudinary |
| Email | Resend |
| Rate limiting | rate-limiter-flexible |
| Testing | Vitest |
| CI | GitHub Actions |
| Hosting | Vercel |

## Architecture Highlights

- **Clerk identity synced to relational data.** Clerk owns authentication and sessions; a local `User` table owns app-specific data (username, role, favorites, reading list), linked by `clerkId` and kept in sync via Clerk webhooks. Just-in-time provisioning creates a database row on first sign-in even before the webhook fires.
- **Authorization enforced on the server.** A single `getCurrentUser()` helper resolves the database user per request, and every API route verifies roles server-side — the UI never gates security on its own.
- **Edge protection & security headers.** Route protection and hardening headers (`X-Frame-Options`, `Strict-Transport-Security`, etc.) run in a single Next.js middleware (`proxy.ts`).
- **Startup env validation.** A Zod schema in `lib/env.ts` validates all required environment variables at server startup via Next.js `instrumentation.ts`, failing fast with a clear error message if anything is missing.

## Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — manage novels and users, no rate limits |
| **Moderator** | Add/edit novels, delete moderators and users |
| **User** | Browse, manage their own list, view stats |

## Quality

- **Tests** — Vitest unit/integration tests covering lib utilities and all major API routes (`__tests__/`). Run with `npm test`.
- **CI** — GitHub Actions runs lint → typecheck → tests on every push and PR to `main`.
- **Pre-commit** — Husky + lint-staged runs ESLint on staged `.ts`/`.tsx` files before every commit.
- **Branch protection** — PRs required on `main`; CI must pass before merge.
- **Dependency updates** — Dependabot checks for npm updates weekly.

## Running Locally

**Prerequisites:** Node.js 20+, a PostgreSQL database, and free accounts on [Clerk](https://clerk.com) and [Cloudinary](https://cloudinary.com).

```bash
git clone https://github.com/anthonylhta/webnovelist.git
cd webnovelist
npm install        # runs `prisma generate` via postinstall
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Key variables:

```bash
# Database
DATABASE_URL=
DIRECT_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxx   # optional locally (see note below)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/browse
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/browse

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Apply the schema and optionally seed sample data:

```bash
npx prisma migrate dev
npx prisma db seed    # optional
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Clerk webhooks are optional for local dev.** User rows are created via just-in-time provisioning on first sign-in, so you don't need a public webhook URL to develop locally.

---

Built by [Anthony](https://github.com/anthonylhta).
