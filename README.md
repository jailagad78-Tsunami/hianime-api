# HiAnime Full-Stack App

A complete anime streaming application — unofficial REST API backend (web scraper) + dark cinematic React frontend.

---

## Architecture

```
Browser (React)
    │  fetch /api/v1/*
    ↓
Vite Dev Server :5173
    │  proxy → localhost:3030
    ↓
Hono API Server :3030  (Bun runtime)
    │  axios + cheerio
    ↓
HiAnime.to (web scraping)
```

---

## Project Structure

```
hianime-app/
├── src/                        # Backend (Bun + Hono)
│   ├── server.js               # Entry point, middleware, error handling
│   ├── routes/index.js         # Route → controller mapping
│   ├── controllers/index.js    # Request handlers, response formatting
│   ├── scraper/
│   │   ├── homeScraper.js      # Spotlight, trending, latest episodes
│   │   ├── animeScraper.js     # Search results, anime detail
│   │   ├── episodeScraper.js   # Episode list via AJAX
│   │   └── streamScraper.js    # Servers → embed URL → decrypt → m3u8
│   └── utils/
│       ├── request.js          # Axios wrapper (browser-spoofed headers)
│       └── parser.js           # Cheerio helpers (buildFlwItem, etc.)
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Router with 4 routes
│   │   ├── api/hianime.js      # All fetch() calls to backend
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Spotlight slider + grids
│   │   │   ├── Search.jsx      # Search results with pagination
│   │   │   ├── AnimeDetail.jsx # Info + episode list (chunk nav)
│   │   │   └── Watch.jsx       # Video player + server selector + ep sidebar
│   │   └── components/
│   │       ├── Navbar.jsx      # Sticky nav with search bar
│   │       ├── AnimeCard.jsx   # Poster card with hover badges
│   │       └── SpotlightSlider.jsx  # Auto-play hero carousel
│   └── index.css               # Design system (CSS variables, utilities)
├── package.json                # Backend deps
└── README.md
```

---

## Setup & Running

### Prerequisites
- [Bun](https://bun.sh) v1.0+ (backend)
- [Node.js](https://nodejs.org) v18+ (frontend Vite)

### 1. Backend

```bash
# From project root
bun install
bun run dev
# → http://localhost:3030
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:3030` automatically.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/home` | Spotlight, trending, latest episodes |
| GET | `/api/v1/search?keyword=naruto&page=1` | Search results |
| GET | `/api/v1/anime/:id` | Full anime metadata + numericId |
| GET | `/api/v1/episodes/:numericId` | Episode list with sub/dub flags |
| GET | `/api/v1/servers?id=:episodeId` | Available streaming servers |
| GET | `/api/v1/stream?id=:serverId` | Decrypted video source URLs |

### Example Responses

**GET /api/v1/home**
```json
{
  "success": true,
  "data": {
    "spotlight": [
      { "rank": 1, "id": "wind-breaker-season-2-19542", "title": "Wind Breaker Season 2",
        "poster": "...", "quality": "HD", "episodes": { "sub": 13, "dub": 13 } }
    ],
    "trending": [...],
    "latestEpisodes": [...],
    "topAiring": [...]
  }
}
```

**GET /api/v1/stream?id=123456**
```json
{
  "success": true,
  "data": {
    "embedUrl": "https://megacloud.tv/embed-2/...",
    "sources": [
      { "url": "https://...master.m3u8", "type": "hls", "quality": "auto" }
    ],
    "tracks": [
      { "file": "https://.../en.vtt", "label": "English", "kind": "subtitles" }
    ],
    "intro": { "start": 92, "end": 182 }
  }
}
```

---

## Key Design Decisions

### Backend

**Why Hono?** Hono is ultralight (~14kb), runs natively on Bun with zero config, and has great TypeScript support. It handles routing, middleware, and CORS efficiently.

**Why the two-phase scraping?** HiAnime stores episode lists in AJAX (not in the HTML). The main anime page gives us a numeric ID, which we then use in a separate AJAX call to get episodes. This mirrors exactly how the real site loads data.

**Decryption key approach:** MegaCloud rotates its AES encryption key periodically. We fetch it from the community-maintained GitHub repo (`enimax-anime/key`) on each stream request. This ensures the API stays working across key rotations.

**Header spoofing:** HiAnime blocks requests without browser-like headers. The `User-Agent`, `Referer`, and `Accept` headers in `request.js` mimic Chrome 123 to avoid 403 errors.

### Frontend

**Why not Redux?** The app has simple, page-local data requirements. `useState` + `useEffect` per page is sufficient and avoids the overhead.

**HLS.js dynamic loading:** We load HLS.js from CDN via a dynamic `<script>` injection only when an m3u8 source is detected — this avoids bundling a large library for users who stream MP4.

**Episode chunking:** Series like Naruto (500+ episodes) would render 500 buttons. Chunking into groups of 100 keeps the DOM lightweight and the UX navigable.

---

## Disclaimer

This project is for educational purposes only. HiAnime.to is a third-party service. This scraper does not host any content — it only reads publicly accessible pages. Use responsibly.
