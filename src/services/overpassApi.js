// ============================================================
//  TriVerse — Overpass API Servisi (OpenStreetMap tabanlı)
//  Türkiye'deki gerçek rüzgar türbinlerini çeker.
//  Endpoint: https://overpass-api.de/api/interpreter
//  Auth: Gereksiz — ücretsiz ve açık
// ============================================================

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Türkiye bounding box
const TURKEY_BBOX = '35.8,25.6,42.1,44.8'; // south,west,north,east

// Oturum boyunca cache (Overpass'a gereksiz istek gitmesin)
let turbineCache = null;
let cacheBbox    = null;

/**
 * Overpass elementini standart formata çevirir
 * Eksik alanlar için 'Bilinmiyor' kullanılır
 */
export function normalizeOverpassElement(element) {
  const tags = element.tags || {};

  // Konum
  let lat = element.lat;
  let lon = element.lon;
  if (!lat && element.center) { lat = element.center.lat; lon = element.center.lon; }

  // Güç çıkışı
  let outputMW = null;
  const generatorOutput = tags['generator:output:electricity'];
  if (generatorOutput) {
    const match = generatorOutput.match(/([\d.]+)\s*(MW|kW|GW)/i);
    if (match) {
      const val  = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      if (unit === 'KW') outputMW = val / 1000;
      else if (unit === 'GW') outputMW = val * 1000;
      else outputMW = val;
    }
  }

  return {
    id:             `osm-${element.id}`,
    osmId:           element.id,
    name:            tags.name || tags['name:tr'] || 'Bilinmiyor',
    lat:             lat     || null,
    lon:             lon     || null,
    operator:        tags.operator || tags['operator:wikidata'] || 'Veri mevcut değil',
    manufacturer:    tags['generator:manufacturer'] || tags.manufacturer || 'Bilinmiyor',
    model:           tags['generator:model'] || tags.model || 'Bilinmiyor',
    outputMW:        outputMW,
    hubHeight:       tags['generator:height'] ? parseFloat(tags['generator:height']) : null,
    rotorDiameter:   tags['rotor:diameter']   ? parseFloat(tags['rotor:diameter'])   : null,
    status:          tags.operational_status || tags['generator:status'] || 'active',
    source:          'OpenStreetMap / Overpass API',
    sourceUrl:       `https://www.openstreetmap.org/${element.type}/${element.id}`,
    rawTags:         tags,
  };
}

/**
 * Belirli bounding box içindeki rüzgar türbinlerini çeker
 * @param {string} bbox 'south,west,north,east'
 */
export async function fetchWindTurbinesByBoundingBox(bbox) {
  if (cacheBbox === bbox && turbineCache) return turbineCache;

  // Overpass QL sorgusu — hem generator hem plant etiketleri
  const query = `
    [out:json][timeout:60];
    (
      node["power"="generator"]["generator:source"="wind"](${bbox});
      way["power"="generator"]["generator:source"="wind"](${bbox});
      node["power"="generator"]["generator:method"="wind_turbine"](${bbox});
      way["power"="plant"]["plant:source"="wind"](${bbox});
    );
    out center tags;
  `.trim();

  const res = await fetch(OVERPASS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `data=${encodeURIComponent(query)}`,
    signal:  AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Overpass API HTTP ${res.status}`);

  const data     = await res.json();
  const elements = (data.elements || []).filter(e => {
    const lat = e.lat || e.center?.lat;
    const lon = e.lon || e.center?.lon;
    return lat && lon;
  });

  const normalized = elements.map(normalizeOverpassElement);
  turbineCache     = normalized;
  cacheBbox        = bbox;
  return normalized;
}

/**
 * Türkiye genelindeki tüm rüzgar türbinlerini çeker
 */
export async function fetchWindTurbinesInTurkey() {
  return fetchWindTurbinesByBoundingBox(TURKEY_BBOX);
}

/**
 * Cache'i temizler (gerekirse manuel sıfırlama için)
 */
export function clearTurbineCache() {
  turbineCache = null;
  cacheBbox    = null;
}
