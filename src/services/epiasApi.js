// ============================================================
//  TriVerse — EPİAŞ Piyasa Fiyatı Servis Katmanı
//  Gerçek EPİAŞ bağlantısı: Token + üyelik gerekir.
//  CORS nedeniyle doğrudan frontend'den güvenli çalışmaz.
//  Backend proxy eklendiğinde bu fonksiyon güncellenecek.
//
//  Şu an: marketPriceFallback.json kullanılıyor.
// ============================================================

import fallbackData from '../data/marketPriceFallback.json';

const EPIAS_STATUS = {
  isLive:      false,
  source:      'PoC fallback scenario',
  note:        'EPİAŞ bağlantısı mevcut değil — PoC fiyat senaryosu kullanılıyor',
  dataType:    'simulation',
  proxyReady:  false,
};

/**
 * Saatlik piyasa fiyatlarını döndürür
 * Gerçek EPİAŞ bağlantısı eklendiğinde burada endpoint çağrısı yapılır.
 *
 * @returns {Promise<{ prices: Array, isLive: boolean, source: string }>}
 */
export async function fetchMarketPrices() {
  // Gelecekte: backend proxy hazır olduğunda burayı aktif et
  // if (EPIAS_CONFIG.proxyEndpoint) {
  //   const res = await fetch(EPIAS_CONFIG.proxyEndpoint);
  //   return { ...(await res.json()), isLive: true, source: 'EPİAŞ Şeffaflık Platformu' };
  // }

  // Şu an fallback JSON kullan
  return {
    prices:   fallbackData.prices,
    currency: fallbackData.currency,
    unit:     fallbackData.unit,
    isLive:   false,
    source:   EPIAS_STATUS.source,
    note:     EPIAS_STATUS.note,
    dataType: EPIAS_STATUS.dataType,
  };
}

/**
 * Belirli saat için fiyat döndürür
 * @param {number} hour 0–23
 */
export async function getPriceForHour(hour) {
  const { prices } = await fetchMarketPrices();
  const entry = prices.find(p => p.hour === `${String(hour).padStart(2, '0')}:00`);
  return entry?.price ?? 2500; // fallback ortalama
}

/**
 * Günlük ortalama fiyat
 */
export async function getDailyAveragePrice() {
  const { prices } = await fetchMarketPrices();
  const avg = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
  return +avg.toFixed(0);
}

export { EPIAS_STATUS };
