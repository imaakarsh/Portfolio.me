import './oneko.js';

type Theme = 'light' | 'dark';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionApiResponse {
  contributions?: ContributionDay[];
  total?: Record<string, number>;
  weeks?: ContributionWeek[];
}

const themeStorageKey = 'portfolio-theme';
const githubUsername = 'imaakarsh';
const typingPhrases = [
  'Full Stack Developer.',
  'Creative Coder.',
  'Problem Solver.',
  'Open Source Enthusiast.',
  'Lifelong Learner.',
];

function byId<T extends Element>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function initTheme(): void {
  const themeToggle = byId<HTMLButtonElement>('theme-toggle');
  const themeToggleIcon = byId<HTMLSpanElement>('theme-toggle-icon');

  const getTheme = (): Theme => {
    const current = document.documentElement.getAttribute('data-theme');
    return current === 'light' ? 'light' : 'dark';
  };

  const applyTheme = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme);

    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Ignore storage failures and keep the session theme only.
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

  try {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      applyTheme(savedTheme);
    } else {
      applyTheme(getTheme());
    }
  } catch {
    applyTheme(getTheme());
  }
}

function initAvatarToggle(): void {
  const avatar = byId<HTMLImageElement>('about-avatar-img');
  if (!avatar) return;

  avatar.addEventListener('click', () => {
    avatar.classList.toggle('avatar-clicked');
  });
}

function initBlogFiltering(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.blog-tag[data-blog-tag]'));
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.blog-card'));

  const applyFilter = (button: HTMLButtonElement, tag: string): void => {
    buttons.forEach((otherButton) => otherButton.classList.remove('active'));
    button.classList.add('active');

    cards.forEach((card) => {
      if (tag === 'all') {
        card.classList.remove('hidden');
        return;
      }

      const tags = card.getAttribute('data-tags') ?? '';
      const visible = tags.split(' ').includes(tag);
      card.classList.toggle('hidden', !visible);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button, button.dataset.blogTag ?? 'all');
    });
  });
}

function initBlogShowMore(): void {
  const button = byId<HTMLButtonElement>('blog-show-more-btn');
  const countEl = byId<HTMLSpanElement>('blog-more-count');
  const labelEl = document.querySelector<HTMLSpanElement>('.blog-show-more-label');
  const chevron = byId<SVGElement>('blog-chevron');
  const collapsedCards = Array.from(document.querySelectorAll<HTMLElement>('.blog-card--collapsed'));

  if (!button || !countEl || !labelEl || !chevron) return;

  const setExpanded = (expanded: boolean): void => {
    if (expanded) {
      collapsedCards.forEach((card) => {
        card.style.display = 'flex';
      });
      button.classList.add('expanded');
      chevron.style.transform = 'rotate(180deg)';
      countEl.textContent = '';
      labelEl.textContent = 'Show Less';
      return;
    }

    collapsedCards.forEach((card) => {
      card.style.display = '';
    });
    button.classList.remove('expanded');
    chevron.style.transform = '';
    countEl.textContent = collapsedCards.length > 0 ? `(${collapsedCards.length} more)` : '';
    labelEl.textContent = 'Show More';
  };

  setExpanded(false);
  button.addEventListener('click', () => {
    setExpanded(!button.classList.contains('expanded'));
  });
}

function initRevealObserver(): void {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}

function initTypingAnimation(): void {
  const typingText = byId<HTMLSpanElement>('typing-text');
  if (!typingText) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const step = (): void => {
    const phrase = typingPhrases[phraseIndex];

    if (!deleting) {
      charIndex += 1;
      typingText.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        window.setTimeout(step, 1800);
        return;
      }
    } else {
      charIndex -= 1;
      typingText.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % typingPhrases.length;
      }
    }

    window.setTimeout(step, deleting ? 45 : 80);
  };

  step();
}

function initScrollProgress(): void {
  const progressBar = byId<HTMLDivElement>('scroll-progress');
  if (!progressBar) return;

  const update = (): void => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initAnimatedCounters(): void {
  const animateCounters = (): void => {
    document.querySelectorAll<HTMLElement>('.stat-value[data-target]').forEach((element) => {
      const target = Number(element.getAttribute('data-target'));
      const duration = 1200;
      const step = target / (duration / 16);
      let current = 0;

      const timer = window.setInterval(() => {
        current = Math.min(current + step, target);
        element.textContent = `${Math.round(current)}+`;
        if (current >= target) {
          window.clearInterval(timer);
        }
      }, 16);
    });
  };

  const statsSection = document.querySelector<HTMLElement>('.stats-section');
  if (!statsSection) return;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  statsObserver.observe(statsSection);
}

function initProgressBars(): void {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll<HTMLElement>('.progress-bar').forEach((bar) => {
          const width = bar.getAttribute('data-width');
          if (width) {
            bar.style.width = `${width}%`;
          }
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll<HTMLElement>('#learning').forEach((element) => barObserver.observe(element));
}

function initCursorSpotlight(): void {
  const spotlight = byId<HTMLDivElement>('cursor-spotlight');
  if (!spotlight) return;

  document.addEventListener('mousemove', (event) => {
    spotlight.style.left = `${event.clientX}px`;
    spotlight.style.top = `${event.clientY}px`;
  });
}

function initNightSky(): void {
  const canvas = byId<HTMLCanvasElement>('night-sky');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  type Star = {
    x: number;
    y: number;
    r: number;
    alpha: number;
    speed: number;
    dir: 1 | -1;
    color: string;
  };

  type Shooter = {
    x: number;
    y: number;
    len: number;
    speed: number;
    alpha: number;
    angle: number;
  };

  let width = 0;
  let height = 0;
  let stars: Star[] = [];
  let shooters: Shooter[] = [];
  let raf: number | null = null;

  const starCount = 200;
  const twinkleSpeed = 0.012;

  const resize = (): void => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
  };

  const randomStar = (): Star => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.4 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * twinkleSpeed + 0.004,
    dir: Math.random() < 0.5 ? 1 : -1,
    color: ['#ffffff', '#cce4ff', '#ffe4cc', '#d4ccff'][Math.floor(Math.random() * 4)],
  });

  const spawnShooter = (): void => {
    if (shooters.length > 2) return;
    shooters.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.4,
      len: Math.random() * 120 + 60,
      speed: Math.random() * 8 + 6,
      alpha: 1,
      angle: Math.PI / 5,
    });
  };

  const init = (): void => {
    stars = Array.from({ length: starCount }, randomStar);
    window.setInterval(spawnShooter, 3200);
  };

  const drawAurora = (): void => {
    const g1 = context.createRadialGradient(width * 0.3, height * 0.08, 0, width * 0.3, height * 0.08, width * 0.55);
    g1.addColorStop(0, 'rgba(56,189,248,0.06)');
    g1.addColorStop(0.5, 'rgba(139,92,246,0.04)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = g1;
    context.fillRect(0, 0, width, height);

    const g2 = context.createRadialGradient(width * 0.75, height * 0.12, 0, width * 0.75, height * 0.12, width * 0.45);
    g2.addColorStop(0, 'rgba(52,211,153,0.05)');
    g2.addColorStop(0.5, 'rgba(99,102,241,0.035)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = g2;
    context.fillRect(0, 0, width, height);
  };

  const draw = (): void => {
    context.clearRect(0, 0, width, height);
    drawAurora();

    stars.forEach((star) => {
      star.alpha += star.speed * star.dir;
      if (star.alpha >= 1) {
        star.alpha = 1;
        star.dir = -1;
      }
      if (star.alpha <= 0.08) {
        star.alpha = 0.08;
        star.dir = 1;
      }

      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fillStyle = star.color;
      context.globalAlpha = star.alpha;
      context.fill();
    });

    shooters = shooters.filter((shooter) => shooter.alpha > 0);
    shooters.forEach((shooter) => {
      const endX = shooter.x + Math.cos(shooter.angle) * shooter.len;
      const endY = shooter.y + Math.sin(shooter.angle) * shooter.len;
      const gradient = context.createLinearGradient(shooter.x, shooter.y, endX, endY);
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(0.3, `rgba(255,255,255,${shooter.alpha * 0.9})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.globalAlpha = 1;
      context.strokeStyle = gradient;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(shooter.x, shooter.y);
      context.lineTo(endX, endY);
      context.stroke();
      shooter.x += Math.cos(shooter.angle) * shooter.speed;
      shooter.y += Math.sin(shooter.angle) * shooter.speed;
      shooter.alpha -= 0.018;
    });

    context.globalAlpha = 1;
    raf = window.requestAnimationFrame(draw);
  };

  const isDark = (): boolean => document.documentElement.getAttribute('data-theme') !== 'light';

  const start = (): void => {
    canvas.style.opacity = '1';
    if (raf === null) {
      draw();
    }
  };

  const stop = (): void => {
    canvas.style.opacity = '0';
    if (raf !== null) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
  };

  const observer = new MutationObserver(() => {
    if (isDark()) {
      start();
    } else {
      stop();
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(document.body);

  window.addEventListener('resize', resize);
  resize();
  init();
  if (isDark()) {
    start();
  } else {
    stop();
  }
}

function initGitHubContributions(): void {
  const ghCard = byId<HTMLDivElement>('gh-glass-card');
  const ghTotal = byId<HTMLSpanElement>('gh-total');
  const gridEl = byId<HTMLDivElement>('gh-calendar-grid');
  const monthsEl = byId<HTMLDivElement>('gh-calendar-months');

  if (ghCard) {
    const ghObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ghCard.classList.add('gh-animated');
          ghObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    ghObserver.observe(ghCard);
  }

  const animateValue = (element: HTMLElement, target: number, suffix = ''): void => {
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
  };

  const computeStreaks = (weeks: ContributionWeek[]): { total: number; current: number; longest: number } => {
    const days: ContributionDay[] = [];
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

  const renderGitHubGrid = (sorted: ContributionDay[]): void => {
    if (!gridEl || !monthsEl || sorted.length === 0) return;

    const weeks: Array<Array<ContributionDay | null>> = [];
    let currentWeek: Array<ContributionDay | null> = [];

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
      const firstValid = week.find((day): day is ContributionDay => day !== null);
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

  const updateStats = (total: number): void => {
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

  const tryFallback = async (): Promise<void> => {
    try {
      const response = await fetch(`https://github-contributions-api.deno.dev/${githubUsername}.json`);
      if (!response.ok) throw new Error('Fallback API error');
      const data = await response.json() as { contributions?: ContributionWeek[] };
      const weeks = data.contributions ?? [];
      const { total } = computeStreaks(weeks);
      updateStats(total);
    } catch (error) {
      console.warn('[GH Stats] Fallback failed.', error);
    }
  };

  const fetchGitHubStats = async (): Promise<void> => {
    try {
      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`, { cache: 'no-cache' });
      if (!response.ok) throw new Error('API error');
      const data = await response.json() as ContributionApiResponse;
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

  void fetchGitHubStats();
}

function initVisitorCounter(): void {
  const namespace = 'aakarshdev-portfolio';
  const key = 'pageviews';
  const pollMs = 30_000;
  const countEl = byId<HTMLSpanElement>('visitor-count');
  let lastValue: number | null = null;

  if (!countEl) return;

  const setCount = (target: number, animate: boolean): void => {
    if (!animate || lastValue === null) {
      const duration = 1000;
      const step = Math.max(1, Math.floor(target / (duration / 16)));
      let current = Math.max(0, target - step * 20);
      countEl.textContent = current.toLocaleString();
      const timer = window.setInterval(() => {
        current = Math.min(current + step, target);
        countEl.textContent = current.toLocaleString();
        if (current >= target) {
          window.clearInterval(timer);
        }
      }, 16);
    } else if (target !== lastValue) {
      const diff = target - lastValue;
      const steps = Math.abs(diff);
      const direction = Math.sign(diff);
      let done = 0;
      let current = lastValue;
      const timer = window.setInterval(() => {
        current += direction;
        countEl.textContent = current.toLocaleString();
        done += 1;
        if (done >= steps) {
          window.clearInterval(timer);
        }
      }, Math.max(16, Math.round(300 / steps)));
    }

    lastValue = target;
  };

  const fetchCount = async (isFirst: boolean): Promise<void> => {
    try {
      const firstVisit = isFirst && !sessionStorage.getItem('vc_counted');
      const endpoint = firstVisit
        ? `https://api.counterapi.dev/v1/${namespace}/${key}/up`
        : `https://api.counterapi.dev/v1/${namespace}/${key}`;

      const response = await fetch(endpoint, { cache: 'no-store' });
      if (!response.ok) throw new Error(`counterapi ${response.status}`);
      const data = await response.json() as { count?: number };

      if (firstVisit) {
        sessionStorage.setItem('vc_counted', '1');
      }

      if (data.count != null) {
        setCount(data.count, !isFirst);
      }
    } catch (error) {
      console.warn('[Visitor Counter]', error);
    }
  };

  void fetchCount(true);
  window.setInterval(() => {
    void fetchCount(false);
  }, pollMs);
}

function init(): void {
  initTheme();
  initAvatarToggle();
  initBlogFiltering();
  initBlogShowMore();
  initRevealObserver();
  initTypingAnimation();
  initScrollProgress();
  initAnimatedCounters();
  initProgressBars();
  initCursorSpotlight();
  initNightSky();
  initGitHubContributions();
  initVisitorCounter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
