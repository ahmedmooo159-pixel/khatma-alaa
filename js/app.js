import { KHATMAH_PAIRS, QURAN_JUZ_LIST, QURAN_SURAH_LIST, fetchAndCacheSurah, getCachedSurah, fetchAndCacheJuz, isJuzCached, getCachedJuz, pairCacheStatus } from './quran-data.js';
import { khatmahManager, getDeviceId, getSavedUserName } from './khatmah-manager.js';
import { DUA_COLLECTION } from './dua-data.js';
import { initPWA, isPWAInstalled, promptInstall, deferredPrompt } from './pwa-installer.js';
import { IS_FIREBASE_ENABLED, FIREBASE_CONFIG } from './firebase-config.js';

let activeFilter = 'all';
let currentReadingPairId = null;
let currentFontSize = 1.6;

let remoteDuaCounts = {};
let duaDbRef = null;

function initDuaSync() {
  if (!IS_FIREBASE_ENABLED) return;
  const tryInit = () => {
    if (!window.firebase) return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      duaDbRef = firebase.database().ref('duas_v2');
      duaDbRef.on('value', snap => {
        const remote = snap.val() || {};
        remoteDuaCounts = remote;
        DUA_COLLECTION.forEach(dua => {
          const btn = document.querySelector(`[data-dua-id="${dua.counterKey}"]`);
          if (btn) {
            const local = parseInt(localStorage.getItem(dua.counterKey) || '0', 10);
            const total = Math.max(local, remote[dua.counterKey] || 0);
            btn.querySelector('.count-val').textContent = total;
          }
        });
      });
    } catch (err) {
      console.warn('[Firebase Duas] init error:', err);
    }
  };
  if (window.firebase) tryInit();
  else window.addEventListener('load', tryInit);
}

document.addEventListener('DOMContentLoaded', () => {
  initDuaSync();
  initPWA();
  initNavigationTabs();
  initMemorialPhotoHandler();
  initThemeToggle();
  initNetworkBadges();
  renderDuaSection();
  initGallery();

  khatmahManager.subscribe((state) => {
    renderProgressStats();
    renderPairsGrid(state);
  });

  initReservationModal();
  initReaderModal();
  initFilterButtons();
  initRestartKhatmahButton();
  renderFullQuranSection();
});

// Network status badges
function initNetworkBadges() {
  const offlineBadge = document.getElementById('offline-badge');
  const onlineBadge  = document.getElementById('online-badge');

  function update() {
    if (navigator.onLine) {
      offlineBadge.style.display = 'none';
      onlineBadge.style.display  = 'inline-flex';
    } else {
      offlineBadge.style.display = 'inline-flex';
      onlineBadge.style.display  = 'none';
    }
  }
  update();
  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
}


// Toast notification helper
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${type === 'success' ? '✨' : '⚠️'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navigation Tabs Handling
function initNavigationTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.add('active');
      }
    });
  });
}

// Progress Banner Renderer
function renderProgressStats() {
  const stats = khatmahManager.getStats();

  const fill = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  const availablePill = document.getElementById('stat-available');
  const progressPill = document.getElementById('stat-progress');
  const completedPill = document.getElementById('stat-completed');
  
  const cycleBadge = document.getElementById('khatmah-cycle-badge');
  const cycleCountText = document.getElementById('khatmah-cycle-count');
  const restartContainer = document.getElementById('restart-khatmah-container');

  if (fill) fill.style.width = `${stats.percentage}%`;
  if (text) text.textContent = `تم قراءة ${stats.completed} من أصل 17 ورد (${stats.percentage}%)`;

  if (availablePill) availablePill.textContent = `متاح: ${stats.available}`;
  if (progressPill) progressPill.textContent = `شغالين فيه: ${stats.reserved}`;
  if (completedPill) completedPill.textContent = `خلص: ${stats.completed}`;

  if (cycleBadge && stats.cycleCount > 0) {
    cycleBadge.style.display = 'block';
    if (cycleCountText) cycleCountText.textContent = stats.cycleCount;
  }

  if (restartContainer) {
    if (stats.completed === stats.total) {
      restartContainer.style.display = 'block';
    } else {
      restartContainer.style.display = 'none';
    }
  }
}

function initRestartKhatmahButton() {
  const btn = document.getElementById('restart-khatmah-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const confirmRestart = confirm('هل أنت متأكد إنك عايز تصفر الختمة وتبدأ ختمة جديدة؟');
      if (confirmRestart) {
        const res = khatmahManager.restartKhatmah();
        if (res.success) {
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'error');
        }
      }
    });
  }
}

// Render 17 Pairs Grid
function renderPairsGrid(state) {
  const container = document.getElementById('juz-grid-container');
  if (!container) return;

  container.innerHTML = '';
  const myDeviceId   = getDeviceId();
  const savedName    = getSavedUserName().trim().toLowerCase();

  KHATMAH_PAIRS.forEach(pair => {
    const pairState = state[pair.pairId] || { status: 'available' };

    // Primary ownership: same deviceToken
    const isMineByToken = pairState.deviceToken === myDeviceId;

    // iOS PWA fallback: different localStorage context but same name
    // Only apply when status is reserved (not completed) and name matches
    const isMineByName = !isMineByToken
      && pairState.status === 'reserved'
      && savedName
      && pairState.readerName
      && pairState.readerName.trim().toLowerCase() === savedName;

    const isMine = isMineByToken || isMineByName;

    // If iOS context mismatch detected → silently re-claim the deviceToken
    if (isMineByName && !isMineByToken) {
      khatmahManager.reclaimPair(pair.pairId, myDeviceId);
    }

    const cacheInfo      = pairCacheStatus(pair.pairId);
    const isFullyCached  = cacheInfo.cached === cacheInfo.total;

    // Apply Filter
    if (activeFilter === 'available' && pairState.status !== 'available') return;
    if (activeFilter === 'reserved'  && pairState.status !== 'reserved')  return;
    if (activeFilter === 'completed' && pairState.status !== 'completed') return;
    if (activeFilter === 'my'        && !isMine)                           return;

    const card = document.createElement('div');
    card.className = `juz-card ${isMine ? 'my-juz' : ''}`;

    let statusBadgeHTML  = '';
    let actionButtonsHTML = '';

    // Offline download indicator (only shown on owner's card)
    const offlineBadge = isMine
      ? `<span style="font-size:0.7rem;color:${isFullyCached ? '#10b981' : '#f59e0b'}">
           ${isFullyCached ? '📥 محفوظ أوفلاين' : '⏳ بيتحمل...'}
         </span>`
      : '';

    if (pairState.status === 'available') {
      statusBadgeHTML   = `<span class="juz-status-badge available">🟢 متاح</span>`;
      actionButtonsHTML = `
        <button class="btn-card btn-reserve" onclick="openReservationModal(${pair.pairId})">
          ✨ احجز الورد ده
        </button>
      `;
    } else if (pairState.status === 'reserved') {
      statusBadgeHTML = `<span class="juz-status-badge reserved">📖 شغالين فيه</span>`;
      if (isMine) {
        actionButtonsHTML = `
          <button class="btn-card btn-read" onclick="openReaderModal(${pair.pairId})">
            📖 اقرأ وردك
          </button>
          <button class="btn-card btn-reserve" onclick="markAsCompleted(${pair.pairId})">
            ✅ خلصته
          </button>
        `;
      } else {
        actionButtonsHTML = `
          <button class="btn-card btn-locked" disabled>
            🔒 محجوز
          </button>
        `;
      }
    } else if (pairState.status === 'completed') {
      statusBadgeHTML   = `<span class="juz-status-badge completed">💙 تم بحمد الله</span>`;
      actionButtonsHTML = `
        <button class="btn-card btn-read" onclick="openReaderModal(${pair.pairId})">
          📖 اقرأ تاني
        </button>
      `;
    }

    card.innerHTML = `
      <div class="juz-header">
        <div class="juz-badge-number">${pair.pairId}</div>
        ${statusBadgeHTML}
      </div>
      <div class="juz-info">
        <h3 class="juz-title">${pair.label}</h3>
        ${pairState.readerName ? `<p class="juz-reader-name">👤 ${pairState.readerName} ${isMine ? '<strong>(أنت)</strong>' : ''}</p>` : ''}
        ${offlineBadge}
      </div>
      <div class="juz-actions">
        ${actionButtonsHTML}
      </div>
    `;

    container.appendChild(card);
  });
}


// Filter Controls Setup
function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderPairsGrid(khatmahManager.state);
    });
  });
}

// Reservation Modal Logic
function initReservationModal() {
  const modal = document.getElementById('reservation-modal');
  const form = document.getElementById('reservation-form');
  const closeBtn = document.getElementById('close-reserve-modal');
  const nameInput = document.getElementById('reader-name-input');

// --- Modals ---
window.openReservationModal = (pairId) => {
  // Enforce PWA Installation first!
  if (!isPWAInstalled()) {
    openInstallModal();
    return;
  }

  currentReadingPairId = pairId;
  const pair = KHATMAH_PAIRS.find(p => p.pairId === pairId);
  if (!pair) return;

  document.getElementById('modal-juz-title').textContent = `حجز ${pair.label}`;
  
  // Suggest previously saved name
  const savedName = getSavedUserName();
  if (savedName) {
    document.getElementById('reader-name-input').value = savedName;
  }

  document.getElementById('reservation-modal').classList.add('active');
};

// Install Required Modal logic
window.openInstallModal = () => {
  const modal = document.getElementById('install-required-modal');
  const btn = document.getElementById('modal-install-btn');
  if (deferredPrompt && btn) {
    btn.style.display = 'block';
  } else if (btn) {
    btn.style.display = 'none';
  }
  if (modal) modal.classList.add('active');
};

window.closeInstallModal = () => {
  const modal = document.getElementById('install-required-modal');
  if (modal) modal.classList.remove('active');
};

window.triggerAppInstall = () => {
  promptInstall();
  closeInstallModal();
};
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value;
      if (!name.trim()) return;

      const res = khatmahManager.reservePair(currentReadingPairId, name);
      if (res.success) {
        showToast(res.message, 'success');
        modal.classList.remove('active');
        // Pre-fetch the Juz text in the background after reservation
        const pair = KHATMAH_PAIRS.find(p => p.pairId === currentReadingPairId);
        if(pair) {
           pair.juzIds.forEach(id => fetchAndCacheJuz(id));
        }
      } else {
        showToast(res.message, 'error');
      }
    });
  }
}

// Reader View Modal Logic
async function renderJuzText(juzId, container) {
  let juzData = getCachedJuz(juzId);
  if (!juzData) {
     container.innerHTML += `<div class="bismillah-header" id="loading-${juzId}">جاري تحميل الجزء من النت...</div>`;
     juzData = await fetchAndCacheJuz(juzId);
     const loadingEl = document.getElementById(`loading-${juzId}`);
     if(loadingEl) loadingEl.remove();
  }

  if (juzData && juzData.surahs) {
    let html = `<div class="bismillah-header">الجزء ${juzId}</div>`;
    juzData.surahs.forEach(surah => {
      html += `<div class="surah-header-banner">✨ سورة ${surah.name} ✨</div>`;
      html += `<p style="margin-bottom: 1.5rem;">`;
      // Bismillah
      if (surah.number !== 1 && surah.number !== 9) {
          html += `<div style="text-align:center; font-size:1.4rem; margin-bottom:1rem; color: var(--primary-gold);">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
      }
      surah.verses.forEach(v => {
        // Remove Bismillah from start of ayah text if it's there (except Fatiha)
        let text = v.text;
        if(surah.number !== 1 && v.number === 1 && text.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ")) {
            text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ", "");
        }
        html += `<span>${text}</span> <span class="ayah-number">${v.number}</span> `;
      });
      html += `</p>`;
    });
    container.innerHTML += html;
  } else {
    container.innerHTML += `<div class="bismillah-header">حصلت مشكلة في تحميل الجزء ده. اتأكد من النت وجرب تاني.</div>`;
  }
}

function initReaderModal() {
  const modal = document.getElementById('reader-modal');
  const closeBtn = document.getElementById('close-reader-btn');
  const fontPlusBtn = document.getElementById('font-plus-btn');
  const fontMinusBtn = document.getElementById('font-minus-btn');
  const markDoneBtn = document.getElementById('reader-mark-done-btn');

  window.openReaderModal = async (pairId) => {
    currentReadingPairId = pairId;
    const pair = KHATMAH_PAIRS.find(p => p.pairId === pairId);
    
    document.getElementById('reader-juz-title').textContent = pair.label;
    const bodyContainer = document.getElementById('quran-text-container');
    bodyContainer.style.fontSize = `${currentFontSize}rem`;
    bodyContainer.innerHTML = ''; // Clear previous

    modal.classList.add('active');

    // Fetch and render both parts
    for (const juzId of pair.juzIds) {
        await renderJuzText(juzId, bodyContainer);
    }

    // Update Mark Done Button State
    const pairState = khatmahManager.state[pairId];
    if (pairState && pairState.deviceToken === getDeviceId() && pairState.status === 'reserved') {
      markDoneBtn.style.display = 'inline-flex';
    } else {
      markDoneBtn.style.display = 'none';
    }
  };

  window.markAsCompleted = (pairId) => {
    const res = khatmahManager.completePair(pairId);
    if (res.success) {
      showToast(res.message, 'success');
      modal.classList.remove('active');
    } else {
      showToast(res.message, 'error');
    }
  };

  if (markDoneBtn) {
    markDoneBtn.addEventListener('click', () => {
      if (currentReadingPairId) window.markAsCompleted(currentReadingPairId);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (fontPlusBtn) {
    fontPlusBtn.addEventListener('click', () => {
      if (currentFontSize < 2.5) {
        currentFontSize += 0.15;
        document.getElementById('quran-text-container').style.fontSize = `${currentFontSize}rem`;
      }
    });
  }

  if (fontMinusBtn) {
    fontMinusBtn.addEventListener('click', () => {
      if (currentFontSize > 1.1) {
        currentFontSize -= 0.15;
        document.getElementById('quran-text-container').style.fontSize = `${currentFontSize}rem`;
      }
    });
  }
}

// Render Supplications (Duas)
function renderDuaSection() {
  const container = document.getElementById('dua-grid-container');
  if (!container) return;

  container.innerHTML = '';
  DUA_COLLECTION.forEach(dua => {
    let localCount = parseInt(localStorage.getItem(dua.counterKey) || '0', 10);
    let count = Math.max(localCount, remoteDuaCounts[dua.counterKey] || 0);

    const card = document.createElement('div');
    card.className = 'dua-card';
    card.innerHTML = `
      <div>
        <span class="dua-category">${dua.category}</span>
        <p class="dua-text">"${dua.text}"</p>
      </div>
      <div class="dua-actions">
        <button class="dua-counter-btn" data-dua-id="${dua.counterKey}" onclick="incrementDuaCounter('${dua.counterKey}', this)">
          🤲 أَمِّنْ على الدعاء (<span class="count-val">${count}</span>)
        </button>
        <button class="dua-share-btn" onclick="shareDuaText('${dua.text}')">
          📲 شير
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.incrementDuaCounter = (counterKey, btnEl) => {
  let localCount = parseInt(localStorage.getItem(counterKey) || '0', 10) + 1;
  localStorage.setItem(counterKey, localCount.toString());
  
  const total = Math.max(localCount, (remoteDuaCounts[counterKey] || 0) + 1);
  btnEl.querySelector('.count-val').textContent = total;
  
  if (duaDbRef) {
    duaDbRef.child(counterKey).transaction((currentVal) => {
      return Math.max(currentVal || 0, localCount - 1) + 1;
    });
  }

  showToast('آمين يا رب العالمين.. ربنا يتقبل منك!', 'success');
};

window.shareDuaText = (text) => {
  const fullText = `دعاء للمغفور له بإذن الله علاء عبد العزيز:\n${text}\n\nشاركونا الختمة والصدقة الجارية على الرابط ده: ${window.location.href}`;
  if (navigator.share) {
    navigator.share({ title: 'صدقة جارية علاء عبد العزيز', text: fullText });
  } else {
    navigator.clipboard.writeText(fullText);
    showToast('تم نسخ الدعاء والرابط عشان تبعته لحبايبك!', 'success');
  }
};

// Memorial Photo Uploader Handler
function initMemorialPhotoHandler() {
  const changeBtn = document.getElementById('change-photo-btn');
  const input = document.getElementById('photo-file-input');
  
  // Find all portrait images across the site
  const imgs = document.querySelectorAll('.portrait-img');

  // Load custom saved image if exists
  const savedImg = localStorage.getItem('sad2a_custom_photo');
  if (savedImg && imgs.length > 0) {
    imgs.forEach(img => img.src = savedImg);
  }

  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      if (input) input.click();
    });
  }
  if (input) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          imgs.forEach(img => img.src = base64);
          localStorage.setItem('sad2a_custom_photo', base64);
          showToast('تم تغيير الصورة بنجاح!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Theme Switcher (Dark / Light)
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const currentTheme = localStorage.getItem('sad2a_theme') || 'dark';

  document.documentElement.setAttribute('data-theme', currentTheme);
  if (toggleBtn) {
    toggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    toggleBtn.addEventListener('click', () => {
      const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('sad2a_theme', nextTheme);
      toggleBtn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
    });
  }
}

// Photo Gallery slideshow logic
function initGallery() {
    const slides = document.querySelectorAll('.gallery-slide');
    const dotsContainer = document.getElementById('gallery-dots');
    if(!slides.length || !dotsContainer) return;

    let currentIndex = 0;
    
    // Create dots
    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `gallery-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.gallery-dot');

    function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = index;
        if(currentIndex < 0) currentIndex = slides.length - 1;
        if(currentIndex >= slides.length) currentIndex = 0;
        
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }

    const nextBtn = document.getElementById('gallery-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }
    const prevBtn = document.getElementById('gallery-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }
    
    // Auto slide every 4s
    setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 4000);
}

// ── Full Quran (Surahs / Juzs) ──
async function renderSurahText(surahId, container) {
  let surahData = getCachedSurah(surahId);
  if (!surahData) {
     container.innerHTML += `<div class="bismillah-header" id="loading-s-${surahId}">جاري تحميل السورة من النت...</div>`;
     surahData = await fetchAndCacheSurah(surahId);
     const loadingEl = document.getElementById(`loading-s-${surahId}`);
     if(loadingEl) loadingEl.remove();
  }

  if (surahData && surahData.surahs) {
    let html = '';
    surahData.surahs.forEach(surah => {
      html += `<div class="surah-header-banner">✨ سورة ${surah.name} ✨</div>`;
      html += `<p style="margin-bottom: 1.5rem;">`;
      if (surah.number !== 1 && surah.number !== 9) {
          html += `<div style="text-align:center; font-size:1.4rem; margin-bottom:1rem; color: var(--primary-gold);">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
      }
      surah.verses.forEach(v => {
        let text = v.text;
        if(surah.number !== 1 && v.number === 1 && text.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ")) {
            text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ", "");
        }
        html += `<span>${text}</span> <span class="ayah-number">${v.number}</span> `;
      });
      html += `</p>`;
    });
    container.innerHTML += html;
  } else {
    container.innerHTML += `<div class="bismillah-header">حصلت مشكلة في تحميل السورة دي. اتأكد من النت وجرب تاني.</div>`;
  }
}

window.openFreeReaderModal = async (type, id, title) => {
  const modal = document.getElementById('reader-modal');
  const markDoneBtn = document.getElementById('reader-mark-done-btn');
  const bodyContainer = document.getElementById('quran-text-container');
  
  document.getElementById('reader-juz-title').textContent = title;
  bodyContainer.style.fontSize = `${currentFontSize}rem`;
  bodyContainer.innerHTML = ''; 

  if (markDoneBtn) markDoneBtn.style.display = 'none'; 
  modal.classList.add('active');

  if (type === 'juz') {
    await renderJuzText(id, bodyContainer);
  } else {
    await renderSurahText(id, bodyContainer);
  }
};

function renderFullQuranSection() {
  const container = document.getElementById('fullquran-grid-container');
  if (!container) return;

  const btnSurahs = document.getElementById('btn-show-surahs');
  const btnJuzs = document.getElementById('btn-show-juzs');
  let currentView = 'surahs';

  function renderGrid() {
    container.innerHTML = '';
    if (currentView === 'surahs') {
      QURAN_SURAH_LIST.forEach(surah => {
        const card = document.createElement('div');
        card.className = 'juz-card';
        card.innerHTML = `
          <div class="juz-header">
            <div class="juz-badge-number">${surah.id}</div>
          </div>
          <div class="juz-info">
            <h3 class="juz-title">${surah.name}</h3>
          </div>
          <div class="juz-actions">
            <button class="btn-card btn-read" onclick="openFreeReaderModal('surah', ${surah.id}, '${surah.name}')">📖 اقرأ</button>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      QURAN_JUZ_LIST.forEach(juz => {
        const card = document.createElement('div');
        card.className = 'juz-card';
        card.innerHTML = `
          <div class="juz-header">
            <div class="juz-badge-number">${juz.id}</div>
          </div>
          <div class="juz-info">
            <h3 class="juz-title">${juz.name}</h3>
            <p class="juz-reader-name" style="font-size: 0.8rem; margin-top:0.25rem;">من: ${juz.startSurah} | إلى: ${juz.endSurah}</p>
          </div>
          <div class="juz-actions">
            <button class="btn-card btn-read" onclick="openFreeReaderModal('juz', ${juz.id}, '${juz.name}')">📖 اقرأ</button>
          </div>
        `;
        container.appendChild(card);
      });
    }
  }

  if (btnSurahs) {
    btnSurahs.addEventListener('click', () => {
      currentView = 'surahs';
      btnSurahs.classList.add('active');
      if (btnJuzs) btnJuzs.classList.remove('active');
      renderGrid();
    });
  }
  if (btnJuzs) {
    btnJuzs.addEventListener('click', () => {
      currentView = 'juzs';
      btnJuzs.classList.add('active');
      if (btnSurahs) btnSurahs.classList.remove('active');
      renderGrid();
    });
  }

  renderGrid();
}
