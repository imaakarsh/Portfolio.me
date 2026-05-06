import { byId } from '../utils/dom.js';
import { PROFILE } from '../config/constants.js';

const { githubUsername } = PROFILE;

export function initGitHubContributions() {
  const ghCard = byId('gh-glass-card');
  const ghTotal = byId('gh-total');
  const gridEl = byId('gh-calendar-grid');
  const monthsEl = byId('gh-calendar-months');

  if (ghCard) {
    const ghObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gh-animated');
          ghObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    ghObserver.observe(ghCard);
  }

  const animateValue = (element, target, suffix = '') => {
    const duration = 1100;
    const step = target / (duration / 16);
    let current = 0;

    const timer = window.setInterval(() => {
      current = Math.min(current + step, target);
      element.textContent = `${Math.round(current)}${suffix}`;
      if (current >= target) {
        window.clearInterval(timer);
      }
    }, 16);

    return timer;
  };

  const computeStreaks = (weeks) => {
    const days = [];
    weeks.forEach((week) => {
      week.contributionDays.forEach((day) => days.push(day));
    });

    let total = 0;
    let longest = 0;
    let current = 0;

    for (let index = 0; index < days.length; index += 1) {
      const contribution = days[index].count;
      total += contribution;
      if (contribution > 0) {
        current += 1;
        if (current > longest) longest = current;
      } else {
        const dayDate = new Date(days[index].date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dayDate < today) {
          current = 0;
        }
      }
    }

    return { total, current, longest };
  };

  const renderGitHubGrid = (sorted) => {
    if (!gridEl || !monthsEl || sorted.length === 0) return;

    const weeks = [];
    let currentWeek = [];

    const firstDayIndex = new Date(sorted[0].date).getDay();
    for (let index = 0; index < firstDayIndex; index += 1) {
      currentWeek.push(null);
    }

    sorted.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    let html = '';
    let monthsHtml = '';
    let lastMonth = -1;

    weeks.forEach((week, columnIndex) => {
      html += '<div class="gh-column">';
      const firstValid = week.find((day) => day !== null);
      if (firstValid) {
        const month = new Date(firstValid.date).getMonth();
        if (month !== lastMonth) {
          monthsHtml += `<span style="position: absolute; left: ${columnIndex * 14}px;">${new Date(firstValid.date).toLocaleString('default', { month: 'short' })}</span>`;
          lastMonth = month;
        }
      }

      week.forEach((day) => {
        if (!day) {
          html += '<div class="gh-cell gh-empty"></div>';
        } else {
          html += `<div class="gh-cell gh-level-${day.level}" title="${day.count} contributions on ${day.date}"></div>`;
        }
      });

      html += '</div>';
    });

    gridEl.innerHTML = html;
    monthsEl.innerHTML = monthsHtml;
  };

  const updateStats = (total) => {
    if (!ghTotal || !ghCard) return;

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(ghTotal, total, '');
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(ghCard);
  };

  const tryFallback = async () => {
    try {
      const response = await fetch(`https://github-contributions-api.deno.dev/${githubUsername}.json`);
      if (!response.ok) throw new Error('Fallback API error');
      const data = await response.json();
      const weeks = data.contributions ?? [];
      const { total } = computeStreaks(weeks);
      updateStats(total);
    } catch (error) {
      console.warn('[GH Stats] Fallback failed.', error);
    }
  };

  const fetchGitHubStats = async () => {
    try {
      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`, { cache: 'no-cache' });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const contributions = data.contributions ?? [];
      const totalValue = contributions.reduce((sum, day) => sum + (day.count ?? 0), 0);
      const sorted = [...contributions].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
      renderGitHubGrid(sorted);
      updateStats(totalValue);
    } catch (error) {
      console.warn('[GH Stats] Primary API failed, trying fallback…', error);
      await tryFallback();
    }
  };

  fetchGitHubStats();
}
export function initVisitorCounter() {
  const countEl = byId('visitor-count');

  if (!countEl) {
    console.debug('Visitor counter element not found');
    return;
  }

  // Smooth count-up animation triggered on scroll into view
  const animateCount = (target) => {
    const duration = 1200;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      countEl.textContent = Math.round(target * easeOut(progress)).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const showCount = (count) => {
    const badge = byId('visitor-badge');
    if (!badge) { countEl.textContent = count.toLocaleString(); return; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(count);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(badge);
  };

  fetch('https://api.counterapi.dev/v1/aakarshdev/portfolio/up')
    .then(response => {
      if (!response.ok) throw new Error('Counter API error');
      return response.json();
    })
    .then(data => {
      if (data && typeof data.count === 'number') {
        showCount(data.count);
      } else {
        throw new Error('Invalid counter format');
      }
    })
    .catch(error => {
      console.warn('[Visitor Counter] API failed, falling back to local.', error);
      const storageKey = 'portfolio-visitor-count';
      const sessionKey = 'portfolio-visitor-counted';
      try {
        const existingCount = Number.parseInt(localStorage.getItem(storageKey) ?? '0', 10);
        const alreadyCounted = sessionStorage.getItem(sessionKey) === '1';

        if (!alreadyCounted) {
          const nextCount = Number.isFinite(existingCount) && existingCount > 0 ? existingCount + 1 : 1;
          localStorage.setItem(storageKey, String(nextCount));
          sessionStorage.setItem(sessionKey, '1');
          showCount(nextCount);
          return;
        }

        const safeCount = Number.isFinite(existingCount) && existingCount > 0 ? existingCount : 1;
        showCount(safeCount);
      } catch (localError) {
        countEl.textContent = '1';
      }
    });
}



