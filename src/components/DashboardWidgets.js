import React from 'react';
import {
  Bar , Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// ─── 7 Günlük Kâr/Zarar Projeksiyonu ────────────────────────────
const profitLossData = [
  { day: 'Mon', AI_Forecast: 16000, OB_Forecast: 12000, NetAI: 16500 },
  { day: 'Tue', AI_Forecast: 14000, OB_Forecast: 8000,  NetAI: 7000 },
  { day: 'Wed', AI_Forecast: 21000, OB_Forecast: 10000, NetAI: 9500 },
  { day: 'Thu', AI_Forecast: 21500, OB_Forecast: 12000, NetAI: 11000 },
  { day: 'Fri', AI_Forecast: 18000, OB_Forecast: 11000, NetAI: 9000 },
  { day: 'Sat', AI_Forecast: 11000, OB_Forecast: 0,     NetAI: 15000 },
  { day: 'Sun', AI_Forecast: 10000, OB_Forecast: 6000,  NetAI: 18000 },
];

export function ProfitLossChartWidget() {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-sm">📈 7 Günlük Kâr/Zarar Projeksiyonu</h3>
          <p className="text-gray-500 text-xs">AI vs OB Tahminleri (TL)</p>
        </div>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={profitLossData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="AI_Forecast" name="AI Forecast" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="OB_Forecast" name="OB Forecast" fill="#a3e635" radius={[4, 4, 0, 0]} barSize={15} />
            <Line type="monotone" dataKey="NetAI" name="NetAI Forecast" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Kritik Bakım Takvimi & Sıklığı ────────────────────────────
export function MaintenanceCalendarWidget() {
  const tasks = [
    { name: 'Kanat İnspeksiyonu', date: '12 Tem', status: 'Yaklaşıyor', color: 'bg-yellow-500' },
    { name: 'Rulman Yağlama', date: '15 Tem', status: 'Planlı', color: 'bg-blue-500' },
    { name: 'Inverter Soğutma', date: '18 Tem', status: 'Kritik', color: 'bg-red-500' },
  ];

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-white font-bold text-sm mb-4">📅 Kritik Bakım Takvimi</h3>
      <div className="space-y-3 flex-1">
        {tasks.map(task => (
          <div key={task.name} className="bg-gray-800/40 rounded-xl p-3 flex items-center justify-between border border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${task.color}`} />
              <div>
                <p className="text-gray-200 text-sm font-bold">{task.name}</p>
                <p className="text-gray-500 text-xs">{task.date}</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300">{task.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Korozyon/Aşınma Risk Haritası ──────────────────────────────
export function CorrosionMapWidget() {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col items-center justify-center">
      <h3 className="text-white font-bold text-sm w-full text-left mb-4">🛡️ Korozyon/Aşınma Risk Haritası</h3>
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Simple SVG representation of a turbine with red zones */}
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
          <line x1="50" y1="50" x2="50" y2="90" stroke="#4b5563" strokeWidth="4" />
          <circle cx="50" cy="50" r="4" fill="#9ca3af" />
          {/* Blades */}
          <ellipse cx="50" cy="20" rx="3" ry="30" fill="#9ca3af" />
          <ellipse cx="50" cy="20" rx="3" ry="30" fill="#f43f5e" style={{ transformOrigin: '50px 50px', transform: 'rotate(120deg)' }} />
          <ellipse cx="50" cy="20" rx="3" ry="30" fill="#9ca3af" style={{ transformOrigin: '50px 50px', transform: 'rotate(240deg)' }} />
          
          {/* Risk overlays */}
          <circle cx="25" cy="65" r="15" fill="#ef4444" opacity="0.3" className="animate-pulse" />
          <text x="25" y="68" fill="#fff" fontSize="8" textAnchor="middle">Risk Zone</text>
        </svg>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Kanat-2 yüzeyinde %18 aşınma tespit edildi.</p>
    </div>
  );
}

// ─── Offshore Yatırım (ROI) Projeksiyonu ─────────────────────────
const roiData = [
  { year: '2027', amortisman: -500, gelir: 0 },
  { year: '2028', amortisman: -400, gelir: 120 },
  { year: '2029', amortisman: -200, gelir: 250 },
  { year: '2030', amortisman: 50,   gelir: 380 },
  { year: '2031', amortisman: 350,  gelir: 450 },
];

export function OffshoreROIWidget() {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-white font-bold text-sm mb-4">🌊 Offshore Yatırım (ROI) Projeksiyonu</h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={roiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="year" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Area type="monotone" dataKey="amortisman" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Amortisman" />
            <Area type="monotone" dataKey="gelir" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Beklenen Gelir" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Biyoçeşitlilik (GRI/TSRS) Skoru ────────────────────────────
export function BiodiversityScoreWidget() {
  return (
    <div className="bg-gray-900/80 border border-emerald-700/30 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col items-center justify-center">
      <h3 className="text-white font-bold text-sm w-full text-left mb-4">🌳 Biyoçeşitlilik (GRI/TSRS) Skoru</h3>
      
      <div className="flex items-center justify-around w-full mt-2">
        <div className="text-center">
          <div className="text-4xl mb-2">🦅</div>
          <div className="text-emerald-400 font-black text-2xl">98<span className="text-sm font-normal">/100</span></div>
          <div className="text-gray-500 text-xs mt-1">Kuş Göç Yolu<br/>Koruma Skoru</div>
        </div>
        
        <div className="w-px h-16 bg-gray-700/50"></div>
        
        <div className="text-center">
          <div className="text-4xl mb-2">🐠</div>
          <div className="text-emerald-400 font-black text-2xl">A+</div>
          <div className="text-gray-500 text-xs mt-1">Yapay Resif<br/>Katkısı</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  İK & SOSYAL DÖNÜŞÜM WİDGET'LARI
//  NOT: Tüm değerler PoC Senaryo Verisidir.
//  Gerçek kurumsal İK verisi değildir.
// ════════════════════════════════════════════════════════════════

function PoCBadge() {
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, color: '#d97706',
      background: '#1c1100', padding: '1px 6px',
      borderRadius: 4, border: '1px solid #78350f',
      letterSpacing: '0.05em', flexShrink: 0,
    }}>
      PoC Senaryo Verisi
    </span>
  );
}

// ─── 1. Personel Yetkinlik & Sertifika Durumu ────────────────────
const certData = [
  { name: 'Sertifikası Geçerli', value: 82, color: '#34d399' },
  { name: 'Eğitim Devam',        value: 12, color: '#60a5fa' },
  { name: 'Süresi Dolmuş',       value: 6,  color: '#f87171' },
];

const certifications = [
  { name: 'GWO Sertifikası',           icon: '🔧', pct: 78, color: '#06b6d4' },
  { name: 'Yüksekte Çalışma',          icon: '🪜', pct: 91, color: '#34d399' },
  { name: 'İlk Yardım Sertifikası',    icon: '🏥', pct: 85, color: '#f59e0b' },
  { name: 'Elektrik Yetkilendirme',    icon: '⚡', pct: 72, color: '#a78bfa' },
  { name: 'Offshore Güvenlik Eğitimi', icon: '🌊', pct: 44, color: '#818cf8' },
];

export function PersonnelCompetencyWidget() {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-white font-bold text-sm">🎓 Personel Yetkinlik & Sertifika</h3>
          <p className="text-gray-500 text-xs mt-0.5">Sertifikasyon durumu — saha operasyonları</p>
        </div>
        <PoCBadge />
      </div>

      {/* Donut Chart */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={certData} cx="50%" cy="50%"
                innerRadius={28} outerRadius={44}
                paddingAngle={3} dataKey="value" stroke="none"
              >
                {certData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '11px' }}
                formatter={(v, name) => [`%${v}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          {certData.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-gray-400 text-xs">{d.name}</span>
              </div>
              <span className="font-bold text-xs flex-shrink-0" style={{ color: d.color }}>%{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sertifika Türleri */}
      <div className="flex-1 space-y-2 min-h-0">
        <p className="text-gray-600 text-xs uppercase tracking-widest font-semibold mb-2">Sertifika Türü Dağılımı</p>
        {certifications.map(c => (
          <div key={c.name}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <span>{c.icon}</span><span>{c.name}</span>
              </span>
              <span className="text-xs font-bold flex-shrink-0 ml-1" style={{ color: c.color }}>%{c.pct}</span>
            </div>
            <div className="bg-gray-700/60 rounded-full h-1">
              <div className="h-1 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Vardiya & Operasyon Hazırlığı ─────────────────────────────
const shiftDetails = [
  { shift: 'Sabah (06–14)',          staff: 12, missing: 0, readiness: 100, active: true  },
  { shift: 'Öğleden Sonra (14–22)', staff: 9,  missing: 1, readiness: 89,  active: false },
  { shift: 'Gece (22–06)',           staff: 5,  missing: 0, readiness: 100, active: false },
];

export function ShiftReadinessWidget() {
  const totalStaff  = shiftDetails.reduce((s, d) => s + d.staff, 0);
  const totalMiss   = shiftDetails.reduce((s, d) => s + d.missing, 0);
  const activeShift = shiftDetails.find(d => d.active);
  const overallRdy  = Math.round(shiftDetails.reduce((s, d) => s + d.readiness, 0) / shiftDetails.length);

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-white font-bold text-sm">🕐 Vardiya & Operasyon Hazırlığı</h3>
          <p className="text-gray-500 text-xs mt-0.5">Gerçek zamanlı vardiya takibi</p>
        </div>
        <PoCBadge />
      </div>

      <div className="space-y-2 flex-1">
        {shiftDetails.map(s => (
          <div key={s.shift} className={`rounded-xl p-3 border ${
            s.active ? 'bg-green-900/20 border-green-700/30' : 'bg-gray-800/40 border-gray-700/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {s.active && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                <p className="text-gray-200 text-xs font-semibold">{s.shift}</p>
              </div>
              {s.active
                ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 border border-green-700/40 text-green-300 font-semibold">Aktif</span>
                : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/30 text-gray-600">Beklemede</span>
              }
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-center">
                <p className="text-white text-sm font-bold">{s.staff}</p>
                <p className="text-gray-600 text-xs">Personel</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${s.missing > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {s.missing > 0 ? `${s.missing} Eksik` : '—'}
                </p>
                <p className="text-gray-600 text-xs">Eksiklik</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${s.readiness >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                  %{s.readiness}
                </p>
                <p className="text-gray-600 text-xs">Hazırlık</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Özet KPI'lar */}
      <div className="mt-3 pt-3 border-t border-gray-700/30 grid grid-cols-2 gap-2">
        {[
          { label: 'Toplam Personel', val: `${totalStaff} kişi`,       color: 'text-cyan-400'  },
          { label: 'Aktif Vardiya',   val: activeShift?.shift.split('(')[0].trim() || '—', color: 'text-green-400' },
          { label: 'Eksik Personel',  val: totalMiss > 0 ? `${totalMiss} kişi` : 'Yok', color: totalMiss > 0 ? 'text-yellow-400' : 'text-green-400' },
          { label: 'Op. Hazırlığı',   val: `%${overallRdy}`, color: overallRdy >= 95 ? 'text-green-400' : 'text-yellow-400' },
        ].map(k => (
          <div key={k.label} className="bg-gray-800/40 rounded-lg p-2 text-center">
            <p className={`font-bold text-sm ${k.color}`}>{k.val}</p>
            <p className="text-gray-600 text-xs mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Çalışan Memnuniyeti ──────────────────────────────────────
const satisfactionData = [
  { label: 'Çok Memnun',   pct: 62, color: '#34d399' },
  { label: 'Memnun',       pct: 28, color: '#60a5fa' },
  { label: 'Kararsız',     pct: 8,  color: '#f59e0b' },
  { label: 'Memnun Değil', pct: 2,  color: '#f87171' },
];

export function EmployeeSatisfactionWidget() {
  const score = 89;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-white font-bold text-sm">😊 Çalışan Memnuniyeti</h3>
          <p className="text-gray-500 text-xs mt-0.5">PoC çalışan anketi senaryosu — Q2 2026</p>
        </div>
        <PoCBadge />
      </div>

      {/* SVG Circular Gauge */}
      <div className="flex items-center justify-center mb-4 flex-shrink-0">
        <div className="relative" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="48" cy="48" r="36" fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="36" fill="none"
              stroke="#34d399" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-green-400 font-black text-xl leading-none">{score}</span>
            <span className="text-gray-600 text-xs">/100</span>
          </div>
        </div>
      </div>

      {/* Dağılım Barları */}
      <div className="flex-1 space-y-2">
        {satisfactionData.map(d => (
          <div key={d.label}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">{d.label}</span>
              <span className="text-xs font-bold" style={{ color: d.color }}>%{d.pct}</span>
            </div>
            <div className="bg-gray-700/60 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/30 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600 text-xs">Son Anket</span>
          <span className="text-gray-400 text-xs font-semibold">2026 Q2</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-xs">Katılım Oranı</span>
          <span className="text-cyan-400 text-xs font-semibold">%84</span>
        </div>
      </div>
    </div>
  );
}

// ─── 4. İş Güvenliği & Çalışan Refahı (Tam Genişlik) ────────────
const safetyKPIs = [
  { label: 'Son 90 Gün İş Kazası',       value: '0',     color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-700/30',  icon: '🛡️' },
  { label: 'Ramak Kala Olayı',           value: '2',     color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', icon: '⚠️' },
  { label: 'PPE Kullanım Oranı',         value: '%98',   color: 'text-cyan-400',   bg: 'bg-cyan-900/20',   border: 'border-cyan-700/30',   icon: '🦺' },
  { label: 'Güvenlik Eğitimi',           value: '%96',   color: 'text-blue-400',   bg: 'bg-blue-900/20',   border: 'border-blue-700/30',   icon: '📚' },
  { label: 'Fazla Mesai Riski',          value: 'Düşük', color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-700/30',  icon: '⏱️' },
  { label: 'Çalışan Refah Endeksi',      value: '84/100',color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-700/30', icon: '💚' },
];

export function SafetyWelfareWidget() {
  return (
    <div className="bg-gray-900/80 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-bold text-sm">🦺 İş Güvenliği & Çalışan Refahı</h3>
          <p className="text-gray-500 text-xs mt-0.5">Son 90 gün · Saha operasyonları</p>
        </div>
        <PoCBadge />
      </div>

      <div className="mb-4 p-3 bg-blue-950/30 border border-blue-700/20 rounded-xl">
        <p className="text-blue-300 text-xs leading-relaxed">
          💡 Çalışan güvenliği, yetkinlik gelişimi ve memnuniyet göstergeleri{' '}
          
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {safetyKPIs.map(k => (
          <div key={k.label} className={`rounded-xl p-3 border ${k.bg} ${k.border} text-center`}>
            <div className="text-xl mb-1">{k.icon}</div>
            <div className={`font-black text-lg ${k.color}`}>{k.value}</div>
            <div className="text-gray-500 text-xs mt-1 leading-tight">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'PPE Kullanım Oranı',         pct: 98,  color: '#06b6d4' },
          { label: 'Güvenlik Eğitimi Tamamlama', pct: 96,  color: '#34d399' },
          { label: 'Çalışan Refah Endeksi',      pct: 84,  color: '#a78bfa' },
          { label: 'Olaysız Gün Hedefi',         pct: 100, color: '#10b981' },
        ].map(b => (
          <div key={b.label}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500 text-xs">{b.label}</span>
              <span className="text-xs font-bold" style={{ color: b.color }}>%{b.pct}</span>
            </div>
            <div className="bg-gray-700/50 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
