import {
  validateSpotifyConfig,
  getServerAccessToken,
  getAuthUrl,
  handleCallback,
  fetchPlaybackState,
} from '../utils/spotify-auth.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function refreshClientToken(refreshTokenParam) {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

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

  if (!tokenResponse.ok) throw new Error('Failed to refresh token');

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const action = url.searchParams.get('action');

  if (pathname.includes('/callback')) {
    return handleCallback(req, res);
  }

  if (action === 'auth') {
    return getAuthUrl(req, res);
  }

  if (action === 'refresh') {
    const refreshTokenParam = url.searchParams.get('refreshToken');
    if (!refreshTokenParam) {
      return res.status(400).json({ error: 'No refresh token provided' });
    }
    try {
      const accessToken = await refreshClientToken(refreshTokenParam);
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ accessToken });
    } catch {
      return res.status(500).json({ error: 'Failed to refresh token' });
    }
  }

  if (action === 'now-playing' || action === 'currently-playing') {
    if (!validateSpotifyConfig()) {
      return res.status(200).json({
        configured: false,
        needsAuth: true,
        error: 'Spotify credentials not configured',
      });
    }

    let accessToken = await getServerAccessToken();

    if (!accessToken) {
      accessToken = url.searchParams.get('accessToken');
    }

    if (!accessToken) {
      return res.status(200).json({
        configured: false,
        needsAuth: true,
        error: 'Add SPOTIFY_REFRESH_TOKEN or connect Spotify once',
      });
    }

    try {
      const track = await fetchPlaybackState(accessToken);
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ configured: true, needsAuth: false, ...track });
    } catch (error) {
      console.error('[Spotify] Playback fetch error:', error);
      return res.status(500).json({ configured: true, needsAuth: false, error: 'Failed to fetch playback' });
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
