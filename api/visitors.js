// In-memory counter with persistence as fallback
let visitorCount = 0;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function getCount() {
  return visitorCount;
}

async function incrementCount() {
  visitorCount = (visitorCount || 0) + 1;
  return visitorCount;
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
    const count = action === 'get' ? await getCount() : await incrementCount();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ count });
  } catch (error) {
    console.error('[Visitors] API call failed:', error);
    return res.status(200).json({ count: 0, error: 'unavailable' });
  }
}