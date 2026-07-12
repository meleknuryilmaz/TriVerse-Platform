// ============================================================
//  TriVerse — Veri Kaynakları Durum Paneli
//  Her API'nin durumunu, son güncelleme zamanını ve
//  veri tipini (Gerçek / Hesaplanan / Simülasyon) gösterir
// ============================================================

import React from 'react';

// Durum renk ve ikon şeması
const STATUS_CONFIG = {
  live:       { color: '#34d399', bg: '#052e16', border: '#166534', icon: '●', label: 'Bağlı' },
  fallback:   { color: '#fbbf24', bg: '#1c1100', border: '#78350f', icon: '◐', label: 'Fallback' },
  error:      { color: '#f87171', bg: '#1f0909', border: '#7f1d1d', icon: '✕', label: 'Hata' },
  loading:    { color: '#60a5fa', bg: '#0c1a2e', border: '#1e3a5f', icon: '○', label: 'Yükleniyor' },
  planned:    { color: '#6b7280', bg: '#111827', border: '#374151', icon: '○', label: 'Planlanıyor' },
  simulation: { color: '#a78bfa', bg: '#1a0f2e', border: '#4c1d95', icon: '◈', label: 'Simülasyon' },
};

// Veri tipi etiketi
const DATA_TYPE_LABELS = {
  'live':               { text: 'Gerçek Açık Veri',  color: '#34d399' },
  'calculated':         { text: 'Hesaplanan Veri',   color: '#60a5fa' },
  'project-assumption': { text: 'Proje Varsayımı',   color: '#fbbf24' },
  'simulation':         { text: 'Simülasyon',        color: '#a78bfa' },
  'fallback':           { text: 'Fallback / Demo',   color: '#9ca3af' },
};

function formatTime(date) {
  if (!date) return null;
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function SourceRow({ name, status, dataType, lastUpdated, note }) {
  const cfg       = STATUS_CONFIG[status]   || STATUS_CONFIG.loading;
  const typeLabel = DATA_TYPE_LABELS[dataType] || DATA_TYPE_LABELS['fallback'];
  const timeStr   = formatTime(lastUpdated);

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          8,
      padding:      '5px 8px',
      borderRadius: 8,
      background:   cfg.bg,
      border:       `1px solid ${cfg.border}`,
      marginBottom: 4,
    }}>
      {/* Durum ikonu */}
      <span style={{ color: cfg.color, fontSize: 10, fontWeight: 900, minWidth: 10 }}>
        {cfg.icon}
      </span>

      {/* İsim + Not */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        {note && (
          <div style={{ fontSize: 9, color: '#6b7280', marginTop: 1 }}>{note}</div>
        )}
      </div>

      {/* Veri tipi */}
      <span style={{
        fontSize: 8, fontWeight: 700, color: typeLabel.color,
        whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {typeLabel.text}
      </span>

      {/* Son güncelleme / Durum */}
      <div style={{ textAlign: 'right', minWidth: 40 }}>
        {timeStr ? (
          <span style={{ fontSize: 9, color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>
            {timeStr}
          </span>
        ) : (
          <span style={{ fontSize: 9, color: cfg.color, fontWeight: 600 }}>
            {cfg.label}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.weatherStatus   { status, lastUpdated }
 * @param {object} props.marineStatus    { status, lastUpdated }
 * @param {object} props.overpassStatus  { status, lastUpdated }
 * @param {object} props.gbifStatus      { status, lastUpdated }
 * @param {boolean} props.collapsed
 * @param {Function} props.onToggle
 */
export default function DataSourceStatus({
  weatherStatus  = { status: 'loading', lastUpdated: null },
  marineStatus   = { status: 'loading', lastUpdated: null },
  overpassStatus = { status: 'loading', lastUpdated: null },
  gbifStatus     = { status: 'planned', lastUpdated: null },
  collapsed      = false,
  onToggle,
}) {
  const sources = [
    {
      name:        'Open-Meteo Forecast',
      status:       weatherStatus.status,
      dataType:     weatherStatus.status === 'live' ? 'live' : 'fallback',
      lastUpdated:  weatherStatus.lastUpdated,
      note:         'Rüzgar, sıcaklık, GHI, yağış',
    },
    {
      name:        'Open-Meteo Marine',
      status:       marineStatus.status,
      dataType:     marineStatus.status === 'live' ? 'live' : 'fallback',
      lastUpdated:  marineStatus.lastUpdated,
      note:         'Dalga yüksekliği, yön, periyot',
    },
    {
      name:        'Overpass API (OSM)',
      status:       overpassStatus.status,
      dataType:     overpassStatus.status === 'live' ? 'live' : 'fallback',
      lastUpdated:  overpassStatus.lastUpdated,
      note:         'Gerçek türbin konumları',
    },
    {
      name:        'GBIF Biyoçeşitlilik',
      status:       gbifStatus.status,
      dataType:     gbifStatus.status === 'live' ? 'live' : gbifStatus.status === 'planned' ? 'fallback' : 'fallback',
      lastUpdated:  gbifStatus.lastUpdated,
      note:         gbifStatus.status === 'planned' ? 'Yakında eklenecek' : 'Tür gözlemleri',
    },
    {
      name:        'EPİAŞ Piyasa Fiyatı',
      status:       'fallback',
      dataType:     'simulation',
      lastUpdated:  null,
      note:         'PoC fiyat senaryosu',
    },
    {
      name:        'SCADA Üretim',
      status:       'planned',
      dataType:     'simulation',
      lastUpdated:  null,
      note:         'Hesaplanan tahmin kullanılıyor',
    },
  ];

  if (collapsed) {
    const liveCount = sources.filter(s => s.status === 'live').length;
    return (
      <button
        onClick={onToggle}
        style={{
          display:    'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: 10, padding: '4px 0',
        }}
      >
        <span style={{ color: '#34d399', fontSize: 8 }}>●</span>
        {liveCount} Canlı Kaynak
        <span style={{ fontSize: 8 }}>▲</span>
      </button>
    );
  }

  return (
    <div style={{
      background:   '#0d1117',
      border:       '1px solid #1f2937',
      borderRadius: 12,
      padding:      '10px 12px',
    }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          📡 Veri Kaynakları
        </span>
        {onToggle && (
          <button
            onClick={onToggle}
            style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 10 }}
          >
            ▼
          </button>
        )}
      </div>

      {/* Kaynaklar */}
      {sources.map(s => (
        <SourceRow key={s.name} {...s} />
      ))}

      {/* Alt not */}
      <div style={{ marginTop: 8, fontSize: 8, color: '#374151', lineHeight: 1.5 }}>
        Gerçek Açık Veri · Hesaplanan · Proje Varsayımı · Simülasyon
      </div>
    </div>
  );
}
