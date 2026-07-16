// ============================================================
//  TriVerse — Kural Tabanlı Operasyonel Karar Motoru v1
//  Gerçek eğitilmiş AI modeli değil — kural tabanlı sistem
//  İleri aşamada ML modeli bu servisi değiştirecek.
// ============================================================

export const ENGINE_META = {
  type:    'rule-based',
  version: '1.0',
  trained: false,
  source:  'Open-Meteo hava + Marine API + power curve hesabı',
  note:    'Bu ilk sürüm kural tabanlı karar motorudur. Gerçek eğitilmiş model henüz entegre edilmedi.',
};

/**
 * Güven skoru yardımcısı (veri kalitesine göre)
 */
function calcConfidence(dataAvailable, dataFresh) {
  if (dataAvailable && dataFresh) return 'Yüksek';
  if (dataAvailable)              return 'Orta';
  return 'Düşük';
}

/**
 * Kural tabanlı operasyonel öneriler üretir
 *
 * @param {object} params
 * @param {object} params.currentWeather  fetchCurrentWeather sonucu
 * @param {object} params.hourlyForecast  fetchHourlyForecast sonucu
 * @param {object} params.marineData      fetchMarineData sonucu
 * @param {object} [params.plant]         Seçili santral verisi
 * @param {object} [params.financialData] Finansal veriler
 *
 * @returns {Array<{
 *   id, severity, title, explanation,
 *   source, recommendedAction, confidence, createdAt
 * }>}
 */
export function generateOperationalRecommendations({
  currentWeather,
  hourlyForecast,
  marineData,
  plant,
  financialData,
}) {
  const recommendations = [];
  const now = new Date();

  const wind      = currentWeather?.windSpeed      ?? 0;
  const gusts     = currentWeather?.windGusts      ?? wind * 1.3;
  const precip    = currentWeather?.precipitation  ?? 0;
  const temp      = currentWeather?.temperature    ?? 20;
  const waveH     = marineData?.waveHeight         ?? 0;
  const ghi       = currentWeather?.ghi            ?? 0;

  // ── KURAL 1: Cut-out eşiği ─────────────────────────────────
  if (wind >= 22) {
    recommendations.push({
      id:               'R01',
      severity:          wind >= 25 ? 'critical' : 'warning',
      title:             wind >= 25 ? 'Acil Cut-out — Türbinler Güvenli Duruş Moduna Geçmeli' : 'Cut-out Eşiğine Yaklaşıyor',
      explanation:      `Anlık rüzgar hızı ${wind} m/s. Cut-out hızı (25 m/s) ${wind >= 25 ? 'aşıldı' : 'yaklaşılıyor'}.`,
      source:           'Open-Meteo Forecast API — anlık rüzgar',
      recommendedAction: wind >= 25 ? 'Tüm türbinleri güvenli duruş moduna al. Fırtına prosedürünü başlat.' : 'Türbin yükünü azalt, fren sistemini hazırlık moduna al.',
      confidence:        calcConfidence(!!currentWeather, true),
      createdAt:         now.toISOString(),
    });
  }

  // ── KURAL 2: Yüksek rüzgar hamlesi ─────────────────────────
  if (gusts > 20 && gusts / wind > 1.4) {
    recommendations.push({
      id:               'R02',
      severity:         'warning',
      title:            'Yüksek Rüzgar Hamlesi — Türbin Yük Kontrolü',
      explanation:      `Rüzgar hamlesi (${gusts.toFixed(1)} m/s) ortalama hızın (${wind} m/s) %${((gusts / wind - 1) * 100).toFixed(0)} üzerinde.`,
      source:           'Open-Meteo wind_gusts_10m verisi',
      recommendedAction: 'Türbin yük kontrolörlerini izle. Ani hamle durumunda pitch kontrol devreye girebilir.',
      confidence:        calcConfidence(!!currentWeather, true),
      createdAt:         now.toISOString(),
    });
  }

  // ── KURAL 3: Offshore dalga yüksekliği ─────────────────────
  if (waveH > 3.5) {
    recommendations.push({
      id:               'R03',
      severity:         'critical',
      title:            'Offshore Bakım Operasyonu Ertelenmeli',
      explanation:      `Dalga yüksekliği ${waveH} m. Güvenli bakım operasyonu sınırı (3.5 m) aşıldı.`,
      source:           'Open-Meteo Marine API — wave_height',
      recommendedAction: 'Offshore bakım botlarını limanda tut. Hava koşulları normale dönene kadar operasyonu ertele.',
      confidence:        calcConfidence(!!marineData, true),
      createdAt:         now.toISOString(),
    });
  } else if (waveH > 2.5) {
    recommendations.push({
      id:               'R03b',
      severity:         'warning',
      title:            'Offshore Operasyona Dikkatli Yaklaş',
      explanation:      `Dalga yüksekliği ${waveH} m. Bakım için tercih edilen sınır (2.5 m) aşıldı.`,
      source:           'Open-Meteo Marine API — wave_height',
      recommendedAction: 'Deneyimli personel ile kısa süreli operasyon değerlendirilebilir. Hava takibini artır.',
      confidence:        calcConfidence(!!marineData, true),
      createdAt:         now.toISOString(),
    });
  }

  // ── KURAL 4: Yağış + Rüzgar kombinasyonu ───────────────────
  if (precip > 2 && wind > 12) {
    recommendations.push({
      id:               'R04',
      severity:         'warning',
      title:            'Yağış + Yüksek Rüzgar — Saha Operasyon Riski Arttı',
      explanation:      `Yağış: ${precip} mm, Rüzgar: ${wind} m/s. Birlikte saha güvenliğini olumsuz etkiler.`,
      source:           'Open-Meteo precipitation + wind_speed_10m',
      recommendedAction: 'Karada saha personelini dışarı çıkarma. Bakım operasyonlarını ertele. Görüş mesafesini izle.',
      confidence:        calcConfidence(!!currentWeather, true),
      createdAt:         now.toISOString(),
    });
  }

  // ── KURAL 5: Düşük rüzgar → Bakım fırsatı ─────────────────
  const upcomingLowWind = hourlyForecast?.wind_speed_10m?.slice(0, 24)
    .filter(v => v < 5).length ?? 0;

  if (wind < 8 && upcomingLowWind >= 4) {
    recommendations.push({
      id:               'R05',
      severity:         'info',
      title:            'Bakım İçin Uygun Zaman Penceresi',
      explanation:      `Anlık rüzgar ${wind} m/s. Önümüzdeki 24 saatte ${upcomingLowWind} saat boyunca rüzgar < 5 m/s bekleniyor.`,
      source:           'Open-Meteo 24 saatlik saatlik tahmin',
      recommendedAction: 'Rutin bakım ve inspeksiyon operasyonlarını bu düşük üretim penceresinde planla.',
      confidence:        calcConfidence(!!hourlyForecast, true),
      createdAt:         now.toISOString(),
    });
  }

  // ── KURAL 6: GES avantajı ───────────────────────────────────
  if (ghi > 700 && wind < 6) {
    recommendations.push({
      id:               'R06',
      severity:         'info',
      title:            'GES Üretim Avantajı — Düşük Rüzgar Telafi Ediliyor',
      explanation:      `GHI irradyans: ${Math.round(ghi)} W/m² (yüksek). Rüzgar: ${wind} m/s (düşük). Güneş santralleri portatif yükü telafi edebilir.`,
      source:           'Open-Meteo shortwave_radiation verisi',
      recommendedAction: 'GES santralleri önceliklendir. Yük dengeleme stratejisini güneş ağırlıklı güncelle.',
      confidence:        calcConfidence(!!currentWeather, true),
      createdAt:         now.toISOString(),
    });
  }

  // ── KURAL 7: Yüksek nem + Sıcaklık → Soğutma riski ─────────
  const humidity = currentWeather?.relativeHumidity ?? 0;
  if (humidity > 85 && temp > 30) {
    recommendations.push({
      id:               'R07',
      severity:         'warning',
      title:            'Yüksek Nem ve Sıcaklık — Elektrik Ekipmanı İzleme',
      explanation:      `Nem: %${humidity}, Sıcaklık: ${temp}°C. Yüksek nem koşulları elektrik ekipmanı için risk oluşturabilir.`,
      source:           'Open-Meteo relative_humidity_2m + temperature_2m',
      recommendedAction: 'Trafo ve elektrik panosu soğutma sistemlerini kontrol et. Nem sızıntısı riskini izle.',
      confidence:        calcConfidence(!!currentWeather, true),
      createdAt:         now.toISOString(),
    });
  }

  // Önemi sırasıyla sırala: critical > warning > info
  const priority = { critical: 0, warning: 1, info: 2 };
  return recommendations.sort((a, b) => priority[a.severity] - priority[b.severity]);
}
