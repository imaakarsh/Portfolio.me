import { byId } from '../utils/dom.js';

const POLL_INTERVAL = 30_000; // 30 seconds

export function initSpotify() {
  const widget  = byId('spotify-widget');
  const section = byId('sp-section');
  if (!widget || !section) return;

  // Always visible
  section.style.display = 'block';

  const fetchAndRender = async () => {
    try {
      const res = await fetch('/api/spotify');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      render(widget, data);
    } catch {
      render(widget, { isPlaying: false });
    }
  };

  fetchAndRender();
  setInterval(fetchAndRender, POLL_INTERVAL);
}

function render(widget, data) {
  const art    = byId('sp-art');
  const title  = byId('sp-title');
  const artist = byId('sp-artist');
  const label  = byId('sp-label');
  const link   = byId('sp-link');

  if (!data.isPlaying) {
    if (label)  label.textContent  = 'LAST PLAYED';
    if (art)    { art.src = ''; art.style.display = 'none'; }
    if (title)  title.textContent  = '—';
    if (artist) artist.textContent = '';
    return;
  }

  // Playing
  if (label)  label.textContent  = 'CURRENTLY PLAYING';
  if (art)    { art.src = data.albumArt || ''; art.style.display = 'block'; }
  if (title)  title.textContent  = data.title  || '';
  if (artist) artist.textContent = data.artist ? `by: ${data.artist}` : '';
  if (link)   link.href = data.songUrl || '#';
}
