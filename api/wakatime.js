const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min

  if (!WAKATIME_API_KEY) {
    return res.status(200).json({ error: 'No API key' });
  }

  try {
    const auth = Buffer.from(WAKATIME_API_KEY).toString('base64');

    const [todayRes, editorsRes] = await Promise.all([
      fetch('https://wakatime.com/api/v1/users/current/status_bar/today', {
        headers: { Authorization: `Basic ${auth}` },
      }),
      fetch('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
        headers: { Authorization: `Basic ${auth}` },
      }),
    ]);

    const today = await todayRes.json();
    const stats = editorsRes.ok ? await editorsRes.json() : null;

    const grandTotal = today?.data?.grand_total;
    const editors    = stats?.data?.editors?.slice(0, 3) ?? [];

    return res.status(200).json({
      text:    grandTotal?.text     ?? '0 secs',
      hours:   grandTotal?.hours    ?? 0,
      minutes: grandTotal?.minutes  ?? 0,
      editors: editors.map((e) => ({
        name:    e.name,
        percent: Math.round(e.percent),
        text:    e.text,
      })),
    });
  } catch (err) {
    console.error('[WakaTime]', err);
    return res.status(200).json({ error: 'Failed', text: '0 secs', editors: [] });
  }
}
