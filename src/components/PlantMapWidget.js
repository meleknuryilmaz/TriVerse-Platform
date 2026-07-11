import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ENERJISA_PLANTS, { PLANT_TYPE_CONFIG } from '../data/enerjisaPlants';

// ── Harita filtre butonları ──────────────────────────────────
function FilterBar({ activeTypes, toggleType }) {
  const types = Object.entries(PLANT_TYPE_CONFIG);
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {types.map(([key, cfg]) => {
        const on = activeTypes.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggleType(key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
              on
                ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`
                : 'bg-gray-800/40 border-gray-700/40 text-gray-600'
            }`}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── KPI özet şeridi ──────────────────────────────────────────
function MapKPIStrip({ plants }) {
  const totalMW = plants.reduce((s, p) => s + p.mw, 0);
  const resCount = plants.filter(p => p.type === 'RES').length;
  const totalPlants = plants.length;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700/40">
      {[
        { label: 'Toplam Kapasite', value: `${totalMW.toLocaleString('tr-TR')} MW`, color: 'text-cyan-400' },
        { label: 'Aktif Santral', value: totalPlants, color: 'text-green-400' },
        { label: 'RES Sayısı', value: resCount, color: 'text-purple-400' },
      ].map(m => (
        <div key={m.label} className="text-center">
          <div className={`font-bold text-lg ${m.color}`}>{m.value}</div>
          <div className="text-gray-500 text-xs">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Ana Harita Widget ────────────────────────────────────────
export default function PlantMapWidget() {
  const allTypes = Object.keys(PLANT_TYPE_CONFIG);
  const [activeTypes, setActiveTypes] = useState(allTypes);

  const toggleType = (type) => {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filtered = useMemo(
    () => ENERJISA_PLANTS.filter(p => activeTypes.includes(p.type)),
    [activeTypes]
  );

  return (
    <div className="bg-gray-900/80 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm">🗺️ Ana Kontrol Odası — Santral Haritası</h3>
          <p className="text-gray-500 text-xs mt-0.5">Enerjisa Üretim Portföyü — Tüm Santraller</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-green-900/40 border-green-600/40 text-green-300">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-400" />
          CANLI
        </span>
      </div>

      {/* Filtre */}
      <FilterBar activeTypes={activeTypes} toggleType={toggleType} />

      {/* Harita */}
      <div className="rounded-xl overflow-hidden border border-gray-700/40" style={{ height: 380 }}>
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

          {filtered.map(plant => {
            const cfg = PLANT_TYPE_CONFIG[plant.type] || PLANT_TYPE_CONFIG.RES;
            const isPlanned = plant.status === 'planned';
            const radius = Math.max(5, Math.min(18, Math.sqrt(plant.mw) * 1.2));

            return (
              <CircleMarker
                key={plant.id}
                center={[plant.lat, plant.lon]}
                radius={radius}
                pathOptions={{
                  color: cfg.color,
                  fillColor: cfg.color,
                  fillOpacity: isPlanned ? 0.3 : 0.6,
                  weight: isPlanned ? 2 : 1.5,
                  dashArray: isPlanned ? '5,5' : undefined,
                }}
              >
                <Popup className="enerjisa-popup">
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
                      {cfg.icon} {plant.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
                      <b>Tip:</b> {cfg.label}<br />
                      <b>İl:</b> {plant.il}<br />
                      <b>Kurulu Güç:</b> {plant.mw} MW<br />
                      {plant.turbines && <><b>Türbin:</b> {plant.turbines} adet<br /></>}
                      <b>Durum:</b>{' '}
                      <span style={{ color: isPlanned ? '#fbbf24' : '#34d399' }}>
                        {isPlanned ? '📐 Planlanan' : '✅ Aktif'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* KPI strip */}
      <MapKPIStrip plants={filtered} />
    </div>
  );
}
