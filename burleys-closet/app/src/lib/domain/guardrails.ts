import type { ConditionGrade } from './types';

export interface IntakeCheck {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Platform-policy guardrails, applied at intake before an item can exist.
 * Sources: research/01 (eBay used-clothing policy), research/03 (Poshmark
 * prohibited items).
 */
export function checkIntake(input: {
  garmentDescription: string;
  cleanedConfirmed: boolean;
  isUsed: boolean;
  weightOz?: number | null;
  brand?: string | null;
  material?: string | null;
}): IntakeCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = `${input.garmentDescription} ${input.material ?? ''}`.toLowerCase();

  // Hard blocks — banned on both platforms when used.
  const banned = ['underwear', 'boxer short', 'briefs', 'sock', 'athletic supporter'];
  if (input.isUsed && banned.some((b) => text.includes(b))) {
    errors.push(
      'Used underwear and socks are prohibited on eBay and Poshmark — cannot intake.',
    );
  }

  if (input.isUsed && !input.cleanedConfirmed) {
    errors.push(
      'eBay policy: used clothing must be properly cleaned and the listing must say so. Confirm cleaning first.',
    );
  }

  // Review flags — allowed, but need a human decision.
  const furWords = ['real fur', 'mink', 'fox fur', 'python', 'alligator', 'crocodile'];
  if (furWords.some((w) => text.includes(w))) {
    warnings.push('Real fur / exotic leather: check endangered-species rules before listing on Poshmark.');
  }

  const hypeBrands = ['supreme', 'bape', 'off-white', 'palace', 'kith', 'fear of god'];
  if (input.brand && hypeBrands.includes(input.brand.toLowerCase())) {
    warnings.push(
      'Hype streetwear brand: eBay Authenticity Guarantee applies at $200+; item will route through authentication.',
    );
  }

  if (input.weightOz != null && input.weightOz > 80) {
    warnings.push(
      `Packed weight ${(input.weightOz / 16).toFixed(1)} lb exceeds Poshmark's 5 lb label — seller pays $5–10 upgrade. Consider eBay-only or price up on Poshmark.`,
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}

export const CONDITION_LABELS: Record<ConditionGrade, string> = {
  NEW_WITH_TAGS: 'New with tags',
  NEW_WITHOUT_TAGS: 'New without tags',
  NEW_WITH_IMPERFECTIONS: 'New with imperfections',
  PREOWNED_EXCELLENT: 'Pre-owned — Excellent',
  PREOWNED_GOOD: 'Pre-owned — Good',
  PREOWNED_FAIR: 'Pre-owned — Fair',
};
