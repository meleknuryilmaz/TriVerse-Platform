// ============================================================
//  TriVerse — Elevation API Servisi (Open-Meteo)
//  Koordinatlara göre arazi yüksekliği verir.
//  Endpoint: https://api.open-meteo.com/v1/elevation
//  Auth: Gereksiz — ücretsiz
// ============================================================

const ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';

// Koordinat bazlı cache (key: 'lat_lon')
const elevationCache = new Map();

/**
 * Birden fazla koordinat için yükseklik verisi çeker (batch)
 * @param {Array<{lat: number, lon: number}>} locations
 * @returns {Promise<Array<{lat, lon, elevation}>>}
 */
export async function fetchElevations(locations) {
  if (!locations?.length) return [];

  // Cache'de olmayanları filtrele
  const uncached = locations.filter(({ lat, lon }) => !elevationCache.has(`${lat}_${lon}`));

  if (uncached.length > 0) {
    const latList = uncached.map(l => l.lat).join(',');
    const lonList = uncached.map(l => l.lon).join(',');

    const params = new URLSearchParams({ latitude: latList, longitude: lonList });
    const res    = await fetch(`${ELEVATION_URL}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Elevation API HTTP ${res.status}`);

    const data = await res.json();
    const elevs = data.elevation || [];

    uncached.forEach(({ lat, lon }, i) => {
      elevationCache.set(`${lat}_${lon}`, elevs[i] ?? null);
    });
  }

  // Tümünü döndür (cache + yeni)
  return locations.map(({ lat, lon }) => ({
    lat,
    lon,
    elevation: elevationCache.get(`${lat}_${lon}`) ?? null,
  }));
}

/**
 * Tek koordinat için yükseklik (convenience)
 */
export async function fetchElevation({ lat, lon }) {
  const results = await fetchElevations([{ lat, lon }]);
  return results[0]?.elevation ?? null;
}

/**
 * Cache boyutunu döndürür
 */
export function getElevationCacheSize() {
  return elevationCache.size;
}
