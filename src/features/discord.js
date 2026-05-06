import { PROFILE } from '../config/constants.js';

const LANYARD_WS  = 'wss://api.lanyard.rest/socket';
const HEARTBEAT   = 30_000;

const STATUS_MAP = {
  online:  { label: 'ONLINE',         color: '#23a55a' },
  idle:    { label: 'IDLE',           color: '#f0b232' },
  dnd:     { label: 'DO NOT DISTURB', color: '#f23f43' },
  offline: { label: 'OFFLINE',        color: '#80848e' },
};

export function initDiscord() {
  const dot    = document.getElementById('discord-dot');
  const text   = document.getElementById('discord-text');
  const navDot = document.getElementById('nav-discord-dot');

  // Spotify elements
  const spArt    = document.getElementById('sp-art');
  const spLabel  = document.getElementById('sp-label');
  const spTitle  = document.getElementById('sp-title');
  const spArtist = document.getElementById('sp-artist');
  const spLink   = document.getElementById('sp-link');

  function updateMusic(data) {
    if (!spTitle || !spArtist) return;

    const isPlaying = data.listening_to_spotify;
    const spotify = data.spotify;

    if (isPlaying && spotify) {
      // 1. Save to local storage for "Last Played" state
      const trackData = {
        title: spotify.song,
        artist: spotify.artist,
        art: spotify.album_art_url,
        url: `https://open.spotify.com/track/${spotify.track_id}`
      };
      localStorage.setItem('last_played_song', JSON.stringify(trackData));

      // 2. Update UI
      if (spArt) {
        spArt.src = spotify.album_art_url;
        spArt.style.display = 'block';
      }
      if (spLabel) spLabel.textContent = 'CURRENTLY PLAYING';
      spTitle.textContent = spotify.song;
      spArtist.textContent = `by: ${spotify.artist}`;
      if (spLink) {
        spLink.href = `https://open.spotify.com/track/${spotify.track_id}`;
        spLink.style.display = 'flex';
      }
    } else {
      // Fallback to "Last Played" from local storage
      const lastPlayed = JSON.parse(localStorage.getItem('last_played_song'));
      
      if (lastPlayed) {
        if (spArt) {
          spArt.src = lastPlayed.art;
          spArt.style.display = 'block';
        }
        if (spLabel) spLabel.textContent = 'LAST PLAYED';
        spTitle.textContent = lastPlayed.title;
        spArtist.textContent = `by: ${lastPlayed.artist}`;
        if (spLink) {
          spLink.href = lastPlayed.url;
          spLink.style.display = 'flex';
        }
      } else {
        // No history at all
        if (spArt) spArt.style.display = 'none';
        if (spLabel) spLabel.textContent = 'LAST PLAYED';
        spTitle.textContent = 'Not playing';
        spArtist.textContent = '';
        if (spLink) spLink.style.display = 'none';
      }
    }
  }

  function applyStatus(data) {
    if (!data) return;

    const status = data.discord_status || 'offline';
    const s = STATUS_MAP[status] || STATUS_MAP.offline;
    const glow = `0 0 6px ${s.color}99`;

    // 1. Update status indicators
    if (dot) {
      dot.style.background = s.color;
      dot.style.boxShadow = glow;
    }
    if (navDot) {
      navDot.style.background = s.color;
      navDot.style.boxShadow = glow;
    }

    // 2. Update status text
    if (text) text.textContent = s.label;

    // 3. Update Music Widget
    updateMusic(data);
  }

  applyStatus({ discord_status: 'offline' });

  let heartbeatTimer;
  let reconnectTimer;
  let wsRef = null;

  function connect() {
    if (document.hidden) return;
    
    clearInterval(heartbeatTimer);
    clearTimeout(reconnectTimer);

    const ws = new WebSocket(LANYARD_WS);
    wsRef = ws;

    ws.onmessage = (event) => {
      try {
        const { op, d, t } = JSON.parse(event.data);

        if (op === 1) {
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: PROFILE.discordId } }));
          heartbeatTimer = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
          }, d?.heartbeat_interval ?? HEARTBEAT);
        }

        if (op === 0 && (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE')) {
          applyStatus(d);
        }
      } catch (err) {
        console.error('[Discord] Message error:', err);
      }
    };

    ws.onclose = () => {
      clearInterval(heartbeatTimer);
      if (!document.hidden) {
        reconnectTimer = window.setTimeout(connect, 5000);
      }
    };

    ws.onerror = () => ws.close();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(heartbeatTimer);
      clearTimeout(reconnectTimer);
      if (wsRef) wsRef.close();
      return;
    }
    connect();
  });

  connect();
}
