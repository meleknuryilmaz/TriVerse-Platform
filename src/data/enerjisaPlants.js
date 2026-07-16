// ============================================================
//  Enerjisa Üretim — Tüm Santraller Veri Seti
//  Kaynak: enerjisauretim.com.tr + Wikipedia/Google Maps
// ============================================================

const ENERJISA_PLANTS = [
  // ── RÜZGAR (RES) ──────────────────────────────────────────
  { id: 'res-01', name: 'Akhisar RES',        type: 'RES', lat: 38.9167, lon: 27.8500, mw: 62,    turbines: 23, il: 'Manisa',      status: 'active', desc: 'Manisa Akhisar bölgesinde rüzgar koridorunda yer alan, bölgenin sanayi tesislerine temiz enerji sağlayan önemli rüzgar santralimiz.' },
  { id: 'res-02', name: 'Akköy RES',          type: 'RES', lat: 37.7833, lon: 29.0833, mw: 25.2,  turbines: 6,  il: 'Denizli',     status: 'active', desc: 'Denizli Akköy mevkiinde, zorlu coğrafi koşullara göre optimize edilmiş yüksek verimli pervanelere sahip butik rüzgar tesisimiz.' },
  { id: 'res-03', name: 'Armutçuk RES',       type: 'RES', lat: 41.4000, lon: 31.4167, mw: 84,    turbines: 24, il: 'Zonguldak',   status: 'active', desc: 'Karadeniz rüzgarlarını değerlendiren Zonguldak Armutçuk tesisimiz, yerel şebeke istikrarına büyük katkı sağlamaktadır.' },
  { id: 'res-04', name: 'Arturna RES',        type: 'RES', lat: 41.2000, lon: 32.6000, mw: 90.4,  turbines: 21, il: 'Kastamonu',   status: 'active', desc: 'Kastamonu yükseklerinde kurulu, kış koşullarına dayanıklı anti-icing sistemlerine sahip yüksek kapasiteli rüzgar parkımız.' },
  { id: 'res-05', name: 'Aydos RES',          type: 'RES', lat: 40.9500, lon: 29.1833, mw: 14,    turbines: 7,  il: 'İstanbul',    status: 'active', desc: 'İstanbul Anadolu yakasında yer alan Aydos santrali, şehrin artan enerji talebine yenilenebilir bir yanıt sunuyor.' },
  { id: 'res-06', name: 'Balıkesir RES',      type: 'RES', lat: 39.6500, lon: 28.0000, mw: 149.3, turbines: 53, il: 'Balıkesir',   status: 'active', desc: 'Türkiye’nin en büyük rüzgar santrallerinden biri olan Balıkesir RES, 53 türbiniyle ulusal şebekemizin dev enerji üretim merkezidir.' },
  { id: 'res-07', name: 'Çanakkale RES',      type: 'RES', lat: 40.1833, lon: 26.4000, mw: 29.9,  turbines: 13, il: 'Çanakkale',   status: 'active', desc: 'Boğazın güçlü ve sürekli rüzgarlarını enerjiye dönüştüren, yüksek kapasite faktörüyle çalışan kıyı rüzgar santralimiz.' },
  { id: 'res-08', name: 'Çeşme RES',          type: 'RES', lat: 38.2958, lon: 26.3229, mw: 18.9,  turbines: 6,  il: 'İzmir',       status: 'active', desc: 'Turizm beldesi Çeşme’nin enerji ihtiyacını sıfır emisyonla karşılayan, çevreye saygılı yeşil tesisimiz.' },
  { id: 'res-09', name: 'Dağpazarı RES',      type: 'RES', lat: 39.7333, lon: 28.5333, mw: 53,    turbines: 15, il: 'Balıkesir',   status: 'active', desc: 'Balıkesir dağ silsilesinde yer alan bu tesisimiz, zorlu arazi şartlarına rağmen yüksek verimle çalışmaktadır.' },
  { id: 'res-10', name: 'Dampınar RES',       type: 'RES', lat: 38.5500, lon: 27.7167, mw: 46,    turbines: 14, il: 'İzmir',       status: 'active', desc: 'İzmir hinterlandında sanayi bölgelerinin yeşil enerji tedarikini sağlayan stratejik rüzgar parkımız.' },
  { id: 'res-11', name: 'Dikili RES',         type: 'RES', lat: 39.0667, lon: 26.8833, mw: 7.2,   turbines: 2,  il: 'İzmir',       status: 'active', desc: 'İzmir Dikili sahil bandında yer alan, düşük rüzgar hızlarında bile elektrik üretebilen özel donanımlı türbinlerimiz.' },
  { id: 'res-12', name: 'Erciyes RES',        type: 'RES', lat: 38.5333, lon: 35.4500, mw: 78.6,  turbines: 16, il: 'Kayseri',     status: 'active', desc: 'Kayseri Erciyes dağının eteklerinde yüksek rakımda çalışan, İç Anadolu bölgesinin enerji güvenliğine destek veren tesisimiz.' },
  { id: 'res-13', name: 'Hacıhıdırlar RES',   type: 'RES', lat: 37.5833, lon: 30.2833, mw: 63,    turbines: 5,  il: 'Burdur',      status: 'active', desc: 'Burdur dağlarında konumlanmış olan Hacıhıdırlar RES, göller yöresinin temiz enerjiyle aydınlanmasını sağlar.' },
  { id: 'res-14', name: 'Harmancık RES',      type: 'RES', lat: 39.6667, lon: 29.2500, mw: 42,    turbines: 10, il: 'Bursa',       status: 'active', desc: 'Bursa Harmancık bölgesinde dağlık arazide rüzgar hızını avantaja çeviren, modern teknolojiye sahip santralimiz.' },
  { id: 'res-15', name: 'Ihlamur RES',        type: 'RES', lat: 39.5000, lon: 28.2000, mw: 75,    turbines: 25, il: 'Balıkesir',   status: 'active', desc: 'Balıkesir rüzgar bölgesinin bel kemiklerinden biri olan Ihlamur RES, 25 türbiniyle karbon emisyonunu ciddi oranda düşürür.' },
  { id: 'res-16', name: 'Kestanederesi RES',  type: 'RES', lat: 39.8000, lon: 27.6500, mw: 74,    turbines: 18, il: 'Balıkesir',   status: 'active', desc: 'Balıkesir Kestanederesi vadisinde rüzgar hızlandırma (tunnel effect) etkisinden faydalanılarak kurulan tesisimiz.' },
  { id: 'res-17', name: 'Ovacık RES',         type: 'RES', lat: 38.7000, lon: 27.0500, mw: 54.6,  turbines: 13, il: 'İzmir',       status: 'active', desc: 'İzmir Çeşme-Ovacık mevkiinde, kuş göç yolları dikkate alınarak tasarlanmış doğa dostu rüzgar üretim alanımız.' },
  { id: 'res-18', name: 'Uygar RES',          type: 'RES', lat: 38.1500, lon: 27.4500, mw: 250,   turbines: 63, il: 'İzmir',       status: 'active', desc: 'İzmir genelinde yayılmış geniş kapasitesiyle Türkiye’nin mega yenilenebilir enerji projelerinden biri.' },

  // ── GÜNEŞ (GES) ───────────────────────────────────────────
  { id: 'ges-01', name: 'Bandırma GES',       type: 'GES', lat: 40.3333, lon: 28.0167, mw: 25,    turbines: null, il: 'Balıkesir', status: 'active', desc: 'Bandırma Enerji Üssü bünyesinde yer alan, yüksek verimli monokristal panellerle donatılmış dev güneş tarlamız.' },
  { id: 'ges-02', name: 'Karabük GES',        type: 'GES', lat: 41.2000, lon: 32.6333, mw: 12,    turbines: null, il: 'Karabük',   status: 'active', desc: 'Karabük bölgesi sanayisine destek vermek üzere kurulan, fotovoltaik teknolojisiyle çalışan temiz güneş tesisimiz.' },

  // ── HİDROELEKTRİK (HES) ──────────────────────────────────
  { id: 'hes-01', name: 'Arkun Barajı HES',   type: 'HES', lat: 40.7833, lon: 41.4667, mw: 332,   turbines: null, il: 'Artvin',    status: 'active', desc: 'Çoruh Nehri üzerinde yer alan, milli ekonomiye dev katkı sunan Türkiye’nin en önemli hidroelektrik ve baraj projelerinden biridir.' },
  { id: 'hes-02', name: 'Çambaşı HES',        type: 'HES', lat: 40.6667, lon: 37.8333, mw: 5,     turbines: null, il: 'Ordu',      status: 'active', desc: 'Ordu Çambaşı yaylası sularından faydalanan, doğayla uyumlu nehir tipi (regülatör) küçük hidroelektrik tesisimiz.' },
  { id: 'hes-03', name: 'Dağdelen HES',       type: 'HES', lat: 40.6000, lon: 37.7500, mw: 6.4,   turbines: null, il: 'Ordu',      status: 'active', desc: 'Bölgedeki su akış rejimini dengeleyerek elektrik üreten, şebekeye baz yük sağlayan aktif nehir tipi barajımız.' },
  { id: 'hes-04', name: 'Doğançay HES',       type: 'HES', lat: 40.5500, lon: 37.7000, mw: 8,     turbines: null, il: 'Tokat',     status: 'active', desc: 'Tokat bölgesinde tarım alanlarına zarar vermeden enerji üreten sürdürülebilir su yönetimi projesi.' },
  { id: 'hes-05', name: 'Hacınınoğlu HES',    type: 'HES', lat: 37.6470, lon: 36.8520, mw: 28,    turbines: null, il: 'Kahramanmaraş', status: 'active', desc: 'Kahramanmaraş Ceyhan Nehri havzasında kurulu olan bu barajımız, taşkın kontrolü ve elektrik üretimini bir arada yürütmektedir.' },
  { id: 'hes-06', name: 'Kandil HES',         type: 'HES', lat: 38.0790, lon: 37.1540, mw: 24,    turbines: null, il: 'Kahramanmaraş', status: 'active', desc: 'Dağlık arazide suyun potansiyel enerjisini yüksek basınçlı tribünlerle elektriğe dönüştüren kritik hidro-tesisimiz.' },
  { id: 'hes-07', name: 'Kavsak Bendi HES',   type: 'HES', lat: 37.5680, lon: 35.6420, mw: 5.5,   turbines: null, il: 'Adana',     status: 'active', desc: 'Adana Seyhan havzası üzerinde yer alan, Çukurova’nın tarımsal sulama döngüsüyle entegre çalışan çevreci hidroelektrik baraj.' },
  { id: 'hes-08', name: 'Köprü HES',          type: 'HES', lat: 37.4080, lon: 35.3780, mw: 15,    turbines: null, il: 'Adana',     status: 'active', desc: 'Göksu nehri sularıyla çalışan Köprü HES, Adana bölgesinin sanayi ve konut elektrik ihtiyacına destek verir.' },
  { id: 'hes-09', name: 'Kuşaklı HES',        type: 'HES', lat: 37.9170, lon: 36.9660, mw: 7.5,   turbines: null, il: 'Kahramanmaraş', status: 'active', desc: 'Nehir sularının akış hızını temiz enerjiye dönüştüren, fauna ve floraya uygun balık geçitlerine sahip sürdürülebilir HES.' },
  { id: 'hes-10', name: 'Menge HES',          type: 'HES', lat: 37.7120, lon: 35.8420, mw: 6,     turbines: null, il: 'Adana',     status: 'active', desc: 'Adana Kozan’da Göksu çayı üzerinde yer alan, su kısıtlılığında dahi optimize edilmiş debi yönetimiyle çalışan tesisimiz.' },
  { id: 'hes-11', name: 'Sarıgüzel HES',      type: 'HES', lat: 37.7100, lon: 36.8650, mw: 6,     turbines: null, il: 'Kahramanmaraş', status: 'active', desc: 'Kahramanmaraş Sarıgüzel barajı, kış aylarında kar erimesiyle artan debiyi başarıyla absorbe edip enerjiye dönüştürür.' },
  { id: 'hes-12', name: 'Yamanlı II HES',     type: 'HES', lat: 37.8920, lon: 36.0020, mw: 5.5,   turbines: null, il: 'Adana',     status: 'active', desc: 'Adana Tufanbeyli sınırlarında Göksu havzası içinde kurulan, yöre halkına istihdam da sağlayan su üretim tesisi.' },

  // ── DİĞER (DGÇS / Linyit) ────────────────────────────────
  { id: 'dgcs-01', name: 'Bandırma I DGÇS',   type: 'DGÇS', lat: 40.3167, lon: 27.9833, mw: 600,  turbines: null, il: 'Balıkesir', status: 'active', desc: 'Enerjisa’nın en esnek ve hızlı devreye giren dev Doğalgaz Çevrim Santrallerinden biri. Şebeke dengesi için kritik bir tesis.' },
  { id: 'dgcs-02', name: 'Bandırma II DGÇS',  type: 'DGÇS', lat: 40.3200, lon: 27.9900, mw: 600,  turbines: null, il: 'Balıkesir', status: 'active', desc: 'Bandırma Enerji Üssündeki ikinci büyük doğalgaz modülü. Dünyanın en yüksek verimli gaz türbin teknolojilerini kullanmaktadır.' },
  { id: 'dgcs-03', name: 'Kentsa DGÇS',       type: 'DGÇS', lat: 40.7667, lon: 30.3833, mw: 120,  turbines: null, il: 'Kocaeli',   status: 'active', desc: 'Kocaeli bölgesinin zorlu sanayi tesislerine buhar ve elektrik sağlayan kojenerasyon altyapılı çevrim santralimiz.' },
  { id: 'oth-01',  name: 'Tufanbeyli Linyit', type: 'Linyit', lat: 38.2667, lon: 36.2333, mw: 450, turbines: null, il: 'Adana',     status: 'active', desc: 'Yerli linyit kaynaklarının en modern ve temiz filtreleme (CFB) teknolojisiyle elektriğe dönüştürüldüğü büyük termik santralimiz.' },

  // ── OFFSHORE & BATARYA (Gelecek ve Aktif Yatırımlar) ────────
  { id: 'off-01', name: 'Çandarlı Offshore',  type: 'Offshore', lat: 38.9200, lon: 26.7800, mw: 0, turbines: 0, il: 'İzmir', status: 'planned', desc: 'Türkiye’nin deniz üstü (Offshore) rüzgar potansiyelini değerlendirmek için Ege Denizi açıklarında planlanan mega yatırım projesi.' },
  { id: 'bat-01', name: 'Bandırma BESS',      type: 'Batarya',  lat: 40.3250, lon: 27.9950, mw: 2, turbines: null, il: 'Balıkesir', status: 'active', desc: 'Türkiye’nin bakanlık kabulü yapılan ilk şebeke ölçekli Batarya Enerji Depolama Sistemi (BESS). Ticari şebekede aktif olarak dengeleme yapmaktadır.' },
  { id: 'bat-02', name: 'Polatlı Dep. GES-1', type: 'Batarya',  lat: 39.5800, lon: 31.9500, mw: 25, turbines: null, il: 'Ankara', status: 'planned', desc: 'EPDK’dan süresi uzatılmış, 2027 sonu hedeflenen, Ankara Polatlı’daki 25 MW kapasiteli güneş ve batarya entegre sistem yatırımımız.' },
  { id: 'bat-03', name: 'Mihalıççık Seki GES',type: 'Batarya',  lat: 39.8700, lon: 31.4900, mw: 25, turbines: null, il: 'Eskişehir', status: 'planned', desc: 'Lokasyon optimizasyonuyla Eskişehir’e taşınan, öz kaynaklarla finanse edilen ÇED aşamasındaki 25 MW GES + Batarya dev depolama yatırımı.' },
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
  Batarya: { color: '#ec4899', icon: '🔋', label: 'Batarya (BESS)',      bgClass: 'bg-pink-900/40',   borderClass: 'border-pink-600/40',   textClass: 'text-pink-400'    },
};
