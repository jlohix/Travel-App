# 🧭 Wanderly — All-in-one travel app

Wanderly brings your travel map, a community forum, direct messaging, and an
AI-powered itinerary planner together in a single Next.js app.

## Features

| Feature | Where |
|---|---|
| 📍 **Interactive map** — click to drop categorized pins (food, stays, sights, wishlist) with notes | `/map` |
| 💬 **Reddit-style forum** — posts with up/down voting and comments, filterable by country / region / city + search | `/forum` |
| 🖼️ **Image uploads** — attach a photo (JPG/PNG/WEBP/GIF, ≤5MB) to any forum post | `/forum/new` |
| ✉️ **Direct messaging** — chat threads between users, with unread counts | `/messages` |
| 🤖 **AI itinerary generator** — day-by-day plans tailored to your interests, powered by Google Gemini | `/itinerary` |

## Tech stack

- **Next.js 14** (App Router, Server Actions) + **TypeScript**
- **Prisma** ORM with **SQLite** (swap `DATABASE_URL` for Postgres in production)
- **Tailwind CSS**
- **Leaflet** + OpenStreetMap (no API key required)
- **@google/generative-ai** (Gemini) for itineraries
- Cookie-based auth with **jose** (JWT) + **bcryptjs**

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
#    - AUTH_SECRET: any long random string
#    - GEMINI_API_KEY: free key from https://aistudio.google.com/app/apikey
#      (only needed for the itinerary generator)

# 3. Create the database and seed demo data
npm run db:push
npm run db:seed

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

### Demo logins (from the seed)

All demo users share the password **`password123`**:

- `alice@example.com`
- `bob@example.com`
- `carol@example.com`

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Prisma connection string. Defaults to `file:./dev.db` (SQLite). |
| `AUTH_SECRET` | yes | Secret used to sign session JWTs. Use a long random string. |
| `GEMINI_API_KEY` | for itineraries | Google Gemini API key ([free tier](https://aistudio.google.com/app/apikey)). |
| `GEMINI_MODEL` | no | Override the Gemini model name. The app falls back through several known models automatically. |

## Project structure

```
src/
  app/
    (auth)/          # login, signup, auth server actions
    map/             # interactive map page + pin actions
    forum/           # forum list, new post, [id] detail + actions
    messages/        # conversations, [username] thread, new + actions
    itinerary/       # AI itinerary page + action
    layout.tsx       # shell + nav
    page.tsx         # landing page
  components/         # NavBar, auth, map, forum, messages, itinerary UI
  lib/
    prisma.ts        # Prisma client singleton
    auth.ts          # sessions, password hashing
    upload.ts        # image upload handling
    gemini.ts        # Gemini itinerary generation
prisma/
  schema.prisma      # data models
  seed.ts            # demo data
```

## Notes & next steps

- **Uploads** are stored on the local filesystem under `public/uploads`. For a
  real deployment, swap `src/lib/upload.ts` to push to S3 / Cloudinary / etc.
- **Database**: SQLite is great for local dev. For production, point
  `DATABASE_URL` at Postgres and change the `provider` in `prisma/schema.prisma`.
- The Gemini call requests strict JSON output and validates the shape before
  rendering, so malformed responses fail gracefully with an error message.
```
