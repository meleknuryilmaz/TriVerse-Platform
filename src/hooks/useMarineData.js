// ============================================================
//  TriVerse — useMarineData Hook
//  Open-Meteo Marine API (Çandarlı Offshore)
//  30 dakikada bir otomatik yenileme
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';
const DEFAULT_INTERVAL = 30 * 60 * 1000; // 30 dakika

async function fetchMarineRaw(coords) {
  const params = new URLSearchParams({
    latitude:  coords.lat,
    longitude: coords.lon,
    current:   'wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height',
    timezone:  'Europe/Istanbul',
  });
  const res = await fetch(`${MARINE_BASE}?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Marine API HTTP ${res.status}`);
  const data = await res.json();
  const c = data.current || {};
  return {
    waveHeight:         c.wave_height           ?? null,
    waveDirection:      c.wave_direction        ?? null,
    wavePeriod:         c.wave_period           ?? null,
    windWaveHeight:     c.wind_wave_height      ?? null,
    swellWaveHeight:    c.swell_wave_height     ?? null,
    isLive:             true,
    source:             'Open-Meteo Marine API',
    dataType:           'live',
  };
}

// Fallback
const MARINE_FALLBACK = {
  waveHeight:      1.2,
  waveDirection:   270,
  wavePeriod:      7,
  windWaveHeight:  0.8,
  swellWaveHeight: 0.5,
  isLive:          false,
  source:          'Fallback Veri',
  dataType:        'fallback',
};

/**
 * @param {{ lat: number, lon: number }} coords
 * @param {number} [intervalMs=1800000]
 */
export function useMarineData(coords, intervalMs = DEFAULT_INTERVAL) {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);
  const coordsRef  = useRef(coords);
  coordsRef.current = coords;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMarineRaw(coordsRef.current);
      if (!mountedRef.current) return;
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setData(MARINE_FALLBACK);
      setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    const id = setInterval(fetchAll, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchAll, intervalMs]);

  return { data: data ?? MARINE_FALLBACK, loading, error, lastUpdated, refetch: fetchAll };
}
