const SPOTIFY_API = '/api/spotify';
const TOKEN_KEY = 'spotifyTokens';
const TRACK_KEY = 'spotifyLastTrack';
const POLL_MS = 30_000;

function getTokens() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

function cacheTrack(track) {
  if (track?.title) {
    localStorage.setItem(TRACK_KEY, JSON.stringify(track));
  }
}

function getCachedTrack() {
  try {
    const raw = localStorage.getItem(TRACK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function updateWidget(track) {
  const widget = document.getElementById('spotify-widget');
  if (!widget) return;

  const art = document.getElementById('sp-art');
  const placeholder = document.getElementById('sp-art-placeholder');
  const link = document.getElementById('sp-link');
  const play = document.getElementById('sp-play');

  if (!track?.title) {
    setText('sp-label', 'SPOTIFY');
    setText('sp-title', 'Nothing played yet');
    setText('sp-artist', 'Connect Spotify to show your music');
    if (art) art.hidden = true;
    if (placeholder) placeholder.hidden = false;
    if (link) link.removeAttribute('href');
    if (play) play.hidden = true;
    widget.classList.remove('spotify-card--playing');
    return;
  }

  setText('sp-label', track.label || 'LAST PLAYED');
  setText('sp-title', track.title);
  setText('sp-artist', track.artist || '');

  if (art && track.albumArt) {
    art.src = track.albumArt;
    art.alt = `${track.title} cover`;
    art.hidden = false;
    if (placeholder) placeholder.hidden = true;
  } else {
    if (art) art.hidden = true;
    if (placeholder) placeholder.hidden = false;
  }

  const url = track.spotifyUrl || '#';
  if (link) {
    link.href = url;
    link.setAttribute('aria-label', `Open ${track.title} on Spotify`);
  }
  if (play) {
    play.href = url;
    play.hidden = !track.spotifyUrl;
  }

  widget.classList.toggle('spotify-card--playing', Boolean(track.isPlaying));
  cacheTrack(track);
}

function showConnectState(message) {
  const widget = document.getElementById('spotify-widget');
  if (!widget) return;

  setText('sp-label', 'SPOTIFY');
  setText('sp-title', 'Connect Spotify');
  setText('sp-artist', message || 'One-time setup for local dev');

  const connect = document.getElementById('sp-connect');
  if (connect) connect.hidden = false;

  widget.classList.add('spotify-card--setup');
}

function hideConnectState() {
  const connect = document.getElementById('sp-connect');
  if (connect) connect.hidden = true;
  document.getElementById('spotify-widget')?.classList.remove('spotify-card--setup');
}

async function fetchPlayback(tokens) {
  const params = new URLSearchParams({ action: 'now-playing' });
  if (tokens?.accessToken) {
    params.set('accessToken', tokens.accessToken);
  }

  const response = await fetch(`${SPOTIFY_API}?${params}`, { cache: 'no-store' });

  if (response.status === 401 && tokens?.refreshToken) {
    const refreshRes = await fetch(
      `${SPOTIFY_API}?action=refresh&refreshToken=${encodeURIComponent(tokens.refreshToken)}`,
    );
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      saveTokens({ accessToken, refreshToken: tokens.refreshToken });
      return fetchPlayback({ accessToken, refreshToken: tokens.refreshToken });
    }
    clearTokens();
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
}

async function startAuth() {
  const response = await fetch(`${SPOTIFY_API}?action=auth`);
  const data = await response.json();
  if (data.authUrl) window.location.href = data.authUrl;
}

export async function initSpotify() {
  const widget = document.getElementById('spotify-widget');
  if (!widget) return;

  const params = new URLSearchParams(window.location.search);
  const spotifyToken = params.get('spotifyToken');
  const refreshToken = params.get('refreshToken');
  const spotifyError = params.get('spotifyError');

  if (spotifyError) {
    showConnectState('Auth failed — check Redirect URI in Spotify Dashboard');
    return;
  }

  if (spotifyToken && refreshToken) {
    saveTokens({ accessToken: spotifyToken, refreshToken });
    window.history.replaceState({}, document.title, window.location.pathname);
    hideConnectState();
  }

  const connectBtn = document.getElementById('sp-connect');
  connectBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    startAuth();
  });

  const cached = getCachedTrack();
  if (cached) updateWidget(cached);

  const load = async () => {
    try {
      const tokens = getTokens();
      const data = await fetchPlayback(tokens);

      if (data.needsAuth) {
        if (!tokens) {
          showConnectState('Add SPOTIFY_REFRESH_TOKEN in .env for production, or connect below');
        }
        return;
      }

      hideConnectState();
      updateWidget(data);
    } catch (error) {
      console.warn('[Spotify]', error);
      const cachedTrack = getCachedTrack();
      if (cachedTrack) updateWidget(cachedTrack);
    }
  };

  await load();
  setInterval(load, POLL_MS);
}
