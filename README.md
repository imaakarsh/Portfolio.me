# Aakarsh Portfolio

Modern personal portfolio built with Vite, modular JavaScript, and serverless API routes.

## Live site

- [https://aakarshdev.me](https://aakarshdev.me)

## 🛠️ Stack

- **Frontend**: HTML, CSS (Custom Design Tokens & Theme-aware styling), JavaScript, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Build tool**: Vite 6
- **APIs**: Vercel Serverless Functions in `api/routes/` (Node.js)
- **Realtime/data**: Firebase (guestbook), Lanyard (Discord), CodeTime, GitHub, and custom Visitor Counter API
## 🚀 Features

- **Cinematic Theme System**: Leverages the native **View Transition API** for fluid, high-fidelity transitions between themes, complemented by dynamic ambient background effects and cinematic noise overlays.
- **Premium Aesthetic**: Redesigned with a dark glassmorphic UI, grain textures, and custom styling for a modern, high-end visual experience.
- **Real-time Data**: Live integration with Firebase (guestbook), Lanyard (Discord), and WakaTime/CodeTime.
- **Interactive Avatar**: Dynamic profile image that toggles on click with a smooth swapping animation.
- **GitHub Activity**: Visual contribution grid featuring month labels, year-to-date summaries, and automated streak calculation with animated counters and enhanced tooltips.
- **Interactive Guestbook**: Persistent messaging with Google authentication, message pagination, and owner-specific deletion controls.
- **Visitor Counter**: Integrated visitor tracking with API-based persistence and fallback mechanisms.
- **Dynamic UI Effects**: Includes a custom cursor spotlight, multi-phrase typing animation, and a scroll progress indicator.
- **Blog Integration**: Dedicated feature module for displaying blog posts and content.
- **Navigation**: Improved navbar visibility and responsive ScrollSpy integration for automatic active-section highlighting.
- **Modular Architecture**: Clean feature-based code organization for better maintainability and scalability.
## ✨ Features

- 📱 **Responsive Design**: Single-page portfolio sections with improved navbar visibility and mobile-first layout.
- 🎨 **Cinematic Transitions**: Immersive theme switching system powered by the **View Transition API**, custom CSS animations, and cinematic noise overlays.
- 📊 **GitHub Insights**: Visual contribution grid with month-wise breakdown, streak tracking, and animated stat counters.
- 💬 **Discord Presence**: Live status updates via Lanyard API integration.
- 🎵 **Spotify Integration**: Real-time music activity tracking and "Now Playing" status updates.
- ⏱️ **CodeTime Stats**: Real-time coding statistics and refined status layout.
- 📖 **Firebase Guestbook**: Real-time messaging with Google sign-in and message management.
- 📝 **Blog Module**: Integrated system for sharing content and technical insights.
- 🌌 **Ambient Effects**: Animated night sky with stars, shooting stars, aurora gradients, and textured noise backgrounds.
- 🛠️ **Skill Visualization**: Tabbed categories and learning progress tracking.
- 🐈 **Interactive Oneko**: Playful cursor-following cat animation.
- 📈 **Visitor Analytics**: Integrated backend system for tracking site traffic and engagement metrics.
- 💎 **Premium Polish**: High-fidelity UI enhancements with optimized performance, refined glassmorphism, and smooth interactions.
## 📂 Project structure

```
Portfolio/
├── api/
│   ├── routes/               # API handlers (visitors, codetime)
│   ├── codetime.js
│   └── visitors.js
├── docs/
├── public/assets/
├── scripts/                  # optimize-images.mjs, etc.
├── src/
│   ├── components/ui.js      # Shared UI (nav, reveal, typing, …)
│   ├── config/constants.js
│   ├── core/theme.js
│   ├── effects/nightSky.js
│   ├── features/
│   │   ├── blog/
│   │   ├── codetime/
│   │   ├── discord/
│   │   ├── github/
│   │   └── guestbook/
│   ├── utils/dom.js
│   ├── main.js
│   ├── oneko.js
│   └── style.css
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

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
## 🚀 Deployment

- **Build**: Vite compiles the application into the `dist/` directory using Node.js 20.
- **Platform**: Deployed via **GitHub Pages** with a custom domain configuration (`aakarshdev.me`).
- **CI/CD**: A GitHub Actions workflow (`build.yml`) automatically installs dependencies, builds the production bundle, and deploys to GitHub Pages on every push to the `main` branch.
## License

This project is open source and available for personal use.
