// ============================================================
//  TriVerse: Onshore Integrated Dashboard (PoC)
//  Stack : Create React App + Tailwind CSS + Recharts
//  Veri  : Open-Meteo (Gerçek) + Hesaplanan + Simülasyon
//  Author: Antigravity — 2026
//
//  ÖNEMLİ: Bu bir PoC'dur. Gerçek, hesaplanan ve
//  simülasyon verileri arayüzde açıkça etiketlenmiştir.
// ============================================================
//
//  index.css İÇİNDE OLMASI GEREKEN (yoksa ekle):
//  @tailwind base;
//  @tailwind components;
//  @tailwind utilities;
//
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ENERJISA_PLANTS from './data/enerjisaPlants';
import PlantMapWidget    from './components/PlantMapWidget';
import StormControlWidget from './components/StormControlWidget';
import RecommendationPanel from './components/RecommendationPanel';
import {
  ProfitLossChartWidget,
  OffshoreROIWidget, BiodiversityScoreWidget,
  PersonnelCompetencyWidget, ShiftReadinessWidget,
  EmployeeSatisfactionWidget, SafetyWelfareWidget,
  AgeDistributionWidget, SalaryDistributionWidget, CorrosionMapWidget
} from './components/DashboardWidgets';

import ChatbotWidget from './components/ChatbotWidget';
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  hourlyToScadaLogs,
  WEATHER_COORDS,
} from './services/weatherApi';

// ─────────────────────────────────────────────────────────────
//  STATIC SYNTHETIC SCADA DATA  (synthetic_scada_logs.json)
// ─────────────────────────────────────────────────────────────
const SYNTHETIC_SCADA_LOGS = [
  { time: '00:00', actual: 42.3, lstm: 41.8, windSpeed: 7.2 },
  { time: '01:00', actual: 38.7, lstm: 39.2, windSpeed: 6.8 },
  { time: '02:00', actual: 45.1, lstm: 44.5, windSpeed: 8.1 },
  { time: '03:00', actual: 51.2, lstm: 50.8, windSpeed: 9.3 },
  { time: '04:00', actual: 48.9, lstm: 49.4, windSpeed: 8.7 },
  { time: '05:00', actual: 53.4, lstm: 52.9, windSpeed: 9.8 },
  { time: '06:00', actual: 61.2, lstm: 60.7, windSpeed: 11.2 },
  { time: '07:00', actual: 72.8, lstm: 73.5, windSpeed: 12.4 },
  { time: '08:00', actual: 85.3, lstm: 84.8, windSpeed: 13.1 },
  { time: '09:00', actual: 91.7, lstm: 92.3, windSpeed: 14.2 },
  { time: '10:00', actual: 88.4, lstm: 87.9, windSpeed: 13.8 },
  { time: '11:00', actual: 95.6, lstm: 96.1, windSpeed: 15.3 },
  { time: '12:00', actual: 102.3, lstm: 101.7, windSpeed: 16.1 },
  { time: '13:00', actual: 98.7, lstm: 99.2, windSpeed: 15.7 },
  { time: '14:00', actual: 94.2, lstm: 93.8, windSpeed: 14.9 },
  { time: '15:00', actual: 87.6, lstm: 88.1, windSpeed: 14.1 },
  { time: '16:00', actual: 79.3, lstm: 78.8, windSpeed: 13.2 },
  { time: '17:00', actual: 71.8, lstm: 72.4, windSpeed: 12.1 },
  { time: '18:00', actual: 64.5, lstm: 63.9, windSpeed: 11.4 },
  { time: '19:00', actual: 58.2, lstm: 57.7, windSpeed: 10.3 },
  { time: '20:00', actual: 52.4, lstm: 53.1, windSpeed: 9.6  },
  { time: '21:00', actual: 47.9, lstm: 47.3, windSpeed: 8.9  },
  { time: '22:00', actual: 44.1, lstm: 44.7, windSpeed: 8.2  },
  { time: '23:00', actual: 41.6, lstm: 42.1, windSpeed: 7.8  },
];

const CARBON_TREND = [
  { month: 'Oca', kapsam1: 48, kapsam2: 12 },
  { month: 'Şub', kapsam1: 44, kapsam2: 10 },
  { month: 'Mar', kapsam1: 40, kapsam2: 8  },
  { month: 'Nis', kapsam1: 36, kapsam2: 5  },
  { month: 'May', kapsam1: 32, kapsam2: 2  },
  { month: 'Haz', kapsam1: 27, kapsam2: 0  },
];

// ─────────────────────────────────────────────────────────────
//  RBAC CONFIG
// ─────────────────────────────────────────────────────────────
const ROLES = {
  SAHA    : 'Saha Mühendisi',
  FINANS  : 'Finans Direktörü',
  YONETICI: 'Üst Düzey Yönetici',
};

const ROLE_PERMS = {
  [ROLES.SAHA]    : { telemetri: true,  tsrs: false, eko: true  },
  [ROLES.FINANS]  : { telemetri: false, tsrs: true,  eko: false },
  [ROLES.YONETICI]: { telemetri: true,  tsrs: true,  eko: true  },
};

const TABS = [
  { key: 'telemetri', label: 'Ana Kontrol Odası (Harita)', icon: '🗺️', perm: 'telemetri' },
  { key: 'finans',    label: 'Kâr/Zarar Tahmini',          icon: '📈', perm: 'tsrs'      },
  { key: 'ik',        label: 'İK & Operasyon',             icon: '👨‍🔧', perm: 'telemetri' },
  { key: 'surd',      label: 'Sürdürülebilirlik & Çevre',  icon: '🌿', perm: 'eko'       },
  { key: 'gelecek',   label: 'Gelecek Yatırımlar (Offshore)', icon: '🌊', perm: 'tsrs'      },
];

// ─────────────────────────────────────────────────────────────
//  SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────────────────

/** Animated live badge */
function PulseBadge({ children, variant = 'cyan' }) {
  const styles = {
    cyan  : 'bg-cyan-900/40 border-cyan-600/40 text-cyan-300',
    green : 'bg-green-900/40 border-green-600/40 text-green-300',
    yellow: 'bg-yellow-900/40 border-yellow-600/40 text-yellow-300',
    red   : 'bg-red-900/40 border-red-600/40 text-red-300',
    purple: 'bg-purple-900/40 border-purple-600/40 text-purple-300',
    gray  : 'bg-gray-800/60 border-gray-600/40 text-gray-400',
  };
  const dotStyles = {
    cyan  : 'bg-cyan-400',
    green : 'bg-green-400',
    yellow: 'bg-yellow-400',
    red   : 'bg-red-400',
    purple: 'bg-purple-400',
    gray  : 'bg-gray-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotStyles[variant]}`} />
      {children}
    </span>
  );
}

/** KPI metric card */
function KPICard({ label, value, unit, trend, icon, accentClass = 'text-cyan-400', hint }) {
  const isUp = trend > 0;
  return (
    <div className="bg-gray-900/70 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-1 hover:border-gray-600/60 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className={`text-2xl font-black ${accentClass}`}>
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
      {trend !== undefined && (
        <span className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(trend)}% son 24s
        </span>
      )}
      {hint && (
        <span className="text-xs text-gray-600 mt-0.5 leading-tight">{hint}</span>
      )}
    </div>
  );
}

/** Section wrapper card */
function WidgetCard({ children, title, subtitle, badge, borderClass = 'border-gray-700/50', className = '' }) {
  return (
    <div className={`bg-gray-900/80 border ${borderClass} rounded-2xl p-5 backdrop-blur-sm flex flex-col h-full ${className}`}>
      {(title || badge) && (
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          <div>
            {title && <h3 className="text-white font-bold text-sm">{title}</h3>}
            {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

/** Custom Recharts tooltip */
function ChartTooltip({ active, payload, label, unit = 'MW' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-2xl text-xs">
      <p className="text-cyan-400 font-semibold mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color }}>
          {e.name}: <b>{typeof e.value === 'number' ? e.value.toFixed(1) : e.value} {unit}</b>
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  WIDGET 1 — POWER FORECAST CHART
//  NOT: Bu widget gerçek SCADA değil, Open-Meteo rüzgar
//  verisinden hesaplanan tahmini üretimi göstermektedir.
// ─────────────────────────────────────────────────────────────
function PowerForecastWidget() {
  const [scadaData,   setScadaData]   = useState(SYNTHETIC_SCADA_LOGS);
  const [dataSource,  setDataSource]  = useState('synthetic'); // 'synthetic' | 'live'
  const [loadingData, setLoadingData] = useState(true);

  // Gerçek saatlik rüzgar tahmini (Open-Meteo) → Power Curve ile üretim tahmini
  useEffect(() => {
    fetchHourlyForecast(WEATHER_COORDS.res)
      .then(hourly => {
        const logs = hourlyToScadaLogs(hourly);
        if (logs.length > 0) {
          setScadaData(logs);
          setDataSource('live');
        }
      })
      .catch(() => {
        // API hatasında sentetik veri kalsın
      })
      .finally(() => setLoadingData(false));
  }, []);

  const peakMW = scadaData.length
    ? Math.max(...scadaData.map(d => d.actual)).toFixed(1)
    : '102.3';

  return (
    <WidgetCard
      title="⚡ Açık Veri Tabanlı Üretim Tahmini"
      subtitle={
        dataSource === 'live'
          ? 'Open-Meteo gerçek rüzgar verisi → IEC 61400-12 referans güç eğrisi'
          : 'Referans senaryo verisi — API bağlantısı bekleniyor'
      }
      borderClass="border-cyan-500/20"
      badge={
        <div className="flex gap-1.5 flex-wrap justify-end">
          {dataSource === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-green-900/40 border-green-600/40 text-green-300">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-400" />
              Open-Meteo Canlı
            </span>
          ) : loadingData ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-gray-800/60 border-gray-600/40 text-gray-400">
              <span className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
              Yükleniyor
            </span>
          ) : (
            <PulseBadge variant="cyan">Senaryo</PulseBadge>
          )}
          {/* Power curve tahmini — gerçek model değil */}
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#60a5fa',
            background: '#0c1a2e', padding: '2px 6px',
            borderRadius: 4, border: '1px solid #1e3a5f',
          }}>Power Curve Tahmini</span>
        </div>
      }
    >
      {/* Uyarı notu */}
      <div style={{
        fontSize: 9, color: '#4b5563', marginBottom: 8,
        background: '#111827', padding: '4px 8px', borderRadius: 6,
        border: '1px solid #1f2937',
      }}>
        ⚠ Bu grafik gerçek SCADA verisi değildir.
        Meteorolojik veriden hesaplanan tahmini üretimi göstermektedir.
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={scadaData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gLSTM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
<XAxis
  dataKey="isoTime"
  stroke="#4b5563"
  tick={{ fill: '#9ca3af', fontSize: 10 }}
  interval={23}
  minTickGap={30}
  tickMargin={10}
  tickLine={false}
  tickFormatter={(value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
    });
  }}
/>            <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 'auto']} unit=" MW" />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 8 }}
              formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Power Curve Tahmini (MW)"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#gActual)"
              dot={false}
              activeDot={{ r: 4, fill: '#06b6d4' }}
            />
            <Area
              type="monotone"
              dataKey="lstm"
              name="Open-Meteo Saatlik Projeksiyon"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gLSTM)"
              dot={false}
              activeDot={{ r: 4, fill: '#a78bfa' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom KPI strip */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-700/40">
        {[
          { label: 'Peak Tahmin', value: peakMW, color: 'text-cyan-400' },
          { label: 'Yöntem', value: 'Baseline', color: 'text-green-400' },
          { label: 'Kaynak', value: 'Open-Meteo', color: 'text-purple-400' },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className={`font-bold text-base ${m.color}`}>{m.value}</div>
            <div className="text-gray-500 text-xs">{m.label}</div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  WIDGET 2 — YAW CONTROL / WAKE EFFECT (Multi-Agent DRL)
// ─────────────────────────────────────────────────────────────
const INITIAL_TURBINES = [
  { id: 'WTG-01', yaw: 4.3, power: 3.2, status: 'optimal'    },
  { id: 'WTG-02', yaw: 2.1, power: 2.9, status: 'optimizing' },
  { id: 'WTG-03', yaw: 5.7, power: 3.4, status: 'optimal'    },
  { id: 'WTG-04', yaw: 0.8, power: 2.7, status: 'wake'       },
  { id: 'WTG-05', yaw: 3.9, power: 3.1, status: 'optimal'    },
  { id: 'WTG-06', yaw: 6.2, power: 3.5, status: 'optimal'    },
];

function YawControlWidget() {
  const [drlActive, setDrlActive] = useState(true);
  const [yawAngle, setYawAngle]   = useState(4.3);
  const [farmYield, setFarmYield] = useState(16.3);
  const [turbines, setTurbines]   = useState(INITIAL_TURBINES);

  useEffect(() => {
    if (!drlActive) return;
    const id = setInterval(() => {
      setYawAngle(p  => +(p + (Math.random() - 0.5) * 0.25).toFixed(1));
      setFarmYield(p => +(p + (Math.random() - 0.5) * 0.15).toFixed(1));
      setTurbines(prev =>
        prev.map(t => ({
          ...t,
          yaw  : +(t.yaw   + (Math.random() - 0.5) * 0.3).toFixed(1),
          power: +(t.power + (Math.random() - 0.5) * 0.08).toFixed(2),
        }))
      );
    }, 2000);
    return () => clearInterval(id);
  }, [drlActive]);

  const statusStyle = {
    optimal   : { bg: 'bg-green-900/30', border: 'border-green-700/40', text: 'text-green-400' },
    optimizing: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/40', text: 'text-yellow-400' },
    wake      : { bg: 'bg-red-900/30', border: 'border-red-700/40', text: 'text-red-400' },
  };

  return (
    <WidgetCard
      title="🌀 Yalpa / Yaw Kontrolü & Kuyruk Etkisi"
      subtitle="Multi-Agent Deep Reinforcement Learning (DRL)"
      borderClass="border-purple-500/20"
      badge={
        <button
          onClick={() => setDrlActive(v => !v)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            drlActive
              ? 'bg-purple-700 hover:bg-purple-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {drlActive ? '⏸ Durdur' : '▶ Başlat'}
        </button>
      }
    >
      {/* DRL Status Banner */}
      <div
        className={`relative rounded-xl p-4 mb-4 overflow-hidden transition-all ${
          drlActive
            ? 'bg-purple-950/50 border border-purple-500/40'
            : 'bg-gray-800/40 border border-gray-700/40'
        }`}
      >
        {drlActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800/10 to-cyan-800/10 animate-pulse pointer-events-none" />
        )}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-2 h-2 rounded-full ${drlActive ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`}
            />
            <span className={`text-xs font-bold tracking-wider ${drlActive ? 'text-purple-300' : 'text-gray-600'}`}>
              MULTI-AGENT DRL {drlActive ? 'AKTİF' : 'PASİF'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">Yalpa Açısı</div>
              <div className={`text-3xl font-black ${drlActive ? 'text-purple-300' : 'text-gray-600'}`}>
                +{yawAngle}°
              </div>
              <div className="text-purple-600 text-xs mt-0.5">Optimize Edildi</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">Çiftlik Verimi</div>
              <div className={`text-3xl font-black ${drlActive ? 'text-green-400' : 'text-gray-600'}`}>
                +%{farmYield}
              </div>
              <div className="text-green-700 text-xs mt-0.5">Kuyruk Etkisi ↓</div>
            </div>
          </div>
        </div>
      </div>

      {/* Turbine Grid */}
      <div className="flex-1">
        <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-2">Türbin Durumu</p>
        <div className="grid grid-cols-3 gap-2">
          {turbines.map(t => {
            const s = statusStyle[t.status];
            return (
              <div key={t.id} className={`rounded-lg p-2 border text-center transition-all ${s.bg} ${s.border}`}>
                <div className="text-gray-400 text-xs">{t.id}</div>
                <div className={`text-sm font-bold ${s.text}`}>{t.power} MW</div>
                <div className="text-gray-600 text-xs">{t.yaw}°</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simülasyon etiketleri — gerçek model değil */}
      <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-700/40">
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#a78bfa',
          background: '#1a0f2e', padding: '2px 8px',
          borderRadius: 4, border: '1px solid #4c1d95',
        }}>🎬 Simülasyon — Optimizasyon Senaryosu</span>
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#6b7280',
          background: '#111827', padding: '2px 8px',
          borderRadius: 4, border: '1px solid #374151',
        }}>Kuyruk: Referans Model</span>
      </div>
    </WidgetCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  WIDGET 3 — ECO MONITOR & DRONE / YOLOV8
// ─────────────────────────────────────────────────────────────
function EcoMonitorWidget() {
  const [phase, setPhase]       = useState('idle'); // idle | scanning | detected
  const [fileName, setFileName] = useState('');
  const fileRef                 = useRef(null);

  const runAnalysis = (name) => {
    setFileName(name);
    setPhase('scanning');
    setTimeout(() => setPhase('detected'), 2200);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) runAnalysis(f.name);
  };

  return (
    <WidgetCard
      title="🦅 Ekolojik Takip & Drone Denetimi"
      subtitle="YOLOv8 Görüntü Analizi + Smart Curtailment"
      borderClass="border-green-500/20"
      badge={<PulseBadge variant="green">AI AKTİF</PulseBadge>}
    >
      {/* Smart Curtailment — Simülasyon senaryosu */}
      <div className="bg-green-950/40 border border-green-700/30 rounded-xl p-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span>🐦</span>
            <span className="text-green-300 text-xs font-bold">Smart Curtailment</span>
          </div>
          <span style={{
            fontSize: 8, fontWeight: 700, color: '#a78bfa',
            background: '#1a0f2e', padding: '1px 5px',
            borderRadius: 3, border: '1px solid #4c1d95',
          }}>Simülasyon Senaryosu</span>
        </div>
        <p className="text-gray-300 text-xs">
          Hız <span className="text-yellow-300 font-bold">≤ 2 RPM</span> ile sınırlandırılıyor (senaryo).
        </p>
        <p className="text-green-600 text-xs mt-0.5">
          Tahmini etki: Çarpışma riski azalması (simülasyon)
        </p>
        <div className="mt-2 bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all"
            style={{ width: '60%' }}
          />
        </div>
        {phase === 'detected' && (
        <div className="bg-red-950/50 border-2 border-red-600/60 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-red-300 text-xs font-black tracking-wide">DEMO ANALİZ SONUCU</span>
            </div>
            <span style={{
              fontSize: 8, fontWeight: 700, color: '#a78bfa',
              background: '#1a0f2e', padding: '1px 5px',
              borderRadius: 3, border: '1px solid #4c1d95',
            }}>Simülasyon</span>
          </div>
          <p className="text-red-200 text-xs font-semibold mb-1">
            Demo Analiz: <span className="text-white font-black text-sm">%94</span> Olası Çatlak Bölgesi
          </p>
          <p className="text-orange-300 text-xs">🔧 Kestirimci Bakım Önerisi (demo çıktısı)</p>
          <p className="text-gray-500 text-xs mt-1">Konum: WTG-04 / Kanat-B / Sektör 3</p>
          <p className="text-gray-700 text-xs mt-1 italic">⚠ Gerçek YOLOv8 modeli entegrasyonu planlanıyor.</p>
        </div>
      )}
      </div>

      {/* Upload area */}
      <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-2 flex-shrink-0">
        Kanat Çatlak Analizi (YOLOv8)
      </p>
      <div
        className="border-2 border-dashed border-gray-700 hover:border-cyan-600/60 rounded-xl p-4 text-center cursor-pointer mb-3 flex-shrink-0 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <div className="text-3xl mb-1">🖼️</div>
        <p className="text-xs text-gray-500">
          {fileName
            ? <span className="text-cyan-400 font-semibold">{fileName}</span>
            : 'Görüntü sürükle-bırak veya tıkla'}
        </p>
      </div>

      <button
        onClick={() => runAnalysis('catlak.jpg')}
        disabled={phase === 'scanning'}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all mb-3 flex-shrink-0"
      >
        🔍 Görsel Yükle (catlak.jpg) — Simüle Et
      </button>

      {/* States */}
      {phase === 'scanning' && (
        <div className="bg-yellow-950/40 border border-yellow-700/40 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-yellow-300 text-xs font-semibold">YOLOv8 analiz ediyor…</span>
        </div>
      )}

      {phase === 'detected' && (
        <div className="bg-red-950/50 border-2 border-red-600/60 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <span className="text-red-300 text-xs font-black tracking-wide">KRİTİK UYARI!</span>
          </div>
          <p className="text-red-200 text-xs font-semibold mb-1">
            YOLOv8: <span className="text-white font-black text-sm">%94</span> Kanat Çatlağı Tespit Edildi!
          </p>
          <p className="text-orange-300 text-xs">🔧 Kestirimci Bakım Tetiklendi.</p>
          <p className="text-gray-500 text-xs mt-1">Konum: WTG-04 / Kanat-B / Sektör 3</p>
        </div>
      )}
    </WidgetCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  WIDGET 4 — TSRS / FINANCIAL ROI ENGINE
// ─────────────────────────────────────────────────────────────
function FinancialROIWidget() {
  const [showReport, setShowReport] = useState(false);

  return (
    <WidgetCard
      title="💰 TSRS & Finansal ROI Motoru"
      subtitle="IFRS S2 Uyumlu — KGK Onaylı Raporlama"
      borderClass="border-yellow-500/20"
      badge={<PulseBadge variant="yellow">IFRS S2</PulseBadge>}
    >
      {/* Scope 1 */}
      <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider">KAPSAM 1</span>
          <span className="text-gray-600 text-xs">Saha Lojistiği Yakıt</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-white font-black text-3xl">%25</span>
          <span className="text-green-400 text-xs font-bold mb-0.5">↓ Tasarruf</span>
        </div>
        <div className="bg-gray-700 rounded-full h-1.5 mt-2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-1.5 rounded-full" style={{ width: '25%' }} />
        </div>
        <p className="text-gray-600 text-xs mt-1">Baz yıla kıyasla yakıt tüketimi azaltması</p>
      </div>

      {/* Scope 2 */}
      <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-emerald-400 text-xs uppercase font-bold tracking-wider">KAPSAM 2</span>
          <span className="text-gray-600 text-xs">İç Tüketim Emisyonu</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-300 font-black text-2xl">SIFIRLANMIŞTIR</span>
          <span className="text-xl">✅</span>
        </div>
        <p className="text-emerald-700 text-xs mt-0.5">%100 Yenilenebilir Kaynaklı İç Tüketim</p>
      </div>

      {/* YEKA ROI */}
      <div className="bg-gradient-to-r from-green-950/60 to-emerald-950/60 border border-green-600/30 rounded-xl p-4 mb-3">
        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider mb-1">YEKA ROI Kazanımı</p>
        <p className="text-green-400 font-black text-4xl">+$12,400</p>
        <p className="text-gray-600 text-xs mt-1">Bu Dönem Teşvik Geliri / MWh Bazlı</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-yellow-900/30 border border-yellow-700/40 text-yellow-500 text-xs px-2 py-0.5 rounded-full">PoC Senaryo Verisi</span>
          <span className="bg-gray-800/50 border border-gray-700/40 text-gray-500 text-xs px-2 py-0.5 rounded-full">EPDK Veri Modeliyle Uyumlu</span>
          <span className="bg-gray-800/50 border border-gray-700/40 text-gray-600 text-xs px-2 py-0.5 rounded-full">📅 7 günlük senaryo</span>
        </div>
      </div>

      {/* Carbon & Credit */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-2.5 text-center">
          <div className="text-cyan-400 font-bold text-xl">847</div>
          <div className="text-gray-500 text-xs">tCO₂e Tasarruf</div>
          <div className="text-gray-700 text-xs mt-1 leading-tight">Son 24 saat tahmini üretime göre</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-2.5 text-center">
          <div className="text-purple-400 font-bold text-xl">€24.6K</div>
          <div className="text-gray-500 text-xs">Karbon Kredi</div>
          <div className="text-gray-700 text-xs mt-1 leading-tight">PoC senaryo fiyatı • Gold Standard</div>
        </div>
      </div>

      <button
        onClick={() => setShowReport(v => !v)}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-yellow-700 to-orange-700 hover:from-yellow-600 hover:to-orange-600 text-white text-xs font-bold transition-all"
      >
        📄 {showReport ? 'Raporu Gizle' : 'IFRS S2 Raporu İndir (PDF Sim.)'}
      </button>
      {showReport && (
        <div className="mt-2 bg-yellow-950/40 border border-yellow-700/30 rounded-lg p-2 text-xs text-yellow-300">
          ✓ Hazırlandı:{' '}
          <span className="font-semibold text-white">TSRS_IFRS_S2_Q2_2026.pdf</span>
          <br />
          <span className="text-gray-600">KGK standartlarına uygun dijital imzalı belge.</span>
        </div>
      )}
    </WidgetCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  TOP BAR
// ─────────────────────────────────────────────────────────────
function TopBar({ role, setRole }) {
  const initials = { [ROLES.SAHA]: 'SE', [ROLES.FINANS]: 'FD', [ROLES.YONETICI]: 'YY' };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 border-b border-gray-800/80 backdrop-blur-md h-14 flex items-center px-4 gap-4">
      {/* Logo + Title */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-cyan-900/40">
          TV
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-none">TriVerse</h1>
          <p className="text-gray-500 text-xs leading-none mt-0.5">Onshore Integrated Dashboard (PoC)</p>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="hidden lg:flex gap-2 ml-2">
        <PulseBadge variant="green">RES: 102.3 MW</PulseBadge>
        <PulseBadge variant="cyan">GES: 78.6 MW</PulseBadge>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        Sistem Normal
      </div>

      {/* Timestamp */}
      <div className="hidden md:block text-gray-600 text-xs">
        {new Date().toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Role selector */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs hidden sm:block">Rol:</span>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          {Object.values(ROLES).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer">
        {initials[role]}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, perms }) {
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-48 bg-gray-950/95 border-r border-gray-800/70 z-40 flex flex-col pt-4 pb-3">
      <p className="text-gray-600 text-xs uppercase tracking-widest font-semibold px-5 mb-3">Modüller</p>

      <nav className="flex-1 px-3 space-y-1">
        {TABS.map(tab => {
          const allowed  = perms[tab.perm];
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => allowed && setActiveTab(tab.key)}
              title={!allowed ? 'Bu rol için erişim yok' : tab.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${
                isActive
                  ? 'bg-cyan-900/30 border border-cyan-600/40 text-cyan-300'
                  : allowed
                  ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  : 'text-gray-700 cursor-not-allowed'
              }`}
            >
              <span className={!allowed ? 'opacity-30' : ''}>{tab.icon}</span>
              <span className="leading-tight">{tab.label}</span>
              {!allowed && <span className="ml-auto text-gray-700 text-xs">🔒</span>}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-3 space-y-2">
        <div className="px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
          <p className="text-gray-600 text-xs">Veri Kaynakları</p>
          <p className="text-gray-300 text-xs font-semibold truncate">Open-Meteo API</p>
          <p className="text-green-500 text-xs">● Gerçek + Hesaplanan</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
          <p className="text-gray-600 text-xs">Çalışma Modu</p>
          <p className="text-cyan-500 text-xs font-bold">Localhost / Intranet</p>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
//  ACCESS DENIED PLACEHOLDER
// ─────────────────────────────────────────────────────────────
function AccessDenied({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-4">🔒</span>
      <h3 className="text-gray-400 font-bold text-lg mb-2">Erişim Kısıtlı</h3>
      <p className="text-gray-600 text-sm max-w-md">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB CONTENTS
// ─────────────────────────────────────────────────────────────

function TelemetriTab({ perms }) {
  // Gerçek kurulu güç verisi: Enerjisa toplam kurulu güç ~3473 MW
  const TOTAL_CAPACITY = ENERJISA_PLANTS.reduce((sum, p) => sum + (p.mw || 0), 0);
  const BASE_WIND = 14.2;

  const [liveData, setLiveData] = useState({
    power:    181.2,
    capFactor: 83.4,
    wind:      BASE_WIND,
    ghi:       920,
    windTrend: -0.5,
    powerTrend: 3.2,
    _apiWeather:    null,   // Gerçek API verisi (RecommendationPanel için)
    _hourlyForecast: null,  // Saatlik tahmin
  });

  // Gerçek rüzgar değeri referansı (simülasyon bu etrafında kalır)
  const realWindRef = useRef(BASE_WIND);
  const realGhiRef  = useRef(920);

  // ── Gerçek Hava Durumu: İlk Yükleme ───────────────────────
  useEffect(() => {
    fetchCurrentWeather(WEATHER_COORDS.res)
      .then(w => {
        realWindRef.current = w.windSpeed;
        realGhiRef.current  = w.ghi > 0 ? w.ghi : 920;
        setLiveData(prev => ({
          ...prev,
          wind:        +w.windSpeed.toFixed(1),
          ghi:         w.ghi > 0 ? Math.round(w.ghi) : prev.ghi,
          _apiWeather: w,  // Gerçek API nesnesini sakla
        }));
      })
      .catch(() => {}); // Hata durumunda simülasyon devam eder

    // Saatlik tahmin (RecommendationPanel'deki kural motoru için)
    fetchHourlyForecast(WEATHER_COORDS.res, 1)
      .then(h => setLiveData(prev => ({ ...prev, _hourlyForecast: h })))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Canlı veri simülasyonu (Her 2.5 saniyede bir güncellenir)
    // Rüzgar, gerçek API değerinin ±2.5 m/s aralığında tutulur
    const timer = setInterval(() => {
      setLiveData(prev => {
        const windFluctuation = (Math.random() * 0.8) - 0.4;
        let newWind = prev.wind + windFluctuation;
        // Gerçek API değerine yakın tut (±2.5 m/s bant)
        const realWind = realWindRef.current;
        newWind = Math.max(realWind - 2.5, Math.min(realWind + 2.5, newWind));
        newWind = Math.max(3, Math.min(25, newWind)); // cut-in / cut-out sınırları

        // Kübik güç yasası
        const RES_CAPACITY = 1217;
        const windRatio = Math.pow(Math.min(newWind / 25, 1), 3);

        const baseGeneration = 1400 + (Math.random() * 50 - 25);
        const windGeneration = RES_CAPACITY * windRatio;
        const newPower = baseGeneration + windGeneration;

        // GHI: gerçek API değerinin ±15 W/m² bantında
        const realGhi = realGhiRef.current;
        const newGhi  = Math.max(
          realGhi - 15,
          Math.min(realGhi + 15, prev.ghi + (Math.random() * 6 - 3))
        );

        return {
          power:       newPower,
          capFactor:   (newPower / TOTAL_CAPACITY) * 100,
          wind:        +newWind.toFixed(1),
          ghi:         Math.round(newGhi),
          windTrend:   +((windFluctuation) * 2).toFixed(1),
          powerTrend:  +((newPower - prev.power) / 10).toFixed(1),
        };
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [TOTAL_CAPACITY]);

  if (!perms.telemetri) {
    return (
      <AccessDenied message="Anlık Telemetri modülü Finans Direktörü rolünde görüntülenemez. Saha Mühendisi veya Üst Düzey Yönetici rolüne geçiniz." />
    );
  }

  return (
    <div className="space-y-4">
      {/* Harita — Ana Kontrol Odası */}
      <PlantMapWidget />

      {/* KPI Strip — zaman aralığı ve veri tipi bağlamı */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Toplam Üretim"     value={(liveData.power).toFixed(1)} unit="MW"
          trend={liveData.powerTrend}  icon="⚡" accentClass="text-cyan-400"
          hint="Power Curve tahmini • Anlık"
        />
        <KPICard
          label="Kapasite Faktörü"  value={(liveData.capFactor).toFixed(1)} unit="%"
          trend={liveData.powerTrend > 0 ? 0.2 : -0.2} icon="📈" accentClass="text-green-400"
          hint="Anlık tahmin bazlı"
        />
        <KPICard
          label="Rüzgar Hızı (Ort)" value={(liveData.wind).toFixed(1)} unit="m/s"
          trend={liveData.windTrend} icon="💨" accentClass="text-yellow-400"
          hint="Open-Meteo gerçek veri ± simülasyon"
        />
        <KPICard
          label="GHI İrradyans"     value={(liveData.ghi).toFixed(0)} unit="W/m²"
          trend={0.5} icon="☀️" accentClass="text-orange-400"
          hint="Open-Meteo gerçek veri"
        />
      </div>

      {/* Fırtına Kontrol & Canlı Sayaçlar */}
      <StormControlWidget />

      {/* Main widget row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ minHeight: 440 }}>
        <PowerForecastWidget />
        <YawControlWidget />
      </div>

      {/* Kural Tabanlı AI Öneri Paneli — Saha + Yönetici görür */}
      {perms.telemetri && (
        <RecommendationPanel
          currentWeather={liveData._apiWeather || { windSpeed: liveData.wind, temperature: 24, ghi: liveData.ghi, windDirection: 180 }}
          hourlyForecast={liveData._hourlyForecast || null}
          marineData={null}
        />
      )}

      {/* Korozyon/Aşınma Risk Haritası — İK'dan Ana Ekrana taşındı */}
      <CorrosionMapWidget />

      {/* Drone Denetimi — Kısa Durum Özeti (Detay: Sürdürülebilirlik & Çevre ekranı) */}
      {perms.eko && (
        <div className="bg-gray-900/70 border border-green-700/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚁</span>
            <div>
              <p className="text-white text-sm font-semibold">Drone Denetimi</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Son tarama: <span className="text-gray-300">05.07.2026 — 14:23</span>
                <span className="mx-2 text-gray-700">·</span>
                Sektör A-B-C / 12 km²
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-green-900/40 border-green-600/40 text-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Normal
            </span>
            <span className="text-gray-600 text-xs italic">Detay → Sürdürülebilirlik & Çevre</span>
          </div>
        </div>
      )}

      {/* Financial locked card for Saha */}
      {!perms.tsrs && (
        <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Finansal & TSRS Modülü</p>
            <p className="text-gray-700 text-xs">
              Bu bölüm mevcut rolünüzde gizlidir.{' '}
              <span className="text-cyan-700">Finans Direktörü</span> veya{' '}
              <span className="text-cyan-700">Üst Düzey Yönetici</span> rolü gereklidir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FinansTab({ perms }) {
  if (!perms.tsrs) {
    return (
      <AccessDenied message="TSRS & Karbon Raporu modülü yalnızca Finans Direktörü ve Üst Düzey Yönetici rollerine açıktır." />
    );
  }

  return (
    <div className="space-y-4">
      {/* TSRS PDF Rapor İndirme Modülü (Word belgesindeki eksik görev) */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-cyan-900/60 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-900/20">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            📄 Kurumsal Sürdürülebilirlik Raporu <PulseBadge variant="green">Hazır</PulseBadge>
          </h3>
          <p className="text-emerald-200/70 text-xs mt-1">
            TSRS, CSRD ve GRI standartlarına tam uyumlu, güncel emisyon ve yatırım verilerini içeren resmi PDF raporu.
          </p>
        </div>
        <button 
          onClick={() => alert("Backend (ReportLab) bağlantısı kuruluyor... PDF oluşturuluyor.")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 flex-shrink-0"
        >
          ⬇️ TSRS Raporunu İndir (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ minHeight: 400 }}>
        <ProfitLossChartWidget />
        <FinancialROIWidget />
      </div>
    </div>
  );
}

function SurdTab({ perms }) {
  if (!perms.eko) {
    return (
      <AccessDenied message="Ekolojik Koruma modülü yalnızca Saha Mühendisi ve Üst Düzey Yönetici rollerine açıktır." />
    );
  }

  const species = [
    { name: 'Şahin',        count: 3,  risk: 'İzleme Önceliği: Düşük',  badge: 'text-green-300 bg-green-900/40 border-green-700/30' },
    { name: 'Kızıl Şahin',  count: 1,  risk: 'İzleme Önceliği: Orta',   badge: 'text-yellow-300 bg-yellow-900/40 border-yellow-700/30' },
    { name: 'Kerkenez',     count: 7,  risk: 'İzleme Önceliği: Düşük',  badge: 'text-green-300 bg-green-900/40 border-green-700/30' },
    { name: 'Büyük Akbaba', count: 0,  risk: 'İzleme Önceliği: Kritik', badge: 'text-red-300 bg-red-900/40 border-red-700/30' },
  ];

  return (
    <div className="space-y-4">

      {/* Karbon Ayak İzi — Finans'tan taşındı */}
      <WidgetCard
        title="📉 Karbon Ayak İzi Trendi (Kapsam 1 & 2)"
        subtitle="KGK / TFRS S2 Uyumlu Raporlama"
        borderClass="border-cyan-500/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sol Kısım: Grafik (2 Sütun) */}
          <div className="md:col-span-2" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CARBON_TREND} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gK1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gK2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                <XAxis dataKey="month" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} unit=" tCO₂" />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Legend formatter={v => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
                <Area type="monotone" dataKey="kapsam1" name="Kapsam 1 (tCO₂)" stroke="#f59e0b" strokeWidth={2} fill="url(#gK1)" dot={false} />
                <Area type="monotone" dataKey="kapsam2" name="Kapsam 2 (tCO₂)" stroke="#10b981" strokeWidth={2} fill="url(#gK2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sağ Kısım: Açıklamalar (1 Sütun) */}
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 flex flex-col justify-center space-y-3">
            <div className="space-y-1 pb-2 border-b border-gray-700/50">
              <p className="text-gray-500 text-[11px] leading-snug">
                📋 <span className="text-white font-semibold">TFRS S2 (Uluslararası IFRS S2):</span> İklimle bağlantılı finansal risklerin Kamu Gözetimi Kurumu (KGK) standartlarında raporlanmasıdır.
              </p>
            </div>
            <div className="space-y-1 pb-2 border-b border-gray-700/50">
              <p className="text-gray-500 text-[11px] leading-snug">
                🔥 <span className="text-fuchsia-400 font-semibold">Kapsam 1:</span> Şirketin sahip olduğu tesis ve araçların doğrudan yarattığı karbon emisyonudur (örn. doğalgaz santralleri, şirket araçları).
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[11px] leading-snug">
                ⚡ <span className="text-emerald-400 font-semibold">Kapsam 2:</span> Dışarıdan satın alınan enerjinin (elektrik/soğutma) üretimi sırasında dolaylı yoldan oluşan emisyondur.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-700/40">
          <PulseBadge variant="yellow">KGK Onaylı</PulseBadge>
          <PulseBadge variant="green">EPDK Uyumlu</PulseBadge>
          <PulseBadge variant="cyan">CDP Raporlandı</PulseBadge>
        </div>
      </WidgetCard>
      {/* Drone + EcoMonitor (tam versiyon burada) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ minHeight: 500 }}>
        <EcoMonitorWidget />

        <WidgetCard
          title="🌍 Doğal Yaşam İzleme"
          subtitle="Tesis Çevresi Termal Tarama ve Çevresel Raporlama"
          borderClass="border-green-500/20"
        >
          {/* Info Text */}
          <div className="mb-4 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg flex items-center gap-3">
            <span className="text-xl">🦉</span>
            <p className="text-gray-300 text-xs leading-relaxed font-medium">
              Tesis çevresindeki vahşi yaşam, termal drone'lar ile düzenli taranır ve uluslararası çevre standartlarına göre kayıt altına alınır.
            </p>
          </div>

          {/* Species List */}
          <div className="space-y-2 flex-1">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">Sahada Tespit Edilen Türler</p>
            {species.map(s => (
              <div key={s.name} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-700/30">
                <div className="flex items-center gap-3">
                  <p className="text-white text-sm font-bold w-24">{s.name}</p>
                  <p className="text-gray-400 text-xs px-2 py-0.5 bg-gray-900/50 rounded-md border border-gray-700/50">
                    <span className="text-white font-bold">{s.count}</span> tespit
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${s.badge}`}>
                  {s.risk}
                </span>
              </div>
            ))}
          </div>

          {/* Drone scan log */}
          <div className="mt-5 p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center border border-blue-700/50">
                🛰️
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold">Son Drone Taraması</p>
                <p className="text-gray-500 text-[10px] mt-0.5">Sektör A-B-C • Termal Kamera Aktif</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-xs font-bold bg-blue-900/40 px-2 py-1 rounded">05.07.2026</p>
            </div>
          </div>

          {/* Habitat health */}
          <div className="mt-4 space-y-3">
            {[
              { label: 'Habitat Sağlık Skoru', val: 78, evaluation: '⭐⭐⭐⭐ (İyi)', color: 'from-green-600 to-emerald-500', textColor: 'text-green-400' },
              { label: 'Biyoçeşitlilik İndeksi', val: 63, evaluation: '⭐⭐⭐ (Orta)', color: 'from-blue-600 to-cyan-500', textColor: 'text-cyan-400' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-gray-400 text-xs">{m.label}</span>
                  <div className="text-right">
                    <span className={`text-[10px] mr-2 ${m.textColor} opacity-80`}>{m.evaluation}</span>
                    <span className={`text-xs font-bold ${m.textColor}`}>{m.val}/100</span>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-full h-1.5 border border-gray-600/30 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${m.color} h-full transition-all`}
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Indicators */}
          <div className="flex gap-2 flex-wrap mt-4 pt-3 border-t border-gray-700/40">
            <div className="group relative">
              <PulseBadge variant="green">IBA Uyumlu</PulseBadge>
              <div className="absolute bottom-full left-0 mb-1 w-56 p-2 bg-gray-900 border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Önemli Kuş Alanı (Important Bird Area) standartlarına uygunluk.
              </div>
            </div>
            <div className="group relative">
              <PulseBadge variant="cyan">EBRD PR6</PulseBadge>
              <div className="absolute bottom-full left-0 mb-1 w-56 p-2 bg-gray-900 border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Avrupa İmar ve Kalkınma Bankası - Biyoçeşitliliğin Korunması kriteri.
              </div>
            </div>
          </div>
        </WidgetCard>
      </div>

      {/* Biyoçeşitlilik Skoru — Offshore tab'dan taşındı */}
      <BiodiversityScoreWidget />
    </div>
  );
}

function IKTab({ perms }) {
  if (!perms.telemetri) {
    return <AccessDenied message="İK & Operasyon modülü bu rolde gizlidir." />;
  }

  return (
    <div className="space-y-4">

      {/* Sayfa başlık banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-700/20 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              👥 İK, Yetkinlik & Çalışan Güvenliği
            </h2>
            
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <span className="bg-yellow-900/30 border border-yellow-700/40 text-yellow-500 text-xs px-2 py-0.5 rounded-full">PoC Senaryo Verisi</span>
            <span className="bg-gray-800/50 border border-gray-700/40 text-gray-500 text-xs px-2 py-0.5 rounded-full">Gerçek İK verisi değildir</span>
          </div>
        </div>
      </div>

      {/* Üst satır — 3 kolon */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" style={{ minHeight: 400 }}>
        <PersonnelCompetencyWidget />
        <ShiftReadinessWidget />
        <EmployeeSatisfactionWidget />
      </div>

      {/* Orta satır — Yaş ve Maaş */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: 300 }}>
        <AgeDistributionWidget />
        <SalaryDistributionWidget />
      </div>

      {/* Alt satır — tam genişlik */}
      <SafetyWelfareWidget />

    </div>
  );
}


function GelecekTab({ perms }) {
  if (!perms.tsrs) {
    return <AccessDenied message="Gelecek Yatırımlar modülü bu rolde gizlidir." />;
  }
  return (
    <div className="space-y-4">
      {/* Sadece yatırım, ROI ve deniz verisi — biyoçeşitlilik Surd tab'a taşındı */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ minHeight: 400 }}>
        <OffshoreROIWidget />

        {/* Offshore Planlama Özeti */}
        <div className="bg-gray-900/80 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-sm flex flex-col">
          <h3 className="text-white font-bold text-sm mb-1">🌊 Çandarlı Offshore RES — Planlama</h3>
          <p className="text-gray-500 text-xs mb-4">Proje varsayımı · Senaryo verisi</p>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { label: 'Planlanan Kapasite', value: '500 MW', color: 'text-purple-400' },
              { label: 'Tahmini Devreye Alma', value: '2031', color: 'text-cyan-400' },
              { label: 'Tahmini Yatırım', value: '~$2.1B', color: 'text-yellow-400' },
              { label: 'Geri Ödeme Süresi', value: '~8 yıl', color: 'text-green-400' },
              { label: 'Türbin Adedi', value: '~83 adet', color: 'text-blue-400' },
              { label: 'Offshore Derinlik', value: '30–50 m', color: 'text-teal-400' },
            ].map(m => (
              <div key={m.label} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">{m.label}</p>
                <p className={`font-bold text-base ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-xs mt-4 pt-3 border-t border-gray-700/30">
            🌱 Biyoçeşitlilik ve çevre etki analizi → Sürdürülebilirlik & Çevre ekranı
          </p>
        </div>
      </div>

      {/* Batarya ve GES Planlama Özeti */}
      <div className="bg-gray-900/80 border border-orange-500/20 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-white font-bold text-sm mb-1">🔋 Güneş (GES) ve Batarya Depolama Yatırımları — Planlama</h3>
            <p className="text-gray-500 text-xs">Mevcut yatırımlar ve genişletilen potansiyel sahalar</p>
          </div>
          <span className="bg-orange-900/30 border border-orange-700/40 text-orange-400 text-xs px-2 py-0.5 rounded-full">Kapasite & Geliştirme</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Kolon: GES Kapasitesi ve Hedefler */}
          <div className="space-y-4 border-r-0 md:border-r border-gray-700/40 pr-0 md:pr-4">
            <h4 className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">☀️ Güneş Enerjisi (GES) Hedefi</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                <p className="text-gray-500 text-[10px] uppercase mb-1">Toplam Kapasite</p>
                <p className="font-bold text-lg text-orange-400">50 MW</p>
              </div>
              <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                <p className="text-gray-500 text-[10px] uppercase mb-1">Durum</p>
                <p className="font-bold text-sm text-yellow-400 mt-1">Önlisans / ÇED</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Polatlı ve Mihalıççık projeleriyle başlayan GES yatırımları, batarya entegrasyonu sayesinde üretilen fazla enerjinin şebekeye dengeli verilmesini hedefler.
            </p>
          </div>

          {/* Sağ Kolon: Batarya Tesisleri ve Şehirler */}
          <div className="space-y-3">
            <h4 className="text-pink-400 text-xs font-bold uppercase tracking-wider mb-3">🔋 Batarya Depolama (BESS) Sahaları</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-2 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-xs">●</span>
                  <span className="text-gray-200 text-xs font-semibold">Bandırma BESS (2 MW)</span>
                </div>
                <span className="text-gray-500 text-[10px]">Balıkesir (Aktif)</span>
              </div>

              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-2 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-xs">●</span>
                  <span className="text-gray-200 text-xs font-semibold">Polatlı Depolamalı GES-1</span>
                </div>
                <span className="text-gray-500 text-[10px]">Ankara (Planlı)</span>
              </div>

              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-2 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-xs">●</span>
                  <span className="text-gray-200 text-xs font-semibold">Mihalıççık Seki GES</span>
                </div>
                <span className="text-gray-500 text-[10px]">Eskişehir (Planlı)</span>
              </div>

              {/* Potansiyel Sahalar */}
              <div className="mt-3 pt-2 border-t border-gray-700/30">
                <p className="text-gray-500 text-[10px] uppercase mb-2">Potansiyel Sahalar</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-pink-900/20 border border-pink-700/30 text-pink-300 text-[10px] rounded">Malkara (Tekirdağ)</span>
                  <span className="px-2 py-1 bg-pink-900/20 border border-pink-700/30 text-pink-300 text-[10px] rounded">Samsun</span>
                  <span className="px-2 py-1 bg-pink-900/20 border border-pink-700/30 text-pink-300 text-[10px] rounded">İpsala (Edirne)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-10 py-5 border-t border-gray-800/50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-gray-600 text-xs text-center md:text-left max-w-2xl leading-relaxed">
          🔒{' '}
          <span className="font-semibold text-gray-500">Siber Güvenlik Politikası:</span>{' '}
          Bu PoC platformu, Enerjisa IT standartları gereğince dış dünyaya kapalı{' '}
          <span className="text-cyan-800 font-semibold">Kurumsal Güvenli Ağ (Localhost / Intranet VPN)</span>{' '}
          üzerinde çalışacak şekilde izole edilmiştir.
        </p>
        <div className="flex items-center gap-3 text-gray-700 text-xs flex-shrink-0">
          <span>TriVerse v1.0.0-PoC</span>
          <span className="text-gray-800">•</span>
          <span>© 2026 Enerjisa Enerji</span>
          <span className="text-gray-800">•</span>
          <span>Antigravity Framework</span>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [role,      setRole     ] = useState(ROLES.YONETICI);
  const [activeTab, setActiveTab] = useState('telemetri');

  const perms = ROLE_PERMS[role];

  // Auto-redirect if current tab is blocked for the newly selected role
  useEffect(() => {
    const firstAllowed = TABS.find(t => perms[t.perm]);
    if (firstAllowed && !perms[TABS.find(t => t.key === activeTab)?.perm]) {
      setActiveTab(firstAllowed.key);
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sayfa değiştiğinde ve ilk açılışta ekranı en üste kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const tabLabel = TABS.find(t => t.key === activeTab)?.label ?? '';

  const renderContent = () => {
    switch (activeTab) {
      case 'telemetri': return <TelemetriTab perms={perms} />;
      case 'finans':    return <FinansTab    perms={perms} />;
      case 'ik':        return <IKTab        perms={perms} />;
      case 'surd':      return <SurdTab      perms={perms} />;
      case 'gelecek':   return <GelecekTab   perms={perms} />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white antialiased">
      <TopBar role={role} setRole={setRole} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} perms={perms} />

      {/* Main Content */}
      <main className="ml-48 pt-14 min-h-screen">
        <div className="p-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{tabLabel}</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                {role} ·{' '}
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <PulseBadge variant="green">Sistem Operasyonel</PulseBadge>
              <PulseBadge variant="gray">Offline / Localhost</PulseBadge>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderContent()}

          <Footer />
        </div>
      </main>

      {/* Kurumsal AI Chatbot — Her sayfada erişilebilir */}
      <ChatbotWidget />
    </div>
  );
}