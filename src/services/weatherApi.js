// ============================================================
//  TriVerse — Open-Meteo Hava Durumu Servis Katmanı
//  Kaynak : https://open-meteo.com  (Ücretsiz, API key YOK)
//  Limit  : 10.000 istek/gün  →  10 dk'da 1 çekersek = 144/gün ✓
// ============================================================

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MARINE_URL   = 'https://marine-api.open-meteo.com/v1/marine';

// ── Koordinatlar ──────────────────────────────────────────────
// Enerjisa'nın en büyük RES lokasyonu (Akhisar/Balıkesir bölgesi)
// temsili olarak tüm Batı Türkiye santralleri için kullanılır.
export const WEATHER_COORDS = {
  res:      { lat: 38.9167, lon: 27.85  },   // Akhisar RES
  offshore: { lat: 38.92,   lon: 26.78  },   // Çandarlı Offshore
};

// ── Yardımcı: fetch + JSON ────────────────────────────────────
async function apiFetch(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  1. Anlık Hava Durumu
//     Döndürür: { windSpeed, windDirection, temperature, ghi }
// ─────────────────────────────────────────────────────────────
export async function fetchCurrentWeather({ lat, lon }) {
  const params = new URLSearchParams({
    latitude:         lat,
    longitude:        lon,
    current:          'wind_speed_10m,wind_direction_10m,temperature_2m,shortwave_radiation',
    wind_speed_unit:  'ms',
    timezone:         'Europe/Istanbul',
  });
  const data = await apiFetch(`${FORECAST_URL}?${params}`);
  const c    = data.current;
  return {
    windSpeed:     c.wind_speed_10m      ?? 12,
    windDirection: c.wind_direction_10m  ?? 0,
    temperature:   c.temperature_2m      ?? 25,
    ghi:           c.shortwave_radiation ?? 800,
  };
}

// ─────────────────────────────────────────────────────────────
//  2. Bugünkü 24 Saatlik Tahmin (SCADA grafiği için)
//     Döndürür: { time[], wind_speed_10m[], shortwave_radiation[] }
// ─────────────────────────────────────────────────────────────
export async function fetchHourlyForecast({ lat, lon }) {
  const params = new URLSearchParams({
    latitude:         lat,
    longitude:        lon,
    hourly:           'wind_speed_10m,shortwave_radiation',
    wind_speed_unit:  'ms',
    forecast_days:    '1',
    timezone:         'Europe/Istanbul',
  });
  const data = await apiFetch(`${FORECAST_URL}?${params}`);
  return data.hourly; // { time, wind_speed_10m, shortwave_radiation }
}

// ─────────────────────────────────────────────────────────────
//  3. Offshore Dalga/Deniz Verisi
//     Döndürür: { waveHeight }
// ─────────────────────────────────────────────────────────────
export async function fetchMarineData({ lat, lon }) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current:   'wave_height',
    timezone:  'Europe/Istanbul',
  });
  const data = await apiFetch(`${MARINE_URL}?${params}`);
  return {
    waveHeight: data.current?.wave_height ?? 1.0,
  };
}

// ─────────────────────────────────────────────────────────────
//  4. Saatlik Tahmin → SCADA Log Formatına Dönüştür
//     PowerForecastWidget'ın beklediği formata çevirir:
//     { time, actual, lstm, windSpeed }
// ─────────────────────────────────────────────────────────────
export function hourlyToScadaLogs(hourly) {
  const RES_CAPACITY_MW = 1217; // Enerjisa toplam RES kapasitesi
  const CUT_IN_SPEED    = 3;    // m/s — altında türbin üretmez
  const CUT_OUT_SPEED   = 25;   // m/s — üstünde türbin frenlenir

  const { time, wind_speed_10m, shortwave_radiation } = hourly;

  return time.map((isoTime, i) => {
    const v    = wind_speed_10m[i]      ?? 0;
    const ghi  = shortwave_radiation[i] ?? 0; // kullanılabilir (ileride GES hesabı için)

    // Kübik rüzgar-güç yasası: P = C × (v / v_max)³
    const power =
      v < CUT_IN_SPEED || v > CUT_OUT_SPEED
        ? 0
        : RES_CAPACITY_MW * Math.pow(Math.min(v / CUT_OUT_SPEED, 1), 3);

    // LSTM: gerçek değerin ±%2 sapması (simüle model çıktısı)
    const noise = (Math.random() - 0.5) * power * 0.04;
    const lstm  = Math.max(0, +(power + noise).toFixed(1));

    // Saat formatı: "HH:00"
    const hour    = new Date(isoTime).getHours();
    const timeStr = `${String(hour).padStart(2, '0')}:00`;

    return {
      time:      timeStr,
      actual:    +power.toFixed(1),
      lstm,
      windSpeed: +v.toFixed(1),
    };
  });
}
