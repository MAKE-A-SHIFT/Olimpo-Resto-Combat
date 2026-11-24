/* ==========================================================================
   OLIMPO TEAM AREGUÁ — Vercel Serverless Cloud Sync API (/api/erp)
   Multi-device persistent cloud database protected by ADMIN_PASSWORD ("Olympus")
   Supports: Vercel KV / Upstash Redis (auto-detected), Firebase RTDB, JSONBin
   ========================================================================== */

const DB_KEY = "olimpo_erp_state_v1";

function findUpstashCredentials() {
  const candidates = [
    ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["REDIS_REST_API_URL", "REDIS_REST_API_TOKEN"]
  ];
  for (const [urlKey, tokenKey] of candidates) {
    if (process.env[urlKey] && process.env[tokenKey]) {
      return {
        url: process.env[urlKey].replace(/\/+$/, ""),
        token: process.env[tokenKey],
        provider: "upstash-redis"
      };
    }
  }
  for (const key of Object.keys(process.env)) {
    if (key.endsWith("_REST_API_URL") || key.endsWith("_REDIS_REST_URL")) {
      const prefix = key.replace(/_(REST_API_URL|REDIS_REST_URL)$/, "");
      const token =
        process.env[`${prefix}_REST_API_TOKEN`] ||
        process.env[`${prefix}_REDIS_REST_TOKEN`];
      if (process.env[key] && token) {
        return {
          url: process.env[key].replace(/\/+$/, ""),
          token,
          provider: "upstash-redis"
        };
      }
    }
  }
  return null;
}

function findFirebaseCredentials() {
  const url = process.env.FIREBASE_DB_URL;
  if (!url) return null;
  const auth = process.env.FIREBASE_DB_AUTH || "";
  const cleanUrl = url.replace(/\/+$/, "");
  const suffix = auth ? `?auth=${encodeURIComponent(auth)}` : "";
  return {
    endpoint: `${cleanUrl}/${DB_KEY}.json${suffix}`,
    provider: "firebase-rtdb"
  };
}

function findJsonBinCredentials() {
  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;
  if (!binId || !apiKey) return null;
  return {
    endpoint: `https://api.jsonbin.io/v3/b/${binId}`,
    apiKey,
    provider: "jsonbin"
  };
}

function getActiveBackend() {
  return findUpstashCredentials() || findFirebaseCredentials() || findJsonBinCredentials();
}

async function readCloudState(backend) {
  if (backend.provider === "upstash-redis") {
    const r = await fetch(backend.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backend.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["GET", DB_KEY])
    });
    if (!r.ok) throw new Error(`UPSTASH_READ_ERROR_${r.status}`);
    const payload = await r.json();
    const raw = payload?.result;
    return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
  }

  if (backend.provider === "firebase-rtdb") {
    const r = await fetch(backend.endpoint);
    if (!r.ok) throw new Error(`FIREBASE_READ_ERROR_${r.status}`);
    return await r.json();
  }

  if (backend.provider === "jsonbin") {
    const r = await fetch(`${backend.endpoint}/latest`, {
      headers: { "X-Master-Key": backend.apiKey }
    });
    if (!r.ok) throw new Error(`JSONBIN_READ_ERROR_${r.status}`);
    const payload = await r.json();
    return payload?.record || null;
  }

  return null;
}

async function writeCloudState(backend, state) {
  if (backend.provider === "upstash-redis") {
    const r = await fetch(backend.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backend.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["SET", DB_KEY, JSON.stringify(state)])
    });
    if (!r.ok) {
      const detail = await r.text();
      throw new Error(`UPSTASH_WRITE_ERROR_${r.status}: ${detail}`);
    }
    return true;
  }

  if (backend.provider === "firebase-rtdb") {
    const r = await fetch(backend.endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
    if (!r.ok) throw new Error(`FIREBASE_WRITE_ERROR_${r.status}`);
    return true;
  }

  if (backend.provider === "jsonbin") {
    const r = await fetch(backend.endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": backend.apiKey
      },
      body: JSON.stringify(state)
    });
    if (!r.ok) throw new Error(`JSONBIN_WRITE_ERROR_${r.status}`);
    return true;
  }

  return false;
}

function createSkeletonState() {
  return {
    version: 1,
    updatedAt: 0,
    initialBalances: {
      club: { cash: 0, transferencia: 0 },
      restaurant: { cash: 0, transferencia: 0 }
    },
    members: [],
    expenses: []
  };
}

function mergePublicEventIntoState(existingState, eventPayload) {
  const state = existingState && Array.isArray(existingState.members)
    ? existingState
    : createSkeletonState();
  const today = new Date().toISOString().slice(0, 10);

  if (eventPayload?.member && typeof eventPayload.member === "object") {
    const incoming = eventPayload.member;
    const entity = incoming.entity === "restaurant" ? "restaurant" : "club";
    const match = state.members.find((m) =>
      m.entity === entity &&
      ((incoming.id && m.id === incoming.id) ||
       (incoming.code && m.code && m.code.toUpperCase() === String(incoming.code).toUpperCase()) ||
       (incoming.email && m.email && m.email.toLowerCase() === String(incoming.email).toLowerCase()))
    );
    if (!match && (incoming.name || incoming.email || incoming.code)) {
      const startIso = incoming.subscribedSince || today;
      const fee = Number(incoming.monthlyFee) || (entity === "club" ? 150000 : 500000);
      state.members.push({
        id: incoming.id || `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        entity,
        code: String(incoming.code || "").toUpperCase(),
        name: String(incoming.name || incoming.code || "Miembro Web").trim(),
        ci: String(incoming.ci || ""),
        phone: String(incoming.phone || ""),
        email: String(incoming.email || ""),
        address: String(incoming.address || ""),
        disciplineOrPlan: String(
          incoming.disciplineOrPlan ||
            (entity === "club" ? "Kickboxing K-1 & Boxeo (150.000 ₲/mes)" : "Pack Nutrición")
        ),
        monthlyFee: fee,
        status: incoming.status || "active",
        accessBlocked: false,
        subscribedSince: startIso,
        unsubscribedAt: null,
        periods: [
          {
            id: `per-${Date.now()}`,
            startDate: startIso,
            endDate: null,
            plan: incoming.disciplineOrPlan || (entity === "club" ? "Kickboxing K-1 & Boxeo" : "Pack Nutrición"),
            fee,
            status: "active"
          }
        ],
        payments: incoming.payments || {},
        affiliate: incoming.affiliate || {
          code: String(incoming.code || "").toUpperCase(),
          clicks: 0,
          monthlyEarnings: 0,
          referralsCount: 0,
          referrals: []
        },
        documents: []
      });
    } else if (match && incoming.affiliate) {
      match.affiliate = {
        ...(match.affiliate || {}),
        clicks: Math.max(Number(match.affiliate?.clicks || 0), Number(incoming.affiliate.clicks || 0)),
        monthlyEarnings: Math.max(Number(match.affiliate?.monthlyEarnings || 0), Number(incoming.affiliate.monthlyEarnings || 0)),
        referralsCount: Math.max(Number(match.affiliate?.referralsCount || 0), Number(incoming.affiliate.referralsCount || 0)),
        referrals: Array.isArray(incoming.affiliate.referrals) && incoming.affiliate.referrals.length >= (match.affiliate?.referrals?.length || 0)
          ? incoming.affiliate.referrals
          : (match.affiliate?.referrals || [])
      };
    }
  }

  state.updatedAt = Date.now();
  return state;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const isPublicEvent = req.method === "POST" && req.headers["x-public-event"] === "true";
  const expectedPassword = (process.env.ADMIN_PASSWORD || "Olympus").trim().toLowerCase();
  const providedPassword = String(req.headers["x-admin-pass"] || "").trim().toLowerCase();

  if (!isPublicEvent && providedPassword !== expectedPassword) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const backend = getActiveBackend();
  if (!backend) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error: "CLOUD_DB_NOT_CONNECTED",
      message: "Connect Upstash Redis / Vercel KV in Vercel Storage (or Firebase RTDB / JSONBin) for multi-device sync."
    });
  }

  try {
    if (req.method === "GET") {
      const data = await readCloudState(backend);
      return res.status(200).json({ ok: true, configured: true, provider: backend.provider, data });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    if (isPublicEvent) {
      const current = await readCloudState(backend);
      const merged = mergePublicEventIntoState(current, body);
      await writeCloudState(backend, merged);
      return res.status(200).json({ ok: true, configured: true, provider: backend.provider, updatedAt: merged.updatedAt });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const state = body?.data || body;
      if (!state || !Array.isArray(state.members)) {
        return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
      }
      await writeCloudState(backend, state);
      return res.status(200).json({ ok: true, configured: true, provider: backend.provider, updatedAt: state.updatedAt });
    }

    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "CLOUD_BACKEND_ERROR", detail: err.message });
  }
};
