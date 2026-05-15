/**
 * Spotify API Integration
 * Handles authentication, token refresh, and fetching currently playing track
 */

const SPOTIFY_WIDGET_ID = 'spotify-widget';
const TOKEN_STORAGE_KEY = 'spotifyTokens';
const SPOTIFY_API_BASE = '/api/spotify';

export async function initSpotify() {
  try {
    let tokens = getStoredTokens();

    const params = new URLSearchParams(window.location.search);
    const spotifyToken = params.get('spotifyToken');
    const refreshToken = params.get('refreshToken');

    if (spotifyToken && refreshToken) {
      tokens = { accessToken: spotifyToken, refreshToken };
      storeTokens(tokens);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!tokens) {
      showLoginPrompt();
      return;
    }

    await fetchAndUpdateWidget(tokens.accessToken, tokens.refreshToken);

    setInterval(async () => {
      const latest = getStoredTokens();
      if (latest) {
        await fetchAndUpdateWidget(latest.accessToken, latest.refreshToken);
      }
    }, 5000);
  } catch (error) {
    console.error('Spotify initialization error:', error);
    showLoginPrompt();
  }
}

function getStoredTokens() {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function storeTokens(tokens) {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function fetchAndUpdateWidget(accessToken, refreshToken) {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}?action=currently-playing&accessToken=${encodeURIComponent(accessToken)}`);

    if (response.status === 401) {
      const refreshResponse = await fetch(`${SPOTIFY_API_BASE}?action=refresh&refreshToken=${encodeURIComponent(refreshToken)}`);
      if (refreshResponse.ok) {
        const newToken = await refreshResponse.json();
        storeTokens({ accessToken: newToken.accessToken, refreshToken });
        await fetchAndUpdateWidget(newToken.accessToken, refreshToken);
        return;
      }

      clearTokens();
      showLoginPrompt();
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const track = await response.json();
    updateWidget(track);
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    updateWidget(getStoredTrackData());
  }
}

function getStoredTrackData() {
  const stored = localStorage.getItem('trackData');

  if (!stored) {
    return { isPlaying: false };
  }

  try {
    const track = JSON.parse(stored);
    return track ? { ...track, isPlaying: false } : { isPlaying: false };
  } catch {
    return { isPlaying: false };
  }
}

function updateWidget(trackData) {
  const widget = document.getElementById(SPOTIFY_WIDGET_ID);
  if (!widget) return;

  const artElement = document.getElementById('sp-art');
  const labelElement = document.getElementById('sp-label');
  const titleElement = document.getElementById('sp-title');
  const artistElement = document.getElementById('sp-artist');
  const linkElement = document.getElementById('sp-link');

  const setText = (el, txt) => { if (el) el.textContent = txt; };

  if (trackData.isPlaying === false) {
    const lastPlayed = getStoredTrackData();

    if (lastPlayed.title) {
      setText(labelElement, 'LAST PLAYED');
      setText(titleElement, lastPlayed.title);
      setText(artistElement, lastPlayed.artist || '');

      if (artElement) {
        if (lastPlayed.albumArt) {
          artElement.src = lastPlayed.albumArt;
          artElement.style.display = 'block';
        } else {
          artElement.src = '';
          artElement.style.display = 'none';
        }
      }

      if (linkElement) {
        if (lastPlayed.spotifyUrl) {
          linkElement.href = lastPlayed.spotifyUrl;
          linkElement.style.display = 'flex';
        } else {
          linkElement.href = '#';
          linkElement.style.display = 'none';
        }
      }
    } else {
      setText(labelElement, 'LAST PLAYED');
      setText(titleElement, 'Nothing playing');
      setText(artistElement, 'Start playing on Spotify');
      if (artElement) { artElement.src = ''; artElement.style.display = 'none'; }
      if (linkElement) { linkElement.href = '#'; linkElement.style.display = 'none'; }
    }
    return;
  }

  setText(labelElement, trackData.isPlaying ? 'CURRENTLY PLAYING' : 'LAST PLAYED');
  setText(titleElement, trackData.title || 'Unknown');
  setText(artistElement, trackData.artist || 'Unknown');

  if (artElement) {
    if (trackData.albumArt) {
      artElement.src = trackData.albumArt;
      artElement.style.display = 'block';
    } else {
      artElement.src = '';
      artElement.style.display = 'none';
    }
  }

  if (linkElement) {
    if (trackData.spotifyUrl) {
      linkElement.href = trackData.spotifyUrl;
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';
      linkElement.style.display = 'flex';
    } else {
      linkElement.href = '#';
      linkElement.style.display = 'none';
    }
  }

  if (trackData.isPlaying) {
    localStorage.setItem('trackData', JSON.stringify({
      title: trackData.title,
      artist: trackData.artist,
      albumArt: trackData.albumArt,
      spotifyUrl: trackData.spotifyUrl,
    }));
  }
}

function showLoginPrompt() {
  const widget = document.getElementById(SPOTIFY_WIDGET_ID);
  if (!widget) return;

  const titleElement = document.getElementById('sp-title');
  const artistElement = document.getElementById('sp-artist');
  const labelElement = document.getElementById('sp-label');

  if (labelElement) labelElement.textContent = 'SPOTIFY LOGIN REQUIRED';
  if (titleElement) titleElement.textContent = 'Authenticate with Spotify';
  if (artistElement) artistElement.textContent = '';

  const linkElement = document.getElementById('sp-link');
  if (!linkElement) return;
  linkElement.href = '#';
  linkElement.textContent = 'Click to Connect';
  linkElement.style.display = 'flex';

  const newLink = linkElement.cloneNode(true);
  linkElement.replaceWith(newLink);
  newLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}?action=auth`);
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error fetching auth URL:', error);
    }
  });
}

export function logoutSpotify() {
  clearTokens();
  showLoginPrompt();
}