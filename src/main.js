import './oneko.js';
import { initTheme } from './core/theme.js';
import { initBlogFiltering, initBlogShowMore } from './features/blog.js';
import { initAvatarToggle, initRevealObserver, initTypingAnimation, initScrollProgress, initAnimatedCounters, initProgressBars, initCursorSpotlight, initNavScrollSpy } from './features/ui.js';
import { initNightSky } from './effects/nightSky.js';
import { initGitHubContributions, initVisitorCounter } from './features/gh.js';
import { initDiscord } from './features/discord.js';
import { initCodeTime } from './features/codetime.js';

/**
 * Error-safe wrapper for initialization functions
 * Logs errors but continues with other initializations
 */
async function safeInit(name, fn) {
  try {
    await fn();
  } catch (error) {
    console.error(`[Init] Failed to initialize ${name}:`, error);
  }
}

async function initGuestbookOnDemand() {
  const section = document.getElementById('guestbook');
  if (!section) return;

  const loadGuestbook = async () => {
    const { initGuestbook } = await import('./features/guestbook.js');
    await initGuestbook();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(async (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        await loadGuestbook();
      }
    }, { rootMargin: '300px 0px' });

    observer.observe(section);
    return;
  }

  await loadGuestbook();
}

/**
 * Initialize all portfolio features in order
 * Each feature initializes independently to prevent cascading failures
 */
async function init() {
  // Core features
  await safeInit('Theme', initTheme);
  await safeInit('Avatar Toggle', initAvatarToggle);

  // UI Features
  await safeInit('Blog Filtering', initBlogFiltering);
  await safeInit('Blog Show More', initBlogShowMore);
  await safeInit('Reveal Observer', initRevealObserver);
  await safeInit('Typing Animation', initTypingAnimation);
  await safeInit('Scroll Progress', initScrollProgress);
  await safeInit('Animated Counters', initAnimatedCounters);
  await safeInit('Progress Bars', initProgressBars);
  await safeInit('Cursor Spotlight', initCursorSpotlight);
  await safeInit('Nav Scroll Spy', initNavScrollSpy);

  // Effects
  await safeInit('Night Sky', initNightSky);

  // External APIs
  await safeInit('GitHub Contributions', initGitHubContributions);
  await safeInit('Visitor Counter', initVisitorCounter);
  await safeInit('Guestbook', initGuestbookOnDemand);
  await safeInit('Discord', initDiscord);
  await safeInit('CodeTime', initCodeTime);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
