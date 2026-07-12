// ============================================================
//  TriVerse — Kural Tabanlı Operasyonel Öneri Paneli
//  decisionEngine.js çıktısını görselleştirir.
//  NOT: Bu panel gerçek eğitilmiş AI modeli değildir.
//  İlk sürüm — Kural Tabanlı Karar Motoru v1
// ============================================================

import React, { useState, useEffect } from 'react';
import { generateOperationalRecommendations, ENGINE_META } from '../services/decisionEngine';

// Önem seviyesi renk şeması
const SEVERITY = {
  critical: {
    bg:     '#1f0909',
    border: '#7f1d1d',
    text:   '#f87171',
    badge:  '#dc2626',
    icon:   '🔴',
    label:  'KRİTİK',
  },
  warning: {
    bg:     '#1c1100',
    border: '#78350f',
    text:   '#fbbf24',
    badge:  '#d97706',
    icon:   '🟡',
    label:  'UYARI',
  },
  info: {
    bg:     '#0c1a2e',
    border: '#1e3a5f',
    text:   '#60a5fa',
    badge:  '#2563eb',
    icon:   '🔵',
    label:  'BİLGİ',
  },
};

function RecommendationCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY[rec.severity] || SEVERITY.info;

  return (
    <div
      style={{
        background:   sev.bg,
        border:       `1px solid ${sev.border}`,
        borderRadius: 10,
        padding:      '10px 12px',
        marginBottom: 8,
        cursor:       'pointer',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Başlık satırı */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 13, marginTop: 1 }}>{sev.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 8, fontWeight: 800, color: '#fff',
              background: sev.badge, padding: '1px 6px',
              borderRadius: 4, letterSpacing: '0.06em',
            }}>
              {sev.label}
            </span>
            <span style={{ fontSize: 9, color: '#6b7280' }}>
              {new Date(rec.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontSize: 9, color: '#374151' }}>·</span>
            <span style={{ fontSize: 9, color: '#4b5563', fontStyle: 'italic' }}>
              Güven: {rec.confidence}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 9, color: '#4b5563' }}>
              {expanded ? '▲' : '▼'}
            </span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: sev.text, marginTop: 4, lineHeight: 1.4 }}>
            {rec.title}
          </div>
        </div>
      </div>

      {/* Genişletilmiş detay */}
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${sev.border}` }}>
          {/* Gerekçe */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
              Gerekçe
            </div>
            <div style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.5 }}>
              {rec.explanation}
            </div>
          </div>

          {/* Önerilen İşlem */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
              Önerilen İşlem
            </div>
            <div style={{
              fontSize: 11, color: '#34d399', lineHeight: 1.5,
              background: '#052e16', padding: '6px 8px', borderRadius: 6,
              border: '1px solid #166534',
            }}>
              {rec.recommendedAction}
            </div>
          </div>

          {/* Veri Kaynağı */}
          <div style={{
            fontSize: 9, color: '#4b5563',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>📡</span>
            <span>Kaynak: {rec.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.currentWeather  useWeatherData hook çıktısı
 * @param {object} props.hourlyForecast  saatlik tahmin verisi
 * @param {object} props.marineData      useMarineData hook çıktısı
 */
export default function RecommendationPanel({ currentWeather, hourlyForecast, marineData }) {
  const [recommendations, setRecommendations] = useState([]);
  const [lastGenerated,   setLastGenerated]   = useState(null);

  // Hava verisi değiştiğinde önerileri yeniden üret
  useEffect(() => {
    if (!currentWeather) return;

    const recs = generateOperationalRecommendations({
      currentWeather,
      hourlyForecast,
      marineData,
    });

    setRecommendations(recs);
    setLastGenerated(new Date());
  }, [
    currentWeather?.windSpeed,
    currentWeather?.windGusts,
    currentWeather?.precipitation,
    currentWeather?.ghi,
    currentWeather?.relativeHumidity,
    marineData?.waveHeight,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const criticalCount = recommendations.filter(r => r.severity === 'critical').length;
  const warningCount  = recommendations.filter(r => r.severity === 'warning').length;

  return (
    <div className="bg-gray-900/80 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-sm">
      {/* Panel başlığı */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            🧠 AI Destekli Operasyonel Öneriler
            {/* "Kural Tabanlı" etiketi — gerçek AI olmadığını belirtir */}
            <span style={{
              fontSize: 8, fontWeight: 700, color: '#a78bfa',
              background: '#1a0f2e', padding: '1px 6px',
              borderRadius: 4, border: '1px solid #4c1d95',
              letterSpacing: '0.05em',
            }}>
              KURAL TABANLI v{ENGINE_META.version}
            </span>
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            Open-Meteo, Marine, türbin konumu ve hesaplanan üretim verilerine dayalı kural tabanlı karar motoru
          </p>
        </div>

        {/* Özet sayaçlar */}
        <div style={{ display: 'flex', gap: 6 }}>
          {criticalCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#f87171',
              background: '#1f0909', padding: '3px 8px',
              borderRadius: 99, border: '1px solid #7f1d1d',
            }}>
              🔴 {criticalCount} Kritik
            </span>
          )}
          {warningCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#fbbf24',
              background: '#1c1100', padding: '3px 8px',
              borderRadius: 99, border: '1px solid #78350f',
            }}>
              🟡 {warningCount} Uyarı
            </span>
          )}
          {recommendations.length === 0 && currentWeather && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#34d399',
              background: '#052e16', padding: '3px 8px',
              borderRadius: 99, border: '1px solid #166534',
            }}>
              ✅ Normal Operasyon
            </span>
          )}
        </div>
      </div>

      {/* Yükleniyor */}
      {!currentWeather && (
        <div style={{ color: '#4b5563', fontSize: 11, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            width: 14, height: 14, border: '2px solid #374151',
            borderTopColor: '#a78bfa', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }} />
          Hava verisi bekleniyor…
        </div>
      )}

      {/* Öneri kartları */}
      {recommendations.length > 0 && (
        <div>
          {recommendations.map(rec => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      {/* Öneri yok — normal durum */}
      {recommendations.length === 0 && currentWeather && (
        <div style={{
          background: '#052e16', border: '1px solid #166534',
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>
              Tüm parametreler normal aralıkta
            </div>
            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
              Mevcut hava ve deniz koşulları operasyonel eşiklerin altında.
            </div>
          </div>
        </div>
      )}

      {/* Alt bilgi */}
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: '1px solid #1f2937',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 9, color: '#374151' }}>
          {ENGINE_META.note}
        </span>
        {lastGenerated && (
          <span style={{ fontSize: 9, color: '#374151' }}>
            {lastGenerated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
