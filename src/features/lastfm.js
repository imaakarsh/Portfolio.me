import { byId } from '../utils/dom.js';

const POLL_INTERVAL = 30_000;

export function initLastFm() {
  const widget  = byId('spotify-widget'); // We can reuse the same widget ID or rename it
  const section = byId('sp-section');
  if (!widget || !section) return;

  const fetchAndRender = async () => {
    try {
      const res = await fetch('/api/lastfm');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      render(data);
    } catch {
      render({ isPlaying: false });
    }
  };

  fetchAndRender();
  setInterval(fetchAndRender, POLL_INTERVAL);
}

function render(data) {
  const art    = byId('sp-art');
  const title  = byId('sp-title');
  const artist = byId('sp-artist');
  const label  = byId('sp-label');
  const link   = byId('sp-link');

  if (!data.isPlaying) {
    if (label)  label.textContent     = 'LAST SCROBBLED';
    if (art)    art.style.display     = 'none';
    if (title)  title.textContent     = data.title || 'Not listening';
    if (artist) artist.textContent    = data.artist ? `by: ${data.artist}` : '';
    if (link)   link.style.display    = 'none';
    return;
  }

  // Playing state
  if (label)  label.textContent     = 'CURRENTLY LISTENING';
  if (art)    { art.src = data.albumArt || ''; art.style.display = 'block'; }
  if (title)  title.textContent     = data.title  || '';
  if (artist) artist.textContent    = data.artist ? `by: ${data.artist}` : '';
  if (link)   { link.href = data.songUrl || '#'; link.style.display = 'inline-flex'; }
}
