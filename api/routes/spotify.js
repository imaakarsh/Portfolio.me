const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/api/spotify/callback';

function validateSpotifyConfig() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('[Spotify] Missing required environment variables: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    return false;
  }
  return true;
}

function getAuthUrl(req, res) {
  if (!validateSpotifyConfig()) {
    return res.status(500).json({ error: 'Spotify configuration incomplete' });
  }

  const scope = 'user-read-currently-playing user-read-playback-state';
  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope,
  }).toString()}`;

  res.json({ authUrl });
}

async function handleCallback(req, res) {
  if (!validateSpotifyConfig()) {
    return res.status(500).json({ error: 'Spotify configuration incomplete' });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const redirectUrl = `/?spotifyToken=${tokenData.access_token}&refreshToken=${tokenData.refresh_token}`;
    res.setHeader('Location', redirectUrl);
    res.status(302);
    res.end();
    return;
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

async function getCurrentlyPlaying(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const accessToken = url.searchParams.get('accessToken');

  if (!accessToken) {
    return res.status(400).json({ error: 'No access token provided' });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      return res.json({ isPlaying: false });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch currently playing track: ${response.status}`);
    }

    const data = await response.json();

    if (!data.item) {
      return res.json({ isPlaying: false });
    }

    const track = {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((artist) => artist.name).join(', '),
      albumArt: data.item.album.images[0]?.url,
      spotifyUrl: data.item.external_urls.spotify,
      duration: data.item.duration_ms,
      progress: data.progress_ms,
    };

    res.json(track);
  } catch (error) {
    console.error('Spotify API error:', error);
    res.status(500).json({ error: 'Failed to fetch track data' });
  }
}

async function refreshToken(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const refreshTokenParam = url.searchParams.get('refreshToken');

  if (!refreshTokenParam) {
    return res.status(400).json({ error: 'No refresh token provided' });
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshTokenParam,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await tokenResponse.json();
    res.json({ accessToken: tokenData.access_token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const action = url.searchParams.get('action');

  if (action === 'auth' || pathname === '/api/spotify/auth') {
    return getAuthUrl(req, res);
  }
  if (action === 'currently-playing' || pathname === '/api/spotify/currently-playing') {
    return await getCurrentlyPlaying(req, res);
  }
  if (action === 'refresh' || pathname === '/api/spotify/refresh') {
    return await refreshToken(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}
