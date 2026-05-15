import './oneko';
import { initTheme } from './core/theme';
import { initBlogFiltering, initBlogShowMore } from './features/blog';
import { initAvatarToggle, initRevealObserver, initTypingAnimation, initScrollProgress, initSkillTabs, initCursorSpotlight, initNavScrollSpy, initMobileMenu } from './features/ui';
import { initNightSky } from './effects/nightSky';
import { initGitHubContributions, initVisitorCounter } from './features/gh';
import { initDiscord } from './features/discord';
import { initCodeTime } from './features/codetime';

async function safeInit(name, fn) {
  try {
    await Promise.resolve(fn());
  } catch (error) {
    console.error(`[Init] Failed to initialize ${name}:`, error);
  }
}

async function initGuestbookOnDemand() {
  const section = document.getElementById('guestbook');
  if (!section) return;

  const loadGuestbook = async () => {
    const { initGuestbook } = await import('./features/guestbook');
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

async function init() {
  await safeInit('Theme', initTheme);
  await safeInit('Avatar Toggle', initAvatarToggle);
  await safeInit('Blog Filtering', initBlogFiltering);
  await safeInit('Blog Show More', initBlogShowMore);
  await safeInit('Reveal Observer', initRevealObserver);
  await safeInit('Typing Animation', initTypingAnimation);
  await safeInit('Scroll Progress', initScrollProgress);
  await safeInit('Skill Tabs', initSkillTabs);
  await safeInit('Cursor Spotlight', initCursorSpotlight);
  await safeInit('Nav Scroll Spy', initNavScrollSpy);
  await safeInit('Mobile Menu', initMobileMenu);
  await safeInit('Night Sky', initNightSky);
  await safeInit('Visitor Counter', initVisitorCounter);
    await safeInit('GitHub Contributions', initGitHubContributions);
  await safeInit('Guestbook', initGuestbookOnDemand);
  await safeInit('Discord', initDiscord);
  await safeInit('CodeTime', initCodeTime);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}