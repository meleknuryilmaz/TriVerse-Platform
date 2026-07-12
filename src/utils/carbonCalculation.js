// ============================================================
//  TriVerse — Karbon Hesaplama Utility
//  Tüm değerler TAHMİNİDİR ve proje varsayımlarına dayanır.
//  Gerçek API verisi değildir.
// ============================================================

import { FINANCIAL_ASSUMPTIONS } from '../config/financialAssumptions';

/**
 * Tahmini önlenen emisyon hesaplar
 * Formül: Üretim (MWh) × Şebeke emisyon faktörü (tCO₂e/MWh)
 *
 * @param {number} mwh Tahmini yenilenebilir üretim (MWh)
 * @param {number} [emissionFactor] tCO₂e/MWh (varsayılan: config değeri)
 * @returns {{ avoidedTons: number, formula: string, isEstimate: boolean }}
 */
export function calculateAvoidedEmissions(mwh, emissionFactor) {
  const ef = emissionFactor ?? FINANCIAL_ASSUMPTIONS.gridEmissionFactor;
  return {
    avoidedTons: +(mwh * ef).toFixed(4),
    formula:     `${mwh.toFixed(3)} MWh × ${ef} tCO₂e/MWh`,
    isEstimate:   true,
    sourceNote:   FINANCIAL_ASSUMPTIONS.sourceNotes.gridEmissionFactor,
    dataType:    'calculated',
  };
}

/**
 * Karbon kredi geliri hesaplar
 * Formül: Önlenen emisyon (tCO₂) × Karbon kredi fiyatı (USD/tCO₂)
 *
 * @param {number} avoidedTons tCO₂
 * @param {number} [priceUSD] USD/tCO₂ (varsayılan: config)
 * @returns {{ revenueUSD: number, isEstimate: boolean }}
 */
export function calculateCarbonCreditValue(avoidedTons, priceUSD) {
  const price = priceUSD ?? FINANCIAL_ASSUMPTIONS.carbonCreditPriceUSD;
  return {
    revenueUSD:  +(avoidedTons * price).toFixed(4),
    priceUsed:    price,
    isEstimate:   true,
    sourceNote:   FINANCIAL_ASSUMPTIONS.sourceNotes.carbonCreditPrice,
    dataType:    'calculated',
  };
}

/**
 * I-REC sertifika geliri hesaplar
 * Formül: Üretim (MWh) × I-REC birim fiyatı (USD/MWh)
 *
 * @param {number} mwh Üretim (MWh)
 * @param {number} [irecPrice] USD/MWh (varsayılan: config)
 * @returns {{ revenueUSD: number, isEstimate: boolean }}
 */
export function calculateIrecRevenue(mwh, irecPrice) {
  const price = irecPrice ?? FINANCIAL_ASSUMPTIONS.irecPriceUSDPerMWh;
  return {
    revenueUSD:  +(mwh * price).toFixed(4),
    priceUsed:    price,
    isEstimate:   true,
    sourceNote:   FINANCIAL_ASSUMPTIONS.sourceNotes.irecPrice,
    dataType:    'calculated',
  };
}

/**
 * Toplam yeşil gelir hesaplar (karbon + I-REC)
 */
export function calculateTotalGreenRevenue(mwh) {
  const ef      = FINANCIAL_ASSUMPTIONS.gridEmissionFactor;
  const avoided = mwh * ef;
  const ccRev   = avoided * FINANCIAL_ASSUMPTIONS.carbonCreditPriceUSD;
  const irecRev = mwh * FINANCIAL_ASSUMPTIONS.irecPriceUSDPerMWh;
  return {
    totalUSD:     +(ccRev + irecRev).toFixed(4),
    carbonRev:    +ccRev.toFixed(4),
    irecRev:      +irecRev.toFixed(4),
    avoidedTons:  +avoided.toFixed(4),
    isEstimate:    true,
    dataType:     'calculated',
  };
}
