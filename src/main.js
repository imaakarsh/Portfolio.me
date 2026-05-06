import './oneko.js';
import { initTheme } from './core/theme.js';
import { initBlogFiltering, initBlogShowMore } from './features/blog.js';
import { initAvatarToggle, initRevealObserver, initTypingAnimation, initScrollProgress, initAnimatedCounters, initProgressBars, initCursorSpotlight, initNavScrollSpy } from './features/ui.js';
import { initNightSky } from './effects/nightSky.js';
import { initGitHubContributions, initVisitorCounter } from './features/gh.js';
import { initGuestbook } from './features/guestbook.js';
import { initLastFm } from './features/lastfm.js';
import { initDiscord } from './features/discord.js';
import { initWakaTime } from './features/wakatime.js';

/**
 * Error-safe wrapper for initialization functions
 * Logs errors but continues with other initializations
 */
function safeInit(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Init] Failed to initialize ${name}:`, error);
  }
}

/**
 * Initialize all portfolio features in order
 * Each feature initializes independently to prevent cascading failures
 */
function init() {
  // Core features
  safeInit('Theme', initTheme);
  safeInit('Avatar Toggle', initAvatarToggle);

  // UI Features
  safeInit('Blog Filtering', initBlogFiltering);
  safeInit('Blog Show More', initBlogShowMore);
  safeInit('Reveal Observer', initRevealObserver);
  safeInit('Typing Animation', initTypingAnimation);
  safeInit('Scroll Progress', initScrollProgress);
  safeInit('Animated Counters', initAnimatedCounters);
  safeInit('Progress Bars', initProgressBars);
  safeInit('Cursor Spotlight', initCursorSpotlight);
  safeInit('Nav Scroll Spy', initNavScrollSpy);

  // Effects
  safeInit('Night Sky', initNightSky);

  // External APIs
  safeInit('GitHub Contributions', initGitHubContributions);
  safeInit('Visitor Counter', initVisitorCounter);
  safeInit('Guestbook', initGuestbook);
  safeInit('Last.fm', initLastFm);
  safeInit('Discord', initDiscord);
  safeInit('WakaTime', initWakaTime);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
