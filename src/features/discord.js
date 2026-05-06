const DISCORD_ID = '716204729071435796';
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

  function applyStatus(status) {
    const s = STATUS_MAP[status] || STATUS_MAP.offline;
    const glow = `0 0 6px ${s.color}99`;

    // Hero status widget
    if (dot)  { dot.style.background = s.color; dot.style.boxShadow = glow; }
    if (text) text.textContent = s.label;

    // Nav avatar dot
    if (navDot) { navDot.style.background = s.color; navDot.style.boxShadow = glow; }
  }

  applyStatus('offline');

  let heartbeatTimer;

  function connect() {
    const ws = new WebSocket(LANYARD_WS);

    ws.onmessage = (event) => {
      const { op, d } = JSON.parse(event.data);

      if (op === 1) {
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
        }, d?.heartbeat_interval ?? HEARTBEAT);
      }

      if (op === 0) applyStatus(d?.discord_status ?? 'offline');
    };

    ws.onclose = () => { clearInterval(heartbeatTimer); setTimeout(connect, 5000); };
    ws.onerror = () => ws.close();
  }

  connect();
}
