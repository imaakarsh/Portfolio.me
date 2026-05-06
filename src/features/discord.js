const DISCORD_ID = '716204729071435796';
const LANYARD_WS  = 'wss://api.lanyard.rest/socket';
const HEARTBEAT   = 30_000;

const STATUS_MAP = {
  online:  { label: 'ONLINE',       color: '#23a55a' },
  idle:    { label: 'IDLE',         color: '#f0b232' },
  dnd:     { label: 'DO NOT DISTURB', color: '#f23f43' },
  offline: { label: 'OFFLINE',      color: '#80848e' },
};

export function initDiscord() {
  const dot  = document.getElementById('discord-dot');
  const text = document.getElementById('discord-text');
  if (!dot || !text) return;

  function applyStatus(status) {
    const s = STATUS_MAP[status] || STATUS_MAP.offline;
    dot.style.background  = s.color;
    dot.style.boxShadow   = `0 0 6px ${s.color}88`;
    text.textContent      = s.label;
  }

  // Set offline immediately while connecting
  applyStatus('offline');

  let heartbeatTimer;

  function connect() {
    const ws = new WebSocket(LANYARD_WS);

    ws.onmessage = (event) => {
      const { op, d } = JSON.parse(event.data);

      // Op 1 = Hello → send Initialize
      if (op === 1) {
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
        // Start heartbeat
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
        }, d?.heartbeat_interval ?? HEARTBEAT);
      }

      // Op 0 = Event (INIT_STATE or PRESENCE_UPDATE)
      if (op === 0) {
        applyStatus(d?.discord_status ?? 'offline');
      }
    };

    ws.onclose = () => {
      clearInterval(heartbeatTimer);
      // Reconnect after 5s
      setTimeout(connect, 5000);
    };

    ws.onerror = () => ws.close();
  }

  connect();
}
