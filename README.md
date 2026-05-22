# 📚 WebNovelist

> An AniList-style tracker for web novels — log what you're reading, rate and review, build a library, and share a public profile.

**Live demo:** [webnovelist.vercel.app](https://webnovelist.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)

---

<!--
SCREENSHOTS — add a few here, recruiters look at these first.
Drop images in docs/screenshots/ and uncomment:

| Home | Profile | Stats |
|------|---------|-------|
| ![Home](docs/screenshots/home.png) | ![Profile](docs/screenshots/profile.png) | ![Stats](docs/screenshots/stats.png) |
-->

## Features

- 📖 **Reading list** — track novels across five statuses (Reading, Completed, On Hold, Dropped, Plan to Read), with per-entry rating, current chapter, reread count, notes, and a reading link.
- 📊 **Stats dashboard** — aggregate metrics across your library: totals by status, chapters read, and average rating.
- 🔥 **Activity heatmap** — a GitHub-style contribution graph of your reading activity over the past year.
- 👤 **Public profiles** — shareable `/user/<username>` pages featuring favorite novels, authors, and characters.
- 🔎 **Browse & search** — find novels by title, author, or genre.
- 🛡️ **Admin panel** — role-based user management, role assignment, and full novel catalog CRUD.
- 🔐 **Authentication** — email/password and social-login-ready sign-in via Clerk, with secure sessions.
- 🖼️ **Image uploads** — avatars and novel covers handled through Cloudinary, plus customizable profile banners.

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| Language | TypeScript |
| Auth | Clerk |
| Database / ORM | PostgreSQL (Supabase) + Prisma |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Media | Cloudinary |
| Hosting | Vercel |

## Architecture Highlights

- **Clerk identity synced to relational data.** Clerk owns authentication and sessions, while a local `User` table owns app-specific data (username, role, favorites, reading list). The two are linked by a `clerkId` and kept in sync via Clerk webhooks, with **just-in-time provisioning** so a database row is created on first sign-in even before the webhook fires.
- **Authorization enforced on the server.** A single `getCurrentUser()` helper resolves the database user per request, and every API route verifies roles server-side (e.g. `canManageNovels`, admin-only checks) — the UI never gates security on its own.
- **Edge protection & security headers.** Route protection and hardening headers (`X-Frame-Options`, `Strict-Transport-Security`, etc.) run in a single Next.js 16 Proxy (`proxy.ts`).
- **Abuse resistance.** Rate limiting on sensitive endpoints (`rate-limiter-flexible`) plus Zod-based input validation and sanitization.

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Supabase](https://supabase.com))
- A [Clerk](https://clerk.com) application
- A [Cloudinary](https://cloudinary.com) account (for image uploads)

### Setup

```bash
git clone https://github.com/anthonylhta/webnovelist.git
cd webnovelist
npm install
cp .env.example .env      # then fill in your values
npx prisma migrate dev    # apply the schema
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Clerk (https://dashboard.clerk.com → API keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/browse
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/browse

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npx prisma migrate dev --name <name>` | Create & apply a migration (dev) |
| `npx prisma studio` | Open the database GUI |

## Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — manage novels and users, no rate limits |
| **Moderator** | Add/edit novels, delete moderators and users |
| **User** | Browse, manage their own list, view stats |

---

Built by [Anthony](https://github.com/anthonylhta).
