const VISITOR_NAMESPACE = 'aakarsh-portfolio';
const VISITOR_KEY = 'visitor-count';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function fetchVisitorCount(mode) {
  const endpoint = mode === 'get' ? 'get' : 'hit';
  const response = await fetch(`https://api.countapi.xyz/${endpoint}/${VISITOR_NAMESPACE}/${VISITOR_KEY}`);

  if (!response.ok) {
    throw new Error(`CountAPI returned ${response.status}`);
  }

  const data = await response.json();
  return Number.isFinite(data?.value) ? data.value : 0;
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get('action') || 'hit';

  try {
    const count = await fetchVisitorCount(action === 'get' ? 'get' : 'hit');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ count });
  } catch (error) {
    console.error('[Visitors] Count request failed:', error);
    res.status(500).json({ error: 'Failed to load visitor count' });
  }
}