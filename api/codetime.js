const CODETIME_API_KEY = process.env.CODETIME_API_KEY || process.env.WAKATIME_API_KEY;

async function fetchCodetimeData(apiKey) {
  try {
    console.log('[CodeTime] attempting CodeTime API fetch');
    const headers = {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    };

    const res = await fetch('https://api.codetime.dev/v1/user', { headers });
    console.log(`[CodeTime] CodeTime API response: ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      console.log('[CodeTime] Got CodeTime data');
      return data;
    }
    return null;
  } catch (err) {
    console.warn('[CodeTime] CodeTime fetch failed:', err?.message);
    return null;
  }
}

async function fetchWakatimeData(apiKey) {
  try {
    console.log('[CodeTime] attempting WakaTime API fetch');
    const authHeader = `Bearer ${apiKey}`;

    const res = await fetch('https://wakatime.com/api/v1/users/current/stats/today', {
      headers: { Authorization: authHeader },
    });

    console.log(`[CodeTime] WakaTime API response: ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      console.log('[CodeTime] Got WakaTime data');
      return { data, source: 'wakatime' };
    }
    return null;
  } catch (err) {
    console.warn('[CodeTime] WakaTime fetch failed:', err?.message);
    return null;
  }
}

function formatCodetimeData(data) {
  if (!data) return { text: 'CodeTime unavailable', hours: 0, minutes: 0 };

  const totalSeconds = data?.cumulativeCodeTime || data?.cumulative_total?.total_seconds || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    text: `${hours}h ${minutes}m coded today`,
    hours,
    minutes,
  };
}

function formatWakatimeData(data) {
  if (!data || !data.data) return { text: '0h 0m coded today', hours: 0, minutes: 0 };

  const grand = data.data.grand_total || {};
  const totalSeconds = grand.total_seconds || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    text: `${hours}h ${minutes}m coded today`,
    hours,
    minutes,
  };
}

async function fetchWakaData(apiKey) {
  const authVariants = [
    { Authorization: `Basic ${apiKey}` },
    { Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}` },
    { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
    { Authorization: `Bearer ${apiKey}` },
  ];

  console.log('[CodeTime] attempting WakaTime fetch with', authVariants.length, 'auth variants');

  let lastTodayStatus = 0;
  let lastStatsStatus = 0;

  for (const [i, headers] of authVariants.entries()) {
    try {
      console.log(`[CodeTime] trying auth variant ${i + 1}`);
      const [todayRes, statsRes] = await Promise.all([
        fetch('https://wakatime.com/api/v1/users/current/status_bar/today', { headers }),
        fetch('https://wakatime.com/api/v1/users/current/stats/last_7_days', { headers }),
      ]);

      lastTodayStatus = todayRes.status;
      lastStatsStatus = statsRes.status;

      console.log(`[CodeTime] responses: today=${todayRes.status}, stats=${statsRes.status}`);

      if (!todayRes.ok) {
        continue;
      }

      const today = await todayRes.json();
      const stats = statsRes.ok ? await statsRes.json() : null;
      return { today, stats, todayStatus: todayRes.status, statsStatus: statsRes.status };
    } catch (err) {
      console.warn('[CodeTime] fetch attempt failed:', err && err.message ? err.message : err);
      continue;
    }
  }

  return { today: null, stats: null, todayStatus: lastTodayStatus, statsStatus: lastStatsStatus };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  if (!CODETIME_API_KEY) {
    console.warn('[CodeTime] No API key configured');
    return res.status(200).json({
      text: 'CodeTime unconfigured',
      hours: 0,
      minutes: 0,
    });
  }

  try {
    const wakaData = await fetchWakaData(CODETIME_API_KEY);

    if (wakaData?.today?.data) {
      const formatted = formatWakatimeData(wakaData.today);
      return res.status(200).json(formatted);
    }

    return res.status(200).json({
      text: 'Fetching stats...',
      hours: 0,
      minutes: 0,
    });
  } catch (err) {
    console.error('[CodeTime] Handler error:', err);
    return res.status(200).json({
      text: 'Stats unavailable',
      hours: 0,
      minutes: 0,
    });
  }
}