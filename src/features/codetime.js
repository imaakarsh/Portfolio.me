const POLL_INTERVAL = 5 * 60_000; // poll every 5 minutes

export function initCodeTime() {
  const timeEl = document.getElementById('discord-codetime');
  if (!timeEl) return;

  const fetchAndRender = async () => {
    try {
      const res = await fetch('/api/codetime');
      const data = await res.json();

      if (data && data.text) {
        timeEl.textContent = data.text;
      } else {
        timeEl.textContent = 'CodeTime unavailable';
      }
    } catch (err) {
      console.error('[CodeTime] fetch failed:', err);
      timeEl.textContent = 'CodeTime unavailable';
    }
  };

  fetchAndRender();
  const intervalId = setInterval(() => {
    if (!document.hidden) {
      fetchAndRender();
    }
  }, POLL_INTERVAL);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      fetchAndRender();
    }
  });

  window.addEventListener('beforeunload', () => clearInterval(intervalId), { once: true });
}
