import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
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

// ─── İK & Operasyon (İş Gücü Dağılımı) ────────────────────────
const hrData = [
  { name: 'Mühendis', value: 45, color: '#06b6d4' },
  { name: 'Teknisyen', value: 35, color: '#f59e0b' },
  { name: 'İdari', value: 20, color: '#8b5cf6' },
];

export function HROpsWidget() {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-white font-bold text-sm mb-4">👥 İş Gücü & Maaş Dağılımı</h3>
      <div className="flex-1 flex items-center justify-between min-h-[200px]">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={hrData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {hrData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 space-y-3">
          {hrData.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1 text-sm text-gray-300">{item.name}</div>
              <div className="text-sm font-bold text-white">%{item.value}</div>
            </div>
          ))}
        </div>
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
