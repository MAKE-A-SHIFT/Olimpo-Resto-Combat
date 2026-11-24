/* ==========================================================================
   OLIMPO TEAM AREGUÁ — Admin ERP Logic (Club de Combat & Restaurant)
   Club Fixed Monthly Rate: 150.000 PYG / month (Non-negotiable)
   Strict Dual Entity Separation + Level 1 & Level 2 Alerts (2 weeks overdue)
   Multi-Device Sync (Vercel /api/erp + Firebase Firestore) & Optional Docs
   ========================================================================== */

const CLUB_MONTHLY_FEE = 150000;
const OVERDUE_CUTOFF_DAYS = 14; // Alert Level 2 threshold: 2 weeks (14 days)
const STORAGE_KEY = "olimpo_erp_state_v1";
const STUDENTS_STORAGE_KEY = "olimpo_students_v1";
const AUTH_KEY = "olimpo_admin_auth";
const AUTH_VALUE = "Olympus_OK";
const ADMIN_PASS = "Olympus";
const ADMIN_LANG_KEY = "olimpo_admin_lang";
const CLOUD_API_URL = "/api/erp";

// ==========================================================================
// 1. MULTI-LANGUAGE ENGINE (ES / FR / EN)
// ==========================================================================
function detectAdminLang() {
  const saved = localStorage.getItem(ADMIN_LANG_KEY) || localStorage.getItem("olimpo_lang");
  if (saved && window.ADMIN_I18N?.[saved]) return saved;
  const nav = (navigator.language || "es").toLowerCase();
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("en")) return "en";
  return "es";
}

let currentAdminLang = detectAdminLang();

function t(key, vars = {}) {
  const i18n = window.ADMIN_I18N || {};
  const dict = i18n[currentAdminLang] || i18n.es || {};
  let text = dict[key] || (i18n.es && i18n.es[key]) || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return text;
}

function setAdminLang(lang, manual = false) {
  if (!window.ADMIN_I18N?.[lang]) return;
  currentAdminLang = lang;
  if (manual) localStorage.setItem(ADMIN_LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyAdminI18n();
  renderAll();
}

function applyAdminI18n() {
  document.querySelectorAll("[data-a18n]").forEach((el) => {
    const key = el.getAttribute("data-a18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-a18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-a18n-ph");
    if (key) el.placeholder = t(key);
  });
  document.querySelectorAll(".admin-lang-btn").forEach((btn) => {
    const isSel = btn.getAttribute("data-lang-btn") === currentAdminLang;
    if (isSel) {
      btn.classList.add("bg-black", "text-white", "shadow-xs");
      btn.classList.remove("text-gray-600", "hover:text-gray-900");
    } else {
      btn.classList.remove("bg-black", "text-white", "shadow-xs");
      btn.classList.add("text-gray-600", "hover:text-gray-900");
    }
  });
  refreshCloudStatusLabel();
}

// ==========================================================================
// 2. DATE & CURRENCY HELPERS (Paraguay-safe YYYY-MM-DD & YYYY-MM)
// ==========================================================================
function toLocalIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayIso() {
  return toLocalIso(new Date());
}

function getCurrentMonthKey() {
  return getTodayIso().slice(0, 7);
}

function parseLocalIso(isoStr) {
  const [y, m, d] = (isoStr || getTodayIso()).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

function addDaysIso(isoStr, days) {
  const dt = parseLocalIso(isoStr);
  dt.setDate(dt.getDate() + days);
  return toLocalIso(dt);
}

function getDaysRange(startIso, endIso) {
  const result = [];
  if (!startIso || !endIso || startIso > endIso) return result;
  let cur = startIso;
  let guard = 0;
  while (cur <= endIso && guard < 1500) {
    result.push(cur);
    cur = addDaysIso(cur, 1);
    guard++;
  }
  return result;
}

function diffDaysInclusive(startIso, endIso) {
  if (!startIso || !endIso || startIso > endIso) return 0;
  const a = parseLocalIso(startIso);
  const b = parseLocalIso(endIso);
  return Math.round((b - a) / 86400000) + 1;
}

function buildCycleDueDate(monthKey, anchorDay) {
  const [y, m] = monthKey.split("-").map(Number);
  const maxDaysInMonth = new Date(y, m, 0).getDate();
  const clampedDay = Math.min(Math.max(1, anchorDay || 1), maxDaysInMonth);
  return `${y}-${String(m).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}

function iterateMonthsInclusive(startMonthKey, endMonthKey) {
  const out = [];
  if (!startMonthKey || !endMonthKey || startMonthKey > endMonthKey) return out;
  let [y, m] = startMonthKey.split("-").map(Number);
  const [ey, em] = endMonthKey.split("-").map(Number);
  let guard = 0;
  while ((y < ey || (y === ey && m <= em)) && guard < 120) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
    guard++;
  }
  return out;
}

function formatDateFr(isoStr) {
  if (!isoStr || isoStr.length < 10) return "—";
  const [y, m, d] = isoStr.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function formatMonthShort(monthKey) {
  if (!monthKey || monthKey.length < 7) return "—";
  const [y, m] = monthKey.split("-");
  return `${m}/${y.slice(2)}`;
}

function formatGs(amount) {
  const n = Math.round(Number(amount) || 0);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}₲ ${abs}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ==========================================================================
// 3. STATE, PUBLIC AFFILIATE BRIDGE & DUAL CLOUD SYNC
// ==========================================================================
function createDefaultState() {
  return {
    version: 1,
    updatedAt: 0,
    initialBalances: {
      club: { cash: 0, transferencia: 0 },
      restaurant: { cash: 0, transferencia: 0 }
    },
    members: [],
    expenses: [],
    dismissedStudentCodes: []
  };
}

function normalizeState(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;
  return {
    ...base,
    ...raw,
    initialBalances: {
      club: {
        cash: Number(raw.initialBalances?.club?.cash || 0),
        transferencia: Number(raw.initialBalances?.club?.transferencia || 0)
      },
      restaurant: {
        cash: Number(raw.initialBalances?.restaurant?.cash || 0),
        transferencia: Number(raw.initialBalances?.restaurant?.transferencia || 0)
      }
    },
    members: Array.isArray(raw.members) ? raw.members : [],
    expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
    dismissedStudentCodes: Array.isArray(raw.dismissedStudentCodes) ? raw.dismissedStudentCodes : []
  };
}

let erpState = loadLocalState();
let activeEntity = "club"; // 'club' or 'restaurant'
let currentPeriod = "monthly"; // 'daily' | 'weekly' | 'monthly' | 'total'
let currentMemberFilter = "all";
let currentTimelineTab = "active";
let activeDocsMemberId = null;
let cloudSyncState = "checking"; // checking | ok | saving | pulling | not_configured | offline

let growthChart = null;
let ratioChart = null;
let expensesChart = null;

function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (err) {
    console.warn("LocalStorage read warning:", err);
  }
  return createDefaultState();
}

function mergePublicStudentsIntoErp(studentsMap = null) {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    const localDb = raw ? JSON.parse(raw) : {};
    const combined = { ...localDb, ...(studentsMap || {}) };
    delete combined.__OLIMPO_ERP_STATE__;

    let changed = false;
    const today = getTodayIso();

    for (const code of Object.keys(combined)) {
      const stu = combined[code];
      if (!stu || !stu.code) continue;

      const refs = Array.isArray(stu.referrals) ? stu.referrals : [];
      const monthlyEarn = refs.reduce((acc, r) => acc + (Number(r.commission) || 0), 0);
      const affObj = {
        code: stu.code,
        clicks: Number(stu.clicks || 0),
        monthlyEarnings: monthlyEarn,
        referralsCount: refs.length,
        referrals: refs
      };

      const existing = erpState.members.find((m) =>
        (m.code && m.code.toUpperCase() === stu.code.toUpperCase()) ||
        (stu.email && m.email && m.email.toLowerCase() === stu.email.toLowerCase())
      );

      if (existing) {
        if (
          JSON.stringify(existing.affiliate) !== JSON.stringify(affObj) ||
          (!existing.phone && stu.phone) ||
          (!existing.email && stu.email)
        ) {
          existing.affiliate = affObj;
          if (!existing.code) existing.code = stu.code;
          if (!existing.phone && stu.phone) existing.phone = stu.phone;
          if (!existing.email && stu.email) existing.email = stu.email;
          changed = true;
        }
      } else if ((stu.pin || stu.email || refs.length > 0) && !(erpState.dismissedStudentCodes || []).includes(stu.code.toUpperCase())) {
        // Real registered member/affiliate from public site -> add to Club subscriber list automatically
        const startIso = stu.createdAt ? stu.createdAt.slice(0, 10) : today;
        erpState.members.push({
          id: `mem-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          entity: "club",
          code: stu.code,
          name: stu.name || stu.code,
          ci: "",
          phone: stu.phone || "",
          email: stu.email || "",
          address: "",
          disciplineOrPlan: "Kickboxing K-1 & Boxeo (150.000 ₲/mes)",
          monthlyFee: CLUB_MONTHLY_FEE,
          status: "active",
          accessBlocked: false,
          subscribedSince: startIso,
          unsubscribedAt: null,
          periods: [
            {
              id: `per-${Date.now()}`,
              startDate: startIso,
              endDate: null,
              plan: "Kickboxing K-1 & Boxeo",
              fee: CLUB_MONTHLY_FEE,
              status: "active"
            }
          ],
          payments: {},
          affiliate: affObj,
          documents: []
        });
        changed = true;
      }
    }

    if (changed) {
      erpState.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(erpState));
    }
  } catch (err) {
    console.warn("Affiliate merge warning:", err);
  }
}

function setCloudStatus(stateKey) {
  cloudSyncState = stateKey;
  refreshCloudStatusLabel();
}

function refreshCloudStatusLabel() {
  const dot = document.getElementById("cloud-sync-dot");
  const txt = document.getElementById("cloud-sync-label");
  const banner = document.getElementById("cloud-setup-banner");

  const map = {
    checking: { cls: "bg-amber-400 animate-pulse", key: "sync_checking" },
    ok: { cls: "bg-emerald-500", key: "sync_ok" },
    saving: { cls: "bg-amber-400 animate-pulse", key: "sync_saving" },
    pulling: { cls: "bg-blue-400 animate-pulse", key: "sync_pulling" },
    not_configured: { cls: "bg-red-500 animate-pulse", key: "sync_not_configured" },
    offline: { cls: "bg-slate-400", key: "sync_offline" }
  };
  const cfg = map[cloudSyncState] || map.offline;
  if (dot) dot.className = `w-2 h-2 rounded-full inline-block ${cfg.cls}`;
  if (txt) txt.textContent = t(cfg.key);

  if (banner) {
    if (cloudSyncState === "not_configured") banner.classList.remove("hidden");
    else banner.classList.add("hidden");
  }
}

let cloudPushTimer = null;
let isSyncingNow = false;

function saveState(skipCloudPush = false) {
  erpState.updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(erpState));
  } catch (err) {
    console.error("LocalStorage quota warning:", err);
  }
  renderAll();

  if (!skipCloudPush) {
    setCloudStatus("saving");
    clearTimeout(cloudPushTimer);
    cloudPushTimer = setTimeout(() => {
      pushToCloud();
    }, 250);
  }
}

async function pushToCloud() {
  if (isSyncingNow) return;
  isSyncingNow = true;
  let anyConnected = false;

  try {
    // 1. Push to Firebase Firestore if configured
    if (window.OlimpoFirebase && window.OlimpoFirebase.isCloudConnected) {
      const fbOk = await window.OlimpoFirebase.syncErpStateToCloud(erpState);
      if (fbOk) anyConnected = true;
    }

    // 2. Push to /api/erp (Vercel KV / Upstash / Local Node server)
    try {
      let res = await fetch(CLOUD_API_URL, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pass": ADMIN_PASS
        },
        body: JSON.stringify({ data: erpState })
      });

      if (res.status === 413) {
        const lightweightState = {
          ...erpState,
          members: erpState.members.map((m) => ({
            ...m,
            documents: (m.documents || []).map((d) => ({
              ...d,
              dataUrl: d.dataUrl && d.dataUrl.length > 50000 ? "" : d.dataUrl
            }))
          }))
        };
        res = await fetch(CLOUD_API_URL, {
          method: "PUT",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pass": ADMIN_PASS
          },
          body: JSON.stringify({ data: lightweightState })
        });
      }

      if (res.ok) anyConnected = true;
    } catch {}

    setCloudStatus(anyConnected ? "ok" : "not_configured");
  } finally {
    isSyncingNow = false;
  }
}

async function syncFromCloud(manual = false) {
  if (isSyncingNow) return;
  if (manual) setCloudStatus("pulling");
  isSyncingNow = true;

  let anyConnected = false;
  let remoteErp = null;
  let needPushUp = false;

  try {
    // 1. Check Firebase Firestore if connected
    if (window.OlimpoFirebase && window.OlimpoFirebase.isCloudConnected) {
      anyConnected = true;
      const [fbErp, fbMembers] = await Promise.all([
        window.OlimpoFirebase.fetchErpStateFromCloud(),
        window.OlimpoFirebase.fetchAllMembersFromCloud()
      ]);
      if (fbErp && Array.isArray(fbErp.members)) {
        remoteErp = fbErp;
      }
      if (fbMembers && Object.keys(fbMembers).length > 0) {
        mergePublicStudentsIntoErp(fbMembers);
      }
    }

    // 2. Check /api/erp (Vercel Cloud DB or Node Local Server)
    try {
      const res = await fetch(CLOUD_API_URL, {
        method: "GET",
        cache: "no-store",
        headers: { "x-admin-pass": ADMIN_PASS }
      });
      if (res.ok) {
        anyConnected = true;
        const payload = await res.json();
        const apiErp = payload?.data;
        if (apiErp && Array.isArray(apiErp.members)) {
          if (!remoteErp || (apiErp.updatedAt || 0) > (remoteErp.updatedAt || 0)) {
            remoteErp = apiErp;
          }
        }
      }
    } catch {}

    if (remoteErp && Array.isArray(remoteErp.members)) {
      if ((remoteErp.updatedAt || 0) > (erpState.updatedAt || 0)) {
        erpState = normalizeState(remoteErp);
        mergePublicStudentsIntoErp();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(erpState));
        renderAll();
      } else if ((erpState.updatedAt || 0) > (remoteErp.updatedAt || 0)) {
        needPushUp = true;
      }
    } else if (anyConnected) {
      if (erpState.updatedAt === 0) erpState.updatedAt = Date.now();
      needPushUp = true;
    }

    setCloudStatus(anyConnected ? "ok" : "not_configured");
  } finally {
    isSyncingNow = false;
  }

  if (needPushUp) {
    await pushToCloud();
  }
}

async function connectFirebaseFromAdmin() {
  const raw = document.getElementById("admin-fb-config-input")?.value || "";
  if (!window.OlimpoFirebase) return;
  const parsed = window.OlimpoFirebase.parseAndSaveConfig(raw);
  if (!parsed.ok) {
    alert(`Firebase Config Error: ${parsed.error}`);
    return;
  }
  const ok = await window.OlimpoFirebase.init();
  if (ok) {
    await syncFromCloud(true);
    closeModal("backup-modal");
  } else {
    alert("Could not initialize Firebase with this configuration.");
  }
}

// IndexedDB for full-resolution local archive of optional uploaded documents
function openFilesDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("No IndexedDB"));
    const req = indexedDB.open("olimpo_erp_files_db", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveFileToIdb(docId, fullDataUrl) {
  try {
    const db = await openFilesDb();
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put({ id: docId, dataUrl: fullDataUrl });
  } catch {}
}

async function getFileFromIdb(docId) {
  try {
    const db = await openFilesDb();
    return new Promise((resolve) => {
      const tx = db.transaction("files", "readonly");
      const req = tx.objectStore("files").get(docId);
      req.onsuccess = () => resolve(req.result?.dataUrl || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ==========================================================================
// 4. AUTHENTICATION LOCK SCREEN ("Olympus")
// ==========================================================================
function isAuthenticated() {
  return (
    sessionStorage.getItem(AUTH_KEY) === AUTH_VALUE ||
    localStorage.getItem(AUTH_KEY) === AUTH_VALUE
  );
}

function checkAuthOnLoad() {
  const overlay = document.getElementById("admin-lock-overlay");
  if (isAuthenticated() && overlay) {
    overlay.classList.add("hidden");
  }
}

function unlockAdminOverlay(e) {
  e.preventDefault();
  const input = document.getElementById("overlay-password-input");
  const err = document.getElementById("overlay-password-error");
  const val = (input?.value || "").trim();

  if (val.toLowerCase() === ADMIN_PASS.toLowerCase()) {
    sessionStorage.setItem(AUTH_KEY, AUTH_VALUE);
    localStorage.setItem(AUTH_KEY, AUTH_VALUE);
    document.getElementById("admin-lock-overlay")?.classList.add("hidden");
    if (err) err.classList.add("hidden");
    syncFromCloud(true);
  } else {
    if (err) err.classList.remove("hidden");
    if (input) {
      input.value = "";
      input.focus();
    }
  }
}

function lockAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY);
  document.getElementById("admin-lock-overlay")?.classList.remove("hidden");
  const input = document.getElementById("overlay-password-input");
  if (input) {
    input.value = "";
    input.focus();
  }
}

// ==========================================================================
// 5. SUBSCRIPTION & MONTHLY PAYMENT EVALUATION ENGINE (+2 WEEKS CUTOFF ALERT)
// ==========================================================================
function getEffectiveMemberPeriods(member) {
  if (Array.isArray(member.periods) && member.periods.length > 0) {
    return member.periods;
  }
  return [
    {
      id: `per-fallback-${member.id}`,
      startDate: member.subscribedSince || getTodayIso(),
      endDate: member.unsubscribedAt || null,
      plan: member.disciplineOrPlan || "",
      fee: Number(member.monthlyFee) || (member.entity === "club" ? CLUB_MONTHLY_FEE : 0),
      status: member.status === "future" ? "future" : member.unsubscribedAt ? "completed" : "active"
    }
  ];
}

function analyzeMemberPayments(member) {
  const today = getTodayIso();
  const currentMonthKey = getCurrentMonthKey();
  const payments = member.payments || {};
  const defaultFee = member.entity === "club" ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || CLUB_MONTHLY_FEE);

  if (member.status === "future") {
    return {
      totalPaidCash: 0,
      totalPaidTransfer: 0,
      totalPaidAmount: 0,
      currentCycleStatus: "future",
      currentMonthKey,
      unpaidCycles: [],
      unpaidCount: 0,
      unpaidAmount: 0,
      maxDaysOverdue: 0,
      cutoffAlert: false,
      needsTodayValidation: false,
      cycleLogs: []
    };
  }

  const periods = getEffectiveMemberPeriods(member);
  const cyclesMap = new Map();

  for (const period of periods) {
    if (!period.startDate || period.status === "future") continue;
    const periodFee = member.entity === "club" ? CLUB_MONTHLY_FEE : (Number(period.fee) || defaultFee);
    const startMonth = period.startDate.slice(0, 7);
    const anchorDay = parseInt(period.startDate.slice(8, 10), 10) || 1;
    const endBound =
      period.endDate && period.endDate < today
        ? period.endDate
        : member.unsubscribedAt && member.unsubscribedAt < today
        ? member.unsubscribedAt
        : today;
    const endMonth = endBound.slice(0, 7);

    const monthKeys = iterateMonthsInclusive(startMonth, endMonth);
    for (const mk of monthKeys) {
      const dueDate = buildCycleDueDate(mk, anchorDay);
      // Do not generate a cycle whose due date hasn't arrived yet unless already explicitly marked paid
      if (dueDate > today && payments[mk]?.status !== "paid") continue;
      if (!cyclesMap.has(mk)) {
        cyclesMap.set(mk, { monthKey: mk, dueDate, amount: periodFee });
      }
    }
  }

  // Also include any explicitly recorded payments even outside active periods
  for (const mk of Object.keys(payments)) {
    if (!cyclesMap.has(mk) && payments[mk]?.status === "paid") {
      cyclesMap.set(mk, {
        monthKey: mk,
        dueDate: (payments[mk].paidAt || `${mk}-01`).slice(0, 10),
        amount: Number(payments[mk].amount) || defaultFee
      });
    }
  }

  const sortedCycles = Array.from(cyclesMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  let totalPaidCash = 0;
  let totalPaidTransfer = 0;
  const unpaidCycles = [];
  const cycleLogs = [];
  let maxDaysOverdue = 0;

  for (const cyc of sortedCycles) {
    const entry = payments[cyc.monthKey];
    const amt = member.entity === "club" ? CLUB_MONTHLY_FEE : (entry?.amount || cyc.amount || defaultFee);

    if (entry && entry.status === "paid") {
      if (entry.method === "transferencia") totalPaidTransfer += amt;
      else totalPaidCash += amt;
      cycleLogs.push({
        monthKey: cyc.monthKey,
        dueDate: cyc.dueDate,
        paidAt: entry.paidAt || cyc.dueDate,
        status: "paid",
        method: entry.method || "cash",
        amount: amt,
        daysOverdue: 0
      });
    } else {
      const daysLate = Math.max(0, diffDaysInclusive(cyc.dueDate, today) - 1);
      if (member.status === "active" && daysLate > maxDaysOverdue) {
        maxDaysOverdue = daysLate;
      }
      const st = entry?.status === "unpaid" ? "unpaid" : "pending";
      const logItem = {
        monthKey: cyc.monthKey,
        dueDate: cyc.dueDate,
        status: st,
        method: null,
        amount: amt,
        daysOverdue: daysLate
      };
      cycleLogs.push(logItem);
      unpaidCycles.push(logItem);
    }
  }

  // If member is active and somehow had no cycle generated for currentMonth (e.g. subscribedSince day > today's day),
  // ensure current month shows up cleanly for validation if within period
  const latestCycle = cycleLogs[cycleLogs.length - 1];
  const currentCycleEntry = payments[currentMonthKey];
  let currentCycleStatus = "paid";
  if (member.status === "active") {
    if (currentCycleEntry?.status === "paid") currentCycleStatus = "paid";
    else if (currentCycleEntry?.status === "unpaid") currentCycleStatus = "unpaid";
    else if (latestCycle && latestCycle.status !== "paid") currentCycleStatus = latestCycle.status;
    else if (!currentCycleEntry && (member.subscribedSince || today) <= today) currentCycleStatus = "pending";
  }

  const targetValidationMonth =
    (latestCycle && latestCycle.status !== "paid" ? latestCycle.monthKey : null) || currentMonthKey;

  const unpaidAmount = unpaidCycles.reduce((acc, c) => acc + c.amount, 0);
  const cutoffAlert = member.status === "active" && (maxDaysOverdue >= OVERDUE_CUTOFF_DAYS || unpaidCycles.length >= 2);
  const needsTodayValidation = member.status === "active" && currentCycleStatus !== "paid";

  return {
    totalPaidCash,
    totalPaidTransfer,
    totalPaidAmount: totalPaidCash + totalPaidTransfer,
    currentCycleStatus,
    currentMonthKey: targetValidationMonth,
    unpaidCycles,
    unpaidCount: unpaidCycles.length,
    unpaidAmount,
    maxDaysOverdue,
    cutoffAlert,
    needsTodayValidation,
    cycleLogs
  };
}

// ==========================================================================
// 6. FINANCIAL METRICS & ENTITY-ISOLATED AGGREGATIONS
// ==========================================================================
function getPeriodStartIso(period) {
  const today = getTodayIso();
  if (period === "daily") return today;
  if (period === "weekly") return addDaysIso(today, -6);
  if (period === "monthly") return addDaysIso(today, -29);
  return null;
}

function computeEntityFinancials(entity) {
  const today = getTodayIso();
  const entityMembers = erpState.members.filter((m) => (m.entity || "club") === entity);
  const entityExpenses = erpState.expenses.filter((e) => (e.entity || "club") === entity);
  const initBal = erpState.initialBalances?.[entity] || { cash: 0, transferencia: 0 };

  let totalPaidCash = 0;
  let totalPaidTransfer = 0;
  let totalUnpaidAmount = 0;
  let totalUnpaidMonths = 0;
  const unpaidMembersList = [];
  const allRevenueEvents = [];

  let activeCount = 0;
  let pastCount = 0;
  let futureCount = 0;
  let unsubscribedCount = 0;
  let potentialChurnLossMonthly = 0;
  let totalAffiliateMonth = 0;
  let activeMonthlyRunRate = 0;

  for (const member of entityMembers) {
    const analysis = analyzeMemberPayments(member);
    totalPaidCash += analysis.totalPaidCash;
    totalPaidTransfer += analysis.totalPaidTransfer;
    totalUnpaidAmount += analysis.unpaidAmount;
    totalUnpaidMonths += analysis.unpaidCount;

    const fee = entity === "club" ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || 0);
    if (member.status === "active") {
      activeCount++;
      activeMonthlyRunRate += fee;
    } else if (member.status === "future") {
      futureCount++;
    } else if (member.status === "unsubscribed" || member.status === "suspended") {
      pastCount++;
      unsubscribedCount++;
      potentialChurnLossMonthly += fee;
    }

    if (member.affiliate && member.affiliate.monthlyEarnings) {
      totalAffiliateMonth += Number(member.affiliate.monthlyEarnings) || 0;
    }

    for (const cyc of analysis.cycleLogs) {
      if (cyc.status === "paid") {
        allRevenueEvents.push({
          date: cyc.paidAt || cyc.dueDate || today,
          amount: cyc.amount,
          method: cyc.method
        });
      }
    }

    if (analysis.unpaidCount > 0) {
      unpaidMembersList.push({ member, analysis });
    }
  }

  unpaidMembersList.sort((a, b) => b.analysis.maxDaysOverdue - a.analysis.maxDaysOverdue || b.analysis.unpaidAmount - a.analysis.unpaidAmount);

  let totalExpCash = 0;
  let totalExpTransfer = 0;
  for (const exp of entityExpenses) {
    const amt = Number(exp.amount) || 0;
    if (exp.method === "transferencia") totalExpTransfer += amt;
    else totalExpCash += amt;
  }

  const cashBalance = (Number(initBal.cash) || 0) + totalPaidCash - totalExpCash;
  const transferBalance = (Number(initBal.transferencia) || 0) + totalPaidTransfer - totalExpTransfer;
  const totalBalance = cashBalance + transferBalance;

  const periodStartIso = getPeriodStartIso(currentPeriod);
  const periodRev = allRevenueEvents
    .filter((ev) => !periodStartIso || ev.date >= periodStartIso)
    .reduce((acc, ev) => acc + ev.amount, 0);

  const periodExp = entityExpenses
    .filter((exp) => !periodStartIso || (exp.date || today) >= periodStartIso)
    .reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);

  return {
    entity,
    members: entityMembers,
    expenses: entityExpenses,
    cashIn: totalPaidCash,
    cashOut: totalExpCash,
    cashBalance,
    transferIn: totalPaidTransfer,
    transferOut: totalExpTransfer,
    transferBalance,
    totalBalance,
    activeMonthlyRunRate,
    activeCount,
    pastCount,
    futureCount,
    totalHistoricalCount: entityMembers.length,
    unsubscribedCount,
    potentialChurnLossMonthly,
    totalUnpaidAmount,
    totalUnpaidMonths,
    unpaidMembersList,
    totalAffiliateMonth,
    allRevenueEvents,
    periodStartIso,
    periodRev,
    periodExp,
    periodNet: periodRev - periodExp
  };
}

// ==========================================================================
// 7. ENTITY SWITCHER & FULL UI RENDERING (PARTIE 1 + PARTIE 2)
// ==========================================================================
function setActiveEntity(entity) {
  activeEntity = entity === "restaurant" ? "restaurant" : "club";
  renderAll();
}

function renderAll() {
  renderEntityTabs();
  const stats = computeEntityFinancials(activeEntity);
  renderPart1Finance(stats);
  renderPart2Alerts(stats);
  renderMembersGrid(stats);
  renderTimeline(stats);
  runPoliceLookup();
}

function renderEntityTabs() {
  const clubCount = erpState.members.filter((m) => (m.entity || "club") === "club" && m.status === "active").length;
  const restoCount = erpState.members.filter((m) => m.entity === "restaurant" && m.status === "active").length;
  document.getElementById("entity-badge-club").textContent = `${clubCount} ${t("kpi_active")}`;
  document.getElementById("entity-badge-restaurant").textContent = `${restoCount} ${t("kpi_active")}`;

  const btnClub = document.getElementById("entity-tab-club");
  const btnResto = document.getElementById("entity-tab-restaurant");

  if (btnClub && btnResto) {
    if (activeEntity === "club") {
      btnClub.className = "entity-tab-btn text-left rounded-3xl p-4 sm:p-5 border-2 border-[#0070f3] bg-gray-950 text-white shadow-lg transition-all cursor-pointer flex items-center justify-between gap-3";
      btnResto.className = "entity-tab-btn text-left rounded-3xl p-4 sm:p-5 border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between gap-3";
    } else {
      btnClub.className = "entity-tab-btn text-left rounded-3xl p-4 sm:p-5 border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between gap-3";
      btnResto.className = "entity-tab-btn text-left rounded-3xl p-4 sm:p-5 border-2 border-emerald-500 bg-gray-950 text-white shadow-lg transition-all cursor-pointer flex items-center justify-between gap-3";
    }
  }

  const ratePill = document.getElementById("entity-rate-pill");
  if (ratePill) {
    ratePill.innerHTML =
      activeEntity === "club"
        ? `${escapeHtml(t("fixed_rate_club_pill"))} <strong class="text-gray-900">₲ 150.000 ${escapeHtml(t("per_month"))}</strong>`
        : `${escapeHtml(t("fixed_rate_resto_pill"))} <strong class="text-emerald-700">${escapeHtml(t("resto_model_val"))}</strong>`;
  }

  const kpiTrainedLbl = document.getElementById("kpi-trained-lbl");
  if (kpiTrainedLbl) {
    kpiTrainedLbl.textContent = activeEntity === "club" ? t("kpi_members_trained") : t("kpi_resto_clients");
  }
}

function renderPart1Finance(stats) {
  document.getElementById("bank-cash-balance").textContent = formatGs(stats.cashBalance);
  document.getElementById("bank-cash-in").textContent = `+ ${formatGs(stats.cashIn)}`;
  document.getElementById("bank-cash-out").textContent = `- ${formatGs(stats.cashOut)}`;

  document.getElementById("bank-transfer-balance").textContent = formatGs(stats.transferBalance);
  document.getElementById("bank-transfer-in").textContent = `+ ${formatGs(stats.transferIn)}`;
  document.getElementById("bank-transfer-out").textContent = `- ${formatGs(stats.transferOut)}`;

  document.getElementById("bank-total-balance").textContent = formatGs(stats.totalBalance);
  document.getElementById("monthly-runrate-pill").textContent = `${formatGs(stats.activeMonthlyRunRate)} ${t("active_month_flow")}`;

  const totalInflows = stats.cashIn + stats.transferIn;
  let cashPct = 50;
  let bankPct = 50;
  if (totalInflows > 0) {
    cashPct = Math.round((stats.cashIn / totalInflows) * 100);
    bankPct = 100 - cashPct;
  } else if (stats.cashBalance + stats.transferBalance > 0) {
    const posCash = Math.max(0, stats.cashBalance);
    const posBank = Math.max(0, stats.transferBalance);
    const sumPos = posCash + posBank || 1;
    cashPct = Math.round((posCash / sumPos) * 100);
    bankPct = 100 - cashPct;
  }
  document.getElementById("ratio-bar-cash").style.width = `${cashPct}%`;
  document.getElementById("ratio-bar-bank").style.width = `${bankPct}%`;
  document.getElementById("ratio-label-cash").textContent = `${t("ratio_cash")} : ${cashPct}%`;
  document.getElementById("ratio-label-bank").textContent = `${t("ratio_bank")} : ${bankPct}%`;

  // KPIs
  document.getElementById("stat-active-count").textContent = stats.activeCount;
  document.getElementById("stat-past-count").textContent = stats.pastCount;
  document.getElementById("stat-future-count").textContent = stats.futureCount;
  document.getElementById("stat-total-trained").textContent = stats.totalHistoricalCount;

  document.getElementById("stat-unsub-count").textContent = stats.unsubscribedCount;
  document.getElementById("stat-churn-loss").textContent = formatGs(stats.potentialChurnLossMonthly);

  document.getElementById("stat-unpaid-amount").textContent = formatGs(stats.totalUnpaidAmount);
  document.getElementById("stat-unpaid-months").textContent = stats.totalUnpaidMonths;
  document.getElementById("stat-unpaid-members").textContent = stats.unpaidMembersList.length;

  document.getElementById("stat-aff-month").textContent = formatGs(stats.totalAffiliateMonth);
  document.getElementById("stat-period-net").textContent = formatGs(stats.periodNet);

  // Period Switcher Buttons
  ["daily", "weekly", "monthly", "total"].forEach((p) => {
    const btn = document.getElementById(`period-btn-${p}`);
    if (!btn) return;
    btn.className =
      p === currentPeriod
        ? "period-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer bg-black text-white shadow-sm"
        : "period-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-gray-600 hover:text-gray-900";
  });

  document.getElementById("period-revenue").textContent = formatGs(stats.periodRev);
  document.getElementById("period-expenses").textContent = formatGs(stats.periodExp);
  document.getElementById("period-profit").textContent = formatGs(stats.periodNet);
  const ratioStr =
    stats.periodExp > 0
      ? `${(stats.periodRev / stats.periodExp).toFixed(2)}x (${Math.round((stats.periodNet / Math.max(1, stats.periodRev)) * 100)}% ${t("margin_word")})`
      : stats.periodRev > 0
      ? t("ratio_inf")
      : "—";
  document.getElementById("period-ratio").textContent = ratioStr;

  renderCharts(stats);

  // Expenses Horizontal List
  const expContainer = document.getElementById("expenses-list");
  const sortedExp = [...stats.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  document.getElementById("expenses-count-badge").textContent = `${sortedExp.length} ${t("expenses_count_suffix")}`;

  if (sortedExp.length === 0) {
    expContainer.innerHTML = `<div class="text-xs text-gray-400 italic py-2">${escapeHtml(t("no_expenses"))}</div>`;
  } else {
    expContainer.innerHTML = sortedExp
      .slice(0, 15)
      .map((exp) => {
        const methodBadge =
          exp.method === "transferencia"
            ? `<span class="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">🏦 ${escapeHtml(t("ratio_bank"))}</span>`
            : `<span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">💵 ${escapeHtml(t("ratio_cash"))}</span>`;
        return `
          <div class="flex-shrink-0 w-60 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-gray-900 truncate">${escapeHtml(exp.description)}</span>
              <button type="button" onclick="deleteExpense('${exp.id}')" class="text-gray-400 hover:text-red-600 cursor-pointer">✕</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-black text-amber-700">${formatGs(exp.amount)}</span>
              ${methodBadge}
            </div>
            <div class="text-[10px] text-gray-500 flex justify-between">
              <span>${escapeHtml(activeEntity === "club" ? "🥊 Club" : "🥗 Resto")}</span>
              <span>${formatDateFr(exp.date)}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function setFinancialPeriod(period) {
  currentPeriod = period;
  renderAll();
}

function buildTimeSeriesBuckets(stats) {
  const today = getTodayIso();
  let dates = [];

  if (currentPeriod === "daily") {
    for (let i = 6; i >= 0; i--) dates.push(addDaysIso(today, -i));
  } else if (currentPeriod === "weekly") {
    for (let i = 13; i >= 0; i--) dates.push(addDaysIso(today, -i));
  } else if (currentPeriod === "monthly") {
    for (let i = 29; i >= 0; i--) dates.push(addDaysIso(today, -i));
  } else {
    const allDates = [
      ...stats.allRevenueEvents.map((e) => e.date),
      ...stats.expenses.map((r) => r.date),
      ...stats.members.map((m) => m.subscribedSince)
    ].filter(Boolean);
    const minDate = allDates.length > 0 ? allDates.sort()[0] : addDaysIso(today, -14);
    dates = getDaysRange(minDate <= today ? minDate : today, today);
    if (dates.length > 60) dates = dates.slice(-60);
  }

  const revByDate = {};
  const expByDate = {};
  for (const ev of stats.allRevenueEvents) revByDate[ev.date] = (revByDate[ev.date] || 0) + ev.amount;
  for (const r of stats.expenses) {
    const d = r.date || today;
    expByDate[d] = (expByDate[d] || 0) + (Number(r.amount) || 0);
  }

  const labels = dates.map((d) => {
    const [, m, day] = d.split("-");
    return `${day}/${m}`;
  });
  const revSeries = dates.map((d) => revByDate[d] || 0);
  const expSeries = dates.map((d) => expByDate[d] || 0);
  const cumNetSeries = [];
  let runningNet = 0;

  for (let i = 0; i < dates.length; i++) {
    runningNet += revSeries[i] - expSeries[i];
    cumNetSeries.push(runningNet);
  }

  return { labels, revSeries, expSeries, cumNetSeries };
}

function renderCharts(stats) {
  if (typeof Chart === "undefined") return;
  const series = buildTimeSeriesBuckets(stats);

  if (growthChart) growthChart.destroy();
  if (ratioChart) ratioChart.destroy();
  if (expensesChart) expensesChart.destroy();

  const ctxGrowth = document.getElementById("chart-growth")?.getContext("2d");
  if (ctxGrowth) {
    growthChart = new Chart(ctxGrowth, {
      type: "line",
      data: {
        labels: series.labels,
        datasets: [
          {
            label: t("chart_lbl_rev"),
            data: series.revSeries,
            borderColor: "#199E5E",
            backgroundColor: "rgba(25, 158, 94, 0.12)",
            fill: true,
            tension: 0.35,
            borderWidth: 2.5
          },
          {
            label: t("chart_lbl_cumnet"),
            data: series.cumNetSeries,
            borderColor: "#0070f3",
            borderDash: [5, 4],
            fill: false,
            tension: 0.35,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } }
      }
    });
  }

  const ctxRatio = document.getElementById("chart-ratio")?.getContext("2d");
  if (ctxRatio) {
    ratioChart = new Chart(ctxRatio, {
      type: "bar",
      data: {
        labels: series.labels,
        datasets: [
          {
            label: t("chart_lbl_rev_short"),
            data: series.revSeries,
            backgroundColor: "rgba(52, 209, 134, 0.78)",
            borderRadius: 6
          },
          {
            label: t("chart_lbl_exp"),
            data: series.expSeries,
            backgroundColor: "rgba(239, 68, 68, 0.78)",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } }
      }
    });
  }

  const ctxExp = document.getElementById("chart-expenses")?.getContext("2d");
  if (ctxExp) {
    expensesChart = new Chart(ctxExp, {
      type: "line",
      data: {
        labels: series.labels,
        datasets: [
          {
            label: t("chart_lbl_exp"),
            data: series.expSeries,
            borderColor: "#d97706",
            backgroundColor: "rgba(217, 119, 6, 0.16)",
            fill: true,
            tension: 0.3,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } }
      }
    });
  }
}

// ==========================================================================
// 8. PARTIE 2: ALERTES NIVEAU 1 (MOIS) & NIVEAU 2 (+2 SEMAINES / COUPER ACCÈS)
// ==========================================================================
function renderPart2Alerts(stats) {
  const container = document.getElementById("alerts-center");
  const blocks = [];

  // Level 2 Alerts (Flashing urgent cutoff after >= 14 days / 2 weeks unpaid)
  const level2Items = stats.unpaidMembersList.filter((item) => item.analysis.cutoffAlert);
  for (const { member, analysis } of level2Items) {
    const phoneClean = (member.phone || "").replace(/\D/g, "");
    const waMsg = encodeURIComponent(
      `Hola ${member.name}, tu cuota mensual en Olimpo (${formatGs(analysis.unpaidAmount)}) lleva ${analysis.maxDaysOverdue} días de atraso. Por favor regularizá hoy en efectivo o transferencia (Alias 0984430018) para mantener activo tu acceso.`
    );
    blocks.push(`
      <div class="alert-cutoff-pulse rounded-3xl bg-red-600 text-white p-5 shadow-lg border-2 border-red-400">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1 flex-1 min-w-[260px]">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full bg-yellow-300 text-black text-[11px] font-black uppercase tracking-wider">
                ${escapeHtml(t("alert_l2_badge"))}
              </span>
              ${member.accessBlocked ? `<span class="px-2 py-0.5 rounded-full bg-black/45 text-white text-[10px] font-bold">${escapeHtml(t("alert_l2_cut_done"))}</span>` : ""}
            </div>
            <h3 class="text-base sm:text-lg font-black">
              ${escapeHtml(member.name)} (${escapeHtml(member.disciplineOrPlan || "Club")}) — ${escapeHtml(t("alert_l2_debt"))} ${formatGs(analysis.unpaidAmount)}
            </h3>
            <p class="text-xs text-red-100 font-medium">
              ${escapeHtml(t("alert_l2_msg_1"))}<strong>${analysis.maxDaysOverdue}</strong> ${escapeHtml(t("word_days"))}${escapeHtml(t("alert_l2_msg_2"))}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="toggleAccessCut('${member.id}')" class="px-3.5 py-2 rounded-full bg-black hover:bg-gray-900 text-yellow-300 text-xs font-extrabold cursor-pointer transition-all">
              ${escapeHtml(member.accessBlocked ? t("btn_restore_access") : t("btn_cut_access"))}
            </button>
            ${phoneClean ? `<a href="https://wa.me/${phoneClean}?text=${waMsg}" target="_blank" class="px-3.5 py-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-extrabold">💬 WhatsApp</a>` : ""}
            <button type="button" onclick="openUnpaidDetailsModal()" class="px-3.5 py-2 rounded-full bg-white text-red-700 hover:bg-red-50 text-xs font-extrabold cursor-pointer">
              ${escapeHtml(t("btn_settle"))}
            </button>
          </div>
        </div>
      </div>
    `);
  }

  // Level 1 Red Alerts (Active members needing current month payment validation)
  const pendingValidation = stats.members.filter((m) => m.status === "active" && analyzeMemberPayments(m).needsTodayValidation);
  for (const member of pendingValidation) {
    const an = analyzeMemberPayments(member);
    const fee = member.entity === "club" ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || CLUB_MONTHLY_FEE);
    const mk = an.currentMonthKey;
    blocks.push(`
      <div class="rounded-2xl bg-red-50 border-2 border-red-400 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0">!</div>
          <div>
            <p class="text-xs font-extrabold text-red-700 uppercase tracking-wider">${escapeHtml(t("alert_today_title"))} (${formatMonthShort(mk)})</p>
            <p class="text-sm font-bold text-gray-900">
              <span class="text-red-700">${escapeHtml(t("alert_today_q_1"))} ${escapeHtml(member.name)} ${escapeHtml(t("alert_today_q_2"))}</span>
              <span class="text-gray-600 font-medium">(${formatGs(fee)})</span>
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="markMonthPayment('${member.id}', '${mk}', 'paid', 'cash')" class="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs">
            ${escapeHtml(t("btn_yes_cash"))}
          </button>
          <button type="button" onclick="markMonthPayment('${member.id}', '${mk}', 'paid', 'transferencia')" class="px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs">
            ${escapeHtml(t("btn_yes_transfer"))}
          </button>
          <button type="button" onclick="markMonthPayment('${member.id}', '${mk}', 'unpaid', null)" class="px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs">
            ${escapeHtml(t("btn_no_unpaid"))}
          </button>
        </div>
      </div>
    `);
  }

  if (blocks.length === 0) {
    container.innerHTML = `
      <div class="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
        <span>✅</span>
        <span>${escapeHtml(t("alerts_all_ok"))} (${formatMonthShort(getCurrentMonthKey())})</span>
      </div>
    `;
  } else {
    container.innerHTML = blocks.join("");
  }
}

// ==========================================================================
// 9. GRILLE DES ABONNÉS (80/20 LOW COGNITIVE LOAD)
// ==========================================================================
function setMemberFilter(filter) {
  currentMemberFilter = filter;
  renderMembersGrid();
}

function renderMembersGrid(statsOverride = null) {
  const stats = statsOverride || computeEntityFinancials(activeEntity);
  const query = (document.getElementById("members-quick-search")?.value || "").trim().toLowerCase();

  ["all", "active", "unpaid", "level2", "unsubscribed", "future"].forEach((f) => {
    const btn = document.getElementById(`member-filter-${f}`);
    if (!btn) return;
    btn.className =
      f === currentMemberFilter
        ? "member-filter-btn px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-all bg-black text-white shadow-sm"
        : "member-filter-btn px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-100";
  });

  const enriched = stats.members.map((m) => ({
    member: m,
    analysis: analyzeMemberPayments(m)
  }));

  const filtered = enriched.filter(({ member, analysis }) => {
    if (query) {
      const hay = `${member.name} ${member.ci} ${member.phone} ${member.code} ${member.email}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    if (currentMemberFilter === "active") return member.status === "active";
    if (currentMemberFilter === "unpaid") return analysis.unpaidCount > 0 || analysis.needsTodayValidation;
    if (currentMemberFilter === "level2") return analysis.cutoffAlert;
    if (currentMemberFilter === "unsubscribed") return member.status === "unsubscribed" || member.status === "suspended";
    if (currentMemberFilter === "future") return member.status === "future";
    return true;
  });

  document.getElementById("members-count-label").textContent = `${filtered.length} ${t("members_shown")}`;
  const grid = document.getElementById("members-grid");

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full rounded-3xl bg-white border border-gray-200 p-8 text-center text-sm text-gray-500">${escapeHtml(t("members_empty"))}</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(({ member, analysis }) => {
      const fee = member.entity === "club" ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || CLUB_MONTHLY_FEE);
      const docsCount = (member.documents || []).length;
      const affEarn = Number(member.affiliate?.monthlyEarnings || 0);
      const isLeft = member.status === "unsubscribed" || member.status === "suspended";
      const isFuture = member.status === "future";

      let statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">${escapeHtml(t("status_active"))}</span>`;
      if (member.accessBlocked) {
        statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">${escapeHtml(t("status_blocked"))}</span>`;
      } else if (isLeft) {
        statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">${escapeHtml(t("status_unsubscribed"))}</span>`;
      } else if (isFuture) {
        statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">${escapeHtml(t("status_future"))}</span>`;
      }

      const monthBanner =
        member.status !== "active"
          ? ""
          : analysis.currentCycleStatus === "paid"
          ? `<div class="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 flex items-center justify-between">
              <span>${escapeHtml(t("paid_month_ok"))} (${formatMonthShort(analysis.currentMonthKey)})</span>
              <button type="button" onclick="markMonthPayment('${member.id}', '${analysis.currentMonthKey}', 'unpaid', null)" class="text-[10px] underline text-gray-500 hover:text-red-600 cursor-pointer">${escapeHtml(t("btn_correct"))}</button>
            </div>`
          : `<div class="rounded-xl bg-red-50 border-2 border-red-400 p-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-red-700">
                  ${escapeHtml(analysis.currentCycleStatus === "unpaid" ? t("unpaid_month_badge") : t("paid_month_q"))} (${formatMonthShort(analysis.currentMonthKey)} • ${formatGs(fee)})
                </span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <button type="button" onclick="markMonthPayment('${member.id}', '${analysis.currentMonthKey}', 'paid', 'cash')" class="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer">${escapeHtml(t("btn_yes_cash_sm"))}</button>
                <button type="button" onclick="markMonthPayment('${member.id}', '${analysis.currentMonthKey}', 'paid', 'transferencia')" class="py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer">${escapeHtml(t("btn_yes_transf_sm"))}</button>
                <button type="button" onclick="markMonthPayment('${member.id}', '${analysis.currentMonthKey}', 'unpaid', null)" class="py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer">${escapeHtml(t("btn_no_sm"))}</button>
              </div>
            </div>`;

      const cutoffStrip = analysis.cutoffAlert
        ? `<div class="rounded-xl bg-red-600 text-white px-3 py-2 text-[11px] font-black flex items-center justify-between gap-2">
            <span>🚨 +${analysis.maxDaysOverdue}${escapeHtml(t("word_days_short"))} (${formatGs(analysis.unpaidAmount)})</span>
            <button type="button" onclick="toggleAccessCut('${member.id}')" class="px-2 py-0.5 rounded bg-black text-yellow-300 text-[10px] cursor-pointer">${escapeHtml(member.accessBlocked ? t("btn_restore_access") : t("btn_cut_access"))}</button>
          </div>`
        : "";

      const recentMonths = analysis.cycleLogs.slice(-6);
      const monthPillsHtml = recentMonths
        .map((cyc) => {
          let cls = "bg-gray-100 text-gray-600 border-gray-200";
          let icon = "•";
          if (cyc.status === "paid" && cyc.method === "cash") {
            cls = "bg-emerald-100 text-emerald-800 border-emerald-300";
            icon = "💵";
          } else if (cyc.status === "paid" && cyc.method === "transferencia") {
            cls = "bg-indigo-100 text-indigo-800 border-indigo-300";
            icon = "🏦";
          } else {
            cls = "bg-red-100 text-red-700 border-red-300";
            icon = "✕";
          }
          return `
            <button type="button" onclick="cycleMonthPayment('${member.id}', '${cyc.monthKey}')" title="${cyc.monthKey}" class="flex flex-col items-center px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer hover:scale-105 transition-transform ${cls}">
              <span>${formatMonthShort(cyc.monthKey)}</span>
              <span>${icon}</span>
            </button>
          `;
        })
        .join("");

      const lifecycleActionBtn = isLeft
        ? `<button type="button" onclick="openResubscribeModal('${member.id}')" class="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer">${escapeHtml(t("btn_return_club"))}</button>`
        : isFuture
        ? `<button type="button" onclick="activateFutureMember('${member.id}')" class="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer">${escapeHtml(t("btn_activate_now"))}</button>`
        : `<button type="button" onclick="markMemberLeft('${member.id}')" class="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer">${escapeHtml(t("btn_leave_club"))}</button>`;

      return `
        <div class="rounded-3xl bg-white border ${analysis.cutoffAlert ? "border-red-500 ring-2 ring-red-200" : isLeft ? "border-amber-200" : "border-gray-200"} shadow-sm overflow-hidden flex flex-col justify-between p-5 space-y-4">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                ${statusBadge}
                <h3 class="font-extrabold text-base text-gray-900 leading-snug mt-1">${escapeHtml(member.name)}</h3>
                <p class="text-[11px] text-gray-500 font-medium">${escapeHtml(member.disciplineOrPlan || "")} • <strong class="text-gray-800">${formatGs(fee)}${escapeHtml(t("per_month"))}</strong></p>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" onclick="openEditMemberModal('${member.id}')" class="text-xs text-gray-400 hover:text-gray-800 p-1 cursor-pointer" title="Edit">✏️</button>
                <button type="button" onclick="deleteMember('${member.id}')" class="text-xs text-gray-400 hover:text-red-600 p-1 cursor-pointer" title="Delete">🗑️</button>
              </div>
            </div>

            <div class="rounded-2xl bg-gray-50 border border-gray-100 p-3 text-xs space-y-1">
              <div class="flex justify-between gap-2">
                <span class="text-gray-500">${escapeHtml(t("lbl_ci_tel"))}</span>
                <span class="font-semibold text-gray-800 text-right">${escapeHtml(member.ci || "—")} • ${escapeHtml(member.phone || "—")}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-gray-500">${escapeHtml(isLeft ? t("lbl_left_at") : t("lbl_since"))}</span>
                <span class="font-bold text-gray-900">${formatDateFr(isLeft ? member.unsubscribedAt : member.subscribedSince)}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-gray-500">${escapeHtml(t("lbl_aff_month"))}</span>
                <span class="font-bold text-indigo-700">+${formatGs(affEarn)} ${member.code ? `(${escapeHtml(member.code)})` : ""}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-gray-500">${escapeHtml(t("lbl_total_paid"))}</span>
                <span class="font-black text-emerald-700">${formatGs(analysis.totalPaidAmount)}${analysis.unpaidAmount > 0 ? ` <span class="text-red-600">(${escapeHtml(t("lbl_unpaid_badge"))} ${formatGs(analysis.unpaidAmount)})</span>` : ""}</span>
              </div>
            </div>

            ${cutoffStrip}
            ${monthBanner}

            ${
              monthPillsHtml
                ? `<div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">${escapeHtml(t("last_months_lbl"))}</p>
                    <div class="flex flex-wrap gap-1">${monthPillsHtml}</div>
                  </div>`
                : ""
            }
          </div>

          <div class="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
            <button type="button" onclick="openMemberDocsModal('${member.id}')" class="py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold cursor-pointer">
              ${escapeHtml(t("btn_docs_opt"))} (${docsCount})
            </button>
            ${lifecycleActionBtn}
            <button type="button" onclick="openMemberHistoryModal('${member.id}')" class="col-span-2 py-1.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold cursor-pointer">
              ${escapeHtml(t("btn_history"))} (${getEffectiveMemberPeriods(member).length})
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

// ==========================================================================
// 10. CHRONOLOGICAL TIMELINE (PRESENT / FUTURE / PAST) & POLICE DATE LOOKUP
// ==========================================================================
function setTimelineTab(tab) {
  currentTimelineTab = tab;
  renderTimeline();
}

function renderTimeline(statsOverride = null) {
  const stats = statsOverride || computeEntityFinancials(activeEntity);

  ["active", "future", "past"].forEach((tab) => {
    const btn = document.getElementById(`timeline-tab-${tab}`);
    if (!btn) return;
    btn.className =
      tab === currentTimelineTab
        ? "timeline-tab-btn px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all bg-black text-white shadow-sm"
        : "timeline-tab-btn px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all text-gray-600 hover:text-gray-900";
  });

  const rows = [];
  for (const m of stats.members) {
    const periods = getEffectiveMemberPeriods(m);
    for (const p of periods) {
      const pStatus = p.status || (p.endDate ? "completed" : m.status);
      if (currentTimelineTab === "active" && pStatus === "active" && m.status === "active") {
        rows.push({ member: m, period: p });
      } else if (currentTimelineTab === "future" && (pStatus === "future" || m.status === "future")) {
        rows.push({ member: m, period: p });
      } else if (currentTimelineTab === "past" && (pStatus === "completed" || m.status === "unsubscribed" || m.status === "suspended")) {
        rows.push({ member: m, period: p });
      }
    }
  }

  rows.sort((a, b) => (b.period.startDate || "").localeCompare(a.period.startDate || ""));
  const list = document.getElementById("timeline-list");

  if (rows.length === 0) {
    list.innerHTML = `<div class="text-xs text-gray-500 text-center py-6 bg-gray-50 rounded-2xl">${escapeHtml(t("timeline_empty"))}</div>`;
    return;
  }

  list.innerHTML = rows
    .map(({ member, period }) => {
      const analysis = analyzeMemberPayments(member);
      const docsCount = (member.documents || []).length;
      return `
        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-extrabold text-sm text-gray-900">${escapeHtml(member.name)}</span>
              ${member.ci ? `<span class="text-xs text-gray-500">ID ${escapeHtml(member.ci)}</span>` : ""}
              <span class="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-gray-800">${escapeHtml(period.plan || member.disciplineOrPlan)}</span>
            </div>
            <p class="text-xs text-gray-600">
              ${escapeHtml(t("lbl_period"))} <strong>${formatDateFr(period.startDate)}</strong> → <strong>${period.endDate ? formatDateFr(period.endDate) : escapeHtml(t("lbl_ongoing"))}</strong>
              • ${escapeHtml(t("label_collected"))} <strong class="text-emerald-700">${formatGs(analysis.totalPaidAmount)}</strong>
              ${analysis.unpaidAmount > 0 ? `• <strong class="text-red-600">${escapeHtml(t("lbl_unpaid_short"))} ${formatGs(analysis.unpaidAmount)}</strong>` : ""}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            ${member.status === "future" ? `<button type="button" onclick="activateFutureMember('${member.id}')" class="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold cursor-pointer">${escapeHtml(t("btn_activate_now"))}</button>` : ""}
            ${member.status === "unsubscribed" ? `<button type="button" onclick="openResubscribeModal('${member.id}')" class="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold cursor-pointer">${escapeHtml(t("btn_return_club"))}</button>` : ""}
            <button type="button" onclick="openMemberDocsModal('${member.id}')" class="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold cursor-pointer hover:bg-gray-800">
              ${escapeHtml(t("btn_docs_opt"))} (${docsCount})
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function runPoliceLookup() {
  const dateInput = document.getElementById("police-date-input");
  const statusFilter = document.getElementById("police-status-select")?.value || "";
  const textFilter = (document.getElementById("police-text-input")?.value || "").trim().toLowerCase();
  const container = document.getElementById("police-results");
  if (!container) return;

  const targetDate = dateInput?.value || "";
  const entityMembers = erpState.members.filter((m) => (m.entity || "club") === activeEntity);

  if (!targetDate && !statusFilter && !textFilter) {
    container.innerHTML = `<p class="text-xs text-slate-400 italic">${escapeHtml(t("police_empty_hint"))}</p>`;
    return;
  }

  const matches = [];
  for (const m of entityMembers) {
    if (statusFilter && m.status !== statusFilter) continue;
    if (textFilter) {
      const hay = `${m.name} ${m.ci} ${m.phone} ${m.code} ${m.email} ${m.address}`.toLowerCase();
      if (!hay.includes(textFilter)) continue;
    }

    const periods = getEffectiveMemberPeriods(m);
    let matchedPeriod = null;
    if (targetDate) {
      matchedPeriod = periods.find((p) => {
        if (!p.startDate || p.startDate > targetDate) return false;
        const effectiveEnd = p.endDate || (m.status === "unsubscribed" ? m.unsubscribedAt : null);
        if (effectiveEnd && effectiveEnd < targetDate) return false;
        return true;
      });
      if (!matchedPeriod) continue;
    } else {
      matchedPeriod = periods[periods.length - 1];
    }

    matches.push({ member: m, period: matchedPeriod });
  }

  if (matches.length === 0) {
    container.innerHTML = `<p class="text-xs text-amber-300 font-semibold">${escapeHtml(t("police_no_match"))}</p>`;
    return;
  }

  container.innerHTML = matches
    .map(({ member, period }) => {
      const docsCount = (member.documents || []).length;
      return `
        <div class="rounded-2xl bg-slate-800 border border-slate-700 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-extrabold text-sm text-white">${escapeHtml(member.name)}</span>
              ${member.ci ? `<span class="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 font-semibold">ID ${escapeHtml(member.ci)}</span>` : ""}
              <span class="text-xs text-emerald-300 font-bold">${escapeHtml(period?.plan || member.disciplineOrPlan)}</span>
            </div>
            <p class="text-xs text-slate-300">
              ${escapeHtml(t("police_period"))} <strong>${formatDateFr(period?.startDate || member.subscribedSince)}</strong> ${escapeHtml(t("police_to"))} <strong>${period?.endDate ? formatDateFr(period.endDate) : escapeHtml(t("police_present"))}</strong>
              • Tel : ${escapeHtml(member.phone || "—")}
            </p>
          </div>
          <button type="button" onclick="openMemberDocsModal('${member.id}')" class="px-3.5 py-2 rounded-full bg-[#34D186] hover:bg-emerald-400 text-black text-xs font-black cursor-pointer">
            ${escapeHtml(t("police_btn_docs"))} (${docsCount})
          </button>
        </div>
      `;
    })
    .join("");
}

// ==========================================================================
// 11. MEMBER PAYMENT, LIFECYCLE & FINANCIAL ACTIONS
// ==========================================================================
function markMonthPayment(memberId, monthKey, status, method) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  if (!member.payments) member.payments = {};
  const fee = member.entity === "club" ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || CLUB_MONTHLY_FEE);

  member.payments[monthKey] = {
    status,
    method: status === "paid" ? method : null,
    amount: fee,
    paidAt: status === "paid" ? getTodayIso() : null,
    updatedAt: Date.now()
  };
  if (status === "paid") {
    const an = analyzeMemberPayments(member);
    if (!an.cutoffAlert) member.accessBlocked = false;
  }
  saveState();
}

function cycleMonthPayment(memberId, monthKey) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  const cur = member.payments?.[monthKey];
  if (!cur || cur.status !== "paid") {
    markMonthPayment(memberId, monthKey, "paid", "cash");
  } else if (cur.method === "cash") {
    markMonthPayment(memberId, monthKey, "paid", "transferencia");
  } else {
    markMonthPayment(memberId, monthKey, "unpaid", null);
  }
}

function settleAllMemberUnpaid(memberId, method) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  const analysis = analyzeMemberPayments(member);
  if (!member.payments) member.payments = {};
  const today = getTodayIso();

  for (const cyc of analysis.unpaidCycles) {
    member.payments[cyc.monthKey] = {
      status: "paid",
      method,
      amount: cyc.amount,
      paidAt: today,
      updatedAt: Date.now()
    };
  }
  member.accessBlocked = false;
  saveState();
  openUnpaidDetailsModal();
}

function toggleAccessCut(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  member.accessBlocked = !member.accessBlocked;
  saveState();
}

function markMemberLeft(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  if (!confirm(t("confirm_leave", { name: member.name }))) return;

  const today = getTodayIso();
  member.status = "unsubscribed";
  member.unsubscribedAt = today;
  const periods = getEffectiveMemberPeriods(member);
  member.periods = periods;
  const lastActive = [...periods].reverse().find((p) => !p.endDate || p.status === "active");
  if (lastActive) {
    lastActive.endDate = today;
    lastActive.status = "completed";
  }
  saveState();
}

function openResubscribeModal(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  document.getElementById("resub-mem-id").value = member.id;
  document.getElementById("resub-mem-name").textContent = member.name;
  document.getElementById("resub-start-date").value = getTodayIso();
  document.getElementById("resub-pay-status").value = "pending";
  openModal("resubscribe-modal");
}

function submitResubscribeForm(e) {
  e.preventDefault();
  const id = document.getElementById("resub-mem-id").value;
  const member = erpState.members.find((m) => m.id === id);
  if (!member) return;

  const startDate = document.getElementById("resub-start-date").value || getTodayIso();
  const payChoice = document.getElementById("resub-pay-status").value;
  const fee = member.entity === "club" ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || CLUB_MONTHLY_FEE);

  member.periods = getEffectiveMemberPeriods(member);
  member.periods.push({
    id: `per-${Date.now()}`,
    startDate,
    endDate: null,
    plan: member.disciplineOrPlan,
    fee,
    status: "active"
  });

  member.status = "active";
  member.accessBlocked = false;
  member.subscribedSince = startDate;
  member.unsubscribedAt = null;

  const mk = startDate.slice(0, 7);
  if (payChoice === "paid_cash" || payChoice === "paid_transferencia") {
    member.payments = member.payments || {};
    member.payments[mk] = {
      status: "paid",
      method: payChoice === "paid_cash" ? "cash" : "transferencia",
      amount: fee,
      paidAt: getTodayIso(),
      updatedAt: Date.now()
    };
  }

  closeModal("resubscribe-modal");
  saveState();
}

function activateFutureMember(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  const today = getTodayIso();
  member.status = "active";
  member.subscribedSince = today;
  member.periods = getEffectiveMemberPeriods(member);
  const futPeriod = [...member.periods].reverse().find((p) => p.status === "future");
  if (futPeriod) {
    futPeriod.status = "active";
    futPeriod.startDate = today;
  }
  saveState();
}

function deleteMember(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  if (!confirm(t("confirm_delete_member", { name: member.name }))) return;
  if (member.code) {
    erpState.dismissedStudentCodes = erpState.dismissedStudentCodes || [];
    if (!erpState.dismissedStudentCodes.includes(member.code.toUpperCase())) {
      erpState.dismissedStudentCodes.push(member.code.toUpperCase());
    }
  }
  erpState.members = erpState.members.filter((m) => m.id !== memberId);
  saveState();
}

function openUnpaidDetailsModal() {
  const stats = computeEntityFinancials(activeEntity);
  const body = document.getElementById("unpaid-modal-body");

  if (stats.unpaidMembersList.length === 0) {
    body.innerHTML = `<div class="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center text-sm font-bold text-emerald-800">${escapeHtml(t("modal_unpaid_empty"))}</div>`;
  } else {
    body.innerHTML = stats.unpaidMembersList
      .map(({ member, analysis }) => {
        const phoneClean = (member.phone || "").replace(/\D/g, "");
        return `
          <div class="rounded-2xl bg-white border ${analysis.cutoffAlert ? "border-red-500 ring-2 ring-red-100" : "border-gray-200"} p-4 space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-base text-gray-900">${escapeHtml(member.name)}</span>
                  ${member.ci ? `<span class="text-xs text-gray-500">ID ${escapeHtml(member.ci)}</span>` : ""}
                  ${analysis.cutoffAlert ? `<span class="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">🚨 +2 sem.</span>` : ""}
                </div>
                <p class="text-xs text-gray-600 mt-0.5">${escapeHtml(member.disciplineOrPlan)} • Tel : ${escapeHtml(member.phone || "—")}</p>
                <p class="text-[11px] text-gray-500 mt-1">
                  ${escapeHtml(t("modal_unpaid_months"))} (${analysis.unpaidCount}) : ${analysis.unpaidCycles.map((c) => formatMonthShort(c.monthKey)).join(", ")}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xl font-black text-red-600">${formatGs(analysis.unpaidAmount)}</p>
                <p class="text-[10px] text-gray-400">${escapeHtml(t("modal_unpaid_owed"))}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <button type="button" onclick="settleAllMemberUnpaid('${member.id}', 'cash')" class="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">
                ${escapeHtml(t("btn_settle_cash"))}
              </button>
              <button type="button" onclick="settleAllMemberUnpaid('${member.id}', 'transferencia')" class="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer">
                ${escapeHtml(t("btn_settle_transfer"))}
              </button>
              ${phoneClean ? `<a href="https://wa.me/${phoneClean}" target="_blank" class="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-bold">💬 WhatsApp</a>` : ""}
            </div>
          </div>
        `;
      })
      .join("");
  }

  openModal("unpaid-modal");
}

function openMemberModal() {
  document.getElementById("member-modal-title").textContent = t("modal_member_add");
  document.getElementById("mem-form-id").value = "";
  document.getElementById("mem-form-name").value = "";
  document.getElementById("mem-form-ci").value = "";
  document.getElementById("mem-form-phone").value = "";
  document.getElementById("mem-form-code").value = "";
  document.getElementById("mem-form-status").value = "active";
  document.getElementById("mem-form-start").value = getTodayIso();
  document.getElementById("mem-form-plan").value =
    activeEntity === "club" ? "Kickboxing K-1 & Boxeo" : "Fighter Pro (2 Platos/día)";
  document.getElementById("mem-form-fee").value = activeEntity === "club" ? CLUB_MONTHLY_FEE : 950000;
  document.getElementById("mem-form-fee").readOnly = activeEntity === "club";
  document.getElementById("mem-form-address").value = "";
  document.getElementById("mem-form-first-pay").value = "pending";
  document.getElementById("mem-first-pay-wrapper").style.display = "block";
  openModal("member-modal");
}

function openEditMemberModal(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  document.getElementById("member-modal-title").textContent = t("modal_member_edit");
  document.getElementById("mem-form-id").value = member.id;
  document.getElementById("mem-form-name").value = member.name || "";
  document.getElementById("mem-form-ci").value = member.ci || "";
  document.getElementById("mem-form-phone").value = member.phone || "";
  document.getElementById("mem-form-code").value = member.email || member.code || "";
  document.getElementById("mem-form-status").value = member.status === "future" ? "future" : "active";
  document.getElementById("mem-form-start").value = member.subscribedSince || getTodayIso();
  document.getElementById("mem-form-plan").value = member.disciplineOrPlan || "";
  const isClub = (member.entity || "club") === "club";
  document.getElementById("mem-form-fee").value = isClub ? CLUB_MONTHLY_FEE : (Number(member.monthlyFee) || 500000);
  document.getElementById("mem-form-fee").readOnly = isClub;
  document.getElementById("mem-form-address").value = member.address || "";
  document.getElementById("mem-first-pay-wrapper").style.display = "none";
  openModal("member-modal");
}

function submitMemberForm(e) {
  e.preventDefault();
  const id = document.getElementById("mem-form-id").value;
  const name = document.getElementById("mem-form-name").value.trim();
  const ci = document.getElementById("mem-form-ci").value.trim();
  const phone = document.getElementById("mem-form-phone").value.trim();
  const rawCodeOrEmail = document.getElementById("mem-form-code").value.trim();
  const status = document.getElementById("mem-form-status").value;
  const startDate = document.getElementById("mem-form-start").value || getTodayIso();
  const plan = document.getElementById("mem-form-plan").value.trim();
  const fee = activeEntity === "club" ? CLUB_MONTHLY_FEE : (Number(document.getElementById("mem-form-fee").value) || 500000);
  const address = document.getElementById("mem-form-address").value.trim();

  const isEmail = rawCodeOrEmail.includes("@");
  const code = isEmail
    ? rawCodeOrEmail.split("@")[0].toUpperCase().replace(/[^A-Z0-9_-]/g, "")
    : rawCodeOrEmail.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const email = isEmail ? rawCodeOrEmail.toLowerCase() : "";

  if (id) {
    const existing = erpState.members.find((m) => m.id === id);
    if (existing) {
      existing.name = name;
      existing.ci = ci;
      existing.phone = phone;
      if (code) existing.code = code;
      if (email) existing.email = email;
      existing.disciplineOrPlan = plan;
      existing.monthlyFee = existing.entity === "club" ? CLUB_MONTHLY_FEE : fee;
      existing.address = address;
      existing.subscribedSince = startDate;
      if (existing.status === "future" && status === "active") existing.status = "active";
    }
  } else {
    const firstPay = document.getElementById("mem-form-first-pay").value;
    const payments = {};
    const mk = startDate.slice(0, 7);
    if (status === "active" && (firstPay === "paid_cash" || firstPay === "paid_transferencia")) {
      payments[mk] = {
        status: "paid",
        method: firstPay === "paid_cash" ? "cash" : "transferencia",
        amount: fee,
        paidAt: getTodayIso(),
        updatedAt: Date.now()
      };
    }

    erpState.members.push({
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entity: activeEntity,
      code,
      name,
      ci,
      phone,
      email,
      address,
      disciplineOrPlan: plan,
      monthlyFee: fee,
      status,
      accessBlocked: false,
      subscribedSince: startDate,
      unsubscribedAt: null,
      periods: [
        {
          id: `per-${Date.now()}`,
          startDate,
          endDate: null,
          plan,
          fee,
          status: status === "future" ? "future" : "active"
        }
      ],
      payments,
      affiliate: { code, clicks: 0, monthlyEarnings: 0, referralsCount: 0, referrals: [] },
      documents: []
    });
  }

  closeModal("member-modal");
  mergePublicStudentsIntoErp();
  saveState();
}

function openExpenseModal() {
  document.getElementById("exp-desc").value = "";
  document.getElementById("exp-amount").value = "";
  document.getElementById("exp-method").value = "cash";
  document.getElementById("exp-date").value = getTodayIso();
  openModal("expense-modal");
}

function submitExpenseForm(e) {
  e.preventDefault();
  erpState.expenses.push({
    id: `exp-${Date.now()}`,
    entity: activeEntity,
    description: document.getElementById("exp-desc").value.trim(),
    amount: Number(document.getElementById("exp-amount").value) || 0,
    method: document.getElementById("exp-method").value,
    date: document.getElementById("exp-date").value || getTodayIso()
  });
  closeModal("expense-modal");
  saveState();
}

function deleteExpense(expId) {
  if (!confirm(t("confirm_delete_exp"))) return;
  erpState.expenses = erpState.expenses.filter((r) => r.id !== expId);
  saveState();
}

function openAdjustBalanceModal(type) {
  document.getElementById("adjust-account-type").value = type;
  document.getElementById("adjust-modal-title").textContent = type === "cash" ? t("modal_adj_cash") : t("modal_adj_bank");
  const curInit = erpState.initialBalances?.[activeEntity]?.[type] || 0;
  document.getElementById("adjust-amount-input").value = curInit;
  openModal("adjust-balance-modal");
}

function submitAdjustBalance(e) {
  e.preventDefault();
  const type = document.getElementById("adjust-account-type").value;
  const val = Number(document.getElementById("adjust-amount-input").value) || 0;
  if (!erpState.initialBalances) erpState.initialBalances = { club: { cash: 0, transferencia: 0 }, restaurant: { cash: 0, transferencia: 0 } };
  if (!erpState.initialBalances[activeEntity]) erpState.initialBalances[activeEntity] = { cash: 0, transferencia: 0 };
  erpState.initialBalances[activeEntity][type] = val;
  closeModal("adjust-balance-modal");
  saveState();
}

function openMemberHistoryModal(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  document.getElementById("mem-history-title").textContent = `${member.name} ${member.ci ? `(ID ${member.ci})` : ""}`;
  const periods = getEffectiveMemberPeriods(member);
  const analysis = analyzeMemberPayments(member);

  const body = document.getElementById("mem-history-body");
  body.innerHTML = `
    <div class="space-y-2">
      <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500">${escapeHtml(t("timeline_title"))} (${periods.length})</h4>
      ${periods
        .map(
          (p) => `
          <div class="rounded-2xl bg-white border border-gray-200 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <p class="font-extrabold text-gray-900">${escapeHtml(p.plan || member.disciplineOrPlan)}</p>
              <p class="text-gray-600">${formatDateFr(p.startDate)} → ${p.endDate ? formatDateFr(p.endDate) : escapeHtml(t("lbl_ongoing"))}</p>
            </div>
            <span class="font-black text-emerald-700">${formatGs(p.fee || member.monthlyFee)}/mes</span>
          </div>
        `
        )
        .join("")}
    </div>
    <div class="space-y-2 pt-2">
      <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500">${escapeHtml(t("last_months_lbl"))}</h4>
      <div class="space-y-1.5">
        ${
          analysis.cycleLogs.length === 0
            ? `<p class="text-xs text-gray-500 italic bg-white p-3 rounded-xl border">—</p>`
            : analysis.cycleLogs
                .map(
                  (c) => `
                <div class="rounded-xl bg-white border border-gray-200 px-3.5 py-2 flex justify-between text-xs">
                  <span class="font-bold text-gray-800">${formatMonthShort(c.monthKey)} (${formatDateFr(c.dueDate)})</span>
                  <span class="font-black ${c.status === "paid" ? "text-emerald-700" : "text-red-600"}">
                    ${c.status === "paid" ? `✅ ${formatGs(c.amount)} (${c.method})` : `❌ ${formatGs(c.amount)}`}
                  </span>
                </div>
              `
                )
                .join("")
        }
      </div>
    </div>
  `;
  openModal("member-history-modal");
}

// ==========================================================================
// 12. ESPACE DOCUMENTS OPTIONNELS (UPLOAD / DOWNLOAD) & IMPRESSION FICHE
// ==========================================================================
function openMemberDocsModal(memberId) {
  activeDocsMemberId = memberId;
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;

  document.getElementById("docs-modal-title").textContent = `${member.name} — ${member.disciplineOrPlan || "Olimpo"}`;
  document.getElementById("docs-member-summary").innerHTML = `
    <div class="text-xs space-y-1">
      <p class="font-extrabold text-sm text-gray-900">${escapeHtml(member.name)} ${member.ci ? `<span class="text-gray-500 font-medium">(ID ${escapeHtml(member.ci)})</span>` : ""}</p>
      <p class="text-gray-600">Tel : <strong>${escapeHtml(member.phone || "—")}</strong> • Inscrit : <strong>${formatDateFr(member.subscribedSince)}</strong></p>
    </div>
    <button type="button" onclick="printMemberWaiver('${member.id}')" class="px-4 py-2.5 rounded-full bg-[#199E5E] hover:bg-[#14824d] text-white text-xs font-extrabold shadow-sm cursor-pointer">
      ${escapeHtml(t("btn_print_waiver"))}
    </button>
  `;

  renderDocsFilesList(member);
  openModal("member-docs-modal");
}

function renderDocsFilesList(member) {
  const grid = document.getElementById("docs-files-grid");
  const docs = member.documents || [];
  if (docs.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-xs text-gray-500 italic bg-white p-6 rounded-2xl border border-gray-200 text-center">${escapeHtml(t("stored_docs_empty"))}</div>`;
    return;
  }

  grid.innerHTML = docs
    .map((doc) => {
      const isImg = (doc.mimeType || "").startsWith("image/") && doc.dataUrl;
      return `
        <div class="rounded-2xl bg-white border border-gray-200 p-3 flex items-center gap-3 shadow-2xs">
          <div class="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            ${isImg ? `<img src="${doc.dataUrl}" alt="${escapeHtml(doc.name)}" class="w-full h-full object-cover" />` : `<span class="text-2xl">📄</span>`}
          </div>
          <div class="min-w-0 flex-1 text-xs space-y-1">
            <p class="font-extrabold text-gray-900 truncate">${escapeHtml(doc.docType)}</p>
            <p class="text-[11px] text-gray-500 truncate">${escapeHtml(doc.name)}</p>
            <div class="flex items-center gap-2 pt-1">
              <button type="button" onclick="viewStoredDocument('${member.id}', '${doc.id}')" class="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-bold cursor-pointer">${escapeHtml(t("btn_view"))}</button>
              <button type="button" onclick="downloadStoredDocument('${member.id}', '${doc.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold cursor-pointer">${escapeHtml(t("btn_download"))}</button>
              <button type="button" onclick="deleteStoredDocument('${member.id}', '${doc.id}')" class="text-gray-400 hover:text-red-600 text-[11px] cursor-pointer ml-auto">🗑️</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function compressImageDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = ev.target.result;
      if (!file.type.startsWith("image/")) {
        resolve({ rawDataUrl, syncedDataUrl: rawDataUrl });
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.65);
        resolve({ rawDataUrl, syncedDataUrl: compressed });
      };
      img.onerror = () => resolve({ rawDataUrl, syncedDataUrl: rawDataUrl });
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

async function handleDocumentUpload(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length || !activeDocsMemberId) return;
  const member = erpState.members.find((m) => m.id === activeDocsMemberId);
  if (!member) return;

  const docType = document.getElementById("upload-doc-type")?.value || "Document";
  if (!member.documents) member.documents = [];

  for (const file of files) {
    const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { rawDataUrl, syncedDataUrl } = await compressImageDataUrl(file);
    await saveFileToIdb(docId, rawDataUrl);

    member.documents.push({
      id: docId,
      name: file.name,
      docType,
      mimeType: file.type || "image/jpeg",
      dataUrl: syncedDataUrl,
      uploadedAt: new Date().toISOString()
    });
  }

  e.target.value = "";
  saveState();
  renderDocsFilesList(member);
}

async function viewStoredDocument(memberId, docId) {
  const member = erpState.members.find((m) => m.id === memberId);
  const doc = member?.documents?.find((d) => d.id === docId);
  if (!doc) return;

  const fullDataUrl = (await getFileFromIdb(docId)) || doc.dataUrl;
  if (!fullDataUrl) {
    alert("Archivo grande guardado localmente en el dispositivo donde se subió.");
    return;
  }
  document.getElementById("viewer-doc-name").textContent = `${doc.docType} — ${doc.name}`;
  const dlBtn = document.getElementById("viewer-doc-download");
  dlBtn.href = fullDataUrl;
  dlBtn.download = doc.name || "document";

  const content = document.getElementById("viewer-doc-content");
  if ((doc.mimeType || "").includes("pdf")) {
    content.innerHTML = `<iframe src="${fullDataUrl}" class="w-full h-full min-h-[75vh] rounded-xl bg-white"></iframe>`;
  } else {
    content.innerHTML = `<img src="${fullDataUrl}" alt="${escapeHtml(doc.name)}" class="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl" />`;
  }
  openModal("doc-viewer-modal");
}

async function downloadStoredDocument(memberId, docId) {
  const member = erpState.members.find((m) => m.id === memberId);
  const doc = member?.documents?.find((d) => d.id === docId);
  if (!doc) return;

  const fullDataUrl = (await getFileFromIdb(docId)) || doc.dataUrl;
  if (!fullDataUrl) {
    alert("Archivo guardado en el dispositivo de origen.");
    return;
  }
  const a = document.createElement("a");
  a.href = fullDataUrl;
  a.download = `${member.name.replace(/\s+/g, "_")}_${doc.docType.replace(/\s+/g, "_")}_${doc.name}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function deleteStoredDocument(memberId, docId) {
  if (!confirm(t("confirm_delete_doc"))) return;
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  member.documents = (member.documents || []).filter((d) => d.id !== docId);
  saveState();
  renderDocsFilesList(member);
}

function printMemberWaiver(memberId) {
  const member = erpState.members.find((m) => m.id === memberId);
  if (!member) return;
  const w = window.open("", "_blank");
  if (!w) return;

  w.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Ficha Oficial Olimpo - ${escapeHtml(member.name)}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 800px; margin: 30px auto; padding: 20px; font-size: 13px; }
        h1 { text-align: center; font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .box { border: 1px solid #ccc; padding: 12px; border-radius: 6px; margin-bottom: 16px; background: #f9f9f9; }
        .sigs { display: flex; justify-content: space-between; margin-top: 60px; }
        .sig { width: 42%; border-top: 1px solid #000; text-align: center; padding-top: 6px; font-weight: bold; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom:20px; text-align:right;">
        <button onclick="window.print()" style="padding:10px 20px; background:#000; color:#fff; border:none; border-radius:20px; cursor:pointer; font-weight:bold;">🖨️ Imprimir / Guardar PDF</button>
      </div>
      <h1>FICHA DE INSCRIPCIÓN Y DESCARGO DE RESPONSABILIDAD — OLIMPO TEAM AREGUÁ</h1>
      <div class="box">
        <strong>ENTIDAD :</strong> ${member.entity === "club" ? "Academia de Combate Olimpo (Prof. Rodrigo Rafael Noguera Barrientos)" : "Restaurante del Olimpo"} • Av. Las Residentas, Areguá, Paraguay.<br/>
        <strong>MIEMBRO :</strong> ${escapeHtml(member.name)} | C.I. N° : <strong>${escapeHtml(member.ci || "—")}</strong> | Tel : ${escapeHtml(member.phone || "—")} | Domicilio : ${escapeHtml(member.address || "—")}.
      </div>
      <div class="box">
        <strong>PLAN :</strong> ${escapeHtml(member.disciplineOrPlan)} | <strong>TARIFA MENSUAL :</strong> ${formatGs(member.entity === "club" ? CLUB_MONTHLY_FEE : member.monthlyFee)} / mes.<br/>
        <strong>FECHA DE INSCRIPCIÓN :</strong> ${formatDateFr(member.subscribedSince)}.
      </div>
      <p><strong>1. CUOTA MENSUAL NO NEGOCIABLE :</strong> La membresía del Club de Kickboxing K-1 &amp; Boxeo es de <strong>₲ 150.000 por mes</strong> (pago mensual en efectivo o transferencia SIPAP Alias 0984430018 Banco Familiar). Tras 14 días de mora, el acceso al club queda automáticamente suspendido.</p>
      <p><strong>2. APTITUD FÍSICA Y DESCARGO :</strong> El alumno declara encontrarse en condiciones aptas para la práctica de deportes de combate (Ley N° 2874/06 del Deporte) y exime al club de responsabilidad por lesiones propias del entrenamiento técnico y sparring.</p>
      <div class="sigs">
        <div class="sig">Dirección Olimpo Team<br/>Av. Las Residentas, Areguá</div>
        <div class="sig">Firma del Miembro<br/>${escapeHtml(member.name)} ${member.ci ? `(ID ${escapeHtml(member.ci)})` : ""}</div>
      </div>
    </body>
    </html>
  `);
  w.document.close();
}

// ==========================================================================
// 13. MODALS, EXPORT / IMPORT JSON & INITIALIZATION
// ==========================================================================
function openModal(id) {
  document.getElementById(id)?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
  document.body.style.overflow = "";
}

function openBackupModal() {
  openModal("backup-modal");
}

function exportDatabaseJson() {
  const blob = new Blob([JSON.stringify(erpState, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `olimpo_erp_backup_${getTodayIso()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDatabaseJson(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed || !Array.isArray(parsed.members)) {
        alert("Invalid JSON backup file.");
        return;
      }
      erpState = normalizeState(parsed);
      saveState();
      closeModal("backup-modal");
    } catch {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", async () => {
  checkAuthOnLoad();
  const policeDateInp = document.getElementById("police-date-input");
  if (policeDateInp) policeDateInp.value = getTodayIso();

  mergePublicStudentsIntoErp();
  setAdminLang(currentAdminLang, false);

  if (window.OlimpoFirebase) {
    await window.OlimpoFirebase.init();
  }
  await syncFromCloud(false);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && isAuthenticated()) {
      mergePublicStudentsIntoErp();
      syncFromCloud(false);
    }
  });
  window.addEventListener("focus", () => {
    if (isAuthenticated()) {
      mergePublicStudentsIntoErp();
      syncFromCloud(false);
    }
  });

  setInterval(() => {
    if (document.visibilityState === "visible" && isAuthenticated() && cloudSyncState === "ok") {
      syncFromCloud(false);
    }
  }, 20000);
});
