/**
 * OLIMPO TEAM AREGUÁ — FIREBASE CLOUD SERVICE (100% FREE SPARK TIER)
 * Connects Firebase Authentication + Cloud Firestore (v10 Modular SDK)
 * with automatic local-first persistence and real-time synchronization.
 */

(function() {
  const DEFAULT_FIREBASE_CONFIG = {
    // Paste your Firebase Spark (Free Tier) Web Config here or via the UI Cloud Setup box:
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  function getSavedFirebaseConfig() {
    try {
      const saved = localStorage.getItem('olimpo_firebase_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey && parsed.projectId) return parsed;
      }
    } catch (e) {
      console.warn('[Olimpo Firebase] Invalid saved config:', e);
    }
    if (window.OLIMPO_FIREBASE_CONFIG && window.OLIMPO_FIREBASE_CONFIG.apiKey && window.OLIMPO_FIREBASE_CONFIG.projectId) {
      return window.OLIMPO_FIREBASE_CONFIG;
    }
    if (DEFAULT_FIREBASE_CONFIG.apiKey && DEFAULT_FIREBASE_CONFIG.projectId) {
      return DEFAULT_FIREBASE_CONFIG;
    }
    return null;
  }

  const OlimpoFirebase = {
    isCloudConnected: false,
    app: null,
    auth: null,
    db: null,
    sdk: null,
    unsubscribeSnapshot: null,
    onMemberUpdateCallbacks: [],

    onMemberUpdate(cb) {
      if (typeof cb === 'function') {
        this.onMemberUpdateCallbacks.push(cb);
      }
    },

    notifyMemberUpdate(memberData) {
      this.onMemberUpdateCallbacks.forEach(cb => {
        try { cb(memberData); } catch (e) { console.error(e); }
      });
    },

    async init() {
      const config = getSavedFirebaseConfig();
      if (!config || !config.apiKey || !config.projectId) {
        this.isCloudConnected = false;
        this.updateStatusBadges();
        return false;
      }

      try {
        const [appMod, authMod, firestoreMod] = await Promise.all([
          import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
          import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
        ]);

        this.sdk = { ...appMod, ...authMod, ...firestoreMod };
        const existingApps = appMod.getApps();
        this.app = existingApps.length ? existingApps[0] : appMod.initializeApp(config);
        this.auth = authMod.getAuth(this.app);
        this.db = firestoreMod.getFirestore(this.app);
        this.isCloudConnected = true;
        this.updateStatusBadges();

        // Sync local members to Firestore on initial connection
        await this.syncAllLocalToCloud();
        return true;
      } catch (err) {
        console.warn('[Olimpo Firebase] Could not initialize cloud SDK, operating in local-first mode:', err);
        this.isCloudConnected = false;
        this.updateStatusBadges();
        return false;
      }
    },

    updateStatusBadges() {
      const badge = document.getElementById('firebaseStatusBadge');
      const dot = document.getElementById('firebaseStatusDot');
      const text = document.getElementById('firebaseStatusText');
      if (!badge) return;
      if (this.isCloudConnected) {
        badge.classList.add('cloud-connected');
        if (dot) dot.style.background = '#22c55e';
        if (text) text.setAttribute('data-cloud-state', 'connected');
      } else {
        badge.classList.remove('cloud-connected');
        if (dot) dot.style.background = '#38bdf8';
        if (text) text.setAttribute('data-cloud-state', 'hybrid');
      }
      if (typeof window.refreshFirebaseBadgeLang === 'function') {
        window.refreshFirebaseBadgeLang();
      }
    },

    parseAndSaveConfig(rawInput) {
      if (!rawInput || !rawInput.trim()) return { ok: false, error: 'Empty input' };
      let text = rawInput.trim();
      try {
        // Extract object literal if user pasted full JS snippet from Firebase Console
        const match = text.match(/\{[\s\S]*\}/);
        if (match) text = match[0];
        // Convert unquoted keys to valid JSON
        const jsonReady = text
          .replace(/\/\/.*$/gm, '')
          .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*\}/g, '}');
        const parsed = JSON.parse(jsonReady);
        if (!parsed.apiKey || !parsed.projectId) {
          return { ok: false, error: 'Missing apiKey or projectId' };
        }
        localStorage.setItem('olimpo_firebase_config_v1', JSON.stringify(parsed));
        return { ok: true, config: parsed };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async syncMemberToCloud(memberObj) {
      if (!this.isCloudConnected || !this.db || !this.sdk || !memberObj || !memberObj.code) return;
      try {
        const { doc, setDoc } = this.sdk;
        const memberRef = doc(this.db, 'members', memberObj.code);
        await setDoc(memberRef, {
          code: memberObj.code,
          name: memberObj.name || memberObj.code,
          email: memberObj.email || '',
          phone: memberObj.phone || '',
          pin: memberObj.pin || '',
          goal: memberObj.goal || 'mantenimiento',
          referredBy: memberObj.referredBy || '',
          clicks: Number(memberObj.clicks || 0),
          referrals: Array.isArray(memberObj.referrals) ? memberObj.referrals : [],
          orders: Array.isArray(memberObj.orders) ? memberObj.orders : [],
          paidOut: Number(memberObj.paidOut || 0),
          rewardMonth: memberObj.rewardMonth || new Date().toISOString().slice(0, 7),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('[Olimpo Firebase] syncMemberToCloud warning:', err);
      }
    },

    async registerEmailAuth(email, password) {
      if (!this.isCloudConnected || !this.auth || !this.sdk || !email || !password) return null;
      try {
        const { createUserWithEmailAndPassword } = this.sdk;
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        return cred.user;
      } catch (err) {
        console.warn('[Olimpo Firebase] registerEmailAuth note:', err.message);
        return null;
      }
    },

    async loginEmailAuth(email, password) {
      if (!this.isCloudConnected || !this.auth || !this.sdk || !email || !password) return null;
      try {
        const { signInWithEmailAndPassword } = this.sdk;
        const cred = await signInWithEmailAndPassword(this.auth, email, password);
        return cred.user;
      } catch (err) {
        console.warn('[Olimpo Firebase] loginEmailAuth note:', err.message);
        return null;
      }
    },

    async fetchMemberFromCloud(codeOrIdentifier) {
      if (!this.isCloudConnected || !this.db || !this.sdk || !codeOrIdentifier) return null;
      try {
        const { doc, getDoc, collection, query, where, getDocs } = this.sdk;
        const cleanCode = codeOrIdentifier.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (cleanCode) {
          const directSnap = await getDoc(doc(this.db, 'members', cleanCode));
          if (directSnap.exists()) return directSnap.data();
        }
        // Try by email if identifier contains @
        if (codeOrIdentifier.includes('@')) {
          const q = query(collection(this.db, 'members'), where('email', '==', codeOrIdentifier.toLowerCase().trim()));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            return qSnap.docs[0].data();
          }
        }
      } catch (err) {
        console.warn('[Olimpo Firebase] fetchMemberFromCloud warning:', err);
      }
      return null;
    },

    subscribeToMember(code) {
      if (this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
        this.unsubscribeSnapshot = null;
      }
      if (!this.isCloudConnected || !this.db || !this.sdk || !code) return;
      try {
        const { doc, onSnapshot } = this.sdk;
        const memberRef = doc(this.db, 'members', code);
        this.unsubscribeSnapshot = onSnapshot(memberRef, (snap) => {
          if (snap.exists()) {
            const cloudData = snap.data();
            this.notifyMemberUpdate(cloudData);
          }
        });
      } catch (err) {
        console.warn('[Olimpo Firebase] subscribeToMember warning:', err);
      }
    },

    async incrementReferralClick(refCode) {
      if (!this.isCloudConnected || !this.db || !this.sdk || !refCode) return;
      try {
        const { doc, setDoc, increment } = this.sdk;
        const memberRef = doc(this.db, 'members', refCode);
        await setDoc(memberRef, {
          code: refCode,
          clicks: increment(1),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('[Olimpo Firebase] incrementReferralClick warning:', err);
      }
    },

    async saveOrderToCloud(orderPayload) {
      if (!this.isCloudConnected || !this.db || !this.sdk || !orderPayload) return;
      try {
        const { collection, addDoc } = this.sdk;
        await addDoc(collection(this.db, 'orders'), {
          ...orderPayload,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[Olimpo Firebase] saveOrderToCloud warning:', err);
      }
    },

    async signInWithGoogle() {
      if (!this.isCloudConnected || !this.auth || !this.sdk) {
        return { ok: false, reason: 'not_configured' };
      }
      try {
        const { GoogleAuthProvider, signInWithPopup } = this.sdk;
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        const user = result.user;
        return {
          ok: true,
          user: {
            name: user.displayName || (user.email ? user.email.split('@')[0] : 'ATLETA'),
            email: user.email || '',
            phone: user.phoneNumber || '',
            uid: user.uid
          }
        };
      } catch (err) {
        return { ok: false, reason: err.message };
      }
    },

    async syncAllLocalToCloud() {
      if (!this.isCloudConnected) return;
      try {
        const raw = localStorage.getItem('olimpo_students_v1');
        if (!raw) return;
        const dbLocal = JSON.parse(raw);
        for (const code of Object.keys(dbLocal)) {
          await this.syncMemberToCloud(dbLocal[code]);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  window.OlimpoFirebase = OlimpoFirebase;
})();
