/**
 * Spotify API Integration
 * Handles authentication, token refresh, and fetching currently playing track
 */

const SPOTIFY_WIDGET_ID = 'spotify-widget';
const TOKEN_STORAGE_KEY = 'spotifyTokens';

export async function initSpotify() {
  try {
    // Check if we have tokens in localStorage
    let tokens = getStoredTokens();

    // Check URL params for callback (OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const spotifyToken = params.get('spotifyToken');
    const refreshToken = params.get('refreshToken');

    if (spotifyToken && refreshToken) {
      // We just came back from Spotify auth, store the tokens
      tokens = { accessToken: spotifyToken, refreshToken };
      storeTokens(tokens);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!tokens) {
      // No tokens, show login button
      showLoginPrompt();
      return;
    }

    // Try to fetch currently playing with stored token
    await fetchAndUpdateWidget(tokens.accessToken, tokens.refreshToken);

    // Poll for updates every 5 seconds
    setInterval(async () => {
      await fetchAndUpdateWidget(tokens.accessToken, tokens.refreshToken);
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
    const response = await fetch(`/api/spotify/currently-playing?accessToken=${encodeURIComponent(accessToken)}`);

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshResponse = await fetch(`/api/spotify/refresh?refreshToken=${encodeURIComponent(refreshToken)}`);
      if (refreshResponse.ok) {
        const newToken = await refreshResponse.json();
        storeTokens({ accessToken: newToken.accessToken, refreshToken });
        await fetchAndUpdateWidget(newToken.accessToken, refreshToken);
        return;
      } else {
        // Refresh failed, clear and show login
        clearTokens();
        showLoginPrompt();
        return;
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const track = await response.json();
    updateWidget(track);
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
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

  if (trackData.isPlaying === false) {
    // No track playing, show last played or empty state
    labelElement.textContent = 'LAST PLAYED';
    titleElement.textContent = 'Nothing playing';
    artistElement.textContent = 'Start playing on Spotify';
    artElement.src = '';
    linkElement.href = '#';
    return;
  }

  // Update widget with current track
  labelElement.textContent = trackData.isPlaying ? 'CURRENTLY PLAYING' : 'LAST PLAYED';
  titleElement.textContent = trackData.title || 'Unknown';
  artistElement.textContent = trackData.artist || 'Unknown';
  
  if (trackData.albumArt) {
    artElement.src = trackData.albumArt;
  }
  
  if (trackData.spotifyUrl) {
    linkElement.href = trackData.spotifyUrl;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
  }

  // Save to localStorage as fallback
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

  labelElement.textContent = 'SPOTIFY LOGIN REQUIRED';
  titleElement.textContent = 'Authenticate with Spotify';
  artistElement.textContent = '';

  const linkElement = document.getElementById('sp-link');
  linkElement.href = '#';
  linkElement.textContent = 'Click to Connect';
  linkElement.style.display = 'flex';
  
  // Remove any existing click handler and add a new one
  linkElement.replaceWith(linkElement.cloneNode(true));
  document.getElementById('sp-link').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/spotify/auth');
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
