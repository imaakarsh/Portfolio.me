# Aakarsh Portfolio

Modern personal portfolio built with Vite, modular JavaScript, and serverless API routes.

## Live site

- [https://portfolio.me](https://portfolio.me)

## 🛠️ Stack

- **Frontend**: HTML, CSS, JavaScript (ES modules), Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Build tool**: Vite 6
- **APIs**: Vercel-style serverless functions in `api/` (Node.js)
<<<<<<< HEAD
- **Realtime/data**: Firebase (guestbook), Lanyard (Discord), Last.fm, CodeTime, and GitHub APIs
## 🚀 Features

- **Real-time Data**: Live integration with Firebase (guestbook), Lanyard (Discord), WakaTime/CodeTime, and GitHub APIs.
- **Interactive UI**: Includes a cursor spotlight effect, multi-phrase typing animation, scroll progress indicator, and animated counters.
- **Responsive Design**: Optimized horizontal navigation bar providing consistent access across all devices.
- **Social Integration**: Quick access to social profiles and dynamic avatar interactions.
## ✨ Features

- 📱 Responsive single-page portfolio sections
- 📊 GitHub contribution grid + animated counters
- 💬 Discord live presence status via Lanyard API
- ⏱️ CodeTime coding statistics and refined status layout
- 📖 Firebase guestbook with Google sign-in and realtime updates
- 🌌 Animated night sky effect with stars, shooting stars, and aurora gradients
- 🎨 Enhanced dark and light themes with optimized CSS variables
## 📂 Project structure

text
Portfolio/
├── api/                      # Serverless API handlers
│   ├── lastfm.js
│   ├── spotify.js
│   └── codetime.js
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
## 🔑 Environment variables

Set deployment/local env vars for the APIs used in the project:

- `CODETIME_API_KEY` or `WAKATIME_API_KEY`: API key for fetching WakaTime or CodeTime coding statistics.
- `SPOTIFY_CLIENT_ID`: Client ID from the Spotify Developer Dashboard.
- `SPOTIFY_CLIENT_SECRET`: Client Secret from the Spotify Developer Dashboard.
- `SPOTIFY_REFRESH_TOKEN`: OAuth refresh token for persistent Spotify API access.
## 🚀 Deployment

- **Build**: Vite compiles the application into the `dist/` directory.
- **Platform**: Deployed via Vercel; `vercel.json` is configured for SPA rewrites, `/api/*` routing, and clean URLs.
- **CI/CD**: A GitHub Actions workflow (`build.yml`) automatically runs `npm run build` and deploys to Vercel on every push to the `main` branch.
## License

This project is open source and available for personal use.
