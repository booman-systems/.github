'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverDb } from '@/lib/db';
import { checkIntake } from '@/lib/domain/guardrails';
import { requiredMeasurements } from '@/lib/domain/measurements';
import type { GarmentType } from '@/lib/domain/types';

const IntakeSchema = z.object({
  bin_code: z.string().trim().min(1).max(10).toUpperCase(),
  acquisition: z.enum(['DONATED', 'PURCHASED']),
  acquisition_cost: z.coerce.number().min(0).default(0),
  acquisition_source: z.string().trim().max(200).optional(),
  brand: z.string().trim().max(100).optional(),
  garment_type: z.string(),
  tag_size: z.string().trim().max(30).optional(),
  size_type: z.enum(['REGULAR', 'BIG_AND_TALL', 'TALL']),
  color: z.string().trim().max(50).optional(),
  material: z.string().trim().max(100).optional(),
  decade: z.string().trim().max(20).optional(),
  condition: z.enum([
    'NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'NEW_WITH_IMPERFECTIONS',
    'PREOWNED_EXCELLENT', 'PREOWNED_GOOD', 'PREOWNED_FAIR',
  ]),
  weight_oz: z.coerce.number().int().min(1).max(2000).optional(),
  cleaned_confirmed: z.coerce.boolean().default(false),
  flaws_json: z.string().default('[]'),
  notes: z.string().trim().max(2000).optional(),
});

export interface IntakeResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  sku?: string;
}

export async function createItem(
  _prev: IntakeResult | null,
  formData: FormData,
): Promise<IntakeResult> {
  const db = serverDb();
  if (!db) {
    return { ok: false, errors: ['Supabase is not configured.'], warnings: [] };
  }

  const parsed = IntakeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      warnings: [],
    };
  }
  const input = parsed.data;
  const garmentType = input.garment_type as GarmentType;

  // Measurements: required per garment type, collected as measure_<key> fields.
  const measurements: Record<string, number> = {};
  const missing: string[] = [];
  for (const field of requiredMeasurements(garmentType)) {
    const raw = formData.get(`measure_${field.key}`);
    const val = raw ? Number(raw) : NaN;
    if (!raw || Number.isNaN(val) || val <= 0) missing.push(field.label);
    else measurements[field.key] = val;
  }
  if (missing.length > 0) {
    return {
      ok: false,
      errors: [`Missing required measurements: ${missing.join(', ')}`],
      warnings: [],
    };
  }

  const isUsed = !input.condition.startsWith('NEW');
  const gate = checkIntake({
    garmentDescription: `${garmentType} ${input.notes ?? ''}`,
    cleanedConfirmed: input.cleaned_confirmed,
    isUsed,
    weightOz: input.weight_oz ?? null,
    brand: input.brand ?? null,
    material: input.material ?? null,
  });
  if (!gate.ok) return { ok: false, errors: gate.errors, warnings: gate.warnings };

  let flaws: unknown = [];
  try {
    flaws = JSON.parse(input.flaws_json);
  } catch {
    /* keep [] */
  }

  const { data: skuData, error: skuError } = await db.rpc('next_sku', {
    p_bin: input.bin_code,
  });
  if (skuError || !skuData) {
    return { ok: false, errors: [`SKU generation failed: ${skuError?.message}`], warnings: [] };
  }
  const sku = skuData as string;

  const { error } = await db.from('items').insert({
    sku,
    bin_code: input.bin_code,
    acquisition: input.acquisition,
    acquisition_cost_cents: Math.round(input.acquisition_cost * 100),
    acquisition_source: input.acquisition_source ?? null,
    brand: input.brand ?? null,
    garment_type: garmentType,
    tag_size: input.tag_size ?? null,
    size_type: input.size_type,
    color: input.color ?? null,
    material: input.material ?? null,
    decade: input.decade || null,
    measurements,
    condition: input.condition,
    flaws,
    cleaned_confirmed: input.cleaned_confirmed,
    weight_oz: input.weight_oz ?? null,
    notes: input.notes ?? null,
  });
  if (error) {
    return { ok: false, errors: [`Insert failed: ${error.message}`], warnings: [] };
  }

  // COGS ledger entry for purchased items — books stay clean from item one.
  if (input.acquisition === 'PURCHASED' && input.acquisition_cost > 0) {
    await db.from('ledger_entries').insert({
      kind: 'COGS',
      amount_cents: -Math.round(input.acquisition_cost * 100),
      item_sku: sku,
      memo: `Acquired: ${input.acquisition_source ?? 'unknown source'}`,
    });
  }

  redirect(`/items?created=${encodeURIComponent(sku)}`);
}
