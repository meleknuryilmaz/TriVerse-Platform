// ============================================================
//  TriVerse — GBIF Biyoçeşitlilik Servisi
//  Global Biodiversity Information Facility
//  Endpoint: https://api.gbif.org/v1/occurrence/search
//  Auth: Gereksiz — ücretsiz ve açık
//
//  ÖNEMLİ: Bu veri kuş ölümü veya türbin çarpışma riski
//  anlamına GELMEZ. Yalnızca bölgedeki gözlem kaydıdır.
// ============================================================

const GBIF_BASE = 'https://api.gbif.org/v1';

// Kuş sınıfı taxon key (Aves)
const AVES_TAXON_KEY = 212;

/**
 * Belirli koordinat ve yarıçapta tür gözlemlerini çeker
 * @param {object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {number} params.radiusKm Arama yarıçapı (km)
 * @param {number} [params.taxonKey] GBIF taxon key (varsayılan: Aves/Kuşlar)
 * @param {number} [params.limit] Maksimum sonuç
 */
export async function fetchSpeciesOccurrences({
  lat,
  lon,
  radiusKm = 10,
  taxonKey = AVES_TAXON_KEY,
  limit    = 50,
}) {
  const params = new URLSearchParams({
    decimalLatitude:  `${(lat - radiusKm / 111).toFixed(4)},${(lat + radiusKm / 111).toFixed(4)}`,
    decimalLongitude: `${(lon - radiusKm / 85).toFixed(4)},${(lon + radiusKm / 85).toFixed(4)}`,
    taxonKey,
    hasCoordinate:    true,
    hasGeospatialIssue: false,
    limit,
    country:          'TR',
  });

  const res = await fetch(`${GBIF_BASE}/occurrence/search?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`GBIF API HTTP ${res.status}`);

  const data    = await res.json();
  const results = data.results || [];

  // Tür bazında gruplama ve normalize
  const speciesMap = new Map();
  results.forEach(occ => {
    const key = occ.speciesKey || occ.taxonKey || occ.species;
    if (!key) return;
    if (!speciesMap.has(key)) {
      speciesMap.set(key, {
        speciesKey:      key,
        scientificName:  occ.scientificName  || 'Bilinmiyor',
        vernacularName:  occ.vernacularName  || occ.species || 'Bilinmiyor',
        kingdom:         occ.kingdom         || 'Animalia',
        phylum:          occ.phylum          || 'Chordata',
        class:           occ.class           || 'Aves',
        order:           occ.order           || 'Bilinmiyor',
        family:          occ.family          || 'Bilinmiyor',
        occurrenceCount: 0,
        lastObserved:    null,
        sampleLat:       occ.decimalLatitude,
        sampleLon:       occ.decimalLongitude,
        source:          'GBIF',
        dataType:        'live-observation',
        disclaimer:      'Bu veri kuş ölümü veya türbin çarpışma riski anlamına gelmez.',
      });
    }
    const entry = speciesMap.get(key);
    entry.occurrenceCount++;
    const obsDate = occ.eventDate || occ.dateIdentified;
    if (obsDate && (!entry.lastObserved || obsDate > entry.lastObserved)) {
      entry.lastObserved = obsDate;
    }
  });

  return {
    species:     Array.from(speciesMap.values()).sort((a, b) => b.occurrenceCount - a.occurrenceCount),
    total:       data.count || 0,
    returned:    results.length,
    isLive:      true,
    source:      'GBIF — Global Biodiversity Information Facility',
    sourceUrl:   'https://www.gbif.org',
    disclaimer:  'GBIF gözlem verisi, kuş ölümü veya türbin çarpışma riski verisi değildir.',
    searchArea:  { lat, lon, radiusKm },
  };
}

// Statik fallback (API başarısız olursa)
export const GBIF_FALLBACK = {
  species: [
    { scientificName: 'Falco tinnunculus', vernacularName: 'Kerkenez', occurrenceCount: 0, dataType: 'demo', source: 'Demo / Fallback', lastObserved: null },
    { scientificName: 'Buteo buteo',       vernacularName: 'Şahin',    occurrenceCount: 0, dataType: 'demo', source: 'Demo / Fallback', lastObserved: null },
    { scientificName: 'Circus aeruginosus',vernacularName: 'Saz Delicesi', occurrenceCount: 0, dataType: 'demo', source: 'Demo / Fallback', lastObserved: null },
    { scientificName: 'Gyps fulvus',       vernacularName: 'Kızıl Akbaba', occurrenceCount: 0, dataType: 'demo', source: 'Demo / Fallback', lastObserved: null },
  ],
  isLive:     false,
  source:     'Demo / Fallback Verisi',
  disclaimer: 'GBIF bağlantısı başarısız. Demo veri gösteriliyor.',
};
