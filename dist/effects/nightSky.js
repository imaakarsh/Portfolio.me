import { byId } from '../utils/dom.js';

/**
 * Initialize animated night sky effect with stars and shooting stars
 * Only displays in dark mode and properly cleans up resources
 */
export function initNightSky() {
  const canvas = byId('night-sky');
  if (!canvas) {
    console.debug('Night sky canvas not found');
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    console.warn('Unable to get 2D canvas context');
    return;
  }

  let width = 0;
  let height = 0;
  let stars = [];
  let shooters = [];
  let raf = null;
  let spawnInterval = null;

  const starCount = 200;
  const twinkleSpeed = 0.012;

  let resizeTimer = null;
  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
  };
  const debouncedResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      stars = Array.from({ length: starCount }, randomStar);
    }, 150);
  };

  const randomStar = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.4 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * twinkleSpeed + 0.004,
    dir: Math.random() < 0.5 ? 1 : -1,
    color: ['#ffffff', '#cce4ff', '#ffe4cc', '#d4ccff'][Math.floor(Math.random() * 4)],
  });

  const spawnShooter = () => {
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

  const init = () => {
    stars = Array.from({ length: starCount }, randomStar);
    if (spawnInterval) {
      clearInterval(spawnInterval);
    }
    spawnInterval = window.setInterval(spawnShooter, 3200);
  };

  const drawAurora = () => {
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

  const draw = () => {
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

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  const start = () => {
    canvas.style.opacity = '1';
    if (raf === null) {
      draw();
    }
  };

  const stop = () => {
    canvas.style.opacity = '0';
    if (raf !== null) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
  };

  const cleanup = () => {
    stop();
    if (spawnInterval) {
      clearInterval(spawnInterval);
      spawnInterval = null;
    }
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('resize', debouncedResize);
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
    debouncedResize();
  });
  resizeObserver.observe(document.body);

  window.addEventListener('resize', debouncedResize);
  window.addEventListener('beforeunload', cleanup);

  resize();
  init();
  if (isDark()) {
    start();
  } else {
    stop();
  }
}
