import { byId } from '../utils/dom';
import { PROFILE } from '../config/constants';

const { githubUsername } = PROFILE;

export function initGitHubContributions() {
  const ghCard = byId('gh-glass-card');
  const ghTotal = byId('gh-total');
  const gridEl = byId('gh-calendar-grid');
  const monthsEl = byId('gh-calendar-months');

  type Contribution = { date: string; count?: number; level?: number };
  type Week = { contributionDays: Contribution[] };

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

  const animateValue = (element: HTMLElement, target: number, suffix = '') => {
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

  const computeStreaks = (weeks: Week[]) => {
    const days: Contribution[] = [];
    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: Contribution) => days.push(day));
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

  const renderGitHubGrid = (sorted: Contribution[]) => {
    if (!gridEl || !monthsEl || sorted.length === 0) return;

    const weeks: (Contribution | null)[][] = [];
    let currentWeek: (Contribution | null)[] = [];

    const firstDayIndex = new Date(sorted[0].date).getDay();
    for (let index = 0; index < firstDayIndex; index += 1) {
      currentWeek.push(null);
    }

    sorted.forEach((day: Contribution) => {
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
      const firstValid = week.find((day) => day !== null) as Contribution | null;
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

  const updateStats = (total: number) => {
    if (!ghTotal || !ghCard) return;

    // Update summary text
    const summaryText = byId('gh-summary-text');
    if (summaryText) {
      animateValue(summaryText as HTMLElement, total, '');
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
      const weeks = data.contributions ?? [] as Week[];
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

  // Smooth count-up animation
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

  const fetchAndUpdateCount = async (): Promise<void> => {
    try {
      const response = await fetch('/api/visitors?action=hit', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      const count = data.count ?? 0;

      console.debug(`[Visitor Counter] Incremented via backend. Total visits: ${count}`);
      showCount(count);
    } catch (error) {
      console.warn('[Visitor Counter] Backend unavailable, falling back to localStorage.', error);
      // Fallback: use localStorage for local counting
      try {
        const storageKey = 'portfolio-visitor-count-fallback';

        let currentCount = Number.parseInt(localStorage.getItem(storageKey) ?? '0', 10);
        
        // Ensure count is valid
        if (!Number.isFinite(currentCount) || currentCount < 0) {
          currentCount = 0;
        }

        currentCount += 1;
        localStorage.setItem(storageKey, String(currentCount));
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



