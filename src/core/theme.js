import { byId } from '../utils/dom';

export const themeStorageKey = 'portfolio-theme';

/**
 * Cinematic theme toggle system.
 * Sequence: pre-glow → blur sweep + card float → circular ripple reveal.
 * Falls back to overlay flash on unsupported browsers.
 */
export function initTheme() {
  const themeToggle = byId('theme-toggle');
  let btnTimer = null;

  /* ── Read current theme ── */
  const getTheme = () =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

  /* ── Apply theme + persist ── */
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(themeStorageKey, theme); } catch (_) {}

    const isLight = theme === 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Toggle dark mode' : 'Toggle light mode');
      themeToggle.title = isLight ? 'Toggle dark mode' : 'Toggle light mode';
    }
  };

  /* ── Step 1: glow pulse on button ── */
  const preGlow = () => {
    if (!themeToggle) return;
    themeToggle.classList.remove('pre-switching', 'is-switching');
    void themeToggle.offsetWidth; // reflow to restart
    themeToggle.classList.add('pre-switching');
    window.clearTimeout(btnTimer);
    btnTimer = window.setTimeout(() => {
      themeToggle.classList.remove('pre-switching');
      themeToggle.classList.add('is-switching');
      window.setTimeout(() => themeToggle.classList.remove('is-switching'), 520);
    }, 450);
  };

  /* ── Step 2: inject blur sweep div ── */
  const injectBlurSweep = () => {
    const el = document.createElement('div');
    el.className = 'theme-blur-sweep';
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 820);
  };

  /* ── Step 3: card float on body class ── */
  const triggerCardFloat = () => {
    document.body.classList.add('theme-transitioning');
    window.setTimeout(() => document.body.classList.remove('theme-transitioning'), 950);
  };

  /* ── Fallback: overlay flash ── */
  const flashFallback = (theme, onMid) => {
    const ov = document.createElement('div');
    ov.style.cssText =
      `position:fixed;inset:0;z-index:99999;pointer-events:none;` +
      `background:${theme === 'light' ? '#f8fafc' : '#0a0a0f'};` +
      `opacity:0;transition:opacity 0.18s ease;`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => requestAnimationFrame(() => { ov.style.opacity = '0.65'; }));
    window.setTimeout(() => {
      onMid();
      ov.style.opacity = '0';
      ov.addEventListener('transitionend', () => ov.remove(), { once: true });
    }, 210);
  };

  /* ── Main switch ── */
  const setTheme = (theme, animated = false) => {
    if (!animated) { applyTheme(theme); return; }

    preGlow();
    injectBlurSweep();
    triggerCardFloat();

    if ('startViewTransition' in document) {
      if (themeToggle) {
        const r = themeToggle.getBoundingClientRect();
        document.documentElement.style.setProperty('--ripple-x', `${r.left + r.width / 2}px`);
        document.documentElement.style.setProperty('--ripple-y', `${r.top + r.height / 2}px`);
      }
      document.startViewTransition(() => applyTheme(theme));
    } else {
      flashFallback(theme, () => applyTheme(theme));
    }
  };

  /* ── Wire up click ── */
  if (themeToggle) {
    themeToggle.addEventListener('click', () =>
      setTheme(getTheme() === 'light' ? 'dark' : 'light', true)
    );
  }

  /* ── Init from storage / system pref ── */
  try {
    const saved = localStorage.getItem(themeStorageKey);
    applyTheme(saved === 'light' || saved === 'dark' ? saved : getTheme());
  } catch (_) {
    applyTheme(getTheme());
  }
}