# MovieVerse

A modern, responsive, **frontend-only** Next.js 15 application that turns simple JSON files into a beautiful Netflix-style movie discovery and streaming experience.

> 🚀 **Live demo:** https://movie-verse.vactorwp.workers.dev/

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: TailwindCSS + Shadcn-style UI primitives
- **Animations**: Framer Motion
- **Data**: TMDB API (client-side) + local collection JSON files
- **Streaming**: VidKing / VidSrc / EmbedSu embeds (switchable servers)
- **No backend. No database. No auth.** Deploy straight to Vercel.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure TMDB credentials (see below)
cp .env.example .env.local   # Windows: copy .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000

### Getting TMDB credentials

1. Create a free account at https://www.themoviedb.org
2. Go to **Settings → API** and request an API key
3. Copy the **API Key (v3)** and **API Read Access Token (v4)** into `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=xxxxxxxx
NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> The Read Access Token is preferred; the v3 API key works as a fallback.

### Environment & secrets

| File | Commit to Git? | Purpose |
| --- | --- | --- |
| `.env.example` | Yes | Template with placeholder values |
| `.env.local` | **No** | Your real TMDB keys (local dev) |
| `.env.production` | **No** | Production secrets (use Vercel env vars instead) |

`.gitignore` is configured to block all env files except `.env.example`. **Never commit files containing real API keys or tokens.** For deployment, add the same variables in your host's environment settings (e.g. Vercel → Project Settings → Environment Variables).

---

## Adding a Collection

Drop a JSON file into `data/collections/` — no code changes needed:

```json
{
  "title": "Top 10 Action Movies of All Time",
  "youtubeUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "movies": ["Mad Max: Fury Road", "John Wick", "Die Hard"]
}
```

- The URL slug is auto-generated from the title (`top-10-action-movies-of-all-time`), from the filename, or you can pin it with an optional `"slug"` field.
- Movie names are resolved against TMDB **by title** at runtime (best match wins). More exact names = better matches. Include the year for ambiguous titles, e.g. `"Dune 2021"`.
- `youtubeUrl` is optional. When present, the collection page embeds the video and shows a badge linking to it.
- Collection pages are statically generated (`generateStaticParams`) and revalidated hourly.

---

## Architecture

```
app/
├── layout.tsx               # Root layout (Navbar, Footer, SEO defaults)
├── page.tsx                 # Home — Hero, Featured, Trending, Latest
├── search/                  # Browse/Search with infinite scroll
├── collection/[slug]/       # Collection page (static + client resolution)
├── movie/[id]/              # Movie details (details + credits + trailer + related)
├── watch/[tmdbId]/          # Streaming player page (dynamic import, SSR off)
├── sitemap.ts / robots.ts   # SEO
└── globals.css

components/
├── MovieCard.tsx            # Poster card (rank, rating, hover overlay)
├── CollectionCard.tsx       # Poster-fan preview card with glassmorphism
├── HeroBanner.tsx           # Cross-fading trending backdrop hero
├── SearchBar.tsx            # Instant suggestions (movies + series + collections)
├── MovieGrid.tsx            # Responsive ranked grid
├── PlayerSection.tsx        # Server switcher, quality + subtitle prefs
├── TrailerModal.tsx         # Lazy-loaded YouTube trailer modal
├── sections/                # FeaturedCollections, TrendingRow, RelatedMovies
└── ui/                      # Shadcn-style primitives (button, input, badge, skeleton)

lib/
├── tmdb.ts                  # searchMovie, getMovieDetails, getMovieCredits,
│                            # getMovieVideos, getSimilarMovies, resolveMovieNames…
├── vidking.ts               # getMovieSource, getSeriesSource, getEpisodes,
│                            # server preference persistence
├── collections.ts           # Local JSON collection loader (require.context)
└── utils.ts                 # cn(), slugify, getYouTubeId, formatters

hooks/
├── useDebounce.ts
├── useSearchSuggestions.ts  # Merges TMDB multi-search + local collections
├── useCollectionMovies.ts   # Resolves movie names -> TMDB data (ordered)
└── useInfiniteMovies.ts     # Infinite scroll (popular / search)

data/collections/            # ← Your collection JSON files live here
types/index.ts               # Shared TypeScript types
```

### Design decisions

- **Data flow**: Collection JSON files are bundled at build time via `require.context`; movie details are fetched **client-side** from TMDB (no secrets beyond the public read token, matching the frontend-only constraint).
- **Resilience**: Movie resolution uses `Promise.allSettled` — one bad title never breaks a collection; unresolved names are listed at the bottom of the grid.
- **Performance**: `next/image` everywhere, lazy trailer modal, `next/dynamic` for the iframe player, `IntersectionObserver` infinite scroll, in-viewport animation triggers, route-level `loading.tsx` + `Suspense`.
- **SEO**: Dynamic metadata per page, Open Graph + Twitter cards, JSON-LD `ItemList` on collections, `sitemap.ts`, `robots.ts`.
- **Playback**: Three interchangeable embed providers. Subtitle/quality preferences are passed to providers that support URL params (VidKing); server choice persists in `localStorage`.

---

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Next.js/ESLint checks |

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import it in Vercel (framework preset: **Next.js**)
3. Add the three env vars from `.env.example` in Vercel → **Settings → Environment Variables**
4. Deploy

Do **not** upload `.env.local` — set secrets only in the hosting dashboard.

---

## Legal

This project displays metadata from TMDB and embeds third-party streaming players. It uses the TMDB API but is not endorsed or certified by TMDB. You are responsible for complying with the terms of the providers you embed and the laws of your jurisdiction.
