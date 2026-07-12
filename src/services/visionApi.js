// ============================================================
//  TriVerse — Vision/YOLO API Servis Katmanı
//  Gerçek YOLOv8 modeli bağlı DEĞİL.
//  Backend endpoint hazır olduğunda bu fonksiyon güncellenir.
// ============================================================

export const VISION_STATUS = {
  isLive:      false,
  modelType:   'YOLOv8',
  trained:     false,
  note:        'Model entegrasyonu planlanıyor. Şu an demo analiz gösteriliyor.',
  dataType:    'simulation',
  backendReady: false,
};

/**
 * Kanat görüntüsü analizi
 * Backend hazır olduğunda gerçek endpoint çağrısı yapılır.
 * @param {File} file Yüklenen görüntü dosyası
 * @returns {Promise<object>} Analiz sonucu
 */
export async function analyzeBladeImage(file) {
  // Gerçek backend bağlandığında:
  // const formData = new FormData();
  // formData.append('image', file);
  // const res = await fetch('/api/yolo/analyze', { method: 'POST', body: formData });
  // return res.json();

  // Şu an: Demo simülasyon (2.2 sn gecikme)
  await new Promise(resolve => setTimeout(resolve, 2200));

  return {
    isDemo:       true,
    modelType:    'YOLOv8',
    status:       'demo',
    label:        'Demo Analiz — Model Entegrasyonu Planlanıyor',
    crackDetected: true,   // demo değer
    confidence:    0.94,   // demo değer
    location:     'WTG-04 / Kanat-B / Sektör 3',
    bbox:          [142, 310, 890, 720],
    note:         'Bu sonuç gerçek model çıktısı değildir. Demo simülasyondur.',
    dataType:     'simulation',
    recommendedAction: 'Demo: Kestirimci bakım planla (gerçek model entegre edildiğinde güncellenecek)',
  };
}
