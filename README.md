# Aakarsh Portfolio

Modern personal portfolio built with Vite, modular JavaScript, and serverless API routes.

## Live site

- [www.aakarshdev.me](https://www.aakarshdev.me)

## 🛠️ Stack

- Frontend: HTML, CSS, JavaScript (ES modules), Tailwind CSS v4
- Build tool: Vite
- APIs: Vercel-style serverless functions in `api/`
- Realtime/data: Firebase (guestbook), Lanyard (Discord), Last.fm, WakaTime, GitHub APIs
## Features

- Responsive single-page portfolio sections
- GitHub contribution grid + animated counters
- Discord live presence + WakaTime coding stats
- Last.fm now playing / last scrobbled widget
- Firebase guestbook with Google sign-in and realtime updates
- Night sky effect and interactive UI animations

## 📂 Project structure

text
Portfolio/
├── api/                      # Serverless API handlers
│   ├── lastfm.js
│   ├── spotify.js
│   └── wakatime.js
├── docs/                     # Documentation
├── public/                   # Static public assets
├── src/
│   ├── config/               # Shared constants (profile data)
│   ├── core/                 # Core systems (theme)
│   ├── effects/              # Visual effects (night sky)
│   ├── features/             # Feature modules (Discord, GH, etc.)
│   ├── utils/                # Utility functions
│   ├── main.js               # Frontend entry point
│   ├── oneko.js              # Cursor-following cat effect
│   └── style.css
├── index.html                # App HTML entry
├── vite.config.js
├── vercel.json
└── package.json

## 💻 Local development

1. Install dependencies:
   - `npm install`
2. Run dev server:
   - `npm run dev`
3. Build production bundle:
   - `npm run build`
4. Preview production bundle:
   - `npm run preview`
## Environment variables

Set deployment/local env vars for APIs you use:

- `LASTFM_API_KEY`
- `LASTFM_USERNAME`
- `WAKATIME_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## 🚀 Deployment

- Vite builds to `dist/`.
- `vercel.json` provides SPA rewrites and `/api/*` routing.
- GitHub Actions workflow automatically builds and deploys the `dist/` output to GitHub Pages on push to `main`.
## License

This project is open source and available for personal use.
