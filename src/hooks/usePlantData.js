// ============================================================
//  TriVerse — usePlantData Hook
//  Önce Overpass API'den gerçek türbinleri çeker.
//  Başarısız olursa ENERJISA_PLANTS verisi döner.
//  Oturum boyunca cache'lenir.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { fetchWindTurbinesInTurkey } from '../services/overpassApi';
import ENERJISA_PLANTS from '../data/enerjisaPlants';

let sessionCache = null; // Oturum boyunca tek seferlik

/**
 * @returns {{
 *   overpassTurbines: Array,
 *   enerjisaPlants: Array,
 *   loading: boolean,
 *   error: string|null,
 *   source: string,
 *   isLive: boolean
 * }}
 */
export function usePlantData() {
  const [overpassTurbines, setOverpassTurbines] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [source,           setSource]           = useState('loading');
  const [isLive,           setIsLive]           = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      // Cache var mı?
      if (sessionCache) {
        setOverpassTurbines(sessionCache.data);
        setSource(sessionCache.source);
        setIsLive(sessionCache.isLive);
        setLoading(false);
        return;
      }

      try {
        const turbines = await fetchWindTurbinesInTurkey();
        if (!mountedRef.current) return;

        // Geçersiz koordinatları filtrele
        const valid = turbines.filter(t => t.lat && t.lon);
        sessionCache = { data: valid, source: 'Overpass API (OpenStreetMap)', isLive: true };
        setOverpassTurbines(valid);
        setSource('Overpass API (OpenStreetMap)');
        setIsLive(true);
        setError(null);
      } catch (err) {
        if (!mountedRef.current) return;
        // Fallback: Enerjisa statik verisi
        sessionCache = { data: [], source: 'Fallback — Enerjisa statik verisi', isLive: false };
        setOverpassTurbines([]);
        setSource('Fallback — Enerjisa statik verisi');
        setIsLive(false);
        setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    load();
    return () => { mountedRef.current = false; };
  }, []);

  return {
    overpassTurbines,
    enerjisaPlants: ENERJISA_PLANTS,
    loading,
    error,
    source,
    isLive,
  };
}

// Session cache'i sıfırla (test veya manuel refresh için)
export function clearPlantCache() {
  sessionCache = null;
}
