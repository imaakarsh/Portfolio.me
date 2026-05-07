const CODETIME_API_KEY = process.env.CODETIME_API_KEY || process.env.WAKATIME_API_KEY; // fallback for compatibility

function parseSecondsFromText(text) {
  if (!text || typeof text !== 'string') return 0;

  const hourMatch = text.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)/i);
  const minuteMatch = text.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/i);
  const secondMatch = text.match(/(\d+)\s*(?:s|sec|secs|second|seconds)/i);

  const h = Number(hourMatch?.[1] || 0);
  const m = Number(minuteMatch?.[1] || 0);
  const s = Number(secondMatch?.[1] || 0);
  return h * 3600 + m * 60 + s;
}

function normalizeTotals(todayData, statsData) {
  const todayGrand = todayData?.grand_total || {};
  const statsGrand = statsData?.grand_total || {};

  // Prefer explicit numeric fields from "today", then from 7-day stats.
  let seconds = Number(
    todayGrand.total_seconds
      ?? todayGrand.seconds
      ?? todayData?.total_seconds
      ?? todayData?.cumulative_total?.seconds
      ?? 0,
  );

  if (!Number.isFinite(seconds) || seconds <= 0) {
    seconds = Number(
      statsGrand.total_seconds
        ?? statsGrand.seconds
        ?? 0,
    );
  }

  if (!Number.isFinite(seconds) || seconds <= 0) {
    // Fallback for payloads that only include human-readable text.
    const textCandidates = [
      todayGrand.text,
      todayGrand.digital,
      todayData?.human_readable_total_including_other_language,
      todayData?.human_readable_total,
      statsGrand.text,
      statsGrand.digital,
    ];

    for (const candidate of textCandidates) {
      const parsed = parseSecondsFromText(candidate);
      if (parsed > 0) {
        seconds = parsed;
        break;
      }
    }
  }

  if (!Number.isFinite(seconds) || seconds < 0) {
    seconds = 0;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const text = todayGrand.text || statsGrand.text || (seconds > 0 ? `${hours} hrs ${minutes} mins` : '0 secs');

  return { seconds, hours, minutes, text };
}

async function fetchWakaData(apiKey) {
  const authVariants = [
    // WakaTime-compatible Basic auth expects "apiKey:" as the credential.
    { Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}` },
    // Keep previous format as fallback for compatibility.
    { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
    { Authorization: `Bearer ${apiKey}` },
  ];

  let lastTodayStatus = 0;
  let lastStatsStatus = 0;

  for (const headers of authVariants) {
    const [todayRes, statsRes] = await Promise.all([
      fetch('https://wakatime.com/api/v1/users/current/status_bar/today', { headers }),
      fetch('https://wakatime.com/api/v1/users/current/stats/last_7_days', { headers }),
    ]);

    lastTodayStatus = todayRes.status;
    lastStatsStatus = statsRes.status;

    if (!todayRes.ok) {
      continue;
    }

    const today = await todayRes.json();
    const stats = statsRes.ok ? await statsRes.json() : null;
    return { today, stats, todayStatus: todayRes.status, statsStatus: statsRes.status };
  }

  return { today: null, stats: null, todayStatus: lastTodayStatus, statsStatus: lastStatsStatus };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min

  if (!CODETIME_API_KEY) {
    return res.status(200).json({ error: 'No API key' });
  }

  try {
    const { today, stats, todayStatus, statsStatus } = await fetchWakaData(CODETIME_API_KEY);
    console.log('[CodeTime] upstream status:', todayStatus, statsStatus);

    if (!today) {
      return res.status(200).json({ error: `Auth failed (${todayStatus || 0})`, text: '0 secs', hours: 0, minutes: 0, editors: [] });
    }

    const totals = normalizeTotals(today?.data, stats?.data);
    const editors = stats?.data?.editors?.slice(0, 3) ?? [];

    return res.status(200).json({
      text: totals.text,
      hours: totals.hours,
      minutes: totals.minutes,
      editors: editors.map((e) => ({
        name: e.name,
        percent: Math.round(Number(e.percent) || 0),
        text: e.text,
      })),
    });
  } catch (err) {
    console.error('[CodeTime]', err);
    return res.status(200).json({ error: 'Failed', text: '0 secs', editors: [] });
  }
}
