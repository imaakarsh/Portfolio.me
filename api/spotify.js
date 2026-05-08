const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/api/spotify/callback';

// Get the authorization URL for the user to log in
function getAuthUrl(req, res) {
  const scope = 'user-read-currently-playing user-read-playback-state';
  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scope,
  }).toString()}`;

  // Return auth URL as JSON - frontend will handle redirect
  res.json({ authUrl });
}

// Handle the OAuth callback
async function handleCallback(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    // Exchange authorization code for access token
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
    
    // Redirect back with the token as a query param
    const redirectUrl = `/?spotifyToken=${tokenData.access_token}&refreshToken=${tokenData.refresh_token}`;
    res.setHeader('Location', redirectUrl);
    res.status(302);
    res.end();
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Fetch currently playing track
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
      // No content - user is not currently playing anything
      return res.json({ isPlaying: false });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch currently playing track: ${response.status}`);
    }

    const data = await response.json();

    if (!data.item) {
      return res.json({ isPlaying: false });
    }

    // Extract relevant track information
    const track = {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map(a => a.name).join(', '),
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

// Refresh the access token
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

// Main handler for routing
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/api/spotify/auth') {
    return getAuthUrl(req, res);
  }
  if (pathname === '/api/spotify/callback') {
    return await handleCallback(req, res);
  }
  if (pathname === '/api/spotify/currently-playing') {
    return await getCurrentlyPlaying(req, res);
  }
  if (pathname === '/api/spotify/refresh') {
    return await refreshToken(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}
