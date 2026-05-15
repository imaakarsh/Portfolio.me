# Aakarsh Portfolio

Modern personal portfolio built with Vite, modular JavaScript, and serverless API routes.

## Live site

- [https://portfolio.me](https://portfolio.me)

## 🛠️ Stack

- **Frontend**: HTML, CSS, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Build tool**: Vite 6
- **APIs**: Vercel-style serverless functions in `api/` (Node.js/TypeScript)
- **Realtime/data**: Firebase (guestbook), Lanyard (Discord), Spotify, CodeTime, GitHub, and CountAPI (visitors)
## 🚀 Features

- **Premium Aesthetic**: Redesigned with a dark glassmorphic UI providing a modern, high-end visual experience.
- **Real-time Data**: Live integration with Firebase (guestbook), Lanyard (Discord), WakaTime/CodeTime, and Spotify.
- **Interactive Avatar**: Dynamic profile image that toggles on click with a smooth swapping animation.
- **GitHub Activity**: Visual contribution grid featuring month labels, year-to-date summaries, and automated streak calculation.
- **Interactive Guestbook**: Persistent messaging with Google authentication, message pagination, and owner-specific deletion controls.
- **Dynamic UI Effects**: Includes a custom cursor spotlight, multi-phrase typing animation ('build', 'ship', 'code', etc.), and a scroll progress indicator.
- **Dynamic Themes**: Smooth dark/light mode switching powered by the View Transition API with custom ripple effects.
- **Navigation**: Responsive navigation with ScrollSpy integration for automatic active-section highlighting.
- **Responsive Overhaul**: Comprehensive mobile-first CSS improvements and visual refinements for a seamless experience across all device sizes.
## ✨ Features

- 📱 Responsive single-page portfolio sections
- 📊 GitHub contribution grid, streak tracking, and animated counters
- 💬 Discord live presence status via Lanyard API
- ⏱️ CodeTime coding statistics and refined status layout
- 📖 Firebase guestbook with Google sign-in and realtime updates
- 🌌 Animated night sky effect with stars, shooting stars, and aurora gradients
- 🎨 Enhanced themes with View Transition API support and ripple effects
- 🛠️ Tabbed skill categories and learning progress visualization
- 💎 Premium visual polish with refined CSS animations and high-fidelity UI enhancements
## 📂 Project structure

text
Portfolio/
├── api/                      # Serverless API handlers (TypeScript)
│   ├── visitors.ts
│   ├── spotify.ts
│   └── codetime.ts
├── docs/                     # Documentation
├── public/                   # Static public assets
├── src/
│   ├── config/               # Shared constants (profile data)
│   ├── core/                 # Core systems (theme)
│   ├── effects/              # Visual effects (night sky)
│   ├── features/             # Feature modules (Discord, GH, etc.)
│   ├── utils/                # Utility functions
│   ├── main.ts               # Frontend entry point
│   ├── oneko.ts              # Cursor-following cat effect
│   └── style.css
├── index.html                # App HTML entry
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── vercel.json
└── package.json

## 💻 Local development

1. Ensure you have **Node.js v20** or higher installed.
2. Install dependencies:
   - `npm install` 
3. Run the development server:
   - `npm run dev` 
4. Build the production bundle:
   - `npm run build` 
5. Preview the production build locally:
   - `npm run preview`
## 🔑 Environment variables

Set deployment/local env vars for the APIs used in the project:

- `CODETIME_API_KEY` or `WAKATIME_API_KEY`: API key for fetching WakaTime or CodeTime coding statistics.
- `SPOTIFY_CLIENT_ID`: Client ID from the Spotify Developer Dashboard.
- `SPOTIFY_CLIENT_SECRET`: Client Secret from the Spotify Developer Dashboard.
- `SPOTIFY_REDIRECT_URI`: (Optional) Redirect URI for Spotify OAuth, defaults to `http://localhost:5173/api/spotify/callback`.
- `SPOTIFY_REFRESH_TOKEN`: OAuth refresh token for persistent Spotify API access.
## 🚀 Deployment

- **Build**: Vite compiles the application into the `dist/` directory.
- **Platform**: Deployed via Vercel; `vercel.json` is configured for SPA rewrites, `/api/*` routing, and clean URLs.
- **CI/CD**: A GitHub Actions workflow (`build.yml`) automatically runs `npm run build` and deploys to Vercel on every push to the `main` branch.
## License

This project is open source and available for personal use.
