/**
 * Platform fee configuration — CONFIG, NOT CODE. Both platforms change
 * these roughly yearly; verify against the source URLs before trusting
 * a P&L. Values current as of research date 2026-07-08.
 */
export const FEES = {
  ebay: {
    // https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822
    clothingFvfPct: 0.1325,          // no store
    clothingFvfPctWithStore: 0.1235, // Basic store+
    perOrderFeeCentsUnder10: 30,
    perOrderFeeCentsOver10: 40,
    internationalFeePct: 0.0165,
    topRatedPlusDiscountPct: 0.10,   // discount ON the FVF, not off the total
    hasBasicStore: false,            // flip when the store subscription starts
  },
  poshmark: {
    // https://support.poshmark.com/s/article/297755057
    flatFeeCentsUnder15: 295,
    commissionPctAt15Plus: 0.20,
    buyerShippingCents: 649,         // USPS Ground Advantage, <=5 lb
    overweightUpgradeCents_5to10lb: 500,
    overweightUpgradeCents_10to15lb: 1000,
  },
} as const;

export interface NetResult {
  grossCents: number;
  feeCents: number;
  labelCents: number;
  netBeforeCogsCents: number;
}

export function ebayNet(
  salePriceCents: number,
  shippingChargedCents: number,
  labelCostCents: number,
): NetResult {
  const cfg = FEES.ebay;
  const base = salePriceCents + shippingChargedCents; // FVF applies to item+shipping (+tax, ignored here)
  const pct = cfg.hasBasicStore ? cfg.clothingFvfPctWithStore : cfg.clothingFvfPct;
  const perOrder =
    base <= 1000 ? cfg.perOrderFeeCentsUnder10 : cfg.perOrderFeeCentsOver10;
  const fee = Math.round(base * pct) + perOrder;
  return {
    grossCents: base,
    feeCents: fee,
    labelCents: labelCostCents,
    netBeforeCogsCents: base - fee - labelCostCents,
  };
}

export function poshmarkNet(salePriceCents: number, weightOz: number | null): NetResult {
  const cfg = FEES.poshmark;
  const fee =
    salePriceCents < 1500
      ? cfg.flatFeeCentsUnder15
      : Math.round(salePriceCents * cfg.commissionPctAt15Plus);
  let upgrade = 0;
  if (weightOz != null && weightOz > 160) upgrade = cfg.overweightUpgradeCents_10to15lb;
  else if (weightOz != null && weightOz > 80) upgrade = cfg.overweightUpgradeCents_5to10lb;
  return {
    grossCents: salePriceCents,
    feeCents: fee,
    labelCents: upgrade, // buyer pays the base label; seller pays only upgrades
    netBeforeCogsCents: salePriceCents - fee - upgrade,
  };
}

/** Suggested Poshmark price for net parity with a given eBay price. */
export function poshmarkParityPrice(ebayPriceCents: number, weightOz: number | null): number {
  const target = ebayNet(ebayPriceCents, 0, 0).netBeforeCogsCents;
  // invert: p - max(2.95, 0.20p) - upgrade = target
  let upgrade = 0;
  if (weightOz != null && weightOz > 160) upgrade = FEES.poshmark.overweightUpgradeCents_10to15lb;
  else if (weightOz != null && weightOz > 80) upgrade = FEES.poshmark.overweightUpgradeCents_5to10lb;
  const p = Math.round((target + upgrade) / (1 - FEES.poshmark.commissionPctAt15Plus));
  return Math.max(p, 1500); // parity math only meaningful in the 20% band
}
