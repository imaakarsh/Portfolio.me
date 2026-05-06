# Project Structure

## Current layout

```text
Portfolio/
├── api/                      # Serverless route handlers
├── docs/                     # Documentation
├── public/                   # Static files served directly by Vite
├── src/
│   ├── config/
│   ├── core/
│   ├── effects/
│   ├── features/
│   ├── utils/
│   ├── main.js
│   ├── oneko.js
│   └── style.css
├── index.html                # Main HTML entry
├── vite.config.js            # Vite config + local API middleware
├── vercel.json               # Production rewrites
└── package.json
```

## Responsibility split

- `index.html` defines page structure and semantic sections.
- `src/main.js` bootstraps features and coordinates startup order.
- `src/features/` contains functional modules (blog, guestbook, stats, integrations).
- `src/effects/` contains decorative canvas/animation effects.
- `src/config/` stores shared profile/config constants.
- `api/*.js` exposes backend endpoints consumed by frontend widgets.

## Build and deploy outputs

- Local/prod build output directory is `dist/`.
- Generated output is not source code and should remain excluded from git.
