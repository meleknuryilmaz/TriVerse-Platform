// ============================================================
//  TriVerse — AI Asistan Servis Katmanı
//  Gemini API (Google) üzerinden kurumsal chatbot altyapısı
//  Fallback: API key yoksa akıllı kural-tabanlı cevap motoru
// ============================================================

import ENERJISA_PLANTS from '../data/enerjisaPlants';

// ── Gemini API Yapılandırması ────────────────────────────────
// .env dosyasına REACT_APP_GEMINI_API_KEY= olarak ekleyin
// veya aşağıdaki değişkene doğrudan yapıştırın (PoC için)
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const getGeminiUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

// ── Enerjisa Portföy Özeti (Sistem Prompt'a gömülecek) ───────
function buildPortfolioContext() {
  const totalMW   = ENERJISA_PLANTS.reduce((s, p) => s + (p.mw || 0), 0);
  const resMW     = ENERJISA_PLANTS.filter(p => p.type === 'RES').reduce((s, p) => s + p.mw, 0);
  const hesMW     = ENERJISA_PLANTS.filter(p => p.type === 'HES').reduce((s, p) => s + p.mw, 0);
  const gesMW     = ENERJISA_PLANTS.filter(p => p.type === 'GES').reduce((s, p) => s + p.mw, 0);
  const dgcsMW    = ENERJISA_PLANTS.filter(p => p.type === 'DGÇS' || p.type === 'Linyit').reduce((s, p) => s + p.mw, 0);
  const resCount  = ENERJISA_PLANTS.filter(p => p.type === 'RES').length;
  const hesCount  = ENERJISA_PLANTS.filter(p => p.type === 'HES').length;
  const totalCount = ENERJISA_PLANTS.length;

  const topPlants = ENERJISA_PLANTS
    .filter(p => p.status === 'active')
    .sort((a, b) => b.mw - a.mw)
    .slice(0, 5)
    .map(p => `${p.name} (${p.type}, ${p.mw} MW, ${p.il})`)
    .join('; ');

  return `
## Enerjisa Üretim Portföyü (Güncel Veri)
- Toplam Kurulu Güç: ${totalMW} MW
- Toplam Santral: ${totalCount} adet
- RES (Rüzgar): ${resCount} adet, ${resMW} MW
- HES (Hidro): ${hesCount} adet, ${hesMW} MW
- GES (Güneş): ${gesMW} MW
- DGÇS/Linyit: ${dgcsMW} MW
- Planlanan Offshore: Çandarlı (İzmir), henüz aktif değil

## En Büyük 5 Santral:
${topPlants}

## Finansal Formüller:
- Güç: P = Kapasite × (Rüzgar Hızı / 25)³ (Kübik rüzgar-güç yasası)
- Karbon Tasarrufu: CO₂ = Üretilen MWh × 0.45 tCO₂/MWh (TR Şebeke Emisyon Faktörü)
- Yeşil Gelir: $ = MWh × (1.5$ I-REC + 4.0$ × 0.45 Gold Standard)
- Cut-in hızı: 3 m/s, Cut-out hızı: 25 m/s

## Platform Özellikleri:
- Open-Meteo Marine API ile canlı hava verisi
- Fırtına senaryosu simülasyonu (3 aşamalı otonom çözüm)
- TSRS/CSRD uyumlu PDF rapor motoru
- YOLOv8 ile kanat çatlak tespiti
- Biyoçeşitlilik ve yapay resif izleme
`.trim();
}

// ── Sistem Prompt'u ─────────────────────────────────────────
const SYSTEM_PROMPT = `Sen "Marine-Twin AI Asistanı" adlı, Enerjisa Enerji için geliştirilmiş kurumsal bir yapay zeka danışmanısın.

Görevin:
1. Enerjisa'nın enerji üretim portföyü hakkında bilgi vermek
2. Rüzgar enerjisi, karbon kredisi, TSRS/CSRD regülasyonları konusunda uzman tavsiyesi sunmak
3. Fırtına senaryoları ve otonom kriz yönetimi hakkında açıklama yapmak
4. Finansal formülleri (I-REC, Gold Standard, Emisyon Faktörü) kullanarak hesaplamalar yapmak

Kuralların:
- Türkçe cevap ver (teknik terimler İngilizce kalabilir)
- Kısa, net ve profesyonel cevaplar ver (en fazla 3-4 cümle)
- Enerjisa'nın kurumsal kimliğine uygun, saygılı bir dil kullan
- Bilmediğin konularda "Bu konuda ekibimizle detaylı analiz yapılması gerekmektedir" de
- Yanıtlarında emoji kullan (🌊⚡💨📊 gibi)

${buildPortfolioContext()}`;

// ── Gemini API Çağrısı ──────────────────────────────────────
async function callGemini(userMessage, history, modelName) {
  if (!GEMINI_API_KEY) {
    throw new Error('NO_API_KEY');
  }

  // Geçmiş mesajları Gemini formatına çevir
  const contents = [];

  // Sistem prompt'u ilk user mesajı olarak gönder
  contents.push({
    role: 'user',
    parts: [{ text: SYSTEM_PROMPT + '\n\nKullanıcının ilk mesajına hazır ol.' }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Merhaba! Ben Marine-Twin AI Asistanı. Enerjisa portföyü, rüzgar enerjisi, karbon hesapları veya fırtına senaryoları hakkında sorularınızı yanıtlamaya hazırım. ⚡🌊' }],
  });

  // Geçmiş mesajları ekle
  history.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  });

  // Yeni kullanıcı mesajını ekle
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const url = getGeminiUrl(modelName);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        topP: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Gemini API Error:', err);
    throw new Error('API_ERROR');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt üretilemedi.';
}

// ── Akıllı Kural-Tabanlı Fallback (API key yokken) ─────────
function smartFallback(message) {
  const msg = message.toLowerCase()
    .replace(/[?!.,;]/g, '')
    .trim();

  const totalMW = ENERJISA_PLANTS.reduce((s, p) => s + (p.mw || 0), 0);
  const resPlants = ENERJISA_PLANTS.filter(p => p.type === 'RES');
  const resMW = resPlants.reduce((s, p) => s + p.mw, 0);
  const hesPlants = ENERJISA_PLANTS.filter(p => p.type === 'HES');
  const hesMW = hesPlants.reduce((s, p) => s + p.mw, 0);
  const gesPlants = ENERJISA_PLANTS.filter(p => p.type === 'GES');
  const gesMW = gesPlants.reduce((s, p) => s + p.mw, 0);

  // 1. Selamlaşma ve Kimlik
  if (msg.includes('merhaba') || msg.includes('selam') || msg.includes('hey') || msg.includes('nasıl')) {
    if (msg.includes('nasılsın') || msg.includes('nasıl gidiyor')) {
      return `İyiyim, teşekkür ederim! ⚡ Enerjisa Marine-Twin platformunda veri akışını izliyor ve kararları analiz ediyorum. Size nasıl yardımcı olabilirim?`;
    }
    return `Merhaba! 👋 Ben **Marine-Twin AI Asistanı**. Enerjisa portföyü, rüzgar enerjisi, karbon hesapları, fırtına senaryoları veya finansal projeksiyonlar hakkında size yardımcı olabilirim. Ne sormak istersiniz?`;
  }

  // 2. Kurulu Güç ve Portföy Detayları
  if (msg.includes('toplam') || msg.includes('kapasite') || msg.includes('güç') || msg.includes('üretim') || msg.includes('mw')) {
    if (!msg.includes('hesaplama') && !msg.includes('nasıl')) {
      return `⚡ Enerjisa Üretim'in toplam kurulu gücü **${totalMW.toLocaleString('tr-TR')} MW**'tır. Bu portföyün **${resMW} MW**'ı rüzgar (RES), **${hesMW} MW**'ı hidroelektrik (HES) ve **${gesMW} MW**'ı güneş (GES) kaynaklıdır.`;
    }
  }

  // 3. Batarya ve Yeni Yatırımlar (Yeni eklendi)
  if (msg.includes('batarya') || msg.includes('depolama') || msg.includes('yeni yatırım') || msg.includes('gelecek') || msg.includes('polatlı') || msg.includes('mihalıççık')) {
    return `🔋 **Güneş ve Batarya Yatırımlarımız:**\n\nBandırma Enerji Üssü'nde 2 MW kapasiteli **Bandırma BESS** aktif olarak şebeke dengelemesi yapmaktadır. Ayrıca Ankara **Polatlı (25 MW)** ve Eskişehir **Mihalıççık Seki (25 MW)** projeleri önlisans ve ÇED aşamasında olup, 2027 sonuna kadar devreye alınmaları planlanmaktadır.`;
  }

  // 4. Fırtına ve Otonom Karar Senaryosu
  if (msg.includes('fırtına') || msg.includes('storm') || msg.includes('alarm') || msg.includes('hız sınırı')) {
    return `🌪️ Fırtına hızı **25 m/s** (90 km/s) limitini aştığında sistem otonom olarak koruma moduna geçer:\n\n1️⃣ **Mühendislik:** Türbin kanatları rüzgara paralel konuma getirilir.\n2️⃣ **Lojistik:** AI güvenli bakım saati çıkarır.\n3️⃣ **Finansal:** VPP (Sanal Güç Santrali) devreye girerek rüzgar açığını HES'lerden dengeler.`;
  }

  // 5. PTF (Piyasa Takas Fiyatı) ve Finans
  if (msg.includes('ptf') || msg.includes('piyasa') || msg.includes('takas') || msg.includes('fiyat')) {
    return `📈 **Piyasa Takas Fiyatı (PTF):**\n\nEPİAŞ (Elektrik Piyasaları İşletme A.Ş.) üzerinden belirlenen anlık saatlik elektrik fiyatıdır. Platformumuzda AI destekli üretim tahminleri, PTF ile çarpılarak şirketin o saatteki net kâr/zarar projeksiyonu otomatik hesaplanır.`;
  }

  // 6. Finans, ROI ve Offshore
  if (msg.includes('offshore') || msg.includes('denizüstü') || msg.includes('amortisman') || msg.includes('roi') || msg.includes('yatırım')) {
    return `🌊 **Offshore (Denizüstü) Yatırım Analizi:**\n\nÇandarlı Offshore (500 MW) projemizin tahmini yatırım maliyeti (CAPEX) yaklaşık $2.1B olarak öngörülmektedir. I-REC ve Karbon kredisi teşvikleriyle birleştiğinde yatırımın geri dönüş süresi (ROI) **yaklaşık 8 yıl** olarak hesaplanmıştır.`;
  }

  // 7. TSRS, Sürdürülebilirlik ve Karbon
  if (msg.includes('tsrs') || msg.includes('csrd') || msg.includes('rapor') || msg.includes('sürdürülebilirlik') || msg.includes('karbon') || msg.includes('emisyon')) {
    return `📄 **Sürdürülebilirlik & TSRS:**\n\nPlatformumuz KGK standartlarına ve **TFRS S2 / IFRS S2** (Uluslararası Finansal Raporlama Standartları) ile Avrupa **CSRD** direktiflerine tam uyumludur. Karbon tasarrufu hesaplanarak Kapsam 1 ve 2 emisyonları için resmi dijital rapor oluşturur.`;
  }

  // 8. YOLOv8 ve Drone Denetimi (Kanat Çatlağı)
  if (msg.includes('yolo') || msg.includes('drone') || msg.includes('iha') || msg.includes('çatlak') || msg.includes('hasar') || msg.includes('kanat') || msg.includes('denetim')) {
    return `🦅 **YOLOv8 Drone ile Kanat Denetimi:**\n\nOtonom uçuş yapan İHA'ların çektiği yüksek çözünürlüklü ve termal görüntüler, entegre YOLOv8 yapay zeka modelimizle taranır. Kanatlardaki kılcal çatlaklar ve korozyonlar tespit edilerek İK operasyon/bakım takvimine doğrudan işlenir.`;
  }

  // 9. İK, Maaş, Yaş Dağılımı ve Operasyon
  if (msg.includes('ik') || msg.includes('personel') || msg.includes('yaş') || msg.includes('maaş') || msg.includes('memnuniyet') || msg.includes('operasyon')) {
    return `👨‍🔧 **İK & Operasyon Verileri:**\n\nSistemimiz sahadaki personelin yaş dağılımını, yetkinlik/sertifika durumlarını (GWO vb.) ve vardiya hazırlığını gerçek zamanlı takip eder. Ayrıca maaş dilimleri ve çalışan memnuniyet anketleri üzerinden şirketin iç dinamikleri görselleştirilir.`;
  }

  // Genel fallback
  return `📋 Sorunuzu lokal veri tabanımda tam eşleştiremedim. Şu konuları sorabilirsiniz:\n\n• **Batarya:** "Yeni batarya yatırımları nelerdir?"\n• **Yapay Zeka:** "Kanat çatlağı tespiti nasıl yapılıyor?"\n• **Finans & Rapor:** "TSRS nedir?", "PTF ne demek?"\n• **Proje:** "Offshore yatırım amortisman süresi nedir?"`;
}

// ── Ana Export: Mesaj Gönder ─────────────────────────────────
export async function sendMessage(userMessage, history = [], modelName = 'gemini-1.5-flash') {
  if (modelName === 'local') {
    const reply = smartFallback(userMessage);
    return { text: reply, source: 'local' };
  }
  try {
    const reply = await callGemini(userMessage, history, modelName);
    return { text: reply, source: modelName };
  } catch (err) {
    // API key yoksa veya hata varsa fallback kullan
    const reply = smartFallback(userMessage);
    return { text: reply, source: err.message === 'NO_API_KEY' ? 'local' : 'fallback' };
  }
}

export function hasApiKey() {
  return !!GEMINI_API_KEY;
}
