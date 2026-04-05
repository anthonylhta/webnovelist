# 📚 WebNovelist

A web application for tracking your Chinese webnovel reading journey. Rate, organize, and never lose your place again.

## ✨ Features

### For Users
- Browse a growing database of Chinese webnovels
- Search & filter by title, author, or genre
- Personal list with status tracking (Reading, Completed, On Hold, Dropped, Plan to Read)
- Rate novels out of 10
- Chapter progress tracking with visual progress bars
- Date tracking for when you started and finished reading
- Reading links to quickly jump to where you're reading
- Re-read counter
- Statistics dashboard with rating distribution, genre breakdown, and highlights
- Personal notes on each novel

### For Admins & Moderators
- Add novels to the database
- Edit novel information and cover images
- Delete novels (admin only)
- Image upload via Cloudinary
- Admin panel to manage users and assign roles
- Role-based access control (Admin, Moderator, User)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL (Supabase)
- Prisma ORM
- NextAuth.js
- Cloudinary
- Vercel

## Getting Started

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Run `npx prisma migrate dev`
5. Run `npx prisma db seed`
6. Run `npm run dev`
7. Open http://localhost:3000

## User Roles

| Role | Browse | Personal List | Add Novels | Edit Novels | Delete Novels | Admin Panel |
|---|---|---|---|---|---|---|
| User | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Moderator | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Contact

- Discord: https://discord.com/users/362585609610461185
- GitHub: https://github.com/kayniss