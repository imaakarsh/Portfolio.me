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

export default async function handler(req, res) {
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