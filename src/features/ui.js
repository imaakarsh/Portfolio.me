import { byId, throttle } from '../utils/dom.js';

const typingPhrases = [
  'Full Stack Developer.',
  'Creative Coder.',
  'Problem Solver.',
  'Open Source Enthusiast.',
  'Lifelong Learner.',
];

export function initAvatarToggle() {
  const avatar = byId('about-avatar-img');
  if (!avatar) return;

  avatar.addEventListener('click', () => {
    avatar.classList.toggle('avatar-clicked');
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

  document.querySelectorAll('#learning').forEach((element) => barObserver.observe(element));
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
