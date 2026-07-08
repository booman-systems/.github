'use client';

import { useActionState, useState } from 'react';
import { createItem, type IntakeResult } from './actions';
import { requiredMeasurements } from '@/lib/domain/measurements';
import { CONDITION_LABELS } from '@/lib/domain/guardrails';
import type { GarmentType } from '@/lib/domain/types';

const GARMENT_TYPES: { value: GarmentType; label: string }[] = [
  { value: 'TSHIRT', label: 'T-Shirt' },
  { value: 'CASUAL_SHIRT', label: 'Casual / Button-Down Shirt' },
  { value: 'DRESS_SHIRT', label: 'Dress Shirt' },
  { value: 'POLO', label: 'Polo' },
  { value: 'SWEATER', label: 'Sweater' },
  { value: 'SWEATSHIRT_HOODIE', label: 'Sweatshirt / Hoodie' },
  { value: 'JACKET_COAT', label: 'Jacket / Coat' },
  { value: 'VEST', label: 'Vest' },
  { value: 'SUIT_JACKET_BLAZER', label: 'Suit Jacket / Blazer' },
  { value: 'SUIT', label: 'Full Suit' },
  { value: 'JEANS', label: 'Jeans' },
  { value: 'PANTS', label: 'Pants' },
  { value: 'SHORTS', label: 'Shorts' },
  { value: 'OVERALLS_COVERALLS', label: 'Overalls / Coveralls' },
  { value: 'HAT', label: 'Hat' },
  { value: 'BELT', label: 'Belt' },
  { value: 'OTHER_ACCESSORY', label: 'Other Accessory' },
];

interface FlawRow {
  type: string;
  location: string;
  note: string;
}

export default function IntakeForm() {
  const [result, formAction, pending] = useActionState<IntakeResult | null, FormData>(
    createItem,
    null,
  );
  const [acquisition, setAcquisition] = useState<'DONATED' | 'PURCHASED'>('PURCHASED');
  const [garmentType, setGarmentType] = useState<GarmentType>('CASUAL_SHIRT');
  const [weightOz, setWeightOz] = useState<string>('');
  const [flaws, setFlaws] = useState<FlawRow[]>([]);

  const measurementFields = requiredMeasurements(garmentType);
  const overLimit = Number(weightOz) > 80;

  return (
    <form action={formAction} className="space-y-6">
      {result && !result.ok && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {result.errors.map((e) => (
            <p key={e}>• {e}</p>
          ))}
        </div>
      )}
      {result?.warnings?.length ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {result.warnings.map((w) => (
            <p key={w}>• {w}</p>
          ))}
        </div>
      ) : null}

      {/* Acquisition */}
      <fieldset className="card space-y-3">
        <legend className="px-1 font-semibold">Acquisition</legend>
        <div className="flex gap-2">
          {(['PURCHASED', 'DONATED'] as const).map((t) => (
            <label
              key={t}
              className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center font-medium ${
                acquisition === t
                  ? 'border-amber-700 bg-amber-50 text-amber-800'
                  : 'border-stone-300 bg-white text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="acquisition"
                value={t}
                checked={acquisition === t}
                onChange={() => setAcquisition(t)}
                className="sr-only"
              />
              {t === 'PURCHASED' ? 'Purchased' : 'Donated'}
            </label>
          ))}
        </div>
        {acquisition === 'PURCHASED' && (
          <div>
            <label className="field-label">Cost ($)</label>
            <input
              name="acquisition_cost"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              className="field-input"
              placeholder="4.99"
            />
          </div>
        )}
        <div>
          <label className="field-label">
            {acquisition === 'PURCHASED' ? 'Source (store, estate sale…)' : 'Donor'}
          </label>
          <input name="acquisition_source" className="field-input" />
        </div>
        <div>
          <label className="field-label">Storage bin</label>
          <input
            name="bin_code"
            required
            className="field-input uppercase"
            placeholder="B07"
            maxLength={10}
          />
          <p className="mt-1 text-xs text-stone-500">
            SKU is generated as BIN-### — write it on the bag/tag.
          </p>
        </div>
      </fieldset>

      {/* Garment */}
      <fieldset className="card space-y-3">
        <legend className="px-1 font-semibold">Garment</legend>
        <div>
          <label className="field-label">Type</label>
          <select
            name="garment_type"
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value as GarmentType)}
            className="field-input"
          >
            {GARMENT_TYPES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Brand</label>
            <input name="brand" className="field-input" placeholder="Carhartt" />
          </div>
          <div>
            <label className="field-label">Tag size</label>
            <input name="tag_size" className="field-input" placeholder="3XL / 3XLT" />
          </div>
          <div>
            <label className="field-label">Size type</label>
            <select name="size_type" defaultValue="BIG_AND_TALL" className="field-input">
              <option value="BIG_AND_TALL">Big &amp; Tall</option>
              <option value="TALL">Tall</option>
              <option value="REGULAR">Regular</option>
            </select>
          </div>
          <div>
            <label className="field-label">Color</label>
            <input name="color" className="field-input" placeholder="Brown" />
          </div>
          <div>
            <label className="field-label">Material</label>
            <input name="material" className="field-input" placeholder="Duck canvas" />
          </div>
          <div>
            <label className="field-label">Decade (if vintage)</label>
            <select name="decade" defaultValue="" className="field-input">
              <option value="">Not vintage / unknown</option>
              {['Y2K', '1990s', '1980s', '1970s', '1960s', '1950s', 'Pre-1950'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Measurements — required per garment type */}
      {measurementFields.length > 0 && (
        <fieldset className="card space-y-3">
          <legend className="px-1 font-semibold">Measurements (inches, laid flat)</legend>
          {measurementFields.map((f) => (
            <div key={f.key}>
              <label className="field-label">{f.label}</label>
              <input
                name={`measure_${f.key}`}
                type="number"
                step="0.25"
                min="0"
                inputMode="decimal"
                required
                className="field-input"
                placeholder={f.hint}
              />
            </div>
          ))}
        </fieldset>
      )}

      {/* Condition & flaws */}
      <fieldset className="card space-y-3">
        <legend className="px-1 font-semibold">Condition</legend>
        <select name="condition" required defaultValue="PREOWNED_GOOD" className="field-input">
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="space-y-2">
          {flaws.map((flaw, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={flaw.type}
                onChange={(e) =>
                  setFlaws(flaws.map((f, j) => (j === i ? { ...f, type: e.target.value } : f)))
                }
                className="field-input"
                placeholder="stain / hole / fading"
              />
              <input
                value={flaw.location}
                onChange={(e) =>
                  setFlaws(
                    flaws.map((f, j) => (j === i ? { ...f, location: e.target.value } : f)),
                  )
                }
                className="field-input"
                placeholder="left cuff"
              />
              <button
                type="button"
                onClick={() => setFlaws(flaws.filter((_, j) => j !== i))}
                className="rounded-lg border border-stone-300 px-3 text-stone-500"
                aria-label="Remove flaw"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFlaws([...flaws, { type: '', location: '', note: '' }])}
            className="text-sm font-medium text-amber-800"
          >
            + Add flaw
          </button>
          <input type="hidden" name="flaws_json" value={JSON.stringify(flaws)} />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="cleaned_confirmed" value="true" className="mt-1" />
          <span>
            Item has been <strong>properly cleaned</strong> (required by eBay for used
            clothing — the listing will state this).
          </span>
        </label>
      </fieldset>

      {/* Weight */}
      <fieldset className="card space-y-2">
        <legend className="px-1 font-semibold">Shipping weight</legend>
        <label className="field-label">Packed weight (oz)</label>
        <input
          name="weight_oz"
          type="number"
          min="1"
          inputMode="numeric"
          value={weightOz}
          onChange={(e) => setWeightOz(e.target.value)}
          className="field-input"
          placeholder="e.g. 48 (3 lb)"
        />
        {overLimit && (
          <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
            ⚠ Over Poshmark&apos;s 5 lb label — seller pays a $5–10 upgrade there. Consider
            eBay-only or price up on Poshmark.
          </p>
        )}
      </fieldset>

      <div className="card">
        <label className="field-label">Notes</label>
        <textarea name="notes" rows={2} className="field-input" />
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full py-4 text-lg">
        {pending ? 'Saving…' : 'Save item → get SKU'}
      </button>
    </form>
  );
}
