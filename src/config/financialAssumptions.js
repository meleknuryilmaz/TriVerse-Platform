// ============================================================
//  TriVerse — Finansal Varsayımlar Konfigürasyonu
//  Bu değerler gerçek piyasa verisi değil; PoC senaryosu.
//  Gerçek entegrasyon eklendiğinde bu dosya güncellenir.
// ============================================================

export const FINANCIAL_ASSUMPTIONS = {
  // Türkiye şebeke emisyon faktörü (tCO₂e/MWh)
  // Kaynak: Proje varsayımı / literatür referansı (~IEA Türkiye 2022)
  gridEmissionFactor: 0.452,

  // Karbon kredi fiyatı (USD/tCO₂) — Gold Standard voluntary market
  // Kaynak: PoC senaryo varsayımı
  carbonCreditPriceUSD: 4.0,

  // I-REC sertifika fiyatı (USD/MWh)
  // Kaynak: PoC senaryo varsayımı
  irecPriceUSDPerMWh: 1.5,

  // Para birimi
  currency: 'USD',

  // EPİAŞ fallback fiyat aralığı (TL/MWh)
  epiasMinPriceTRY: 1000,
  epiasMaxPriceTRY: 4000,

  // USD/TRY kur varsayımı (gerçek kur API bağlandığında güncellenir)
  usdToTryRate: 32.5,

  // Kaynak notları — arayüzde gösterilecek
  sourceNotes: {
    gridEmissionFactor: 'Proje varsayımı / literatür referansı (IEA Türkiye 2022)',
    carbonCreditPrice:  'PoC senaryo varsayımı — Gold Standard voluntary market',
    irecPrice:          'PoC senaryo varsayımı — I-REC Standard',
    epiasPrice:         'EPİAŞ bağlantısı mevcut değil — PoC fiyat senaryosu kullanılıyor',
    emissionCalc:       'Tahmini üretimden hesaplanan değer; gerçek SCADA verisi değil',
  },

  // Veri tipi sınıflandırması
  dataType: 'project-assumption', // 'live' | 'calculated' | 'project-assumption' | 'simulation'
};

// EPİAŞ gerçek bağlantı eklendiğinde burası güncellenir
export const EPIAS_CONFIG = {
  isLive: false,
  endpoint: null, // 'https://api.epias.com.tr/...' — ileride
  requiresProxy: true,
  fallbackDataPath: '../data/marketPriceFallback.json',
};
