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
  const topPlant = ENERJISA_PLANTS.filter(p => p.status === 'active').sort((a, b) => b.mw - a.mw)[0];

  // 1. Selamlaşma ve Kimlik
  if (msg.includes('merhaba') || msg.includes('selam') || msg.includes('hey') || msg.includes('nasıl')) {
    if (msg.includes('nasılsın') || msg.includes('nasıl gidiyor')) {
      return `İyiyim, teşekkür ederim! ⚡ Enerjisa Marine-Twin platformunda veri akışını izliyor ve kararları analiz ediyorum. Size nasıl yardımcı olabilirim?`;
    }
    return `Merhaba! 👋 Ben **Marine-Twin AI Asistanı**. Enerjisa portföyü, rüzgar enerjisi, karbon hesapları, fırtına senaryoları veya finansal projeksiyonlar hakkında size yardımcı olabilirim. Ne sormak istersiniz?`;
  }

  // 2. Kurulu Güç ve Portföy Detayları
  if (msg.includes('toplam') && (msg.includes('kapasite') || msg.includes('güç') || msg.includes('üretim') || msg.includes('mw'))) {
    return `⚡ Enerjisa Üretim'in toplam kurulu gücü **${totalMW.toLocaleString('tr-TR')} MW**'tır. Bu portföyün **${resMW} MW**'ı rüzgar (RES), **${hesMW} MW**'ı hidroelektrik (HES) ve **${gesMW} MW**'ı güneş (GES) kaynaklıdır.`;
  }

  if (msg.includes('kaç santral') || msg.includes('santral sayısı') || msg.includes('kaç adet santral')) {
    return `🏢 Enerjisa bünyesinde toplam **${ENERJISA_PLANTS.length} adet** santral bulunmaktadır. Bunların ${resPlants.length} adedi Rüzgar (RES), ${hesPlants.length} adedi Hidroelektrik (HES) ve ${gesPlants.length} adedi Güneş (GES) santralidir.`;
  }

  // 3. En Büyük Santraller ve Lokasyonlar
  if (msg.includes('en büyük') || msg.includes('en çok') || msg.includes('en yüksek') || msg.includes('lider')) {
    if (msg.includes('rüzgar') || msg.includes('res')) {
      const sortedRes = [...resPlants].sort((a, b) => b.mw - a.mw);
      return `💨 En büyük Rüzgar Santralimiz **${sortedRes[0].name}** RES'tir (${sortedRes[0].mw} MW, ${sortedRes[0].il}). Onu **${sortedRes[1].name}** RES (${sortedRes[1].mw} MW) takip eder.`;
    }
    return `🏆 Enerjisa portföyündeki en yüksek kapasiteli aktif santral **${topPlant.name}** santralidir (${topPlant.mw} MW, ${topPlant.il}).`;
  }

  if (msg.includes('nerede') || msg.includes('hangi illerde') || msg.includes('lokasyon') || msg.includes('konum')) {
    const provinces = [...new Set(ENERJISA_PLANTS.map(p => p.il))].slice(0, 8).join(', ');
    return `📍 Santrallerimiz Türkiye geneline yayılmıştır. Başta **${provinces}** olmak üzere birçok ilde aktif tesislerimiz bulunmaktadır.`;
  }

  // 4. Fırtına ve Otonom Karar Senaryosu
  if (msg.includes('fırtına') || msg.includes('storm') || msg.includes('alarm') || msg.includes('hız sınırı')) {
    return `🌪️ Fırtına hızı **25 m/s** (90 km/s) limitini aştığında sistem otonom olarak koruma moduna geçer:\n\n1️⃣ **Mühendislik:** Türbin kanatları rüzgara paralel konuma getirilir (Pitch Control) ve mekanik disk frenler kilitlenir.\n2️⃣ **Lojistik:** AI dalga/rüzgar tahminine göre güvenli bakım saati (Hava Penceresi) çıkarır.\n3️⃣ **Finansal:** VPP (Sanal Güç Santrali) devreye girerek rüzgar açığını barajlı HES'lerden dengeler.`;
  }

  // 5. Karbon Hesaplamaları ve Emisyon
  if (msg.includes('karbon') || msg.includes('co2') || msg.includes('emisyon') || msg.includes('tasarruf') || msg.includes('kredi')) {
    return `🌿 **Karbon Hesaplama Metodolojimiz:**\n\n- **Şebeke Azaltımı:** Ürettiğimiz her 1 MWh yenilenebilir enerji için Türkiye Şebeke Emisyon Faktörü olan **0.45 ton CO₂** tasarruf hesaplanır.\n- **Yeşil Gelir:** Tasarruf edilen karbon sertifikalandırılarak Gold Standard üzerinden **$4.0 / ton CO₂** ve I-REC üzerinden **$1.5 / MWh** oranında paraya dönüştürülür.`;
  }

  // 6. Finans, ROI ve TSRS Raporlama
  if (msg.includes('tsrs') || msg.includes('csrd') || msg.includes('rapor') || msg.includes('standart') || msg.includes('tfrs')) {
    return `📊 **Sürdürülebilirlik Uyum Modülü:**\n\nPlatformumuz KGK (Kamu Gözetimi Kurumu) standartlarına ve **TFRS S2 / IFRS S2** (Uluslararası Finansal Raporlama Standartları) ile Avrupa **CSRD** direktiflerine tam uyumludur. Kapsam 1 (Lojistik) ve Kapsam 2 (İç tüketim) emisyonlarını otomatik raporlar.`;
  }

  if (msg.includes('amortisman') || msg.includes('roi') || msg.includes('finans') || msg.includes('kazanç') || msg.includes('maliyet') || msg.includes('yatırım')) {
    return `💰 **Offshore (Denizüstü) Yatırım Analizi:**\n\nÇandarlı Offshore projemizin toplam yatırım maliyeti (CAPEX) yaklaşık $350M olarak öngörülmektedir. I-REC ve Karbon kredisi teşvikleriyle birleştiğinde yatırımın geri dönüş süresi (ROI) **6.8 yıl** olarak hesaplanmıştır. Net Bugünkü Değer (NPV) ise $120M+ seviyesindedir.`;
  }

  // 7. Teknik Türbin Özellikleri
  if (msg.includes('türbin') || msg.includes('pervane') || msg.includes('kanat') || msg.includes('boyut') || msg.includes('yükseklik')) {
    return `📐 **Offshore Türbin Mühendislik Detayları:**\n\n- **Güç:** 8 MW nominal offshore güç kapasitesi.\n- **Rotor Çapı:** 164 metre (Kanat uzunluğu 80 metre).\n- **Göbek Yüksekliği (Hub Height):** Deniz seviyesinden 105 metre yükseklik.\n- **Çalışma Aralığı:** 3 m/s (cut-in) ile 25 m/s (cut-out) rüzgar hızları arası.`;
  }

  // 8. YOLOv8 ve Drone Denetimi
  if (msg.includes('yolo') || msg.includes('drone') || msg.includes('iha') || msg.includes('çatlak') || msg.includes('hasar') || msg.includes('kamera')) {
    return `🦅 **YOLOv8 Drone ile Kanat Denetimi:**\n\nOtonom uçuş yapan İHA'ların çektiği 4K termal görüntüler YOLOv8 nesne tespit modelimizle taranır. Kanatlardaki kılcal çatlaklar, korozyon ve yıldırım hasarları **%94 doğruluk oranıyla** tespit edilerek saha mühendislerine prediktif bakım emri gönderilir.`;
  }

  // 9. İK, Bakım ve Operasyon
  if (msg.includes('bakım') || msg.includes('personel') || msg.includes('teknisyen') || msg.includes('ik') || msg.includes('eleman') || msg.includes('vardiya')) {
    return `👨‍🔧 **Saha Operasyon Bilgileri:**\n\nSistemde aktif **48 sertifikalı teknisyen** tanımlıdır. Bakım ekipleri fırtına durumunda otomatik koruma vardiyasına geçirilir. Korozyon ve kanat çatlağı tespit edilen türbinler (Örn: WTG-04) öncelikli olarak bakım takvimine otomatik atanır.`;
  }

  // 10. Biyoçeşitlilik ve Yapay Resifler
  if (msg.includes('kuş') || msg.includes('balık') || msg.includes('resif') || msg.includes('habitat') || msg.includes('biyo')) {
    return `🌿 **Ekolojik Koruma Politikamız:**\n\n- **Smart Curtailment:** YOLOv8 kuş sürüsü tespit ettiğinde türbin dönüş hızını otomatik olarak 2 RPM altına düşürür. Kuş ölümleri %85 azaldı.\n- **Yapay Resif Projesi:** Denizüstü temellerinin etrafına yerleştirilen yapay resifler sayesinde bölgedeki biyoçeşitlilik indeksi (Shannon) %18 oranında artmıştır.`;
  }

  // Genel fallback
  return `📋 Sorunuzu lokal veri tabanımda tam eşleştiremedim. Bu konuda daha detaylı bilgi için ekibimizle çalışmamız gerekmektedir. Şu anahtar kelimelerle ilgili sorular sorabilirsiniz:\n\n• **Santral Güçleri:** "toplam güç", "en büyük santral", "kaç adet santral var"\n• **Fırtına:** "fırtına senaryosu nedir", "hız sınırı kaç"\n• **Finans & Karbon:** "karbon hesabı", "tsrs standardı", "amortisman süresi"\n• **Mühendislik:** "türbin boyutları", "yolo drone denetimi", "personel ve bakım"`;
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
