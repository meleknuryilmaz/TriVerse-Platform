import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ENERJISA_PLANTS, { PLANT_TYPE_CONFIG } from '../data/enerjisaPlants';
import { fetchCurrentWeather } from '../services/weatherApi';

// ── Rüzgar gücü tahmini (kübik yasa) ────────────────────────
function calcWindPower(capacityMW, windSpeed) {
  if (!capacityMW || windSpeed < 3 || windSpeed > 25) return 0;
  return capacityMW * Math.pow(Math.min(windSpeed / 25, 1), 3);
}

// ── Tıklanan Santral için Canlı Hava Popup'ı ─────────────────
// Popup açıldığında (bileşen mount olduğunda) o santralin
// koordinatından Open-Meteo API'ye istek gider.
function PlantWeatherPopup({ plant, cfg }) {
  const [weather, setWeather] = useState(null);
  const [status,  setStatus]  = useState('loading'); // 'loading' | 'ok' | 'error'
  const isPlanned = plant.status === 'planned';

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    setWeather(null);

    fetchCurrentWeather({ lat: plant.lat, lon: plant.lon })
      .then(w  => { if (mounted) { setWeather(w); setStatus('ok'); } })
      .catch(() => { if (mounted) setStatus('error'); });

    return () => { mounted = false; };
  }, [plant.lat, plant.lon]);

  // RES / Offshore için tahmini anlık üretim
  const estimatedMW =
    weather && (plant.type === 'RES' || plant.type === 'Offshore')
      ? calcWindPower(plant.mw, weather.windSpeed).toFixed(1)
      : null;

  // Kapasite kullanım oranı
  const utilizationPct =
    estimatedMW && plant.mw > 0
      ? ((estimatedMW / plant.mw) * 100).toFixed(0)
      : null;

  return (
    <div style={{ minWidth: 210, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Başlık ── */}
      <div style={{
        fontWeight: 800, fontSize: 13, marginBottom: 6,
        color: cfg.color, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 16 }}>{cfg.icon}</span>
        {plant.name}
      </div>

      {/* ── Statik Santral Bilgileri ── */}
      <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.75, marginBottom: 8 }}>
        <b style={{ color: '#d1d5db' }}>Tip:</b> {cfg.label}<br />
        <b style={{ color: '#d1d5db' }}>İl:</b> {plant.il}<br />
        <b style={{ color: '#d1d5db' }}>Kurulu Güç:</b> {plant.mw} MW<br />
        {plant.turbines && (
          <><b style={{ color: '#d1d5db' }}>Türbin:</b> {plant.turbines} adet<br /></>
        )}
        <b style={{ color: '#d1d5db' }}>Durum:</b>{' '}
        <span style={{ color: isPlanned ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
          {isPlanned ? '📐 Planlanan' : '✅ Aktif'}
        </span>
      </div>

      {/* ── Ayırıcı ── */}
      <div style={{ borderTop: '1px solid #374151', marginBottom: 8 }} />

      {/* ── Hava Verisi Bölümü ── */}
      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 11 }}>
          <span style={{
            display: 'inline-block', width: 12, height: 12,
            border: '2px solid #4b5563', borderTopColor: '#06b6d4',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          Anlık hava verisi çekiliyor…
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: '#ef4444', fontSize: 11 }}>
          ⚠ Hava verisi alınamadı
        </div>
      )}

      {status === 'ok' && weather && (
        <>
          {/* Kaynak etiketi */}
          <div style={{
            fontSize: 9, color: '#4b5563', textTransform: 'uppercase',
            letterSpacing: '0.07em', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#06b6d4', display: 'inline-block',
            }} />
            Anlık Hava — Open-Meteo API
          </div>

          {/* Hava metrikleri grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>

            {/* Rüzgar Hızı */}
            <div style={{
              background: '#0c1929', borderRadius: 8, padding: '6px 8px',
              border: '1px solid #1e3a5f',
            }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>💨 Rüzgar Hızı</div>
              <div style={{ color: '#06b6d4', fontWeight: 800, fontSize: 15 }}>
                {weather.windSpeed}
                <span style={{ color: '#374151', fontSize: 10, fontWeight: 400 }}> m/s</span>
              </div>
            </div>

            {/* Sıcaklık */}
            <div style={{
              background: '#1a0f00', borderRadius: 8, padding: '6px 8px',
              border: '1px solid #4d2c00',
            }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>🌡 Sıcaklık</div>
              <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: 15 }}>
                {weather.temperature}
                <span style={{ color: '#374151', fontSize: 10, fontWeight: 400 }}>°C</span>
              </div>
            </div>

            {/* GHI — GES için öne çıkar, diğerleri için de göster */}
            <div style={{
              background: '#1a1000', borderRadius: 8, padding: '6px 8px',
              border: plant.type === 'GES' ? '1px solid #78350f' : '1px solid #1f2937',
              gridColumn: plant.type === 'GES' ? '1 / -1' : undefined,
            }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>☀️ GHI İrradyans</div>
              <div style={{
                color: plant.type === 'GES' ? '#fbbf24' : '#6b7280',
                fontWeight: plant.type === 'GES' ? 800 : 600,
                fontSize: 14,
              }}>
                {Math.round(weather.ghi)}
                <span style={{ color: '#374151', fontSize: 10, fontWeight: 400 }}> W/m²</span>
              </div>
            </div>

            {/* Yön */}
            <div style={{
              background: '#0a0a0a', borderRadius: 8, padding: '6px 8px',
              border: '1px solid #1f2937',
              display: plant.type === 'GES' ? 'none' : undefined,
            }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 2 }}>🧭 Rüzgar Yönü</div>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14 }}>
                {weather.windDirection}
                <span style={{ color: '#374151', fontSize: 10, fontWeight: 400 }}>°</span>
              </div>
            </div>
          </div>

          {/* Tahmini Anlık Üretim — sadece RES / Offshore */}
          {estimatedMW !== null && (
            <div style={{
              marginTop: 8, padding: '8px 10px',
              background: 'linear-gradient(135deg, #0c1f2e, #0a1520)',
              borderRadius: 10, border: '1px solid #0e4d6a',
            }}>
              <div style={{ color: '#4b5563', fontSize: 9, marginBottom: 3 }}>
                ⚡ Tahmini Anlık Üretim
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ color: '#06b6d4', fontWeight: 900, fontSize: 18 }}>
                  {estimatedMW}
                </span>
                <span style={{ color: '#374151', fontSize: 11 }}>MW</span>
                {utilizationPct && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                    color: Number(utilizationPct) > 50 ? '#34d399' : '#f59e0b',
                    background: Number(utilizationPct) > 50 ? '#052e16' : '#1c1100',
                    padding: '2px 6px', borderRadius: 99,
                  }}>
                    %{utilizationPct} kapasite
                  </span>
                )}
              </div>
              <div style={{ color: '#374151', fontSize: 9, marginTop: 2 }}>
                P = {plant.mw} MW × ({weather.windSpeed}/25)³
              </div>
            </div>
          )}

          {/* HES notu */}
          {plant.type === 'HES' && (
            <div style={{
              marginTop: 8, fontSize: 10, color: '#4b5563',
              fontStyle: 'italic',
            }}>
              💧 Hidroelektrik üretim su debisine bağlıdır; rüzgar bağımsız gösterilmiştir.
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
  const totalMW    = plants.reduce((s, p) => s + p.mw, 0);
  const resCount   = plants.filter(p => p.type === 'RES').length;
  const totalPlants = plants.length;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700/40">
      {[
        { label: 'Toplam Kapasite', value: `${totalMW.toLocaleString('tr-TR')} MW`, color: 'text-cyan-400' },
        { label: 'Aktif Santral',   value: totalPlants,                              color: 'text-green-400' },
        { label: 'RES Sayısı',      value: resCount,                                 color: 'text-purple-400' },
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
          <p className="text-gray-500 text-xs mt-0.5">
            Enerjisa Üretim Portföyü — Santrallere tıklayarak anlık hava verisini görün
          </p>
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
            const cfg       = PLANT_TYPE_CONFIG[plant.type] || PLANT_TYPE_CONFIG.RES;
            const isPlanned = plant.status === 'planned';
            const radius    = Math.max(5, Math.min(18, Math.sqrt(plant.mw) * 1.2));

            return (
              <CircleMarker
                key={plant.id}
                center={[plant.lat, plant.lon]}
                radius={radius}
                pathOptions={{
                  color:       cfg.color,
                  fillColor:   cfg.color,
                  fillOpacity: isPlanned ? 0.3 : 0.6,
                  weight:      isPlanned ? 2 : 1.5,
                  dashArray:   isPlanned ? '5,5' : undefined,
                }}
              >
                {/* Tıklanınca PlantWeatherPopup mount olur → API çağrısı tetiklenir */}
                <Popup className="enerjisa-popup" maxWidth={240}>
                  <PlantWeatherPopup plant={plant} cfg={cfg} />
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
