# TriVerse Platformu Kapsamlı Arayüz Rehberi ve Terimler Sözlüğü

Bu belge, **TriVerse Platformu** arayüzünde (Dashboard, Santral Haritası, Fırtına Kontrol Merkezi vb.) görünen **her bir terimi, kelimeyi, sayıyı ve arkadaki matematiksel formülü** farklı disiplinlerden (İktisat, İnsan Kaynakları, İşletme, İletişim vb.) gelen ekip üyelerinin en ince detayına kadar anlayabilmesi için detaylandırılmıştır.

---

## BÖLÜM 1: CANLI ÜRETİM & FIRTINA KONTROL MERKEZİ (Storm Control Widget)
Bu ekran, santrallerin gerçek zamanlı enerji üretimini ve özellikle rüzgar türbinlerinin fırtına gibi ekstrem hava koşullarındaki "Yapay Zeka" otonom kriz yönetimini gösterir.

### 📊 Ekranda Görülen Kelimeler ve Metrikler
*   **Rüzgar Hızı (m/s):** Saniyedeki rüzgar hızını metre cinsinden gösterir. Saniyede 1 metre (m/s) rüzgar hızı, saatte 3.6 kilometreye (km/h) eşittir. (Örn: 25 m/s = 90 km/h).
*   **Dalga Boyu (m):** Deniz üstü (Offshore) santralleri etkileyen anlık dalga yüksekliği.
*   **Anlık Güç (MW):** O anda saniyelik olarak üretilen toplam elektrik miktarını (Megawatt) gösterir.
*   **Durum (Üretimde / Frenlendi):** Türbinlerin aktif elektrik üretip üretmediği durumudur.
*   **Open-Meteo API:** Arayüze gerçek hava durumu verilerini (rüzgar, sıcaklık, dalga) canlı olarak sağlayan sistemin/servisin adıdır.
*   **LSTM v2.4 (Long Short-Term Memory):** Gelecekteki rüzgarı ve fırtınayı tahmin etmek için arkaplanda kullanılan Yapay Zeka modelinin adıdır. Rüzgar tahmininde en başarılı derin öğrenme modellerinden biridir.

### 📐 Yapısal Sağlık Göstergeleri
Türbinlerin strese (zorlanmaya) ne kadar dayandığını gösteren güvenlik yüzdeleridir.
*   **Kule Titreşim Stresi (%):** Güçlü rüzgar nedeniyle türbinin direk/kule kısmında oluşan sallanmanın veya yalpalamanın tehlike oranı.
*   **Dalga Kaynaklı Yük (%):** Açık denizlerdeki dev dalgaların, türbinin deniz altındaki temeline (substructure) uyguladığı baskı ve yorulma oranı.
*   **Kanat Rüzgar Yükü (%):** Pervanenin rüzgara karşı ne kadar büküldüğünü ve kırılma riskini gösteren oran.

### 🧮 Canlı Yeşil Finans Sayaçları ve Formülleri
*   **Üretilen Enerji (MWh - Megawatt Saat):** Toplam üretilen elektriktir.
    *   **Formül / Kübik Yasa:** `Anlık Güç = Toplam Kapasite × (Anlık Rüzgar Hızı / Maksimum Rüzgar Hızı)³`. Rüzgardan elde edilen enerji, rüzgar hızının *küpüyle* orantılıdır. Rüzgar iki kat eserse üretim sekiz kat artar.
    *   **Sınırlar:** Rüzgar hızı 3 m/s'den düşükse pervane dönmez (Cut-in). 25 m/s'yi geçerse pervane kırılmasın diye otonom olarak kilitlenir (Cut-out).
*   **Engellenen Karbon (tCO₂):** Fosil yakıt (kömür/doğalgaz) yerine rüzgar kullanıldığı için doğaya salınması engellenen karbondioksit gazıdır.
    *   **Formül:** `Engellenen Karbon = Üretilen Enerji (MWh) × 0.45`
    *   **Not:** 0.45 değeri, "Türkiye Şebeke Emisyon Faktörü"dür. Türkiye'de üretilen ortalama 1 MWh elektrik için doğaya 0.45 ton karbon salınır. Triverse bunu engeller.
*   **Kazanılan Yeşil Gelir ($):** Yenilenebilir enerji üretmenin borsa üzerinden kuruma sağladığı ekstra uluslararası paradır.
    *   **Formül:** `Üretilen Enerji × [I-REC Fiyatı + (Karbon Kredisi Fiyatı × 0.45)]`
*   **I-REC & Gold Standard:** "I-REC", uluslararası yeşil enerji ürettiğinizi kanıtlayan bir sertifikadır. "Gold Standard" ise dünyadaki en saygın karbon denkleştirme sertifikasyonudur.

### 🤖 Otonom Çözüm Paneli (AI Fırtına Müdahalesi)
Sistem fırtına algıladığında 3 aşamalı karar alır:
1.  **Mühendislik Çözümü (Pitch Control & Fren):** "Pitch Control", kanatların kendi etrafında dönerek rüzgarı kesmesini (uçak kanadı gibi) sağlamasıdır. Ardından mekanik frenle türbin kilitlenir, üretim durur ama türbin kurtarılır.
2.  **Lojistik Çözümü (Hava Penceresi):** Yapay zeka fırtınanın ne zaman biteceğini hesaplayıp o saat dilimi (Hava Penceresi) için limandaki bakım gemisine otomatik görev emri gönderir.
3.  **Finansal Çözüm (Sanal Santral - VPP):** Fırtınada denizdeki santral durduğunda para kaybedilir. Sistem anında VPP (Sanal Santral) mantığı ile iç kısımlardaki rüzgarlı karasal santrallere "Üretimi Artır!" komutu göndererek zararı (açığı) telafi eder.

---

## BÖLÜM 2: ANA KONTROL ODASI — SANTRAL HARİTASI (Plant Map Widget)
Enerjisa portföyündeki tüm santralleri haritada gösterir.

### 🗺️ Santral Tipleri (Filtreler)
*   **RES (Rüzgar Enerjisi Santrali):** Dağlara veya karaya kurulan rüzgar türbinleri.
*   **GES (Güneş Enerjisi Santrali):** Güneş paneli tarlaları.
*   **HES (Hidroelektrik Santrali):** Barajlar veya akarsu üzerine kurulan su gücü tesisleri. Elektrik üretimi "su debisine" (suyun akış miktarı ve hızına) bağlıdır.
*   **DGÇS (Doğalgaz Çevrim Santrali):** Doğalgaz yakarak elektrik üreten fosil kaynaklı tesisler.
*   **Offshore:** Denizin ortasına (karadan uzağa) dikilen devasa rüzgar türbinleridir. Rüzgar daha sürekli estiği için çok verimlidir.

### 🌡️ Harita Üzerindeki Tesis Verileri (Popup Ekranı)
Bir tesise tıkladığınızda çıkan mini karttaki terimler:
*   **Durum (Aktif / Planlanan):** Üretime başlamış veya henüz inşaat/planlama aşamasında olan tesisler.
*   **GHI İrradyans (W/m²):** Global Horizontal Irradiance (Küresel Yatay İrradyans). 1 metrekare yatay yüzeye yukarıdan düşen toplam güneş ışınımı miktarıdır. GES (Güneş) santrallerinin elektrik üretim potansiyelini doğrudan belirleyen rakamdır. Yüksek olması çok iyi güneş aldığı anlamına gelir.
*   **Rüzgar Yönü (° - Derece):** Rüzgarın hangi açıdan geldiği. Türbin kafa kısmını (Yaw motorları ile) bu yöne çevirir.
*   **Kapasite Kullanım Oranı (%):** Tesisin mevcut rüzgar veya güneşle, kurulu maksimum potansiyelinin yüzde kaçıyla çalıştığını gösterir (Örn: 100 MW'lık santral o an 60 MW üretiyorsa kapasite oranı %60'tır).

---

## BÖLÜM 3: YÖNETİM PANELİ VE DASHBOARD WIDGET'LARI
Burası şirketin finansal projeksiyonları, bakım planlamaları, insan kaynakları (İK) ve çalışan memnuniyeti gibi sürdürülebilirlik hedeflerinin yer aldığı ekrandır.

### 💰 Finansal ve Sürdürülebilirlik Tabloları
*   **AI vs OB Tahminleri (Kâr/Zarar):** 
    *   **AI Forecast:** Yapay zekanın hava tahminine bakarak öngördüğü finansal gelir.
    *   **OB Forecast:** Operasyonel Bütçe. İnsanların/yöneticilerin yıl başında excel tablolarında hedeflediği bütçe beklentisi.
    *   **NetAI:** Çıkan ekstra masraflar düşüldükten sonraki saf AI tahmini.
    *   Grafikteki "k" harfi "bin" demektir (10k = 10.000).
*   **Offshore Yatırım (ROI) Projeksiyonu:**
    *   **ROI (Return on Investment):** Bir projeye yatırılan paranın kârlılık getirisi.
    *   **Amortisman:** Denize santral kurmak çok pahalıdır. Grafikteki eksi (-) değerler (Amortisman), yatırılan bu paranın yıllar içerisinde yavaş yavaş geri ödenmesini / çıkarılmasını temsil eder.
    *   **Beklenen Gelir:** Santralin kendini ödedikten sonra şirkete bırakacağı saf kazanç.
*   **Biyoçeşitlilik (GRI/TSRS) Skoru:**
    *   **GRI (Küresel Raporlama Girişimi) & TSRS (Türkiye Sürdürülebilirlik Raporlama Standartları):** Dünyada ve Türkiye'de büyük şirketlerin çevreye ve topluma ne kadar duyarlı olduklarını puanlayan katı standartlar bütünü.
    *   **Kuş Göç Yolu Koruma Skoru:** Türbinlerin kuş sürülerinin rotası üzerinden geçerken radarlar vasıtasıyla algılanıp geçici süreyle durdurulması başarısı.
    *   **Yapay Resif Katkısı:** Denizdeki (Offshore) türbinlerin devasa temellerinin zamanla yosunlaşıp balıklar için bir yuva (resif) haline gelmesinin doğaya pozitif katkısı.

### 🔧 Teknik Bakım Terimleri
*   **Kanat İnspeksiyonu:** Türbin pervanelerinde yıldırım çarpması veya sürtünme kaynaklı kılcal çatlakların drone/kamera ile muayene edilmesi.
*   **Rulman Yağlama:** Türbinin dönen devasa şaftında sürtünmeyi engelleyen çelik bilyelerin periyodik olarak greslenmesi/yağlanması.
*   **Inverter Soğutma:** Üretilen elektriği dönüştüren invertör (çevirici) sistemlerinin aşırı ısınmasını engellemek için yapılan soğutma sistemi bakımı.
*   **Korozyon / Aşınma Risk Haritası:** Metal aksamların yağmur, deniz tuzu veya havadaki nem nedeniyle paslanma veya dökülme yapması (Korozyon).

### 👷 İnsan Kaynakları (İK) ve İş Güvenliği (İSG)
Arayüzde **"PoC Senaryo Verisi"** yazan etiketler (Kavram Kanıtlama - Proof of Concept) bu değerlerin sisteme test amaçlı konduğunu, kurumsal canlı veritabanına henüz bağlanmadığını ifade eder.

*   **Sertifikalar ve Yetkinlik:**
    *   **GWO Sertifikası (Global Wind Organisation):** Dünyadaki rüzgar santrallerinde çalışacak personelin sahip olması zorunlu olan, denizden kurtarma, yangın ve yüksekte çalışma eğitimlerini kapsayan küresel standart belgesi.
*   **Vardiya & Operasyon Hazırlığı:**
    *   **Eksiklik:** Hastalık, izin veya sertifika süresi dolduğu için vardiyaya gelemeyen personel sayısı.
    *   **Hazırlık (%):** Bir vardiyanın ekipman ve yetkin personel sayısıyla o günkü işi yapabilme gücü yüzdesi.
*   **Çalışan Memnuniyeti (Q2 2026):** "Q2", Quarter 2 anlamına gelir; yani yılın 2. Çeyreği (Nisan, Mayıs, Haziran aylarını kapsar). 
    *   **Katılım Oranı:** Şirkette o ankete katılan personelin yüzdesi.
*   **İş Güvenliği & Çalışan Refahı:**
    *   **Ramak Kala Olayı:** Bir işyerinde meydana gelen, kıl payı ucuz atlatılan ve kazaya dönüşmeyen çok tehlikeli durumlardır. (Örneğin tepeden ingiliz anahtarı düşmesi ama kimseye çarpmaması). İSG kültüründe bu olayların raporlanması ilerideki ölümlü kazaları önlemek için kritiktir.
    *   **PPE Kullanım Oranı (Personal Protective Equipment):** İşçilerin Kişisel Koruyucu Donanım (baret, fosforlu yelek, çelik burunlu ayakkabı, düşüş önleyici emniyet kemeri) kullanma kurallarına ne kadar uyduğu.
    *   **Fazla Mesai Riski:** Personelin aralıksız çok uzun süre çalıştırılmasının yaratacağı yorgunluk, dikkat dağınıklığı ve kaza yapma tehlikesi.
    *   **Olaysız Gün Hedefi:** Hiçbir çalışanın yaralanmadığı, iş kazasının yaşanmadığı gün sayısı rekoru hedefi.
