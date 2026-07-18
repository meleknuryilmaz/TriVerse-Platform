// ============================================================
//  TriVerse — AI Destekli Aksiyon Planları (AI Insight Panel)
//  decisionEngine.js çıktısını görselleştirir.
//  SUMMARY + RECOMMENDATION bölümlerine ayrılmıştır.
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
  }, [currentWeather, hourlyForecast, marineData]);

  const criticalCount = recommendations.filter(r => r.severity === 'critical').length;
  const warningCount  = recommendations.filter(r => r.severity === 'warning').length;

  // ── Zaman dilimi etiketi ──
  const hour = new Date().getHours();
  const timeLabel = hour < 12 ? 'MORNING' : hour < 18 ? 'MIDDAY' : 'EVENING';

  // ── Summary maddeleri (hava verisinden türetilen durum analizi) ──
  const summaryItems = [];
  if (currentWeather) {
    summaryItems.push(`Anlık rüzgar hızı ${currentWeather.windSpeed} m/s, sıcaklık ${currentWeather.temperature}°C seviyesinde ölçümlendi.`);
    if (currentWeather.windSpeed > 12)
      summaryItems.push(`Rüzgar hızı 12 m/s üzerinde — RES türbinleri yüksek kapasite faktöründe çalışıyor.`);
    if (currentWeather.windSpeed < 5)
      summaryItems.push(`Rüzgar hızı düşük seviyede. Üretim kapasitesi kısıtlı olabilir, HES dengeleme devreye alınabilir.`);
    if (currentWeather.ghi > 600)
      summaryItems.push(`GHI irradyans ${Math.round(currentWeather.ghi)} W/m² — GES panelleri verimli üretim bandında.`);
    if (currentWeather.ghi <= 200 && currentWeather.ghi > 0)
      summaryItems.push(`GHI irradyans düşük (${Math.round(currentWeather.ghi)} W/m²). Bulutlu hava GES verimini sınırlıyor.`);
    summaryItems.push(`Sistem yönü genel olarak dengeli kaldı; rüzgar yönü ${currentWeather.windDirection}° olarak kaydedildi.`);
  }

  // ── Recommendation maddeleri (aksiyona yönelik öneriler) ──
  const recommendItems = [];
  if (currentWeather) {
    if (currentWeather.windSpeed > 20)
      recommendItems.push('Yüksek rüzgar beklentisi nedeniyle fırtına koruma protokolü değerlendirilebilir.');
    if (currentWeather.windSpeed > 12)
      recommendItems.push('Yüksek rüzgar bandında RES üretimini maksimize etmek için Yaw optimizasyonu uygulanabilir.');
    if (currentWeather.ghi > 600)
      recommendItems.push('GES sahalarında panel temizlik takvimi öne çekilebilir — yüksek GHI fırsatı.');
    recommendItems.push('Günlük PTF takibi ile üretim-satış dengesinin optimize edilmesi önerilir.');
    if (currentWeather.windSpeed < 5)
      recommendItems.push('Düşük rüzgar döneminde HES ve DGÇS ile dengeleme stratejisi aktive edilebilir.');
    recommendItems.push('Korozyon izleme modülündeki verilerin saha ekibiyle haftalık olarak gözden geçirilmesi tavsiye edilir.');
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm shadow-xl shadow-black/20">
      {/* Panel başlığı */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>AI</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-100 font-bold text-sm tracking-wide">AI DECISION ENGINE</span>
              <span className="text-slate-600 text-xs">|</span>
              <span className="text-indigo-400 text-xs font-medium tracking-wider">{timeLabel}</span>
            </div>
            <p className="text-slate-400/80 text-[11px] mt-0.5">
              Open-Meteo verisi + kural tabanlı karar motoru v{ENGINE_META.version}
            </p>
          </div>
        </div>

        {/* Özet sayaçlar */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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

      {/* ═══════════ SUMMARY & RECOMMENDATION BÖLÜMÜ ═══════════ */}
      {currentWeather && (
        <div className="space-y-4">

          {/* ── SUMMARY + RECOMMENDATION KUTUSU ── */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-inner">
            
            {/* SUMMARY */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-700/60 pb-1.5">
                <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                  Mevcut Durum Analizi
                </span>
              </div>
              <div className="space-y-3">
                {summaryItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-slate-500 text-[10px] mt-1.5">◆</span>
                    <span className="text-slate-300 text-[13px] leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMMENDATION */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-indigo-900/60 pb-1.5">
                <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase">
                  Sistem Önerileri
                </span>
              </div>
              <div className="space-y-3">
                {recommendItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-indigo-500 text-[10px] mt-1.5">▶</span>
                    <span className="text-indigo-100 text-[13px] leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Detaylı Uyarı Kartları (varsa) ── */}
          {recommendations.length > 0 && (
            <div>
              <p className="text-gray-600 text-xs font-bold tracking-wider uppercase mb-2">Detaylı Uyarılar</p>
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}

          {/* Öneri yok — normal durum */}
          {recommendations.length === 0 && (
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
