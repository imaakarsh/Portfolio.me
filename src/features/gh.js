import { byId } from '../utils/dom';
import { PROFILE } from '../config/constants';

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
      const contribution = days[index].count ?? 0;
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
    if (!gridEl || sorted.length === 0) return;

    // Build weeks array
    const weeks = [];
    let currentWeek = [];
    const firstDayIndex = new Date(sorted[0].date).getDay();
    
    // Add empty cells for days before the first date
    for (let i = 0; i < firstDayIndex; i += 1) {
      currentWeek.push(null);
    }

    // Add all contribution days
    sorted.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Fill remaining cells in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Render calendar grid columns
    let gridHtml = '';
    weeks.forEach((week) => {
      gridHtml += '<div class="gh-column">';
      week.forEach((day) => {
        if (!day) {
          gridHtml += '<div class="gh-cell gh-empty"></div>';
        } else {
          gridHtml += `<div class="gh-cell gh-level-${day.level}" title="${day.count} contributions on ${day.date}"></div>`;
        }
      });
      gridHtml += '</div>';
    });

    gridEl.innerHTML = gridHtml;

    // Render months row - calculate month positions
    const monthsEl = byId('gh-calendar-months');
    if (monthsEl) {
      let monthsHtml = '';
      let lastMonth = -1;
      
      weeks.forEach((week) => {
        const firstDay = week.find(d => d !== null);
        if (firstDay) {
          const month = new Date(firstDay.date).getMonth();
          if (month !== lastMonth) {
            const monthName = new Date(firstDay.date).toLocaleString('default', { month: 'short' });
            monthsHtml += `<span>${monthName}</span>`;
            lastMonth = month;
          }
        }
      });
      
      monthsEl.innerHTML = monthsHtml;
    }

    // Update year summary
    const yearSummaryEl = byId('gh-year-summary');
    if (yearSummaryEl) {
      const total = sorted.reduce((sum, day) => sum + (day.count ?? 0), 0);
      yearSummaryEl.textContent = `${total} contributions in the last year`;
    }
  };

  const updateStats = (total) => {
    if (!ghTotal || !ghCard) return;

    const summaryText = byId('gh-summary-text');
    if (summaryText) {
      animateValue(summaryText, total, '');
    }

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
    if (!badge) {
      countEl.textContent = count.toLocaleString();
      return;
    }

    countEl.textContent = count.toLocaleString();

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

  const fetchAndUpdateCount = async () => {
    try {
      const response = await fetch('/api/visitors?action=hit', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      let count = data.count ?? 0;

      if (!Number.isFinite(count) || count < 0) {
        count = 0;
      }

      console.debug(`[Visitor Counter] Incremented via backend. Total visits: ${count}`);
      showCount(count);
    } catch (error) {
      console.warn('[Visitor Counter] Backend unavailable, falling back to localStorage.', error);
      try {
        const storageKey = 'portfolio-visitor-count-fallback';

        let currentCount = parseInt(localStorage.getItem(storageKey) ?? '0', 10);

        if (!Number.isFinite(currentCount) || currentCount < 0) {
          currentCount = 0;
        }

        currentCount += 1;
        try {
          localStorage.setItem(storageKey, String(currentCount));
        } catch (e) {
          console.warn('LocalStorage full or disabled:', e);
          return;
        }
        console.debug(`[Visitor Counter] Incremented locally (fallback). Total: ${currentCount}`);

        showCount(currentCount);
      } catch (storageError) {
        console.warn('[Visitor Counter] Storage unavailable.', storageError);
        countEl.textContent = '—';
      }
    }
  };

  fetchAndUpdateCount();
}