// ============================================================
//  TriVerse — Türbin Teknik Varsayımları
//  Gerçek türbin model verisi mevcut değilse bu referans
//  power curve kullanılır.
// ============================================================

// Genel referans türbin parametreleri (bilinmeyen model için)
export const DEFAULT_TURBINE = {
  name: 'Genel Referans Türbini',
  cutInSpeed:    3,   // m/s — üretim başlangıcı
  ratedSpeed:    12,  // m/s — nominal güce ulaşılan hız
  cutOutSpeed:   25,  // m/s — güvenli duruş hızı
  hubHeight:     80,  // metre (varsayılan)
  rotorDiameter: 80,  // metre (varsayılan)
  powerCurveType: 'cubic', // 'cubic' | 'piecewise'
};

// Parçalı (piecewise) referans güç eğrisi
// Kaynak: IEC 61400-12 standardı baz alınarak PoC için basitleştirildi
export const REFERENCE_POWER_CURVE = [
  { windSpeed: 0,  powerFactor: 0 },
  { windSpeed: 3,  powerFactor: 0 },
  { windSpeed: 4,  powerFactor: 0.02 },
  { windSpeed: 5,  powerFactor: 0.05 },
  { windSpeed: 6,  powerFactor: 0.09 },
  { windSpeed: 7,  powerFactor: 0.15 },
  { windSpeed: 8,  powerFactor: 0.23 },
  { windSpeed: 9,  powerFactor: 0.33 },
  { windSpeed: 10, powerFactor: 0.44 },
  { windSpeed: 11, powerFactor: 0.58 },
  { windSpeed: 12, powerFactor: 1.00 }, // rated
  { windSpeed: 13, powerFactor: 1.00 },
  { windSpeed: 14, powerFactor: 1.00 },
  { windSpeed: 15, powerFactor: 1.00 },
  { windSpeed: 20, powerFactor: 1.00 },
  { windSpeed: 25, powerFactor: 1.00 }, // cut-out başlangıcı
  { windSpeed: 26, powerFactor: 0 },
];

// Bilinen türbin modelleri için özel parametreler
export const KNOWN_TURBINES = {
  'GE 2.5-120':    { cutIn: 3, rated: 11.5, cutOut: 25, ratedPowerKW: 2500 },
  'Vestas V90':    { cutIn: 4, rated: 15,   cutOut: 25, ratedPowerKW: 2000 },
  'Siemens SWT':   { cutIn: 3, rated: 12,   cutOut: 25, ratedPowerKW: 2300 },
  'Enercon E-101': { cutIn: 2, rated: 11.5, cutOut: 28, ratedPowerKW: 3050 },
};

export const MODEL_STATUS = {
  type: 'baseline',
  trained: false,
  source: 'Open-Meteo + power curve (IEC 61400-12)',
  note: 'Gerçek eğitilmiş model henüz entegre edilmedi',
};
