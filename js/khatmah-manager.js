// Khatmah Manager - State, Locking, Firebase Realtime Sync
import { KHATMAH_PAIRS, prefetchPairJuz } from './quran-data.js';
import { IS_FIREBASE_ENABLED, FIREBASE_CONFIG } from './firebase-config.js';

const LOCAL_STORAGE_KEY = 'sad2a_khatmah_state_v2';
const USER_INFO_KEY     = 'sad2a_user_info_v1';
const DEVICE_ID_KEY     = 'sad2a_device_id';

// ─── Device ID ─────────────────────────────────────────────
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getSavedUserName() { return localStorage.getItem(USER_INFO_KEY) || ''; }
export function setSavedUserName(name) { localStorage.setItem(USER_INFO_KEY, name.trim()); }

// ─── Initial State ──────────────────────────────────────────
function buildInitialState() {
  const state = {};
  KHATMAH_PAIRS.forEach(p => {
    state[p.pairId] = {
      pairId: p.pairId,
      status: 'available',   // 'available' | 'reserved' | 'completed'
      readerName: '',
      deviceToken: '',
      reservedAt: null,
      completedAt: null
    };
  });
  return state;
}

// ─── Manager Class ──────────────────────────────────────────
class KhatmahManager {
  constructor() {
    this._listeners = [];
    this.state = this._loadLocal();
    this._initSync();
  }

  // ── Local Storage ─────────────────────────────────────────
  _loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return buildInitialState();
      const parsed = JSON.parse(raw);
      const initial = buildInitialState();
      // Merge: only accept valid (non-null object) values from parsed
      const merged = { ...initial };
      Object.keys(initial).forEach(key => {
        if (parsed[key] && typeof parsed[key] === 'object') {
          merged[key] = { ...initial[key], ...parsed[key] };
        }
      });
      return merged;
    } catch {
      return buildInitialState();
    }
  }

  _saveLocal() {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state)); } catch {}
    this._notify();
  }

  // ── Subscriptions ─────────────────────────────────────────
  subscribe(cb) { this._listeners.push(cb); cb(this.state); }
  _notify()     { this._listeners.forEach(cb => cb(this.state)); }

  // ── Firebase Sync ─────────────────────────────────────────
  _initSync() {
    // Cross-tab sync via StorageEvent
    window.addEventListener('storage', e => {
      if (e.key === LOCAL_STORAGE_KEY) {
        this.state = this._loadLocal();
        this._notify();
      }
    });

    // Firebase Realtime Database listener
    if (IS_FIREBASE_ENABLED) {
      this._initFirebase();
    }
  }

  _initFirebase() {
    // Firebase compat SDK is loaded via <script> tag in index.html
    const tryInit = () => {
      if (!window.firebase) return;
      try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        const dbRef = firebase.database().ref('khatmah_v2');
        dbRef.on('value', snap => {
          const remote = snap.val();
          if (!remote) return;
          // Merge remote into local (remote wins for reservation status)
          this.state = { ...buildInitialState(), ...remote };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
          this._notify();
        });
        this._dbRef = dbRef;
      } catch (err) {
        console.warn('[Firebase] init error:', err);
      }
    };

    // Firebase script may still be loading
    if (window.firebase) {
      tryInit();
    } else {
      window.addEventListener('load', tryInit);
    }
  }

  _pushToFirebase() {
    if (!IS_FIREBASE_ENABLED || !this._dbRef) return;
    try { this._dbRef.set(this.state); } catch (err) { console.warn('[Firebase] push error:', err); }
  }

  // ── Actions ───────────────────────────────────────────────

  /** Reserve a pair for this device/reader */
  reservePair(pairId, readerName) {
    pairId = Number(pairId);
    const cur = this.state[pairId];
    if (!cur) return { success: false, message: 'الورد ده مش موجود!' };

    const myId = getDeviceId();

    if (cur.status !== 'available' && cur.deviceToken !== myId) {
      return {
        success: false,
        message: `الورد ده محجوز بالفعل لـ "${cur.readerName}" 🔒\nاختار ورد تاني ربنا يكرمك يا غالي.`
      };
    }

    setSavedUserName(readerName);
    this.state[pairId] = {
      ...cur,
      status:      'reserved',
      readerName:  readerName.trim(),
      deviceToken: myId,
      reservedAt:  new Date().toISOString()
    };

    this._saveLocal();
    this._pushToFirebase();

    // Start downloading the Quran text in the background immediately after reservation
    prefetchPairJuz(pairId);

    const pair = KHATMAH_PAIRS.find(p => p.pairId === pairId);
    return {
      success: true,
      message: `تم الحجز! ورد ${pair.label} محجوز باسمك يا "${readerName}" 🤍\nالجزء بيتحمل دلوقتي عشان تقدر تقراه بدون نت!`
    };
  }

  /** Mark pair as finished */
  completePair(pairId) {
    pairId = Number(pairId);
    const cur = this.state[pairId];
    if (!cur) return { success: false, message: 'الورد ده مش موجود!' };

    const myId = getDeviceId();
    if (cur.deviceToken && cur.deviceToken !== myId) {
      return { success: false, message: 'ما ينفعش تغير ورد حد تاني 🙏' };
    }

    this.state[pairId] = { ...cur, status: 'completed', completedAt: new Date().toISOString() };
    this._saveLocal();
    this._pushToFirebase();
    return { success: true, message: 'تقبل الله منك! 🌿 الله يرحم علاء ويجعله في ميزان حسناتك.' };
  }

  /** Cancel own reservation */
  releasePair(pairId) {
    pairId = Number(pairId);
    const cur = this.state[pairId];
    if (!cur) return { success: false, message: 'الورد ده مش موجود!' };

    const myId = getDeviceId();
    if (cur.deviceToken && cur.deviceToken !== myId) {
      return { success: false, message: 'ما ينفعش تلغي حجز حد تاني.' };
    }

    this.state[pairId] = { pairId, status: 'available', readerName: '', deviceToken: '', reservedAt: null, completedAt: null };
    this._saveLocal();
    this._pushToFirebase();
    return { success: true, message: 'تم إلغاء الحجز، الورد متاح دلوقتي للكل.' };
  }

  // ── Stats ─────────────────────────────────────────────────
  getStats() {
    const initial = buildInitialState();
    // Merge state with initial to guard against any null/missing entries
    const safeState = { ...initial };
    Object.keys(initial).forEach(key => {
      if (this.state[key] && typeof this.state[key] === 'object') {
        safeState[key] = this.state[key];
      }
    });
    const vals       = Object.values(safeState);
    const total      = KHATMAH_PAIRS.length;
    const available  = vals.filter(v => v && v.status === 'available').length;
    const reserved   = vals.filter(v => v && v.status === 'reserved').length;
    const completed  = vals.filter(v => v && v.status === 'completed').length;
    return { total, available, reserved, completed, percentage: Math.round((completed / total) * 100) };
  }
}

export const khatmahManager = new KhatmahManager();
