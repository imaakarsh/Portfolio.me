const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
    return res.status(200).json({ isPlaying: false, error: 'Missing credentials' });
  }

  const URL = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

  try {
    const response = await fetch(URL);
    if (!response.ok) throw new Error('Last.fm API error');
    
    const data = await response.json();
    const track = data.recenttracks.track[0];

    if (!track) {
      return res.status(200).json({ isPlaying: false });
    }

    // Last.fm uses @attr.nowplaying to indicate current playback
    const isPlaying = track['@attr']?.nowplaying === 'true';
    const title = track.name;
    const artist = track.artist['#text'];
    const album = track.album['#text'];
    const albumArt = track.image[2]['#text'] || track.image[1]['#text'];
    const songUrl = track.url;

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
