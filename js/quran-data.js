// Quran 30 Juz - Distributed across 17 people
// 13 people get 2 juz each (1-26), 4 people get 1 juz each (27-30)

export const QURAN_JUZ_LIST = [
  { id: 1,  name: "الجزء الأول",           startSurah: "الفاتحة",      endSurah: "البقرة 141" },
  { id: 2,  name: "الجزء التاني",           startSurah: "البقرة 142",   endSurah: "البقرة 252" },
  { id: 3,  name: "الجزء التالت",           startSurah: "البقرة 253",   endSurah: "آل عمران 92" },
  { id: 4,  name: "الجزء الرابع",           startSurah: "آل عمران 93",  endSurah: "النساء 23" },
  { id: 5,  name: "الجزء الخامس",           startSurah: "النساء 24",    endSurah: "النساء 147" },
  { id: 6,  name: "الجزء السادس",           startSurah: "النساء 148",   endSurah: "المائدة 81" },
  { id: 7,  name: "الجزء السابع",           startSurah: "المائدة 82",   endSurah: "الأنعام 110" },
  { id: 8,  name: "الجزء التامن",           startSurah: "الأنعام 111",  endSurah: "الأعراف 87" },
  { id: 9,  name: "الجزء التاسع",           startSurah: "الأعراف 88",   endSurah: "الأنفال 40" },
  { id: 10, name: "الجزء العاشر",           startSurah: "الأنفال 41",   endSurah: "التوبة 92" },
  { id: 11, name: "الجزء الحداشر",          startSurah: "التوبة 93",    endSurah: "هود 5" },
  { id: 12, name: "الجزء الاتناشر",         startSurah: "هود 6",        endSurah: "يوسف 52" },
  { id: 13, name: "الجزء التلتاشر",         startSurah: "يوسف 53",      endSurah: "إبراهيم 52" },
  { id: 14, name: "الجزء الاربعتاشر",       startSurah: "الحجر 1",      endSurah: "النحل 128" },
  { id: 15, name: "الجزء الخمستاشر",        startSurah: "الإسراء 1",    endSurah: "الكهف 74" },
  { id: 16, name: "الجزء الستاشر",          startSurah: "الكهف 75",     endSurah: "طه 135" },
  { id: 17, name: "الجزء السبعتاشر",        startSurah: "الأنبياء 1",   endSurah: "الحج 78" },
  { id: 18, name: "الجزء التمنتاشر",        startSurah: "المؤمنون 1",   endSurah: "الفرقان 20" },
  { id: 19, name: "الجزء التسعتاشر",        startSurah: "الفرقان 21",   endSurah: "النمل 55" },
  { id: 20, name: "الجزء العشرين",          startSurah: "النمل 56",     endSurah: "العنكبوت 45" },
  { id: 21, name: "الجزء الواحد وعشرين",   startSurah: "العنكبوت 46",  endSurah: "الأحزاب 30" },
  { id: 22, name: "الجزء الاتنين وعشرين",  startSurah: "الأحزاب 31",   endSurah: "يس 27" },
  { id: 23, name: "الجزء التلاتة وعشرين",  startSurah: "يس 28",        endSurah: "الزمر 31" },
  { id: 24, name: "الجزء الاربعة وعشرين",  startSurah: "الزمر 32",     endSurah: "فصلت 46" },
  { id: 25, name: "الجزء الخمسة وعشرين",   startSurah: "فصلت 47",      endSurah: "الجاثية 37" },
  { id: 26, name: "الجزء الستة وعشرين",    startSurah: "الأحقاف 1",    endSurah: "ق 45" },
  { id: 27, name: "الجزء السبعة وعشرين",   startSurah: "الذاريات 1",   endSurah: "الحديد 29" },
  { id: 28, name: "الجزء التمانية وعشرين", startSurah: "المجادلة 1",   endSurah: "التحريم 12" },
  { id: 29, name: "الجزء التسعة وعشرين",   startSurah: "الملك 1",      endSurah: "المرسلات 50" },
  { id: 30, name: "جزء عمّ",               startSurah: "النبأ 1",      endSurah: "الناس 6" }
];

// 17 slots:
// Slots 1-13 → 2 juz each  (جزئين لكل واحد)
// Slots 14-17 → 1 juz each  (جزء لكل واحد)
export const KHATMAH_PAIRS = [
  { pairId: 1,  juzIds: [1,  2],  label: "الجزء ١ و ٢" },
  { pairId: 2,  juzIds: [3,  4],  label: "الجزء ٣ و ٤" },
  { pairId: 3,  juzIds: [5,  6],  label: "الجزء ٥ و ٦" },
  { pairId: 4,  juzIds: [7,  8],  label: "الجزء ٧ و ٨" },
  { pairId: 5,  juzIds: [9,  10], label: "الجزء ٩ و ١٠" },
  { pairId: 6,  juzIds: [11, 12], label: "الجزء ١١ و ١٢" },
  { pairId: 7,  juzIds: [13, 14], label: "الجزء ١٣ و ١٤" },
  { pairId: 8,  juzIds: [15, 16], label: "الجزء ١٥ و ١٦" },
  { pairId: 9,  juzIds: [17, 18], label: "الجزء ١٧ و ١٨" },
  { pairId: 10, juzIds: [19, 20], label: "الجزء ١٩ و ٢٠" },
  { pairId: 11, juzIds: [21, 22], label: "الجزء ٢١ و ٢٢" },
  { pairId: 12, juzIds: [23, 24], label: "الجزء ٢٣ و ٢٤" },
  { pairId: 13, juzIds: [25, 26], label: "الجزء ٢٥ و ٢٦" },
  { pairId: 14, juzIds: [27],     label: "الجزء ٢٧" },
  { pairId: 15, juzIds: [28],     label: "الجزء ٢٨" },
  { pairId: 16, juzIds: [29],     label: "الجزء ٢٩" },
  { pairId: 17, juzIds: [30],     label: "جزء عمّ (٣٠)" }
];

// ─────────────────────────────────────────────────────────────
// Quran API + Offline Cache Logic
// API: alquran.cloud  |  Storage: localStorage
// ─────────────────────────────────────────────────────────────
const QURAN_CACHE_PREFIX = 'sad2a_quran_juz_v2_';

/**
 * Fetch a single juz from API and persist to localStorage.
 * Returns the data object on success, null on failure.
 */
export async function fetchAndCacheJuz(juzId) {
  const cacheKey = QURAN_CACHE_PREFIX + juzId;

  // 1. Return cached copy if available
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch { localStorage.removeItem(cacheKey); }
  }

  // 2. Need network
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/juz/${juzId}/quran-uthmani`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.status === 'OK' && json.data && json.data.ayahs) {
      const surahMap = {};
      json.data.ayahs.forEach(ayah => {
        const sn = ayah.surah.number;
        if (!surahMap[sn]) {
          surahMap[sn] = { number: sn, name: ayah.surah.name, verses: [] };
        }
        surahMap[sn].verses.push({ number: ayah.numberInSurah, text: ayah.text });
      });

      const result = { juzId, surahs: Object.values(surahMap) };
      try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch { /* storage full */ }
      return result;
    }
  } catch (err) {
    console.warn(`[Quran] فشل تحميل الجزء ${juzId}:`, err.message);
  }
  return null;
}

/** Background prefetch all juz ids in a pair without blocking UI */
export function prefetchPairJuz(pairId) {
  const pair = KHATMAH_PAIRS.find(p => p.pairId === pairId);
  if (!pair) return;
  pair.juzIds.forEach(id => {
    if (!isJuzCached(id)) fetchAndCacheJuz(id); // fire & forget
  });
}

export function isJuzCached(juzId) {
  return localStorage.getItem(QURAN_CACHE_PREFIX + juzId) !== null;
}

export function getCachedJuz(juzId) {
  const raw = localStorage.getItem(QURAN_CACHE_PREFIX + juzId);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** How many juz of a pair are already cached offline */
export function pairCacheStatus(pairId) {
  const pair = KHATMAH_PAIRS.find(p => p.pairId === pairId);
  if (!pair) return { cached: 0, total: 0 };
  const cached = pair.juzIds.filter(id => isJuzCached(id)).length;
  return { cached, total: pair.juzIds.length };
}


export const QURAN_SURAH_LIST = [
  {
    "id": 1,
    "name": "سُورَةُ ٱلْفَاتِحَةِ"
  },
  {
    "id": 2,
    "name": "سُورَةُ البَقَرَةِ"
  },
  {
    "id": 3,
    "name": "سُورَةُ آلِ عِمۡرَانَ"
  },
  {
    "id": 4,
    "name": "سُورَةُ النِّسَاءِ"
  },
  {
    "id": 5,
    "name": "سُورَةُ المَائـِدَةِ"
  },
  {
    "id": 6,
    "name": "سُورَةُ الأَنۡعَامِ"
  },
  {
    "id": 7,
    "name": "سُورَةُ الأَعۡرَافِ"
  },
  {
    "id": 8,
    "name": "سُورَةُ الأَنفَالِ"
  },
  {
    "id": 9,
    "name": "سُورَةُ التَّوۡبَةِ"
  },
  {
    "id": 10,
    "name": "سُورَةُ يُونُسَ"
  },
  {
    "id": 11,
    "name": "سُورَةُ هُودٍ"
  },
  {
    "id": 12,
    "name": "سُورَةُ يُوسُفَ"
  },
  {
    "id": 13,
    "name": "سُورَةُ الرَّعۡدِ"
  },
  {
    "id": 14,
    "name": "سُورَةُ إِبۡرَاهِيمَ"
  },
  {
    "id": 15,
    "name": "سُورَةُ الحِجۡرِ"
  },
  {
    "id": 16,
    "name": "سُورَةُ النَّحۡلِ"
  },
  {
    "id": 17,
    "name": "سُورَةُ الإِسۡرَاءِ"
  },
  {
    "id": 18,
    "name": "سُورَةُ الكَهۡفِ"
  },
  {
    "id": 19,
    "name": "سُورَةُ مَرۡيَمَ"
  },
  {
    "id": 20,
    "name": "سُورَةُ طه"
  },
  {
    "id": 21,
    "name": "سُورَةُ الأَنبِيَاءِ"
  },
  {
    "id": 22,
    "name": "سُورَةُ الحَجِّ"
  },
  {
    "id": 23,
    "name": "سُورَةُ المُؤۡمِنُونَ"
  },
  {
    "id": 24,
    "name": "سُورَةُ النُّورِ"
  },
  {
    "id": 25,
    "name": "سُورَةُ الفُرۡقَانِ"
  },
  {
    "id": 26,
    "name": "سُورَةُ الشُّعَرَاءِ"
  },
  {
    "id": 27,
    "name": "سُورَةُ النَّمۡلِ"
  },
  {
    "id": 28,
    "name": "سُورَةُ القَصَصِ"
  },
  {
    "id": 29,
    "name": "سُورَةُ العَنكَبُوتِ"
  },
  {
    "id": 30,
    "name": "سُورَةُ الرُّومِ"
  },
  {
    "id": 31,
    "name": "سُورَةُ لُقۡمَانَ"
  },
  {
    "id": 32,
    "name": "سُورَةُ السَّجۡدَةِ"
  },
  {
    "id": 33,
    "name": "سُورَةُ الأَحۡزَابِ"
  },
  {
    "id": 34,
    "name": "سُورَةُ سَبَإٍ"
  },
  {
    "id": 35,
    "name": "سُورَةُ فَاطِرٍ"
  },
  {
    "id": 36,
    "name": "سُورَةُ يسٓ"
  },
  {
    "id": 37,
    "name": "سُورَةُ الصَّافَّاتِ"
  },
  {
    "id": 38,
    "name": "سُورَةُ صٓ"
  },
  {
    "id": 39,
    "name": "سُورَةُ الزُّمَرِ"
  },
  {
    "id": 40,
    "name": "سُورَةُ غَافِرٍ"
  },
  {
    "id": 41,
    "name": "سُورَةُ فُصِّلَتۡ"
  },
  {
    "id": 42,
    "name": "سُورَةُ الشُّورَىٰ"
  },
  {
    "id": 43,
    "name": "سُورَةُ الزُّخۡرُفِ"
  },
  {
    "id": 44,
    "name": "سُورَةُ الدُّخَانِ"
  },
  {
    "id": 45,
    "name": "سُورَةُ الجَاثِيَةِ"
  },
  {
    "id": 46,
    "name": "سُورَةُ الأَحۡقَافِ"
  },
  {
    "id": 47,
    "name": "سُورَةُ مُحَمَّدٍ"
  },
  {
    "id": 48,
    "name": "سُورَةُ الفَتۡحِ"
  },
  {
    "id": 49,
    "name": "سُورَةُ الحُجُرَاتِ"
  },
  {
    "id": 50,
    "name": "سُورَةُ قٓ"
  },
  {
    "id": 51,
    "name": "سُورَةُ الذَّارِيَاتِ"
  },
  {
    "id": 52,
    "name": "سُورَةُ الطُّورِ"
  },
  {
    "id": 53,
    "name": "سُورَةُ النَّجۡمِ"
  },
  {
    "id": 54,
    "name": "سُورَةُ القَمَرِ"
  },
  {
    "id": 55,
    "name": "سُورَةُ الرَّحۡمَٰن"
  },
  {
    "id": 56,
    "name": "سُورَةُ الوَاقِعَةِ"
  },
  {
    "id": 57,
    "name": "سُورَةُ الحَدِيدِ"
  },
  {
    "id": 58,
    "name": "سُورَةُ المُجَادلَةِ"
  },
  {
    "id": 59,
    "name": "سُورَةُ الحَشۡرِ"
  },
  {
    "id": 60,
    "name": "سُورَةُ المُمۡتَحنَةِ"
  },
  {
    "id": 61,
    "name": "سُورَةُ الصَّفِّ"
  },
  {
    "id": 62,
    "name": "سُورَةُ الجُمُعَةِ"
  },
  {
    "id": 63,
    "name": "سُورَةُ المُنَافِقُونَ"
  },
  {
    "id": 64,
    "name": "سُورَةُ التَّغَابُنِ"
  },
  {
    "id": 65,
    "name": "سُورَةُ الطَّلَاقِ"
  },
  {
    "id": 66,
    "name": "سُورَةُ التَّحۡرِيمِ"
  },
  {
    "id": 67,
    "name": "سُورَةُ المُلۡكِ"
  },
  {
    "id": 68,
    "name": "سُورَةُ القَلَمِ"
  },
  {
    "id": 69,
    "name": "سُورَةُ الحَاقَّةِ"
  },
  {
    "id": 70,
    "name": "سُورَةُ المَعَارِجِ"
  },
  {
    "id": 71,
    "name": "سُورَةُ نُوحٍ"
  },
  {
    "id": 72,
    "name": "سُورَةُ الجِنِّ"
  },
  {
    "id": 73,
    "name": "سُورَةُ المُزَّمِّلِ"
  },
  {
    "id": 74,
    "name": "سُورَةُ المُدَّثِّرِ"
  },
  {
    "id": 75,
    "name": "سُورَةُ القِيَامَةِ"
  },
  {
    "id": 76,
    "name": "سُورَةُ الإِنسَانِ"
  },
  {
    "id": 77,
    "name": "سُورَةُ المُرۡسَلَاتِ"
  },
  {
    "id": 78,
    "name": "سُورَةُ النَّبَإِ"
  },
  {
    "id": 79,
    "name": "سُورَةُ النَّازِعَاتِ"
  },
  {
    "id": 80,
    "name": "سُورَةُ عَبَسَ"
  },
  {
    "id": 81,
    "name": "سُورَةُ التَّكۡوِيرِ"
  },
  {
    "id": 82,
    "name": "سُورَةُ الانفِطَارِ"
  },
  {
    "id": 83,
    "name": "سُورَةُ المُطَفِّفِينَ"
  },
  {
    "id": 84,
    "name": "سُورَةُ الانشِقَاقِ"
  },
  {
    "id": 85,
    "name": "سُورَةُ البُرُوجِ"
  },
  {
    "id": 86,
    "name": "سُورَةُ الطَّارِقِ"
  },
  {
    "id": 87,
    "name": "سُورَةُ الأَعۡلَىٰ"
  },
  {
    "id": 88,
    "name": "سُورَةُ الغَاشِيَةِ"
  },
  {
    "id": 89,
    "name": "سُورَةُ الفَجۡرِ"
  },
  {
    "id": 90,
    "name": "سُورَةُ البَلَدِ"
  },
  {
    "id": 91,
    "name": "سُورَةُ الشَّمۡسِ"
  },
  {
    "id": 92,
    "name": "سُورَةُ اللَّيۡلِ"
  },
  {
    "id": 93,
    "name": "سُورَةُ الضُّحَىٰ"
  },
  {
    "id": 94,
    "name": "سُورَةُ الشَّرۡحِ"
  },
  {
    "id": 95,
    "name": "سُورَةُ التِّينِ"
  },
  {
    "id": 96,
    "name": "سُورَةُ العَلَقِ"
  },
  {
    "id": 97,
    "name": "سُورَةُ القَدۡرِ"
  },
  {
    "id": 98,
    "name": "سُورَةُ البَيِّنَةِ"
  },
  {
    "id": 99,
    "name": "سُورَةُ الزَّلۡزَلَةِ"
  },
  {
    "id": 100,
    "name": "سُورَةُ العَادِيَاتِ"
  },
  {
    "id": 101,
    "name": "سُورَةُ القَارِعَةِ"
  },
  {
    "id": 102,
    "name": "سُورَةُ التَّكَاثُرِ"
  },
  {
    "id": 103,
    "name": "سُورَةُ العَصۡرِ"
  },
  {
    "id": 104,
    "name": "سُورَةُ الهُمَزَةِ"
  },
  {
    "id": 105,
    "name": "سُورَةُ الفِيلِ"
  },
  {
    "id": 106,
    "name": "سُورَةُ قُرَيۡشٍ"
  },
  {
    "id": 107,
    "name": "سُورَةُ المَاعُونِ"
  },
  {
    "id": 108,
    "name": "سُورَةُ الكَوۡثَرِ"
  },
  {
    "id": 109,
    "name": "سُورَةُ الكَافِرُونَ"
  },
  {
    "id": 110,
    "name": "سُورَةُ النَّصۡرِ"
  },
  {
    "id": 111,
    "name": "سُورَةُ المَسَدِ"
  },
  {
    "id": 112,
    "name": "سُورَةُ الإِخۡلَاصِ"
  },
  {
    "id": 113,
    "name": "سُورَةُ الفَلَقِ"
  },
  {
    "id": 114,
    "name": "سُورَةُ النَّاسِ"
  }
];
