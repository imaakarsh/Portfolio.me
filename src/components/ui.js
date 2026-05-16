import { byId, throttle } from '../utils/dom';

const typingPhrases = [
  'build',
  'ship',
  'code',
  'gym',
  'repeat',
];

export function initAvatarToggle() {
  const avatar = byId('about-avatar-img');
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
  }, 16);

  const handleMouseMove = (event) => {
    updateSpotlight(event.clientX, event.clientY);
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
}

export function initNavScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll('.nav-link[data-section]'));
  if (!navLinks.length) return;

  const sections = navLinks.map((link) => {
    const id = link.getAttribute('data-section');
    return { link, section: document.getElementById(id) };
  }).filter(({ section }) => section != null);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('data-section') === id;
      link.classList.toggle('active', active);
      if (active) {
        link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const mostVisible = entries.reduce((max, entry) => {
      return entry.intersectionRatio > (max?.intersectionRatio ?? 0) ? entry : max;
    }, null);

    if (mostVisible?.isIntersecting) {
      setActive(mostVisible.target.id);
    }
  }, {
    rootMargin: '-40% 0px -40% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });

  sections.forEach(({ section }) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      const section = document.getElementById(sectionId);

      if (section) {
        setActive(sectionId);

        const offsetTop = section.getBoundingClientRect().top + window.scrollY;
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 100;

        window.scrollTo({
          top: offsetTop - navHeight - 16,
          behavior: 'smooth',
        });
      }
    });
  });

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
  const menuBtn = byId('nav-menu-btn');
  const navLinks = byId('nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!isExpanded));
    navLinks.classList.toggle('nav-links--active');
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('nav-links--active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
      menuBtn.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('nav-links--active');
    }
  });
}
