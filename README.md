# Aakarsh Portfolio

Modern personal portfolio built with Vite, modular JavaScript, and serverless API routes.

## Live site

- [https://portfolio.me](https://portfolio.me)

## 🛠️ Stack

- **Frontend**: HTML, CSS (Custom Design Tokens & Theme-aware styling), JavaScript, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Build tool**: Vite 6
- **APIs**: Vercel Serverless Functions in `api/routes/` (Node.js)
- **Realtime/data**: Firebase (guestbook), Lanyard (Discord), Spotify, CodeTime, GitHub, and custom Visitor Counter API
## 🚀 Features

- **Premium Aesthetic**: Redesigned with a dark glassmorphic UI providing a modern, high-end visual experience.
- **Real-time Data**: Live integration with Firebase (guestbook), Lanyard (Discord), WakaTime/CodeTime, and Spotify.
- **Interactive Avatar**: Dynamic profile image that toggles on click with a smooth swapping animation.
- **GitHub Activity**: Visual contribution grid featuring month labels, year-to-date summaries, and automated streak calculation with enhanced tooltips.
- **Interactive Guestbook**: Persistent messaging with Google authentication, message pagination, and owner-specific deletion controls.
- **Visitor Counter**: Integrated visitor tracking with API-based persistence and fallback mechanisms.
- **Dynamic UI Effects**: Includes a custom cursor spotlight, multi-phrase typing animation, and a scroll progress indicator.
- **Blog Integration**: Dedicated feature module for displaying blog posts and content.
- **Navigation**: Responsive navigation with ScrollSpy integration for automatic active-section highlighting.
- **Modular Architecture**: Clean feature-based code organization for better maintainability and scalability.
## ✨ Features

- 📱 Responsive single-page portfolio sections
- 📊 GitHub contribution grid, streak tracking, and animated counters
- 💬 Discord live presence status via Lanyard API
- ⏱️ CodeTime coding statistics and refined status layout
- 📖 Firebase guestbook with Google sign-in and realtime updates
- 📝 Integrated blog module for sharing content and insights
- 🌌 Animated night sky effect with stars, shooting stars, and aurora gradients
- 🎨 Enhanced themes with View Transition API support and ripple effects
- 🛠️ Tabbed skill categories and learning progress visualization
- 🐈 Playful cursor-following Oneko cat animation
- 💎 Premium visual polish with refined CSS animations and high-fidelity UI enhancements
## 📂 Project structure

text
Portfolio/
├── api/                      # Serverless API handlers
│   └── routes/               # Organized endpoints (spotify, visitors, codetime)
├── docs/                     # Documentation (Structure & Implementation guides)
├── public/                   # Static public assets
├── src/
│   ├── components/           # Reusable UI components (navbar, ui, etc.)
│   ├── config/               # Shared constants and profile data
│   ├── core/                 # Core systems (theme management)
│   ├── effects/              # Visual effects (night sky)
│   ├── features/             # Feature-specific modules (github, spotify, blog, etc.)
│   ├── utils/                # Utility functions (DOM, etc.)
│   ├── main.js               # Frontend entry point
│   ├── oneko.js              # Cursor-following cat effect
│   └── style.css             # Global styles
├── index.html                # App HTML entry
├── vite.config.js            # Vite configuration
├── vercel.json               # Vercel deployment config
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

- **Build**: Vite compiles the application into the `dist/` directory using Node.js 20.
- **Platform**: Deployed via **GitHub Pages** with a custom domain configuration (`aakarshdev.me`).
- **CI/CD**: A GitHub Actions workflow (`build.yml`) automatically installs dependencies, builds the production bundle, and deploys to GitHub Pages on every push to the `main` branch.
## License

This project is open source and available for personal use.
