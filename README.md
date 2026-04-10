# WebNovelist 📚

AniList-style webnovel tracker. Track your reading, rate novels, manage your list.

**Tech:** Next.js 14 (App Router), Prisma, PostgreSQL, NextAuth, Cloudinary, Tailwind CSS

---

## Quick Start

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run dev:clean` | Clean cache + start dev server |
| `npm run build` | Production build |
| `npx prisma migrate dev --name name` | Create migration on dev |
| `npm run prod:migrate` | Apply migrations to prod |
| `npx prisma studio` | Database GUI (dev) |
| `./scripts/prod.sh "any command"` | Run any command with prod env vars |
| `./commit.sh "message"` | Git add + commit + push |
| `npx repomix` | Export codebase for LLM chats |

---

## Workflow

```bash
# Start dev
./dev.sh

# If schema changed
npx prisma migrate dev --name what-changed
npm run prod:migrate

# Commit
./commit.sh "feat(scope): description"
```

---

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# RESEND_API_KEY=        # Disabled for now
# EMAIL_FROM=            # Enable with paid Resend plan
```

---

## Roles

| Role | Permissions |
|------|------------|
| **Admin** | Everything — novels, users, no cooldowns |
| **Moderator** | Add/edit novels, delete mods + users |
| **User** | Browse, manage own list, stats |

