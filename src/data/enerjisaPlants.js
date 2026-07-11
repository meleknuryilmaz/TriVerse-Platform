// ============================================================
//  Enerjisa Üretim — Tüm Santraller Veri Seti
//  Kaynak: enerjisauretim.com.tr + Wikipedia/Google Maps
// ============================================================

const ENERJISA_PLANTS = [
  // ── RÜZGAR (RES) ──────────────────────────────────────────
  { id: 'res-01', name: 'Akhisar RES',        type: 'RES', lat: 38.9167, lon: 27.8500, mw: 62,    turbines: 23, il: 'Manisa',      status: 'active' },
  { id: 'res-02', name: 'Akköy RES',          type: 'RES', lat: 37.7833, lon: 29.0833, mw: 25.2,  turbines: 6,  il: 'Denizli',     status: 'active' },
  { id: 'res-03', name: 'Armutçuk RES',       type: 'RES', lat: 41.4000, lon: 31.4167, mw: 84,    turbines: 24, il: 'Zonguldak',   status: 'active' },
  { id: 'res-04', name: 'Arturna RES',        type: 'RES', lat: 41.2000, lon: 32.6000, mw: 90.4,  turbines: 21, il: 'Kastamonu',   status: 'active' },
  { id: 'res-05', name: 'Aydos RES',          type: 'RES', lat: 40.9500, lon: 29.1833, mw: 14,    turbines: 7,  il: 'İstanbul',    status: 'active' },
  { id: 'res-06', name: 'Balıkesir RES',      type: 'RES', lat: 39.6500, lon: 28.0000, mw: 149.3, turbines: 53, il: 'Balıkesir',   status: 'active' },
  { id: 'res-07', name: 'Çanakkale RES',      type: 'RES', lat: 40.1833, lon: 26.4000, mw: 29.9,  turbines: 13, il: 'Çanakkale',   status: 'active' },
  { id: 'res-08', name: 'Çeşme RES',          type: 'RES', lat: 38.2958, lon: 26.3229, mw: 18.9,  turbines: 6,  il: 'İzmir',       status: 'active' },
  { id: 'res-09', name: 'Dağpazarı RES',      type: 'RES', lat: 39.7333, lon: 28.5333, mw: 53,    turbines: 15, il: 'Balıkesir',   status: 'active' },
  { id: 'res-10', name: 'Dampınar RES',       type: 'RES', lat: 38.5500, lon: 27.7167, mw: 46,    turbines: 14, il: 'İzmir',       status: 'active' },
  { id: 'res-11', name: 'Dikili RES',         type: 'RES', lat: 39.0667, lon: 26.8833, mw: 7.2,   turbines: 2,  il: 'İzmir',       status: 'active' },
  { id: 'res-12', name: 'Erciyes RES',        type: 'RES', lat: 38.5333, lon: 35.4500, mw: 78.6,  turbines: 16, il: 'Kayseri',     status: 'active' },
  { id: 'res-13', name: 'Hacıhıdırlar RES',   type: 'RES', lat: 37.5833, lon: 30.2833, mw: 63,    turbines: 5,  il: 'Burdur',      status: 'active' },
  { id: 'res-14', name: 'Harmancık RES',      type: 'RES', lat: 39.6667, lon: 29.2500, mw: 42,    turbines: 10, il: 'Bursa',       status: 'active' },
  { id: 'res-15', name: 'Ihlamur RES',        type: 'RES', lat: 39.5000, lon: 28.2000, mw: 75,    turbines: 25, il: 'Balıkesir',   status: 'active' },
  { id: 'res-16', name: 'Kestanederesi RES',  type: 'RES', lat: 39.8000, lon: 27.6500, mw: 74,    turbines: 18, il: 'Balıkesir',   status: 'active' },
  { id: 'res-17', name: 'Ovacık RES',         type: 'RES', lat: 38.7000, lon: 27.0500, mw: 54.6,  turbines: 13, il: 'İzmir',       status: 'active' },
  { id: 'res-18', name: 'Uygar RES',          type: 'RES', lat: 38.1500, lon: 27.4500, mw: 250,   turbines: 63, il: 'İzmir',       status: 'active' },

  // ── GÜNEŞ (GES) ───────────────────────────────────────────
  { id: 'ges-01', name: 'Bandırma GES',       type: 'GES', lat: 40.3333, lon: 28.0167, mw: 25,    turbines: null, il: 'Balıkesir', status: 'active' },
  { id: 'ges-02', name: 'Karabük GES',        type: 'GES', lat: 41.2000, lon: 32.6333, mw: 12,    turbines: null, il: 'Karabük',   status: 'active' },

  // ── HİDROELEKTRİK (HES) ──────────────────────────────────
  { id: 'hes-01', name: 'Arkun Barajı HES',   type: 'HES', lat: 40.7833, lon: 41.4667, mw: 332,   turbines: null, il: 'Artvin',    status: 'active' },
  { id: 'hes-02', name: 'Çambaşı HES',        type: 'HES', lat: 40.6667, lon: 37.8333, mw: 5,     turbines: null, il: 'Ordu',      status: 'active' },
  { id: 'hes-03', name: 'Dağdelen HES',       type: 'HES', lat: 40.6000, lon: 37.7500, mw: 6.4,   turbines: null, il: 'Ordu',      status: 'active' },
  { id: 'hes-04', name: 'Doğançay HES',       type: 'HES', lat: 40.5500, lon: 37.7000, mw: 8,     turbines: null, il: 'Tokat',     status: 'active' },
  { id: 'hes-05', name: 'Hacınınoğlu HES',    type: 'HES', lat: 40.7000, lon: 37.9000, mw: 28,    turbines: null, il: 'Ordu',      status: 'active' },
  { id: 'hes-06', name: 'Kandil HES',         type: 'HES', lat: 40.6333, lon: 37.8000, mw: 24,    turbines: null, il: 'Ordu',      status: 'active' },
  { id: 'hes-07', name: 'Kavsak Bendi HES',   type: 'HES', lat: 40.5667, lon: 37.6500, mw: 5.5,   turbines: null, il: 'Tokat',     status: 'active' },
  { id: 'hes-08', name: 'Köprü HES',          type: 'HES', lat: 37.4000, lon: 31.3833, mw: 15,    turbines: null, il: 'Konya',     status: 'active' },
  { id: 'hes-09', name: 'Kuşaklı HES',        type: 'HES', lat: 40.3833, lon: 36.7000, mw: 7.5,   turbines: null, il: 'Tokat',     status: 'active' },
  { id: 'hes-10', name: 'Menge HES',          type: 'HES', lat: 40.7167, lon: 37.8500, mw: 6,     turbines: null, il: 'Ordu',      status: 'active' },
  { id: 'hes-11', name: 'Sarıgüzel HES',      type: 'HES', lat: 40.6500, lon: 37.7667, mw: 6,     turbines: null, il: 'Ordu',      status: 'active' },
  { id: 'hes-12', name: 'Yamanlı II HES',     type: 'HES', lat: 40.5833, lon: 37.7167, mw: 5.5,   turbines: null, il: 'Tokat',     status: 'active' },

  // ── DİĞER (DGÇS / Linyit) ────────────────────────────────
  { id: 'dgcs-01', name: 'Bandırma I DGÇS',   type: 'DGÇS', lat: 40.3167, lon: 27.9833, mw: 600,  turbines: null, il: 'Balıkesir', status: 'active' },
  { id: 'dgcs-02', name: 'Bandırma II DGÇS',  type: 'DGÇS', lat: 40.3200, lon: 27.9900, mw: 600,  turbines: null, il: 'Balıkesir', status: 'active' },
  { id: 'dgcs-03', name: 'Kentsa DGÇS',       type: 'DGÇS', lat: 40.7667, lon: 30.3833, mw: 120,  turbines: null, il: 'Kocaeli',   status: 'active' },
  { id: 'oth-01',  name: 'Tufanbeyli Linyit', type: 'Linyit', lat: 38.2667, lon: 36.2333, mw: 450, turbines: null, il: 'Adana',     status: 'active' },

  // ── OFFSHORE (Gelecek Yatırım) ────────────────────────────
  { id: 'off-01', name: 'Çandarlı Offshore',  type: 'Offshore', lat: 38.9200, lon: 26.7800, mw: 0, turbines: 0, il: 'İzmir', status: 'planned' },
];

export default ENERJISA_PLANTS;

// Type renkleri ve ikonları
export const PLANT_TYPE_CONFIG = {
  RES:     { color: '#06b6d4', icon: '💨', label: 'Rüzgar (RES)',       bgClass: 'bg-cyan-900/40',   borderClass: 'border-cyan-600/40',   textClass: 'text-cyan-400'    },
  GES:     { color: '#f59e0b', icon: '☀️', label: 'Güneş (GES)',        bgClass: 'bg-yellow-900/40', borderClass: 'border-yellow-600/40', textClass: 'text-yellow-400'  },
  HES:     { color: '#3b82f6', icon: '💧', label: 'Hidroelektrik (HES)', bgClass: 'bg-blue-900/40',   borderClass: 'border-blue-600/40',   textClass: 'text-blue-400'    },
  DGÇS:    { color: '#a855f7', icon: '🔥', label: 'Doğalgaz (DGÇS)',    bgClass: 'bg-purple-900/40', borderClass: 'border-purple-600/40', textClass: 'text-purple-400'  },
  Linyit:  { color: '#6b7280', icon: '⛏️', label: 'Linyit',             bgClass: 'bg-gray-800/40',   borderClass: 'border-gray-600/40',   textClass: 'text-gray-400'    },
  Offshore:{ color: '#10b981', icon: '🌊', label: 'Offshore (Planlı)',  bgClass: 'bg-emerald-900/40',borderClass: 'border-emerald-600/40',textClass: 'text-emerald-400' },
};
