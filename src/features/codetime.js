const POLL_INTERVAL = 5 * 60_000; // poll every 5 minutes

export function initCodeTime() {
  const timeEl    = document.getElementById('discord-codetime');
  const editorsEl = document.getElementById('discord-editors');
  const edTextEl  = document.getElementById('discord-editors-text');
  if (!timeEl) return;

  const fetchAndRender = async () => {
    try {
      const res  = await fetch('/api/codetime');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.error) {
        timeEl.textContent = 'CodeTime unavailable';
        if (edTextEl && editorsEl) {
          edTextEl.textContent = '';
          editorsEl.style.display = 'none';
        }
        return;
      }

      // Update time text
      const h = Number(data.hours) || 0;
      const m = Number(data.minutes) || 0;
      timeEl.textContent = `${h}h ${m}m coded today`;

      // Update editors row
      if (data.editors && data.editors.length > 0 && edTextEl && editorsEl) {
        const names = data.editors.map(e => `${e.name} ${e.percent}%`).join('  ·  ');
        edTextEl.textContent = names;
        editorsEl.style.display = 'inline-flex';
      }
    } catch {
      // API not available — keep placeholder
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
