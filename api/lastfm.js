const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
    return res.status(200).json({ isPlaying: false, error: 'Missing credentials' });
  }

  const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(LASTFM_USERNAME)}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

  try {
    const response = await fetch(URL);
    if (!response.ok) throw new Error('Last.fm API error');
    
    const data = await response.json();
    const tracks = data?.recenttracks?.track;
    const track = Array.isArray(tracks) ? tracks[0] : tracks;

    if (!track) {
      return res.status(200).json({ isPlaying: false });
    }

    // Last.fm uses @attr.nowplaying to indicate current playback
    const isPlaying = track['@attr']?.nowplaying === 'true';
    const title = track?.name ?? '';
    const artist = track?.artist?.['#text'] ?? '';
    const album = track?.album?.['#text'] ?? '';
    const images = Array.isArray(track?.image) ? track.image : [];
    const albumArt = images.find((img) => img?.size === 'medium' && img?.['#text'])?.['#text']
      || images.find((img) => img?.size === 'small' && img?.['#text'])?.['#text']
      || images.find((img) => img?.['#text'])?.['#text']
      || '';
    const songUrl = track?.url ?? '';

    return res.status(200).json({
      isPlaying,
      title,
      artist,
      album,
      albumArt,
      songUrl,
    });
  } catch (err) {
    console.error('[Last.fm API]', err);
    return res.status(200).json({ isPlaying: false });
  }
}
