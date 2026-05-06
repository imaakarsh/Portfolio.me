# Aakarsh's Portfolio 🚀

A modern, responsive portfolio website showcasing my work as a Full Stack Developer.

## 🌐 Portfolio Link

Visit the live site: [imaakarsh.github.io/Portfolio.me](https://imaakarsh.github.io/Portfolio.me/)
## 📋 About

This is my personal portfolio website built with HTML, CSS, and TypeScript. The interactive behavior now lives in `src/` and is emitted to `public/dist/` for the browser.

## ✨ Features

- **Responsive Design** - Works seamlessly across all devices
- **Modern UI** - Clean and professional interface
- **Interactive Oneko** - A playful cat animation that follows your cursor with idle behaviors like sleeping and scratching
- **GitHub Contributions** - Real-time display of GitHub activity grid and animated contribution statistics with fallback API support
- **Last.fm Integration** - Real-time "Currently Listening" or "Last Scrobbed" status with album art and direct song links, featuring periodic polling for live updates
- **Discord Presence** - Real-time status tracking (Online, Idle, DND, Offline) powered by Lanyard WebSocket API with live status indicators on both the hero section and navigation avatar
- **WakaTime Statistics** - Real-time coding activity tracking showing daily time spent and a breakdown of top editors (e.g., VS Code, Cursor) with automated polling
- **Interactive Guestbook** - Real-time messaging system with Firebase Firestore integration, Google Authentication, message deletion for owners, and a dynamic "View More" pagination system for message history
- **Local API Emulator** - Custom Vite middleware to emulate Vercel Serverless Functions locally for seamless API development
- **Social Links** - Direct links to my social media profiles
- **Easy Navigation** - Smooth navigation between sections
- **Visitor Counter** - Persistent visitor tracking using localStorage with simplified retrieval and improved logic for edge cases
## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Build Tool:** Vite
- **Backend:** Node.js (Vercel Serverless Functions)
- **Database:** Firebase (Firestore & Authentication)
- **APIs:** Lanyard (Discord Presence), Spotify API, GitHub API, WakaTime API
- **Deployment:** Vercel
- **Version Control:** Git & GitHub
## 📂 Project Structure

Portfolio/
├── api/                # Serverless functions for Spotify and WakaTime APIs
├── index.html          # Home page
├── style.css           # Styling and layout
├── build.js            # Build script for JS files
├── public/
│   ├── assets/         # Images and icons
│   ├── dist/           # Bundled JavaScript output
│   └── guestbook.js    # Firebase guestbook logic
├── src/                # JavaScript source files
│   ├── core/           # Theme management (theme.js)
│   ├── effects/        # Visual effects (nightSky.js)
│   ├── features/       # UI, Blog, GitHub, Discord, Spotify, and WakaTime features
│   ├── utils/          # DOM utilities
│   ├── main.js         # Application entry point
│   └── oneko.js        # Oneko character logic
├── docs/               # Project documentation
└── README.md           # Project documentation
## 🎨 Sections

- **Home** - Introduction and welcome section
- **About** - Information about me
- **Projects** - Showcase of my work
- **Skills** - Technical skills and expertise
- **Contact** - Get in touch with me

## 🔗 Connect With Me

- **GitHub**: [@imaakarsh](https://github.com/imaakarsh)
- **LinkedIn**: [aakarshraj07](https://www.linkedin.com/in/aakarshraj07/)
- **Instagram**: [@aakarsh.wtf](https://www.instagram.com/aakarsh.wtf/)
- **Spotify**: [My Profile](https://open.spotify.com/user/31bmyhvubvmkjqnd6jclf6x4ix4q?si=33029016ddf74bd8)

## 🚀 Getting Started

1. **Install dependencies:**
   bash
   npm install
   

2. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example` and provide your credentials for Last.fm, WakaTime, and other services.

3. **Run the development server:**
   bash
   npm run dev
   
   *Note: The development server uses a custom emulator to handle API routes in `api/*.js`.*

4. **Build for production:**
   bash
   npm run build
   

5. **Preview the build:**
   bash
   npm run preview
   

6. **Deployment:**
   The project is configured for Vercel deployment. The `vercel.json` file defines API rewrites and configures routing to support SPA functionality. Ensure `LASTFM_API_KEY`, `LASTFM_USERNAME`, `WAKATIME_API_KEY`, and any Spotify credentials are configured in your deployment environment variables.
## 📝 License

This project is open source and available for personal use.

## 👨‍💻 Author

**Aakarsh**
- Full Stack Developer
- Building modern web experiences

---

⭐ Star this repository if you like it!