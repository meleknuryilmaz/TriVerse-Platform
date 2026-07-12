// ============================================================
//  TriVerse — useWeatherData Hook
//  Open-Meteo anlık ve saatlik hava verisi
//  10 dakikada bir otomatik yenileme
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetchDailyForecast,
} from '../services/weatherApi';

const DEFAULT_INTERVAL = 10 * 60 * 1000; // 10 dakika

/**
 * @param {{ lat: number, lon: number }} coords
 * @param {number} [intervalMs=600000]
 * @returns {{
 *   current: object|null,
 *   hourly: object|null,
 *   daily: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   lastUpdated: Date|null,
 *   source: string,
 *   dataType: string,
 *   refetch: Function
 * }}
 */
export function useWeatherData(coords, intervalMs = DEFAULT_INTERVAL) {
  const [current,     setCurrent]     = useState(null);
  const [hourly,      setHourly]      = useState(null);
  const [daily,       setDaily]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [source,      setSource]      = useState('loading');

  const mountedRef = useRef(true);
  const coordsRef  = useRef(coords);
  coordsRef.current = coords;

  const fetchAll = useCallback(async () => {
    if (!coordsRef.current?.lat || !coordsRef.current?.lon) return;
    setLoading(true);
    setError(null);

    try {
      const [cur, hrly, dly] = await Promise.all([
        fetchCurrentWeather(coordsRef.current),
        fetchHourlyForecast(coordsRef.current, 7).catch(() => null),
        fetchDailyForecast  (coordsRef.current).catch(() => null),
      ]);

      if (!mountedRef.current) return;
      setCurrent(cur);
      setHourly(hrly);
      setDaily(dly);
      setLastUpdated(new Date());
      setSource('Open-Meteo Canlı Veri');
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Hava verisi alınamadı');
      setSource('Fallback Veri');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    const id = setInterval(fetchAll, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchAll, intervalMs]);

  return {
    current,
    hourly,
    daily,
    loading,
    error,
    lastUpdated,
    source,
    dataType: source === 'Open-Meteo Canlı Veri' ? 'live' : 'fallback',
    refetch: fetchAll,
  };
}
