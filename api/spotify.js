const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const BASIC = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASIC}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  return res.json();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const { access_token } = await getAccessToken();

    const nowPlaying = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // 204 = nothing playing
    if (nowPlaying.status === 204 || nowPlaying.status > 400) {
      return res.status(200).json({ isPlaying: false });
    }

    const song = await nowPlaying.json();

    // Could be a podcast episode, not a track
    if (song.currently_playing_type !== 'track') {
      return res.status(200).json({ isPlaying: false });
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((a) => a.name).join(', ');
    const album = song.item.album.name;
    const albumArt = song.item.album.images[1]?.url ?? song.item.album.images[0]?.url;
    const songUrl = song.item.external_urls.spotify;

    return res.status(200).json({
      isPlaying,
      title,
      artist,
      album,
      albumArt,
      songUrl,
    });
  } catch (err) {
    console.error('[Spotify API]', err);
    return res.status(200).json({ isPlaying: false });
  }
}
