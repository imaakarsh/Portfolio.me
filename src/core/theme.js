import { byId } from '../utils/dom.js';

export const themeStorageKey = 'portfolio-theme';

/**
 * Initialize theme system with toggle button and persistence
 * Respects system preferences as fallback
 */
export function initTheme() {
  const themeToggle = byId('theme-toggle');
  const themeToggleIcon = byId('theme-toggle-icon');

  const getTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    return current === 'light' ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      // localStorage might be disabled or full
      console.debug('[Theme] Could not persist to localStorage', error);
    }

    const isLight = theme === 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Toggle dark mode' : 'Toggle light mode');
      themeToggle.title = isLight ? 'Toggle dark mode' : 'Toggle light mode';
    }

    if (themeToggleIcon) {
      themeToggleIcon.textContent = isLight ? '☀' : '☾';
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
  }

  // Load saved theme or use system preference
  try {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      applyTheme(savedTheme);
    } else {
      applyTheme(getTheme());
    }
  } catch (error) {
    console.debug('[Theme] Could not load from localStorage', error);
    applyTheme(getTheme());
  }
}
