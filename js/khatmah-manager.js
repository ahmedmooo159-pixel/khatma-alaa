// Khatmah Manager Engine - Reservation, Locking & Sync Logic
import { KHATMAH_PAIRS } from './quran-data.js';
import { IS_FIREBASE_ENABLED, FIREBASE_CONFIG } from './firebase-config.js';

const LOCAL_STORAGE_KEY = 'sad2a_khatmah_state_pairs_v1';
const USER_INFO_KEY = 'sad2a_user_info_v1';

// Generate or retrieve persistent unique Device ID for user locking
export function getDeviceId() {
  let deviceId = localStorage.getItem('sad2a_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('sad2a_device_id', deviceId);
  }
  return deviceId;
}

// Get saved user name
export function getSavedUserName() {
  return localStorage.getItem(USER_INFO_KEY) || '';
}

// Save user name
export function setSavedUserName(name) {
  localStorage.setItem(USER_INFO_KEY, name.trim());
}

// Default initial state for all 15 Pairs
function buildInitialKhatmahState() {
  const state = {};
  KHATMAH_PAIRS.forEach(pair => {
    state[pair.pairId] = {
      pairId: pair.pairId,
      status: 'available', // 'available' | 'reserved' | 'completed'
      readerName: '',
      deviceToken: '',
      reservedAt: null,
      completedAt: null
    };
  });
  return state;
}

class KhatmahManager {
  constructor() {
    this.state = this.loadLocalState();
    this.listeners = [];
    this.initSync();
  }

  loadLocalState() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return buildInitialKhatmahState();
      const parsed = JSON.parse(raw);
      const initial = buildInitialKhatmahState();
      return { ...initial, ...parsed };
    } catch (e) {
      console.warn('Failed to load local state:', e);
      return buildInitialKhatmahState();
    }
  }

  saveLocalState() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
  }

  initSync() {
    // Cross-tab sync via storage event
    window.addEventListener('storage', (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        this.state = this.loadLocalState();
        this.notifyListeners();
      }
    });

    // If Firebase configured, setup Realtime Database listener dynamically
    if (IS_FIREBASE_ENABLED && window.firebase) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        const dbRef = firebase.database().ref('khatmah_pairs_state');
        dbRef.on('value', (snapshot) => {
          const remoteVal = snapshot.val();
          if (remoteVal) {
            this.state = remoteVal;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteVal));
            this.notifyListeners();
          }
        });
      } catch (err) {
        console.warn('Firebase sync initialization warning:', err);
      }
    }
  }

  // Reserve a Pair for a specific reader name
  reservePair(pairId, readerName) {
    const current = this.state[pairId];
    if (!current) return { success: false, message: 'الورد ده مش موجود' };

    const myDeviceId = getDeviceId();

    // Check if already reserved by someone else
    if (current.status !== 'available' && current.deviceToken !== myDeviceId) {
      return { 
        success: false, 
        message: `الورد ده محجوز لـ (${current.readerName}). اختار ورد تاني ربنا يكرمك.` 
      };
    }

    setSavedUserName(readerName);

    this.state[pairId] = {
      ...current,
      status: 'reserved',
      readerName: readerName.trim(),
      deviceToken: myDeviceId,
      reservedAt: new Date().toISOString()
    };

    this.saveLocalState();
    this.syncToRemote();
    return { success: true, message: `تم حجز ${KHATMAH_PAIRS.find(p=>p.pairId===pairId).label} باسمك يا (${readerName}). ربنا يتقبل.` };
  }

  // Mark Pair as completed
  completePair(pairId) {
    const current = this.state[pairId];
    const myDeviceId = getDeviceId();

    if (!current) return { success: false, message: 'الورد ده مش موجود' };
    
    if (current.deviceToken && current.deviceToken !== myDeviceId) {
      return { success: false, message: 'ما ينفعش تغير حالة ورد بتاع حد تاني' };
    }

    this.state[pairId] = {
      ...current,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    this.saveLocalState();
    this.syncToRemote();
    return { success: true, message: `تقبل الله طاعتكم! تم تسجيل القراءة بنجاح.` };
  }

  // Release/Cancel reservation
  releasePair(pairId) {
    const current = this.state[pairId];
    const myDeviceId = getDeviceId();

    if (!current) return { success: false, message: 'الورد ده مش موجود' };

    if (current.deviceToken && current.deviceToken !== myDeviceId) {
      return { success: false, message: 'ما ينفعش تلغي حجز حد تاني' };
    }

    this.state[pairId] = {
      pairId: pairId,
      status: 'available',
      readerName: '',
      deviceToken: '',
      reservedAt: null,
      completedAt: null
    };

    this.saveLocalState();
    this.syncToRemote();
    return { success: true, message: 'تم إلغاء الحجز.' };
  }

  syncToRemote() {
    if (IS_FIREBASE_ENABLED && window.firebase) {
      try {
        firebase.database().ref('khatmah_pairs_state').set(this.state);
      } catch (err) {
        console.warn('Remote sync failed:', err);
      }
    }
  }

  getStats() {
    const values = Object.values(this.state);
    const total = 15;
    const available = values.filter(v => v.status === 'available').length;
    const reserved = values.filter(v => v.status === 'reserved').length;
    const completed = values.filter(v => v.status === 'completed').length;
    const percentage = Math.round((completed / total) * 100);

    return { total, available, reserved, completed, percentage };
  }
}

export const khatmahManager = new KhatmahManager();
