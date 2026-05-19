const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export function validateSpotifyConfig() {
  return Boolean(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET);
}

export function getRedirectUri(req) {
  const fromEnv = process.env.SPOTIFY_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;

  const host = (
    req.headers['x-forwarded-host']?.split(',')[0]?.trim()
    || req.headers.host
    || 'localhost:5173'
  );

  const proto = (
    req.headers['x-forwarded-proto']?.split(',')[0]?.trim()
    || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
  );

  return `${proto}://${host}/api/spotify/callback`;
}

export async function getServerAccessToken() {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
  if (!refreshToken || !validateSpotifyConfig()) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      console.error('[Spotify] Refresh token failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.access_token ?? null;
  } catch (error) {
    console.error('[Spotify] Token refresh error:', error);
    return null;
  }
}

export function getAuthUrl(req, res) {
  if (!validateSpotifyConfig()) {
    return res.status(500).json({ error: 'Spotify configuration incomplete' });
  }

  const redirectUri = getRedirectUri(req);
  const scope = 'user-read-currently-playing user-read-playback-state user-read-recently-played';
  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope,
  }).toString()}`;

  return res.json({ authUrl, redirectUri });
}

export async function handleCallback(req, res) {
  if (!validateSpotifyConfig()) {
    return res.status(500).json({ error: 'Spotify configuration incomplete' });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const spotifyError = url.searchParams.get('error');
  const redirectUri = getRedirectUri(req);

  if (spotifyError) {
    res.setHeader('Location', `/?spotifyError=${encodeURIComponent(spotifyError)}`);
    res.statusCode = 302;
    res.end();
    return;
  }

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
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      console.error('[Spotify] Token exchange failed:', detail);
      res.setHeader('Location', '/?spotifyError=token_exchange_failed');
      res.statusCode = 302;
      res.end();
      return;
    }

    const tokenData = await tokenResponse.json();
    const redirectUrl = `/?spotifyToken=${encodeURIComponent(tokenData.access_token)}&refreshToken=${encodeURIComponent(tokenData.refresh_token)}`;
    res.setHeader('Location', redirectUrl);
    res.statusCode = 302;
    res.end();
  } catch (error) {
    console.error('[Spotify] Auth error:', error);
    res.setHeader('Location', '/?spotifyError=auth_failed');
    res.statusCode = 302;
    res.end();
  }
}

function mapTrack(item, { isPlaying, label }) {
  return {
    isPlaying,
    label,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    albumArt: item.album?.images?.[0]?.url ?? null,
    spotifyUrl: item.external_urls?.spotify ?? null,
  };
}

export async function fetchPlaybackState(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const playingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });

  if (playingRes.status === 200) {
    const data = await playingRes.json();
    if (data?.item) {
      return mapTrack(data.item, {
        isPlaying: Boolean(data.is_playing),
        label: data.is_playing ? 'CURRENTLY PLAYING' : 'LAST PLAYED',
      });
    }
  }

  const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers });

  if (recentRes.ok) {
    const recent = await recentRes.json();
    const item = recent?.items?.[0]?.track;
    if (item) {
      return mapTrack(item, { isPlaying: false, label: 'LAST PLAYED' });
    }
  }

  return { isPlaying: false, label: 'LAST PLAYED', title: null, artist: null, albumArt: null, spotifyUrl: null };
}
