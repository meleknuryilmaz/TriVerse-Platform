// ============================================================
//  TriVerse — Finansal Hesaplama Utility
//  Önemli: EPİAŞ canlı bağlantısı mevcut değil.
//  Tüm gelir hesaplamaları PoC senaryo fiyatlarına dayanır.
// ============================================================

import { FINANCIAL_ASSUMPTIONS } from '../config/financialAssumptions';

/**
 * Tahmini brüt elektrik geliri
 * @param {number} mwh MWh
 * @param {number} pricePerMwh TL/MWh
 * @returns {{ revenueUSD: number, revenueTRY: number }}
 */
export function calculateGrossRevenue(mwh, pricePerMwh) {
  const revTRY = mwh * pricePerMwh;
  const revUSD = revTRY / FINANCIAL_ASSUMPTIONS.usdToTryRate;
  return {
    revenueTRY:    +revTRY.toFixed(2),
    revenueUSD:    +revUSD.toFixed(2),
    mwhUsed:        mwh,
    priceUsed:      pricePerMwh,
    isEstimate:     true,
    sourceNote:    'EPİAŞ bağlantısı mevcut değil — PoC fiyat senaryosu',
    dataType:      'calculated',
  };
}

/**
 * Fırtına/kesinti nedeniyle tahmini gelir kaybı
 * @param {number} powerMW Kaybedilen güç (MW)
 * @param {number} durationHours Süre (saat)
 * @param {number} pricePerMwh TL/MWh
 */
export function calculateStormLoss(powerMW, durationHours, pricePerMwh) {
  const lostMWh = powerMW * durationHours;
  return calculateGrossRevenue(lostMWh, pricePerMwh);
}

/**
 * 7 günlük gelir projeksiyonu
 * @param {number[]} dailyMwhArray 7 günlük günlük MWh listesi
 * @param {number} avgPriceTRY Ortalama TL/MWh
 */
export function calculate7DayProjection(dailyMwhArray, avgPriceTRY) {
  const total = dailyMwhArray.reduce((sum, mwh) => sum + mwh, 0);
  return {
    totalMWh:    +total.toFixed(2),
    totalRevTRY: +(total * avgPriceTRY).toFixed(2),
    totalRevUSD: +(total * avgPriceTRY / FINANCIAL_ASSUMPTIONS.usdToTryRate).toFixed(2),
    dailyAvgRev: +(total * avgPriceTRY / 7).toFixed(2),
    isEstimate:   true,
    dataType:    'calculated',
  };
}
