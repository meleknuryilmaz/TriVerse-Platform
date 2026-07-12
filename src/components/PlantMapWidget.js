// ============================================================
//  TriVerse — Santral Haritası Widget (v2)
//  Yenilikler:
//  - Overpass API'den gerçek türbin konumları (usePlantData)
//  - react-leaflet-cluster ile marker gruplama
//  - 3 filtre katmanı: Enerjisa / Gerçek Türbinler / Offshore
//  - Open-Meteo koordinata göre hava verisi popup
//  - Open-Meteo Elevation API ile rakım bilgisi
//  - Clustering başarısız olursa CircleMarker fallback
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ENERJISA_PLANTS, { PLANT_TYPE_CONFIG } from '../data/enerjisaPlants';
import { fetchCurrentWeather } from '../services/weatherApi';
import { fetchElevation }       from '../services/elevationApi';
import { usePlantData }         from '../hooks/usePlantData';

// ── Marker clustering: fallback destekli ─────────────────────
let MarkerClusterGroup = null;
try {
  // eslint-disable-next-line
  const mod = require('react-leaflet-cluster');
  MarkerClusterGroup = mod.default || mod.MarkerClusterGroup;
} catch {
  // Paket yüklü değilse clustering olmadan devam et
}

// ── Rüzgar gücü tahmini ──────────────────────────────────────
function calcWindPower(capacityMW, windSpeed) {
  if (!capacityMW || windSpeed < 3 || windSpeed > 25) return 0;
  const v = Math.min(windSpeed, 12); // rated speed
  return +(capacityMW * Math.pow((v - 3) / (12 - 3), 2)).toFixed(1);
}

// ── Tek santral / türbin popup ───────────────────────────────
function PlantWeatherPopup({ plant, cfg }) {
  const [weather,   setWeather]   = useState(null);
  const [elevation, setElevation] = useState(null);
  const [status,    setStatus]    = useState('loading');
  const isPlanned = plant.status === 'planned';
  const isOSM     = !!plant.osmId; // Overpass API'den gelen

  useEffect(() => {
    let mounted = true;
    setStatus('loading');

    Promise.all([
      fetchCurrentWeather({ lat: plant.lat, lon: plant.lon }),
      fetchElevation({ lat: plant.lat, lon: plant.lon }).catch(() => null),
    ])
      .then(([w, elev]) => {
        if (!mounted) return;
        setWeather(w);
        setElevation(elev);
        setStatus('ok');
      })
      .catch(() => { if (mounted) setStatus('error'); });

    return () => { mounted = false; };
  }, [plant.lat, plant.lon]);

  const estimatedMW =
    weather && (plant.type === 'RES' || plant.type === 'Offshore' || isOSM)
      ? calcWindPower(plant.mw || plant.outputMW || 2, weather.windSpeed)
      : null;

  const headerColor = cfg?.color || '#06b6d4';

  return (
    <div style={{ minWidth: 220, fontFamily: 'Inter, sans-serif' }}>
      {/* Başlık */}
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: headerColor, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{isOSM ? '🌀' : (cfg?.icon || '⚡')}</span>
        {plant.name || 'Türbin'}
      </div>

      {/* Kaynak etiketi */}
      <div style={{
        fontSize: 8, fontWeight: 700, marginBottom: 6, padding: '2px 6px',
        borderRadius: 4, display: 'inline-block',
        background: isOSM ? '#052e16' : '#0c1a2e',
        border: `1px solid ${isOSM ? '#166534' : '#1e3a5f'}`,
        color: isOSM ? '#34d399' : '#60a5fa',
        letterSpacing: '0.05em',
      }}>
        {isOSM ? 'OpenStreetMap / Overpass API' : 'Enerjisa Portföyü'}
      </div>

      {/* Statik bilgiler */}
      <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.8, marginBottom: 8 }}>
        {plant.il         && <div><b style={{ color: '#d1d5db' }}>İl:</b> {plant.il}</div>}
        {plant.type       && <div><b style={{ color: '#d1d5db' }}>Tip:</b> {cfg?.label || plant.type}</div>}
        {(plant.mw || plant.outputMW) && (
          <div><b style={{ color: '#d1d5db' }}>Kapasite:</b> {plant.mw || plant.outputMW} MW</div>
        )}
        {plant.turbines   && <div><b style={{ color: '#d1d5db' }}>Türbin:</b> {plant.turbines} adet</div>}
        {plant.operator   && plant.operator !== 'Veri mevcut değil' && (
          <div><b style={{ color: '#d1d5db' }}>Operatör:</b> {plant.operator}</div>
        )}
        {plant.model      && plant.model !== 'Bilinmiyor' && (
          <div><b style={{ color: '#d1d5db' }}>Model:</b> {plant.model}</div>
        )}
        {elevation !== null && (
          <div><b style={{ color: '#d1d5db' }}>Rakım:</b> <span style={{ color: '#a78bfa' }}>{Math.round(elevation)} m</span></div>
        )}
        {plant.status !== undefined && (
          <div>
            <b style={{ color: '#d1d5db' }}>Durum:</b>{' '}
            <span style={{ color: isPlanned ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
              {isPlanned ? '📐 Planlanan' : '✅ Aktif'}
            </span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #374151', marginBottom: 8 }} />

      {/* Hava verisi */}
      {status === 'loading' && (
        <div style={{ color: '#6b7280', fontSize: 11, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            display: 'inline-block', width: 12, height: 12,
            border: '2px solid #4b5563', borderTopColor: '#06b6d4',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          Hava verisi yükleniyor…
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: '#f87171', fontSize: 10 }}>⚠ Hava verisi alınamadı</div>
      )}

      {status === 'ok' && weather && (
        <>
          <div style={{ fontSize: 9, color: '#4b5563', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
            Anlık Hava — Open-Meteo API (Gerçek Veri)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px' }}>
            <div style={{ background: '#0c1929', borderRadius: 8, padding: '6px 8px', border: '1px solid #1e3a5f' }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>💨 Rüzgar</div>
              <div style={{ color: '#06b6d4', fontWeight: 800, fontSize: 14 }}>
                {weather.windSpeed} <span style={{ color: '#374151', fontSize: 10, fontWeight: 400 }}>m/s</span>
              </div>
            </div>
            <div style={{ background: '#1a0f00', borderRadius: 8, padding: '6px 8px', border: '1px solid #4d2c00' }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>🌡 Sıcaklık</div>
              <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: 14 }}>
                {weather.temperature}<span style={{ color: '#374151', fontSize: 10, fontWeight: 400 }}>°C</span>
              </div>
            </div>
            {weather.windGusts && (
              <div style={{ background: '#0a0a0a', borderRadius: 8, padding: '6px 8px', border: '1px solid #1f2937' }}>
                <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>💨 Hamle</div>
                <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13 }}>
                  {weather.windGusts.toFixed(1)} <span style={{ color: '#374151', fontSize: 10 }}>m/s</span>
                </div>
              </div>
            )}
            <div style={{ background: '#0a0a0a', borderRadius: 8, padding: '6px 8px', border: '1px solid #1f2937' }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>☀️ GHI</div>
              <div style={{ color: '#6b7280', fontWeight: 600, fontSize: 13 }}>
                {Math.round(weather.ghi)} <span style={{ color: '#374151', fontSize: 10 }}>W/m²</span>
              </div>
            </div>
          </div>

          {estimatedMW !== null && (
            <div style={{
              marginTop: 8, padding: '8px 10px',
              background: 'linear-gradient(135deg, #0c1f2e, #0a1520)',
              borderRadius: 10, border: '1px solid #0e4d6a',
            }}>
              <div style={{ fontSize: 9, color: '#4b5563', marginBottom: 3 }}>
                ⚡ Tahmini Anlık Üretim
                <span style={{ marginLeft: 4, color: '#1e3a5f', fontStyle: 'italic' }}>(Power Curve Hesabı)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: '#06b6d4', fontWeight: 900, fontSize: 18 }}>{estimatedMW}</span>
                <span style={{ color: '#374151', fontSize: 11 }}>MW</span>
                <span style={{ fontSize: 9, color: '#374151', marginLeft: 4, fontStyle: 'italic' }}>— tahmin</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* OSM kaynak linki */}
      {isOSM && plant.sourceUrl && (
        <div style={{ marginTop: 8, fontSize: 9, color: '#374151' }}>
          <a href={plant.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}>
            🔗 OpenStreetMap'te görüntüle
          </a>
        </div>
      )}
    </div>
  );
}

// ── Filtre katman butonları ───────────────────────────────────
const LAYER_FILTERS = [
  { id: 'enerjisa',  label: 'Enerjisa Santralleri', icon: '🏭', color: '#06b6d4' },
  { id: 'turbines',  label: 'Gerçek Türbinler (OSM)', icon: '🌀', color: '#34d399' },
  { id: 'offshore',  label: 'Planlanan Offshore', icon: '🌊', color: '#a78bfa' },
];

function LayerFilterBar({ activeLayers, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {LAYER_FILTERS.map(f => {
        const on = activeLayers.includes(f.id);
        return (
          <button
            key={f.id}
            onClick={() => onToggle(f.id)}
            style={{
              display:    'flex', alignItems: 'center', gap: 5,
              padding:    '4px 10px', borderRadius: 8, fontSize: 11,
              fontWeight: 600, border: `1px solid`,
              borderColor: on ? f.color : '#374151',
              background:  on ? `${f.color}20` : 'transparent',
              color:       on ? f.color : '#6b7280',
              cursor:      'pointer', transition: 'all 0.15s',
            }}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Tip filtre butonları (Enerjisa katmanı için) ──────────────
function TypeFilterBar({ activeTypes, toggleType }) {
  const types = Object.entries(PLANT_TYPE_CONFIG);
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {types.map(([key, cfg]) => {
        const on = activeTypes.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggleType(key)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border transition-all ${
              on
                ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`
                : 'bg-gray-800/40 border-gray-700/40 text-gray-600'
            }`}
          >
            <span style={{ fontSize: 10 }}>{cfg.icon}</span>
            <span style={{ fontSize: 10 }}>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── KPI şeridi ────────────────────────────────────────────────
function MapKPIStrip({ plants, turbineCount, osmSource }) {
  const totalMW  = plants.reduce((s, p) => s + (p.mw || 0), 0);
  const resCount = plants.filter(p => p.type === 'RES').length;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700/40">
      {[
        { label: 'Enerjisa Kapasitesi',  value: `${totalMW.toLocaleString('tr-TR')} MW`, color: 'text-cyan-400' },
        { label: 'OSM Türbin Verisi',    value: `${turbineCount} adet`, color: turbineCount > 0 ? 'text-green-400' : 'text-gray-500' },
        { label: 'RES Santral',          value: `${resCount}`,         color: 'text-purple-400' },
      ].map(m => (
        <div key={m.label} className="text-center">
          <div className={`font-bold text-lg ${m.color}`}>{m.value}</div>
          <div className="text-gray-500 text-xs">{m.label}</div>
        </div>
      ))}
      {osmSource && (
        <div className="col-span-3 text-center">
          <span style={{ fontSize: 9, color: '#374151' }}>
            Türbin verisi: {osmSource}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Ana Widget ────────────────────────────────────────────────
export default function PlantMapWidget() {
  const allTypes                  = Object.keys(PLANT_TYPE_CONFIG);
  const [activeTypes,  setActiveTypes]  = useState(allTypes);
  const [activeLayers, setActiveLayers] = useState(['enerjisa', 'offshore']);

  const { overpassTurbines, enerjisaPlants, loading: turbineLoading, source: osmSource, isLive: osmLive } = usePlantData();

  const toggleType = (type) =>
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const toggleLayer = (id) =>
    setActiveLayers(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);

  const filteredEnerjisa = useMemo(
    () => enerjisaPlants.filter(p => activeTypes.includes(p.type) && p.type !== 'Offshore'),
    [activeTypes]
  );

  const filteredOffshore = useMemo(
    () => enerjisaPlants.filter(p => p.type === 'Offshore'),
    []
  );

  // OSM türbinlerini kümele (clustering yoksa düz liste)
  const turbinesForMap = activeLayers.includes('turbines') ? overpassTurbines : [];

  return (
    <div className="bg-gray-900/80 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-sm flex flex-col">
      {/* Başlık */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-sm">🗺️ Santral Haritası</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            Santrallere tıklayarak anlık hava & tahmini üretim verisi görün
          </p>
        </div>
        <div className="flex gap-2">
          {osmLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold bg-green-900/40 border-green-600/40 text-green-300">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-400" />
              OSM Canlı
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold bg-yellow-900/30 border-yellow-700/40 text-yellow-400">
              Fallback
            </span>
          )}
          {turbineLoading && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold bg-gray-800/60 border-gray-600/40 text-gray-400">
              <span style={{
                width: 10, height: 10, border: '2px solid #4b5563',
                borderTopColor: '#34d399', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', display: 'inline-block',
              }} />
              OSM yükleniyor
            </span>
          )}
        </div>
      </div>

      {/* Katman filtresi */}
      <LayerFilterBar activeLayers={activeLayers} onToggle={toggleLayer} />

      {/* Tip filtresi (Enerjisa aktifse) */}
      {activeLayers.includes('enerjisa') && (
        <TypeFilterBar activeTypes={activeTypes} toggleType={toggleType} />
      )}

      {/* Harita */}
      <div className="rounded-xl overflow-hidden border border-gray-700/40" style={{ height: 400 }}>
        <MapContainer
          center={[39.2, 32.0]}
          zoom={6}
          zoomControl={false}
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          attributionControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Enerjisa Santralleri */}
          {activeLayers.includes('enerjisa') && filteredEnerjisa.map(plant => {
            const cfg       = PLANT_TYPE_CONFIG[plant.type] || PLANT_TYPE_CONFIG.RES;
            const isPlanned = plant.status === 'planned';
            const radius    = Math.max(6, Math.min(20, Math.sqrt(plant.mw) * 1.3));
            return (
              <CircleMarker
                key={plant.id}
                center={[plant.lat, plant.lon]}
                radius={radius}
                pathOptions={{
                  color:       cfg.color,
                  fillColor:   cfg.color,
                  fillOpacity: isPlanned ? 0.25 : 0.6,
                  weight:      isPlanned ? 2 : 1.5,
                  dashArray:   isPlanned ? '5,5' : undefined,
                }}
              >
                <Popup className="enerjisa-popup" maxWidth={250}>
                  <PlantWeatherPopup plant={plant} cfg={cfg} />
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Planlanan Offshore */}
          {activeLayers.includes('offshore') && filteredOffshore.map(plant => {
            const cfg = PLANT_TYPE_CONFIG['Offshore'] || PLANT_TYPE_CONFIG.RES;
            return (
              <CircleMarker
                key={plant.id}
                center={[plant.lat, plant.lon]}
                radius={12}
                pathOptions={{
                  color: '#a78bfa', fillColor: '#a78bfa',
                  fillOpacity: 0.4, weight: 2, dashArray: '4,4',
                }}
              >
                <Popup className="enerjisa-popup" maxWidth={250}>
                  <PlantWeatherPopup plant={plant} cfg={{ ...cfg, color: '#a78bfa', icon: '🌊', label: 'Offshore RES (Planlanan)' }} />
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Gerçek OSM Türbinleri — clustering destekli */}
          {turbinesForMap.length > 0 && (
            MarkerClusterGroup ? (
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={40}
              >
                {turbinesForMap.map(t => (
                  t.lat && t.lon ? (
                    <CircleMarker
                      key={t.id}
                      center={[t.lat, t.lon]}
                      radius={4}
                      pathOptions={{
                        color: '#34d399', fillColor: '#34d399',
                        fillOpacity: 0.7, weight: 1,
                      }}
                    >
                      <Popup className="enerjisa-popup" maxWidth={250}>
                        <PlantWeatherPopup
                          plant={{ ...t, mw: t.outputMW }}
                          cfg={{ color: '#34d399', icon: '🌀', label: 'Rüzgar Türbini (OSM)' }}
                        />
                      </Popup>
                    </CircleMarker>
                  ) : null
                ))}
              </MarkerClusterGroup>
            ) : (
              // Clustering yoksa düz CircleMarker
              turbinesForMap.slice(0, 500).map(t =>
                t.lat && t.lon ? (
                  <CircleMarker
                    key={t.id}
                    center={[t.lat, t.lon]}
                    radius={3}
                    pathOptions={{
                      color: '#34d399', fillColor: '#34d399',
                      fillOpacity: 0.6, weight: 1,
                    }}
                  >
                    <Popup className="enerjisa-popup" maxWidth={250}>
                      <PlantWeatherPopup
                        plant={{ ...t, mw: t.outputMW }}
                        cfg={{ color: '#34d399', icon: '🌀', label: 'Rüzgar Türbini (OSM)' }}
                      />
                    </Popup>
                  </CircleMarker>
                ) : null
              )
            )
          )}
        </MapContainer>
      </div>

      {/* KPI şeridi */}
      <MapKPIStrip
        plants={filteredEnerjisa}
        turbineCount={overpassTurbines.length}
        osmSource={osmSource}
      />
    </div>
  );
}
