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
- **Spotify Integration** - Persistent widget displaying live "Now Playing" or "Last Played" status, featuring a "Not playing" state when idle and periodic polling for real-time updates
- **Interactive Guestbook** - Real-time messaging system with Firebase Firestore integration, Google Authentication (Popup/Redirect), message deletion for owners, character counting, and dynamic avatar generation
- **Social Links** - Direct links to my social media profiles
- **Easy Navigation** - Smooth navigation between sections
- **Visitor Counter** - Persistent visitor tracking using localStorage with simplified retrieval and improved logic for edge cases
## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Build Tool:** Vite
- **Backend:** Node.js (Vercel Serverless Functions)
- **Database:** Firebase (Firestore & Authentication)
- **Deployment:** Vercel
- **Version Control:** Git & GitHub
## 📂 Project Structure

Portfolio/
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
│   ├── features/       # UI, Blog, and GitHub API features
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
   

2. **Run the development server:**
   bash
   npm run dev
   

3. **Build for production:**
   bash
   npm run build
   

4. **Preview the build:**
   bash
   npm run preview
   

5. **Deployment:**
   The project is configured for Vercel deployment. The `vercel.json` file defines API rewrites for Spotify integration and configures routing to support SPA functionality. The build process utilizes Vite 6 to ensure stability and prevent permission errors (such as error 126) during the Vercel build process. Ensure `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` environment variables are configured.
## 📝 License

This project is open source and available for personal use.

## 👨‍💻 Author

**Aakarsh**
- Full Stack Developer
- Building modern web experiences

---

⭐ Star this repository if you like it!