# Aakarsh Portfolio

Modern personal portfolio built with Vite, modular JavaScript, and serverless API routes.

## Live site

- [https://portfolio.me](https://portfolio.me)

## 🛠️ Stack

- **Frontend**: HTML, CSS, JavaScript (ES modules), Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Build tool**: Vite 6
- **APIs**: Vercel-style serverless functions in `api/` (Node.js)
- **Realtime/data**: Firebase (guestbook), Lanyard (Discord), Last.fm, WakaTime, and GitHub APIs
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
2. Run the development server:
   - `npm run dev` 
3. Build the production bundle:
   - `npm run build` 
4. Preview the production build locally:
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

- **Build**: Vite compiles the application into the `dist/` directory.
- **Platform**: Deployed via Vercel; `vercel.json` is configured for SPA rewrites, `/api/*` routing, and clean URLs.
- **CI/CD**: A GitHub Actions workflow (`build.yml`) automatically runs `npm run build` and deploys to Vercel on every push to the `main` branch.
## License

This project is open source and available for personal use.
