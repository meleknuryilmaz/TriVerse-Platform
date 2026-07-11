import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Finansal Formüller (İktisat ekibinden) ─────────────────
const TOTAL_RES_CAPACITY_MW = 1217;  // Enerjisa Toplam RES Kapasitesi
const MAX_WIND_SPEED      = 25;      // m/s (rated wind speed)
const CUT_OUT_SPEED       = 25;      // m/s  (90 km/s ≈ 25 m/s)
const GRID_EMISSION_FACTOR = 0.45;   // ton CO₂ / MWh (TR şebeke)
const IREC_PRICE           = 1.5;    // $ / MWh
const CARBON_CREDIT_PRICE  = 4.0;    // $ / ton CO₂ (Gold Standard)

// ─── Güç hesabı ─────────────────────────────────────────────
function calcPowerMW(windSpeed) {
  if (windSpeed < 3) return 0;                    // cut-in
  if (windSpeed > CUT_OUT_SPEED) return 0;        // cut-out (fırtına freni)
  const ratio = Math.min(windSpeed / MAX_WIND_SPEED, 1);
  return TOTAL_RES_CAPACITY_MW * Math.pow(ratio, 3); // kubik wind-power law
}

// ─── Ticking Counter Bileşeni ───────────────────────────────
function TickingCounter({ value, decimals = 1, prefix = '', suffix = '', colorClass = 'text-cyan-400' }) {
  const [display, setDisplay] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(display);
  const startTime = useRef(null);

  useEffect(() => {
    startRef.current = display;
    startTime.current = performance.now();
    const duration = 800;

    const animate = (now) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(startRef.current + (value - startRef.current) * eased);
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className={`font-black tabular-nums ${colorClass}`}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

// ─── Rüzgar Gülü / Pervane SVG ─────────────────────────────
function WindTurbineSVG({ rpm, braking }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 100 100">
        {/* Tower */}
        <line x1="50" y1="50" x2="50" y2="95" stroke="#4b5563" strokeWidth="4" />
        {/* Base */}
        <rect x="40" y="92" width="20" height="5" rx="2" fill="#374151" />
        {/* Hub */}
        <circle cx="50" cy="50" r="5" fill={braking ? '#ef4444' : '#06b6d4'} />
        {/* Blades */}
        <g style={{
          transformOrigin: '50px 50px',
          animation: braking
            ? 'none'
            : `spin ${Math.max(0.2, 6 / Math.max(rpm, 0.1))}s linear infinite`,
        }}>
          <ellipse cx="50" cy="25" rx="4" ry="25" fill={braking ? '#6b7280' : '#06b6d4'} opacity="0.8" />
          <ellipse cx="50" cy="25" rx="4" ry="25" fill={braking ? '#6b7280' : '#06b6d4'} opacity="0.8"
            style={{ transformOrigin: '50px 50px', transform: 'rotate(120deg)' }} />
          <ellipse cx="50" cy="25" rx="4" ry="25" fill={braking ? '#6b7280' : '#06b6d4'} opacity="0.8"
            style={{ transformOrigin: '50px 50px', transform: 'rotate(240deg)' }} />
        </g>
      </svg>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ─── 3-Aşamalı Otonom Çözüm Paneli ─────────────────────────
function AutonomousSolution({ phase, stormActive }) {
  if (!stormActive) return null;

  const solutions = [
    {
      icon: '🛑', title: 'Mühendislik Çözümü — Pitch Control & Fren',
      text: 'Türbin kanatları rüzgara paralel hale getirildi. Mekanik fren kilitlendi. Yapısal stres güvenli sınıra çekildi.',
      delay: 3000, color: 'red',
    },
    {
      icon: '🚢', title: 'Lojistik Çözümü — Hava Penceresi',
      text: 'Fırtına sonrası ilk güvenli bakım zamanı: Çarşamba 04:00-08:00. Çandarlı Limanı bakım gemisine otonom iş emri gönderildi.',
      delay: 6000, color: 'yellow',
    },
    {
      icon: '💹', title: 'Finansal Çözüm — Sanal Santral (VPP)',
      text: 'Fırtına kaynaklı kayıp: $1,200/saat. Enerjisa karasal Balıkesir RES üretimi otonom olarak %8 artırılarak şebeke açığı dengelendi.',
      delay: 9000, color: 'green',
    },
  ];

  const colorMap = {
    red:    { bg: 'bg-red-950/60',    border: 'border-red-600/60',    text: 'text-red-300',    glow: 'shadow-red-900/40' },
    yellow: { bg: 'bg-yellow-950/60', border: 'border-yellow-600/60', text: 'text-yellow-300', glow: 'shadow-yellow-900/40' },
    green:  { bg: 'bg-green-950/60',  border: 'border-green-600/60',  text: 'text-green-300',  glow: 'shadow-green-900/40' },
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
        🤖 AI Otonom Karar Mekanizması
      </p>
      {solutions.map((sol, i) => {
        const active = phase >= i + 1;
        const c = colorMap[sol.color];
        return (
          <div
            key={i}
            className={`rounded-xl p-2.5 border-2 transition-all duration-1000 shadow-lg ${
              active
                ? `${c.bg} ${c.border} ${c.glow} scale-100`
                : 'bg-gray-800/30 border-gray-700/30 opacity-40 scale-95'
            }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base">{sol.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? c.text : 'text-gray-600'}`}>
                {sol.title}
              </span>
              {active && (
                <span className="ml-auto text-[10px] text-green-400 font-bold animate-pulse">✓ ÇÖZÜLDÜ</span>
              )}
              {!active && (
                <span className="ml-auto text-[10px] text-gray-700">Bekliyor...</span>
              )}
            </div>
            {active && (
              <p className="text-gray-300 text-xs leading-snug">{sol.text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Yapısal Stres Göstergesi ───────────────────────────────
function StressGauge({ value, label }) {
  const getColor = (v) => {
    if (v < 40) return 'from-green-500 to-emerald-400';
    if (v < 70) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-rose-400';
  };
  const getTextColor = (v) => {
    if (v < 40) return 'text-green-400';
    if (v < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-500 text-xs">{label}</span>
        <span className={`text-xs font-bold ${getTextColor(value)}`}>{value}%</span>
      </div>
      <div className="bg-gray-700 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${getColor(value)} h-2 rounded-full transition-all duration-1000`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  ANA BİLEŞEN: Fırtına Kontrol Merkezi
// ═════════════════════════════════════════════════════════════
export default function StormControlWidget() {
  // ── State ──────────────────────────────────────────────────
  const [stormActive, setStormActive] = useState(false);
  const [solutionPhase, setSolutionPhase] = useState(0);  // 0=yok, 1=fren, 2=lojistik, 3=vpp
  const [windSpeed, setWindSpeed]   = useState(12);       // m/s
  const [waveHeight, setWaveHeight] = useState(1.2);      // metre
  const [towerStress, setTowerStress] = useState(28);     // %
  const [totalMWh, setTotalMWh]     = useState(0);
  const [totalCO2, setTotalCO2]     = useState(0);
  const [totalUSD, setTotalUSD]     = useState(0);
  const tickRef = useRef(null);

  // ── Normal mod: Verileri simüle et ────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (!stormActive) {
        // Normal rüzgar varyasyonu
        setWindSpeed(prev => {
          const next = prev + (Math.random() - 0.48) * 1.5;
          return Math.max(5, Math.min(22, +next.toFixed(1)));
        });
        setWaveHeight(prev => {
          const next = prev + (Math.random() - 0.5) * 0.15;
          return Math.max(0.5, Math.min(2.5, +next.toFixed(1)));
        });
        setTowerStress(prev => {
          const next = prev + (Math.random() - 0.5) * 3;
          return Math.max(15, Math.min(45, Math.round(next)));
        });
      }
    }, 2000);
    return () => clearInterval(tickRef.current);
  }, [stormActive]);

  // ── Canlı sayaçlar: Enerji üretimi hesapla ────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const power = calcPowerMW(stormActive && solutionPhase >= 1 ? 0 : windSpeed);
      const mwhIncrement = power * (0.1 / 3600); // 100ms (0.1 saniye) üretimi
      if (mwhIncrement > 0) {
        setTotalMWh(prev => prev + mwhIncrement);
        setTotalCO2(prev => prev + mwhIncrement * GRID_EMISSION_FACTOR);
        setTotalUSD(prev => prev + mwhIncrement * (IREC_PRICE + CARBON_CREDIT_PRICE * GRID_EMISSION_FACTOR));
      }
    }, 100);
    return () => clearInterval(id);
  }, [windSpeed, stormActive, solutionPhase]);

  // ── Fırtına tetikleyicisi ─────────────────────────────────
  const triggerStorm = useCallback(() => {
    setStormActive(true);
    setSolutionPhase(0);

    // Fırtına değerleri
    setWindSpeed(29.2);       // ~105 km/s
    setWaveHeight(5.8);
    setTowerStress(92);

    // 3 aşamalı çözüm sıralı animasyon
    setTimeout(() => {
      setSolutionPhase(1);      // Fren
      setTowerStress(45);       // Stres düşer
    }, 3000);
    setTimeout(() => {
      setSolutionPhase(2);      // Lojistik
      setTowerStress(28);
    }, 6000);
    setTimeout(() => {
      setSolutionPhase(3);      // VPP
      setWindSpeed(18);         // Fırtına azalıyor
      setWaveHeight(2.1);
    }, 9000);
  }, []);

  const resetStorm = useCallback(() => {
    setStormActive(false);
    setSolutionPhase(0);
    setWindSpeed(12);
    setWaveHeight(1.2);
    setTowerStress(28);
  }, []);

  // ── Render ─────────────────────────────────────────────────
  const currentPower = calcPowerMW(stormActive && solutionPhase >= 1 ? 0 : windSpeed);
  const braking = stormActive && solutionPhase >= 1;

  return (
    <div className={`bg-gray-900/80 border rounded-2xl p-4 backdrop-blur-sm transition-all duration-1000 ease-in-out ${
      stormActive ? 'border-red-500/60 shadow-[0_0_40px_rgba(220,38,38,0.3)] bg-red-950/20' : 'border-cyan-500/20'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-sm">
            {stormActive ? '🌪️ FIRTINA ALARM — Otonom Kriz Yönetimi' : '⚡ Canlı Üretim & Fırtına Kontrol Merkezi'}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {stormActive ? 'AI Otonom Karar Sistemi Devrede' : 'Open-Meteo Marine API • LSTM Tahmin • Gerçek Zamanlı'}
          </p>
        </div>
        <button
          onClick={stormActive ? resetStorm : triggerStorm}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            stormActive
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 text-white shadow-lg shadow-red-900/40 animate-pulse'
          }`}
        >
          {stormActive ? '✕ Senaryoyu Sıfırla' : '🌪️ Fırtına Senaryosu Tetikle'}
        </button>
      </div>

      {/* Alarm Banner */}
      {stormActive && (
        <div className="bg-gradient-to-r from-red-950/80 to-red-900/40 border-l-4 border-red-500 rounded-r-xl p-2.5 mb-3 animate-pulse shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <p className="text-red-300 text-xs font-black tracking-widest uppercase">
                Kritik Alarm: Ekstrem Fırtına Tespit Edildi
              </p>
              <p className="text-red-200/80 text-[11px] mt-0.5">
                Rüzgar: {windSpeed} m/s ({(windSpeed * 3.6).toFixed(0)} km/s) • Dalga: {waveHeight}m • Kule Stresi: {towerStress}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* SOL: Canlı Veriler + Pervane */}
        <div className="space-y-2">
          {/* Rüzgar + Pervane */}
          <div className={`rounded-xl p-3 border transition-colors duration-1000 ${
            stormActive
              ? 'bg-red-950/30 border-red-800/40'
              : 'bg-gray-800/40 border-gray-700/40'
          }`}>
            <div className="flex items-center gap-4">
              <WindTurbineSVG rpm={windSpeed} braking={braking} />
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Rüzgar Hızı</div>
                    <div className={`text-2xl font-black ${stormActive ? 'text-red-400' : 'text-cyan-400'}`}>
                      {windSpeed} <span className="text-sm font-normal text-gray-500">m/s</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Dalga Boyu</div>
                    <div className={`text-2xl font-black ${waveHeight > 3 ? 'text-red-400' : 'text-blue-400'}`}>
                      {waveHeight} <span className="text-sm font-normal text-gray-500">m</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Anlık Güç</div>
                    <div className={`text-2xl font-black ${braking ? 'text-gray-600' : 'text-green-400'}`}>
                      {currentPower.toFixed(1)} <span className="text-sm font-normal text-gray-500">MW</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Durum</div>
                    <div className={`text-sm font-bold ${braking ? 'text-red-400' : 'text-green-400'}`}>
                      {braking ? '🛑 FRENLENDİ' : '✅ ÜRETİMDE'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yapısal Stres Göstergeleri */}
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-3 space-y-2">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">Yapısal Sağlık</p>
            <StressGauge value={towerStress} label="Kule Titreşim Stresi" />
            <StressGauge value={Math.min(100, Math.round(waveHeight * 15))} label="Dalga Kaynaklı Yük" />
            <StressGauge value={Math.min(100, Math.round(windSpeed * 3.2))} label="Kanat Rüzgar Yükü" />
          </div>
        </div>

        {/* SAĞ: Canlı Sayaçlar + Otonom Çözümler */}
        <div className="space-y-2 flex flex-col justify-between">
          {/* Ticking Counters */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">
              💰 Canlı Yeşil Finans Sayaçları
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                <div>
                  <div className="text-gray-500 text-xs">Üretilen Enerji</div>
                  <div className="text-2xl">
                    <TickingCounter value={totalMWh} decimals={3} suffix=" MWh" colorClass="text-cyan-400" />
                  </div>
                </div>
                <span className="text-3xl">⚡</span>
              </div>
              <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                <div>
                  <div className="text-gray-500 text-xs">Engellenen Karbon</div>
                  <div className="text-2xl">
                    <TickingCounter value={totalCO2} decimals={3} suffix=" tCO₂" colorClass="text-green-400" />
                  </div>
                </div>
                <span className="text-3xl">🌿</span>
              </div>
              <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                <div>
                  <div className="text-gray-500 text-xs">Kazanılan Yeşil Gelir</div>
                  <div className="text-2xl">
                    <TickingCounter value={totalUSD} decimals={2} prefix="$" colorClass="text-yellow-400" />
                  </div>
                </div>
                <span className="text-3xl">💵</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-gray-700/30">
              <span className="text-[10px] text-gray-500">Formül: P = N × C × (v/v_max)³</span>
              <span className="text-[10px] text-gray-500">• EF: 0.45 tCO₂/MWh</span>
            </div>
          </div>

          {/* Otonom Çözüm Paneli */}
          <AutonomousSolution phase={solutionPhase} stormActive={stormActive} />

          {/* Fırtına yokken AI Stratejik Öneri */}
          {!stormActive && (
            <div className="bg-gradient-to-br from-purple-950/40 to-blue-950/40 border border-purple-600/30 rounded-xl p-3 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">🧠</span>
                <span className="text-purple-300 text-xs font-bold">AI Stratejik Öneri</span>
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "Yarın rüzgar hızı düşüyor. Bakımı yarına çekmek ≈ ~12.500 TL tasarruf sağlar.
                Balıkesir RES kapasite faktörü %87'ye çıkabilir."
              </p>
              <p className="text-gray-600 text-xs mt-2">LSTM v2.4 • Güven: %94 • Son güncelleme: şimdi</p>
            </div>
          )}
        </div>
      </div>

      {/* Alt bilgi */}
      <div className="flex gap-2 flex-wrap mt-4 pt-3 border-t border-gray-700/40">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-cyan-900/40 border-cyan-600/40 text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-400" /> Open-Meteo API
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-purple-900/40 border-purple-600/40 text-purple-300">
          LSTM v2.4
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-green-900/40 border-green-600/40 text-green-300">
          I-REC + Gold Standard
        </span>
        {stormActive && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-red-900/40 border-red-600/40 text-red-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> STORM MODE
          </span>
        )}
      </div>
    </div>
  );
}
