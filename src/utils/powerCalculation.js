// ============================================================
//  TriVerse — Güç Üretim Hesaplama Utility
//  Önemli: Tüm sonuçlar TAHMİNİDİR.
//  Gerçek SCADA verisi mevcut değil.
// ============================================================

import { DEFAULT_TURBINE, REFERENCE_POWER_CURVE } from '../config/turbineAssumptions';

/**
 * Rüzgar hızından güç faktörü hesaplar (referans power curve interpolasyonu)
 * @param {number} windSpeed m/s
 * @returns {number} 0–1 arası güç faktörü
 */
export function getPowerFactor(windSpeed) {
  const { cutInSpeed, cutOutSpeed } = DEFAULT_TURBINE;

  if (windSpeed < cutInSpeed || windSpeed > cutOutSpeed) return 0;

  const curve = REFERENCE_POWER_CURVE;

  // İki nokta arasında lineer interpolasyon
  for (let i = 0; i < curve.length - 1; i++) {
    if (windSpeed >= curve[i].windSpeed && windSpeed <= curve[i + 1].windSpeed) {
      const ratio =
        (windSpeed - curve[i].windSpeed) /
        (curve[i + 1].windSpeed - curve[i].windSpeed);
      return curve[i].powerFactor + ratio * (curve[i + 1].powerFactor - curve[i].powerFactor);
    }
  }
  return 0;
}

/**
 * Rüzgar hızı ve santral kapasitesinden tahmini güç hesaplar
 * @param {number} windSpeed m/s
 * @param {number} capacityMW MW
 * @param {object} options Opsiyonel türbin parametreleri
 * @returns {{ powerMW: number, powerFactor: number, method: string, isEstimate: boolean }}
 */
export function calculatePowerFromWindSpeed(windSpeed, capacityMW, options = {}) {
  if (!capacityMW || capacityMW <= 0) {
    return { powerMW: 0, powerFactor: 0, method: 'none', isEstimate: true };
  }

  const factor  = getPowerFactor(windSpeed);
  const powerMW = +(capacityMW * factor).toFixed(2);

  return {
    powerMW,
    powerFactor: +factor.toFixed(4),
    method:     'reference-power-curve',
    isEstimate:  true,
    label:      'Tahmini Üretim',
    source:     'Open-Meteo rüzgar verisi + IEC 61400-12 referans güç eğrisi',
  };
}

/**
 * Kapasite faktörü hesaplar (%)
 * @param {number} windSpeed m/s
 * @returns {number} Kapasite faktörü %
 */
export function calculateCapacityFactor(windSpeed) {
  return +(getPowerFactor(windSpeed) * 100).toFixed(1);
}

/**
 * Belirli süre için tahmini enerji üretimi (MWh)
 * @param {number} powerMW Güç (MW)
 * @param {number} hours Saat
 * @returns {number} MWh
 */
export function calculateEnergyMWh(powerMW, hours) {
  return +(powerMW * hours).toFixed(4);
}

/**
 * Saatlik rüzgar verisinden günlük toplam tahmini üretim
 * @param {number[]} hourlyWindSpeeds Saatlik rüzgar hızları (m/s)
 * @param {number} capacityMW MW
 * @returns {{ totalMWh: number, avgCapFactor: number, peakMW: number }}
 */
export function calculateDailyEnergy(hourlyWindSpeeds, capacityMW) {
  if (!hourlyWindSpeeds?.length) return { totalMWh: 0, avgCapFactor: 0, peakMW: 0 };

  const powers      = hourlyWindSpeeds.map(v => calculatePowerFromWindSpeed(v, capacityMW).powerMW);
  const totalMWh    = powers.reduce((sum, p) => sum + p, 0); // her nokta = 1 saat
  const avgCapFactor = +(powers.reduce((sum, p) => sum + p, 0) / (capacityMW * powers.length) * 100).toFixed(1);
  const peakMW      = +Math.max(...powers).toFixed(2);

  return { totalMWh: +totalMWh.toFixed(2), avgCapFactor, peakMW, isEstimate: true };
}
