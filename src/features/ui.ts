import { byId, throttle } from '../utils/dom';

const typingPhrases = [
  'Full Stack Developer.',
  'Creative Coder.',
  'Problem Solver.',
  'Open Source Enthusiast.',
  'Lifelong Learner.',
];

export function initAvatarToggle(): void {
  const avatar = byId('about-avatar-img') as HTMLImageElement | null;
  if (!avatar) return;

  const imgA = 'assets/aakarshh.png';
  const imgB = 'assets/icon.jpg';
  let isAlt = false;

  avatar.addEventListener('click', () => {
    avatar.classList.add('avatar-swapping');
    setTimeout(() => {
      isAlt = !isAlt;
      avatar.src = isAlt ? imgB : imgA;
      avatar.classList.remove('avatar-swapping');
    }, 300);
  });
}

export function initRevealObserver() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('reveal--visible');
    });
    return;
  }

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

export function initTypingAnimation() {
  const typingText = byId('typing-text');
  if (!typingText || typingText.dataset.typingInit === 'true') return;
  typingText.dataset.typingInit = 'true';

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timeoutId = null;

  const step = () => {
    const phrase = typingPhrases[phraseIndex];

    if (!deleting) {
      charIndex += 1;
      typingText.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        timeoutId = window.setTimeout(step, 1800);
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

    timeoutId = window.setTimeout(step, deleting ? 45 : 80);
  };

  step();

  window.addEventListener('beforeunload', () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

export function initScrollProgress() {
  const progressBar = byId('scroll-progress');
  if (!progressBar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function initAnimatedCounters() {
  const animateCounters = () => {
    document.querySelectorAll('.stat-value[data-target]').forEach((element) => {
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

  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) {
    console.debug('[UI] Stats section not found, skipping counters.');
    return;
  }

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

export function initProgressBars() {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.progress-bar').forEach((bar) => {
          const width = bar.getAttribute('data-width');
          if (width) {
            bar.style.width = `${width}%`;
          }
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const learningSection = document.querySelectorAll('#learning');
  if (learningSection.length === 0) {
    console.debug('[UI] Learning section not found, skipping progress bars.');
    return;
  }

  learningSection.forEach((element) => barObserver.observe(element));
}

export function initSkillTabs() {
  const skillsPanel = document.querySelector('.skills-panel');
  if (!skillsPanel) return;

  const tabs = Array.from(skillsPanel.querySelectorAll('.skills-tab[data-skill-group]'));
  const rows = Array.from(skillsPanel.querySelectorAll('.skill-row[data-skill-group]'));

  if (!tabs.length || !rows.length) return;

  const setActiveGroup = (group) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.skillGroup === group;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    rows.forEach((row) => {
      row.classList.toggle('is-hidden', row.dataset.skillGroup !== group);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveGroup(tab.dataset.skillGroup);
    });
  });

  setActiveGroup('frontend');
}

export function initCursorSpotlight() {
  const spotlight = byId('cursor-spotlight');
  if (!spotlight) return;

  const updateSpotlight = throttle((clientX, clientY) => {
    spotlight.style.left = `${clientX}px`;
    spotlight.style.top = `${clientY}px`;
  }, 16); // ~60fps

  const handleMouseMove = (event) => {
    updateSpotlight(event.clientX, event.clientY);
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
}

export function initNavScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks).map((link) => {
    const id = link.getAttribute('data-section');
    return { link, section: document.getElementById(id) };
  }).filter(({ section }) => section != null);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('data-section') === id;
      link.classList.toggle('active', active);
      if (active) {
        // Smooth scroll the active link into view if needed
        link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    });
  };

  // Use a better root margin for scroll detection
  const observer = new IntersectionObserver((entries) => {
    // Find the entry that's most in view
    const mostVisible = entries.reduce((max, entry) => {
      return entry.intersectionRatio > (max?.intersectionRatio ?? 0) ? entry : max;
    }, null);

    if (mostVisible?.isIntersecting) {
      setActive(mostVisible.target.id);
    }
  }, { 
    rootMargin: '-40% 0px -40% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });

  sections.forEach(({ section }) => observer.observe(section));

  // Handle click events for smooth scrolling
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      
      if (section) {
        // Set active immediately on click for better UX
        setActive(sectionId);
        
        // Scroll smoothly with appropriate offset
        const offsetTop = section.getBoundingClientRect().top + window.scrollY;
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 100;
        
        window.scrollTo({
          top: offsetTop - navHeight - 16,
          behavior: 'smooth'
        });
      }
    });
  });

  // Keyboard navigation support (Arrow keys for nav links)
  navLinks.forEach((link, index) => {
    link.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextLink = navLinks[(index + 1) % navLinks.length];
        nextLink.focus();
        nextLink.click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevLink = navLinks[(index - 1 + navLinks.length) % navLinks.length];
        prevLink.focus();
        prevLink.click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        navLinks[0].focus();
        navLinks[0].click();
      } else if (e.key === 'End') {
        e.preventDefault();
        navLinks[navLinks.length - 1].focus();
        navLinks[navLinks.length - 1].click();
      }
    });
  });
}

export function initMobileMenu() {
  // Mobile menu disabled - navbar is now horizontal on all devices
  return;
}

