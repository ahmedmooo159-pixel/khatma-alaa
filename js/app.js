// Main Application Driver & UI Controller
import { KHATMAH_PAIRS, fetchAndCacheJuz, isJuzCached, getCachedJuz } from './quran-data.js';
import { khatmahManager, getDeviceId, getSavedUserName } from './khatmah-manager.js';
import { DUA_COLLECTION } from './dua-data.js';
import { initPWA } from './pwa-installer.js';

let activeFilter = 'all';
let currentReadingPairId = null;
let currentFontSize = 1.6;

document.addEventListener('DOMContentLoaded', () => {
  initPWA();
  initNavigationTabs();
  initMemorialPhotoHandler();
  initThemeToggle();
  renderDuaSection();
  initGallery();

  // Subscribe to Khatmah State Changes
  khatmahManager.subscribe((state) => {
    renderProgressStats();
    renderPairsGrid(state);
  });

  initReservationModal();
  initReaderModal();
  initFilterButtons();
});

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
      document.getElementById(targetId)?.classList.add('active');
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

  if (fill) fill.style.width = `${stats.percentage}%`;
  if (text) text.textContent = `تم قراءة ${stats.completed} من أصل 15 ورد (${stats.percentage}%)`;

  if (availablePill) availablePill.textContent = `متاح: ${stats.available}`;
  if (progressPill) progressPill.textContent = `شغالين فيه: ${stats.reserved}`;
  if (completedPill) completedPill.textContent = `خلص: ${stats.completed}`;
}

// Render 15 Pairs Grid
function renderPairsGrid(state) {
  const container = document.getElementById('juz-grid-container');
  if (!container) return;

  container.innerHTML = '';
  const myDeviceId = getDeviceId();

  KHATMAH_PAIRS.forEach(pair => {
    const pairState = state[pair.pairId] || { status: 'available' };
    const isMine = pairState.deviceToken === myDeviceId;

    // Apply Filter
    if (activeFilter === 'available' && pairState.status !== 'available') return;
    if (activeFilter === 'reserved' && pairState.status !== 'reserved') return;
    if (activeFilter === 'completed' && pairState.status !== 'completed') return;
    if (activeFilter === 'my' && !isMine) return;

    const card = document.createElement('div');
    card.className = `juz-card ${isMine ? 'my-juz' : ''}`;

    let statusBadgeHTML = '';
    let actionButtonsHTML = '';

    if (pairState.status === 'available') {
      statusBadgeHTML = `<span class="juz-status-badge available">🟢 متاح</span>`;
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
            📖 اقرأ
          </button>
          <button class="btn-card btn-reserve" onclick="markAsCompleted(${pair.pairId})">
            ✅ خلصته
          </button>
        `;
      } else {
        actionButtonsHTML = `
          <button class="btn-card btn-locked" disabled title="الورد ده محجوز">
            🔒 محجوز
          </button>
        `;
      }
    } else if (pairState.status === 'completed') {
      statusBadgeHTML = `<span class="juz-status-badge completed">💙 تم بحمد الله</span>`;
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
        ${pairState.readerName ? `<p class="juz-reader-name">👤 القارئ: <strong>${pairState.readerName}</strong> ${isMine ? '(أنت)' : ''}</p>` : ''}
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

  window.openReservationModal = (pairId) => {
    currentReadingPairId = pairId;
    const pair = KHATMAH_PAIRS.find(p => p.pairId === pairId);
    document.getElementById('modal-juz-title').textContent = `حجز ${pair.label}`;
    nameInput.value = getSavedUserName();
    modal.classList.add('active');
    nameInput.focus();
  };

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  form?.addEventListener('submit', (e) => {
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

  markDoneBtn?.addEventListener('click', () => {
    if (currentReadingPairId) window.markAsCompleted(currentReadingPairId);
  });

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));

  fontPlusBtn?.addEventListener('click', () => {
    if (currentFontSize < 2.5) {
      currentFontSize += 0.15;
      document.getElementById('quran-text-container').style.fontSize = `${currentFontSize}rem`;
    }
  });

  fontMinusBtn?.addEventListener('click', () => {
    if (currentFontSize > 1.1) {
      currentFontSize -= 0.15;
      document.getElementById('quran-text-container').style.fontSize = `${currentFontSize}rem`;
    }
  });
}

// Render Supplications (Duas)
function renderDuaSection() {
  const container = document.getElementById('dua-grid-container');
  if (!container) return;

  container.innerHTML = '';
  DUA_COLLECTION.forEach(dua => {
    let count = parseInt(localStorage.getItem(dua.counterKey) || '0', 10);

    const card = document.createElement('div');
    card.className = 'dua-card';
    card.innerHTML = `
      <div>
        <span class="dua-category">${dua.category}</span>
        <p class="dua-text">"${dua.text}"</p>
      </div>
      <div class="dua-actions">
        <button class="dua-counter-btn" onclick="incrementDuaCounter('${dua.counterKey}', this)">
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
  let count = parseInt(localStorage.getItem(counterKey) || '0', 10) + 1;
  localStorage.setItem(counterKey, count.toString());
  btnEl.querySelector('.count-val').textContent = count;
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

  changeBtn?.addEventListener('click', () => input?.click());
  input?.addEventListener('change', (e) => {
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

    document.getElementById('gallery-next')?.addEventListener('click', () => goToSlide(currentIndex + 1));
    document.getElementById('gallery-prev')?.addEventListener('click', () => goToSlide(currentIndex - 1));
    
    // Auto slide every 4s
    setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 4000);
}
