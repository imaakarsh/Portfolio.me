const POLL_INTERVAL = 5 * 60_000; // poll every 5 minutes

export function initWakaTime() {
  const timeEl    = document.getElementById('discord-wakatime');
  const editorsEl = document.getElementById('discord-editors');
  const edTextEl  = document.getElementById('discord-editors-text');
  if (!timeEl) return;

  const fetchAndRender = async () => {
    try {
      const res  = await fetch('/api/wakatime');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.error) return; // No key configured yet

      // Update time text
      const h = data.hours   || 0;
      const m = data.minutes || 0;
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
  setInterval(fetchAndRender, POLL_INTERVAL);
}
