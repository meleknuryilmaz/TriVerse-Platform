// ============================================================
//  TriVerse — Open-Meteo Hava Durumu Servis Katmanı (v2)
//  Kaynak : https://open-meteo.com  (Ücretsiz, API key YOK)
//  Limit  : 10.000 istek/gün
//  Güncelleme: 7 günlük saatlik tahmin, güstler, nem, basınç
// ============================================================

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MARINE_URL   = 'https://marine-api.open-meteo.com/v1/marine';

// ── Koordinatlar ──────────────────────────────────────────────
export const WEATHER_COORDS = {
  res:      { lat: 38.9167, lon: 27.85  },   // Akhisar RES (temsili)
  offshore: { lat: 38.92,   lon: 26.78  },   // Çandarlı Offshore
};

// ── Koordinat bazlı cache (10 dakika TTL) ─────────────────────
const weatherCache = new Map(); // key: 'lat_lon_type' → { data, ts }
const CACHE_TTL    = 10 * 60 * 1000; // 10 dakika

function getCached(key) {
  const entry = weatherCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { weatherCache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  weatherCache.set(key, { data, ts: Date.now() });
}

// ── Yardımcı fetch ────────────────────────────────────────────
async function apiFetch(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  1. Anlık Hava Durumu (genişletilmiş)
//     Döndürür: { windSpeed, windDirection, windGusts,
//                 temperature, relativeHumidity,
//                 surfacePressure, ghi, precipitation,
//                 weatherCode }
// ─────────────────────────────────────────────────────────────
export async function fetchCurrentWeather({ lat, lon }) {
  const key    = `${lat}_${lon}_current`;
  const cached = getCached(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude:         lat,
    longitude:        lon,
    current: [
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'temperature_2m',
      'relative_humidity_2m',
      'surface_pressure',
      'shortwave_radiation',
      'precipitation',
      'weather_code',
    ].join(','),
    wind_speed_unit:  'ms',
    timezone:         'Europe/Istanbul',
  });

  const data = await apiFetch(`${FORECAST_URL}?${params}`);
  const c    = data.current || {};

  const result = {
    windSpeed:        c.wind_speed_10m        ?? 10,
    windDirection:    c.wind_direction_10m    ?? 0,
    windGusts:        c.wind_gusts_10m        ?? null,
    temperature:      c.temperature_2m        ?? 20,
    relativeHumidity: c.relative_humidity_2m  ?? 50,
    surfacePressure:  c.surface_pressure      ?? 1013,
    ghi:              c.shortwave_radiation   ?? 0,
    precipitation:    c.precipitation         ?? 0,
    weatherCode:      c.weather_code          ?? 0,
    isLive:           true,
    source:           'Open-Meteo Forecast API',
    dataType:         'live',
    fetchedAt:        new Date().toISOString(),
  };

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────
//  2. Saatlik Tahmin (7 günlük)
//     Döndürür: { time[], wind_speed_10m[], shortwave_radiation[], ... }
// ─────────────────────────────────────────────────────────────
export async function fetchHourlyForecast({ lat, lon }, forecastDays = 7) {
  const key    = `${lat}_${lon}_hourly_${forecastDays}`;
  const cached = getCached(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    hourly: [
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'temperature_2m',
      'relative_humidity_2m',
      'shortwave_radiation',
      'precipitation',
      'weather_code',
    ].join(','),
    wind_speed_unit: 'ms',
    forecast_days:   String(forecastDays),
    timezone:        'Europe/Istanbul',
  });

  const data   = await apiFetch(`${FORECAST_URL}?${params}`);
  const result = data.hourly || {};
  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────
//  3. Günlük Tahmin Özeti
// ─────────────────────────────────────────────────────────────
export async function fetchDailyForecast({ lat, lon }) {
  const key    = `${lat}_${lon}_daily`;
  const cached = getCached(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'precipitation_sum',
    ].join(','),
    wind_speed_unit: 'ms',
    forecast_days:   '7',
    timezone:        'Europe/Istanbul',
  });

  const data   = await apiFetch(`${FORECAST_URL}?${params}`);
  const result = data.daily || {};
  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────
//  4. Marine API (Offshore)
// ─────────────────────────────────────────────────────────────
export async function fetchMarineData({ lat, lon }) {
  const key    = `${lat}_${lon}_marine`;
  const cached = getCached(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: [
      'wave_height',
      'wave_direction',
      'wave_period',
      'wind_wave_height',
      'swell_wave_height',
    ].join(','),
    timezone: 'Europe/Istanbul',
  });

  const data = await apiFetch(`${MARINE_URL}?${params}`);
  const c    = data.current || {};

  const result = {
    waveHeight:      c.wave_height         ?? 1.0,
    waveDirection:   c.wave_direction      ?? null,
    wavePeriod:      c.wave_period         ?? null,
    windWaveHeight:  c.wind_wave_height    ?? null,
    swellWaveHeight: c.swell_wave_height   ?? null,
    isLive:          true,
    source:          'Open-Meteo Marine API',
    dataType:        'live',
    fetchedAt:       new Date().toISOString(),
  };

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────
//  5. Saatlik Tahmin → SCADA Log Formatı (grafik için)
//     NOT: Bu hesaplama tahminidir, gerçek SCADA değildir.
// ─────────────────────────────────────────────────────────────
export function hourlyToScadaLogs(hourly) {
  const RES_CAPACITY_MW = 1217;
  const CUT_IN          = 3;
  const CUT_OUT         = 25;
  const RATED           = 12;

  const { time, wind_speed_10m } = hourly;
  if (!time || !wind_speed_10m) return [];

  return time.map((isoTime, i) => {
    const v = wind_speed_10m[i] ?? 0;

    // Referans power curve (lineer cut-in → rated, sabit rated → cut-out)
    let factor = 0;
    if (v >= CUT_IN && v <= RATED) {
      factor = Math.pow((v - CUT_IN) / (RATED - CUT_IN), 2);
    } else if (v > RATED && v <= CUT_OUT) {
      factor = 1;
    }

    const power = +(RES_CAPACITY_MW * factor).toFixed(1);

    // Power curve tahminine küçük sapma (tahmin senaryosu)
    const deviation = (Math.random() - 0.5) * power * 0.03;
    const scenario2 = Math.max(0, +(power + deviation).toFixed(1));

    const hour    = new Date(isoTime).getHours();
    const timeStr = `${String(hour).padStart(2, '0')}:00`;

    return {
      time:      timeStr,
      actual:    power,      // 'Power Curve Tahmini'
      lstm:      scenario2,  // 'Open-Meteo Projeksiyon'
      windSpeed: +v.toFixed(1),
      isEstimate: true,
    };
  });
}

// ─────────────────────────────────────────────────────────────
//  6. Weather code → Türkçe açıklama
// ─────────────────────────────────────────────────────────────
export function weatherCodeToLabel(code) {
  if (code === 0)              return 'Açık';
  if (code <= 3)               return 'Parçalı Bulutlu';
  if (code <= 49)              return 'Sisli';
  if (code <= 57)              return 'Çisenti';
  if (code <= 67)              return 'Yağmurlu';
  if (code <= 77)              return 'Karlı';
  if (code <= 82)              return 'Sağanaklı';
  if (code <= 86)              return 'Yoğun Kar';
  if (code >= 95)              return 'Fırtınalı';
  return 'Bilinmiyor';
}

// Cache boyutunu döndürür (debug için)
export function getWeatherCacheSize() {
  return weatherCache.size;
}
