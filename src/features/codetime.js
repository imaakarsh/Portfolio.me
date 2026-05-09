const POLL_INTERVAL = 5 * 60_000; // poll every 5 minutes

export function initCodeTime() {
  const timeEl    = document.getElementById('discord-codetime');
  const editorsEl = document.getElementById('discord-editors');
  const edTextEl  = document.getElementById('discord-editors-text');
  if (!timeEl) return;

  const fetchAndRender = async () => {
    try {
      const res  = await fetch('/api/codetime');
      let data = null;

      // Attempt to parse JSON even if the response is non-2xx so we can show
      // a meaningful message returned by the server.
      try {
        data = await res.json();
      } catch (e) {
        // Invalid JSON — treat as unavailable
        console.warn('[CodeTime] invalid json from API', e);
      }

      // If the request failed or the API returned an error flag, show a clear fallback
      if (!res.ok || (data && data.error)) {
        const msg = (data && data.text) ? data.text : 'CodeTime unavailable';
        timeEl.textContent = msg;
        if (edTextEl && editorsEl) {
          edTextEl.textContent = '';
          editorsEl.style.display = 'none';
        }
        return;
      }

      // Prefer a human-readable text field when available
      if (data && data.text) {
        timeEl.textContent = data.text;
      } else {
        const h = Number(data?.hours) || 0;
        const m = Number(data?.minutes) || 0;
        timeEl.textContent = `${h}h ${m}m coded today`;
      }

      // Update editors row
      if (data && data.editors && data.editors.length > 0 && edTextEl && editorsEl) {
        const names = data.editors.map(e => `${e.name} ${e.percent}%`).join('  ·  ');
        edTextEl.textContent = names;
        editorsEl.style.display = 'inline-flex';
      } else if (editorsEl) {
        editorsEl.style.display = 'none';
      }
    } catch (err) {
      console.error('[CodeTime] fetch failed:', err);
      timeEl.textContent = 'CodeTime unavailable';
      if (edTextEl && editorsEl) {
        edTextEl.textContent = '';
        editorsEl.style.display = 'none';
      }
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
