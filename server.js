const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const LOCAL_CLOUD_FILE = path.join(PUBLIC_DIR, 'erp_cloud_local.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg'
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-pass, x-public-event',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS'
  });
  res.end(JSON.stringify(obj));
}

async function handleLocalErpApi(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const isPublicEvent = req.method === 'POST' && req.headers['x-public-event'] === 'true';
  const providedPass = String(req.headers['x-admin-pass'] || '').trim().toLowerCase();
  if (!isPublicEvent && providedPass !== 'olympus') {
    return sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED' });
  }

  let current = null;
  try {
    if (fs.existsSync(LOCAL_CLOUD_FILE)) {
      current = JSON.parse(fs.readFileSync(LOCAL_CLOUD_FILE, 'utf8'));
    }
  } catch {}

  if (req.method === 'GET') {
    return sendJson(res, 200, { ok: true, configured: true, provider: 'local-node-file', data: current });
  }

  try {
    const body = await readJsonBody(req);
    if (isPublicEvent) {
      const apiHandler = require('./api/erp.js');
      // Reuse same merge helper logic safely via local read/write
      const today = new Date().toISOString().slice(0, 10);
      const state = current && Array.isArray(current.members)
        ? current
        : { version: 1, updatedAt: 0, initialBalances: { club: { cash: 0, transferencia: 0 }, restaurant: { cash: 0, transferencia: 0 } }, members: [], expenses: [] };
      if (body?.member && typeof body.member === 'object') {
        const incoming = body.member;
        const entity = incoming.entity === 'restaurant' ? 'restaurant' : 'club';
        const match = state.members.find((m) =>
          m.entity === entity &&
          ((incoming.code && m.code && m.code.toUpperCase() === String(incoming.code).toUpperCase()) ||
           (incoming.email && m.email && m.email.toLowerCase() === String(incoming.email).toLowerCase()))
        );
        if (!match && (incoming.name || incoming.email || incoming.code)) {
          state.members.push({
            id: incoming.id || `mem-${Date.now()}`,
            entity,
            code: String(incoming.code || '').toUpperCase(),
            name: String(incoming.name || incoming.code || 'Miembro Web').trim(),
            ci: String(incoming.ci || ''),
            phone: String(incoming.phone || ''),
            email: String(incoming.email || ''),
            address: String(incoming.address || ''),
            disciplineOrPlan: String(incoming.disciplineOrPlan || (entity === 'club' ? 'Kickboxing K-1 & Boxeo (150.000 ₲/mes)' : 'Pack Nutrición')),
            monthlyFee: Number(incoming.monthlyFee) || (entity === 'club' ? 150000 : 500000),
            status: incoming.status || 'active',
            accessBlocked: false,
            subscribedSince: incoming.subscribedSince || today,
            unsubscribedAt: null,
            periods: [{ id: `per-${Date.now()}`, startDate: incoming.subscribedSince || today, endDate: null, plan: incoming.disciplineOrPlan || 'Club', fee: Number(incoming.monthlyFee) || 150000, status: 'active' }],
            payments: incoming.payments || {},
            affiliate: incoming.affiliate || { code: String(incoming.code || '').toUpperCase(), clicks: 0, monthlyEarnings: 0, referralsCount: 0, referrals: [] },
            documents: []
          });
        }
      }
      state.updatedAt = Date.now();
      fs.writeFileSync(LOCAL_CLOUD_FILE, JSON.stringify(state, null, 2), 'utf8');
      return sendJson(res, 200, { ok: true, configured: true, provider: 'local-node-file', updatedAt: state.updatedAt });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const state = body?.data || body;
      if (!state || !Array.isArray(state.members)) {
        return sendJson(res, 400, { ok: false, error: 'INVALID_PAYLOAD' });
      }
      fs.writeFileSync(LOCAL_CLOUD_FILE, JSON.stringify(state, null, 2), 'utf8');
      return sendJson(res, 200, { ok: true, configured: true, provider: 'local-node-file', updatedAt: state.updatedAt });
    }
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message });
  }
  return sendJson(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/api/erp') {
    return handleLocalErpApi(req, res);
  }

  if (pathname === '/') pathname = '/index.html';
  // Clean URLs support (matching vercel.json cleanUrls: true)
  if (!path.extname(pathname) && fs.existsSync(path.join(PUBLIC_DIR, pathname + '.html'))) {
    pathname += '.html';
  }

  const safePath = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(pathname)));

  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🏛️ OLIMPO RESTO & FIGHT CLUB LOCAL SERVER RUNNING!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://127.0.0.1:${PORT}/admin.html`);
  console.log(`=======================================================`);
});
