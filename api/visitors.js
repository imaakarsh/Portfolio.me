// Firestore REST API — no extra packages needed
const FIREBASE_PROJECT_ID = 'aakarsh-portfolio';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const COUNTER_DOC = `${FIRESTORE_BASE}/meta/visitor-count`;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function getCount() {
  const res = await fetch(COUNTER_DOC);
  if (!res.ok) return 0;
  const doc = await res.json();
  return Number(doc?.fields?.count?.integerValue ?? 0);
}

async function incrementCount() {
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;

  const body = {
    writes: [{
      transform: {
        document: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/meta/visitor-count`,
        fieldTransforms: [{
          fieldPath: 'count',
          increment: { integerValue: '1' },
        }],
      },
    }],
  };

  const commitRes = await fetch(commitUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!commitRes.ok) {
    const err = await commitRes.text();
    throw new Error(`Commit failed ${commitRes.status}: ${err}`);
  }

  return getCount();
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
    console.error('[Visitors] Firestore REST failed:', error);
    return res.status(200).json({ count: 0, error: 'unavailable' });
  }
}