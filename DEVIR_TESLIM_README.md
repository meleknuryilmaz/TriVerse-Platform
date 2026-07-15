# 🚀 Enerjisa Marine-Twin (TriVerse) - Yazılım Mühendisi Devir Teslim Dökümanı

**Hazırlayan:** Yazılım Mühendisi (UI/UX, Frontend & AI Entegrasyonu)  
**Tarih:** 14 Temmuz 2026  
**Hedef Kitle:** Bilgisayar Mühendisliği, İnşaat Mühendisliği, İktisat & İşletme Disiplinlerindeki Ekip Arkadaşlarımız  

Merhaba takım! Enerjisa'nın 2030 vizyonunu yansıtacak "Marine-Twin" (Denizüstü Rüzgar Dijital İkizi) PoC (Proof of Concept) projemizin ön yüz (Frontend/Arayüz) tasarımlarını, canlı hava durumu API entegrasyonunu ve son olarak **Kurumsal AI Chatbot (LLM)** modülünü tamamlamış bulunmaktayım. Sistem, jüri ve mentor sunumlarında en yüksek etkiyi bırakacak şekilde optimize edilmiştir.

Bu döküman, hem teknik ekibin (Bilgisayar Mühendisliği) kod tabanını devralması hem de diğer disiplinlerdeki arkadaşlarımızın projede kullanılan formülleri ve sistem mantığını anlayıp sunumda rahatça savunabilmesi için hazırlanmıştır.

---

## 🛠️ Hangi Disiplin İçin Ne Geliştirildi?

### 💻 1. Bilgisayar Mühendisi İçin (Geliştirici Notları)
- **Modüler React Mimarisi:** Tüm bileşenler `src/components/` klasörüne (Örn: `StormControlWidget.js`, `DashboardWidgets.js`, `PlantMapWidget.js`, `ChatbotWidget.js`) taşınarak temiz ve sürdürülebilir bir yapı sağlandı.
- **Canlı Veri Kancaları (React Hooks):** Sistem şu anda hem canlı API verileriyle hem de yedek simülasyonlarla çalışıyor. API bağlantılarında bir kesinti olması durumunda sistem otonom olarak simülasyon moduna geçer ve jüri sunumu asla yarıda kalmaz.
- **TSRS PDF Rapor Tetikleyici:** Finans sekmesinde "TSRS Raporunu İndir" butonu arayüze yerleştirildi. Arkada hazırlanacak `ReportLab` veya benzeri PDF motorunu tetiklemek için bu butona kolayca onClick event'i bağlayabilirsiniz.
- **Karbon ve Finans Hesaplama Servisleri:** Formüller kod içinde merkezi hale getirilerek backend entegrasyonuna hazırlandı.

### 🏗️ 2. İnşaat Mühendisi İçin (Yapısal Sağlık, Güvenlik & Lojistik)
- **Fırtına Kontrol ve Alarm Modülü:** Rüzgar hızı kritik sınır olan 25 m/s'yi (yaklaşık 90 km/s) ve dalga boyu güvenli limiti aştığında; kule titreşim stresinin %90'lara çıktığını ve türbin frenleme (Pitch Control - Kanat Açısı Değişimi) mekanizmasının devreye girdiğini gösteren otonom alarm modülü kodlandı.
- **Fırtına Durumu Aşamaları (1000ms Yumuşak Geçiş):** Fırtına tetiklendiğinde sistem birden durmak yerine, 1 saniyelik sinematik geçişlerle türbin hızını azaltır ve sistemi güvenli kilit moduna alır.
- **Lojistik ve Hava Penceresi Analizi:** Fırtına bitiminde bakım gemilerinin denize açılabileceği güvenli zaman dilimi "Lojistik Çözüm" adımında dinamik olarak gösterilir.

### 📈 3. İktisat & İşletme Ekibi İçin (Yeşil Finans, TSRS ve Regülasyon)
- **Canlı Karbon ve I-REC Sayaçları:** Enerji üretildikçe ekranda milisaniyeler içinde üretilen gücü (MWh), azaltılan karbonu (tCO2) ve elde edilen yeşil finans gelirini ($) sayan dinamik göstergeler eklendi.
- **Kâr/Zarar ve ROI Modülleri:** Çandarlı Offshore tesisinin amortisman süresi projeksiyonu, İK maaş dağılımları, biyoçeşitlilik koruma bütçeleri ve yapay resiflerin bölge balıkçılığına katkısını gösteren analizler entegre edildi.

---

## 🤖 Kurumsal AI Chatbot (LLM & Asistan) Modülü

Mentor ve jüri sunumunda yapay zeka iddiasını güçlendirmek için ekranın sağ alt köşesine kurumsal bir **AI Chatbot** eklenmiştir. 

### Nasıl Çalışır?
- **Çift Katmanlı Çalışma Yapısı (Hybrid Engine):** 
  1. **Gemini LLM Modu:** Eğer projeye bir Gemini API Key bağlanırsa, chatbot tamamen üretken yapay zeka (LLM) olarak çalışır. Enerjisa'nın portföyünü, fırtına senaryolarını, karbon kredilerini ve formülleri çok iyi bilir.
  2. **Akıllı Lokal Fallback Modu:** API anahtarı girilmediğinde (veya internet/API kesintilerinde), chatbot **kural tabanlı akıllı bir motor** yardımıyla çalışır. En sık sorulabilecek "Toplam güç nedir?", "Karbon hesabı nasıl yapılır?", "Fırtına senaryosu nedir?" gibi sorulara doğrudan veritabanındaki güncel Enerjisa sayılarıyla tutarlı ve doğru cevaplar verir.
- **Hızlı Soru Butonları:** Kullanıcının (veya jürinin) ne soracağını bilemediği durumlar için chatbot'un içine hızlı tıklanabilir butonlar eklenmiştir.
- **Yazıyor Animasyonu & Tasarım:** Platformun genel kurumsal karanlık temasıyla uyumlu, yarı şeffaf (glassmorphism) ve modern bir chat penceresi tasarlanmıştır.

### Gemini API Bağlantısı Nasıl Yapılır?
Projenin kök dizininde bir `.env` dosyası oluşturarak içerisine şu satırı eklemeniz yeterlidir:
```env
REACT_APP_GEMINI_API_KEY=BURAYA_GEMINI_API_ANAHTARINIZI_YAZIN
```
*Not: API anahtarı eklenmezse sistem otomatik olarak "Lokal Motor" modunda çalışır ve mentorunuz test ederken hiçbir hata almadan chatbot ile etkileşime girebilir.*

### Chatbot Nasıl Devre Dışı Bırakılır veya Kaldırılır? (Mentor Beğenmezse)
Eğer mentorunuz chatbot'un kaldırılmasını isterse, sistemi eski haline getirmek son derece basittir:
1. `src/App.js` dosyasının en üstündeki `import ChatbotWidget from './components/ChatbotWidget';` satırını silin.
2. `src/App.js` dosyasının en altındaki (yaklaşık 1150. satır) `<ChatbotWidget />` etiketini kaldırın.
3. Bu iki adımla chatbot tamamen arayüzden kaybolacaktır (dosyaları silmenize dahi gerek kalmaz).

---

## ❓ Ekip İçin Soru-Cevap (Teknik ve Finansal Metotlar)

Sistemin kalbini oluşturan verileri ve formülleri kurgularken kullandığımız metodoloji şu şekildedir:

### Soru 1: Arayüzdeki "1217 MW Rüzgar ve Toplam 3473 MW" kurulu güç verisi nereden alındı?
**Cevap:** Bu veriyi doğrudan Enerjisa Üretim'in resmi web sitesinden alarak oluşturduğumuz `enerjisaPlants.js` dosyasından çekiyoruz. Enerjisa'nın aktif olan 18 Rüzgar (RES), 12 Hidroelektrik (HES), 2 Güneş (GES) ve Doğalgaz/Linyit santrallerinin kapasitelerini yazılımla topladığımızda toplam **3473 MW Kurulu Güç** değerine ulaşıyoruz. Arayüzdeki Kapasite Faktörü (%) hesabı da anlık üretilen gücün bu toplam kurulu güce bölünmesiyle otonom olarak hesaplanmaktadır.

### Soru 2: Canlı sayaçlardaki "P = Kapasite × (Hız / MaxHız)³" formülü neye göre seçildi?
**Cevap:** Bu formül rüzgar enerjisinin temel fizik kurallarından biridir. Rüzgarın gücü, hızının **küpüyle** (³) doğru orantılıdır. Rüzgar hızı 12 m/s'den 15 m/s'ye çıktığında üretim doğrusal değil, kübik olarak katlanarak artar.
- **Maksimum Rüzgar Hızı:** 25 m/s (Türbinin tam kapasiteye ulaştığı limit).
- **Emisyon Faktörü:** Türkiye şebeke ortalaması olan **0.45 tCO2/MWh** kullanılmıştır.
- **I-REC Fiyatı:** 1.5 $ / MWh (Yenilenebilir enerji sertifikası piyasa değeri).
- **Gold Standard Karbon Kredisi:** 4.0 $ / ton CO2.
- **Çıktı Hızı:** Rakamların tıkır tıkır hızlı dönmesinin sebebi, Enerjisa'nın 1217 MW'lık devasa rüzgar üretim gücünün 100 milisaniyelik zaman dilimlerine bölünerek canlı akıtılmasıdır. Bu sunumda "gerçek zamanlı veri akışı" hissini mükemmel şekilde simüle eder.

---

## 🚀 Sistem İyileştirmesi ve Optimizasyon Fikirleri (Sistem Mühendisi Gözüyle)

Eğer Enerjisa'da bu platformun altyapısını denetleyen bir **Sistem Mühendisi** olsaydım, PoC (Prototip) aşamasından sonra projeyi gerçek üretime (Production) taşımak için şu özelliklerin eklenmesini önerirdim. Bunları sunumda "Gelecek Vizyonumuz ve Yol Haritamız" olarak jüriye sunabilirsiniz:

1. **Şebeke Kararlılığı ve Frekans Kontrolü (Grid Stability):** Fırtına anında rüzgar türbinleri aniden durduğunda şebekede oluşacak frekans düşüşlerine karşı Enerjisa'nın hidroelektrik veya doğalgaz santrallerinin ne kadar sürede devreye girip şebekeyi dengelediğini gösteren *Primer Frekans Kontrolü (PFC)* ekranı.
2. **Batarya Depolama (BESS) Entegrasyonu:** Üretilen fazla enerjinin şebekeye verilmek yerine sahada konumlandırılmış lityum-iyon batarya depolarına aktarılma durumunu ve bataryaların doluluk oranını (SoC - State of Charge) takip eden bir modül.
3. **Prediktif Bakım için IoT Titreşim Analizi:** Sadece meteorolojik veriler değil, doğrudan türbin rulmanlarından, dişli kutularından (gearbox) gelen titreşim ve sıcaklık sensör verilerinin dijital ikize işlenmesi ve arıza yapmadan önce bakım uyarısı verilmesi.
4. **API Kesinti ve Yedeklilik (Redundancy) Monitörü:** Canlı hava durumu veya SCADA verileri koptuğunda sistemin yapay zeka LSTM modellerinin tahminlerini devreye alarak "Son Bilinen İyi Değerlerle" otonom çalışmaya devam ettiğini gösteren sistem sağlığı izleyicisi.

---
*Projenin Frontend, Arayüz ve AI altyapısı başarıyla teslim edilmiştir. Jüri sunumunda tüm ekibe başarılar dilerim! 🚀*
