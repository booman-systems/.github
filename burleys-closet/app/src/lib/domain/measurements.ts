import type { GarmentType } from './types';

export interface MeasurementField {
  key: string;
  label: string;
  hint: string;
}

const TOP_FIELDS: MeasurementField[] = [
  { key: 'pit_to_pit', label: 'Pit to pit (chest)', hint: 'Armpit seam to armpit seam, laid flat' },
  { key: 'shoulder', label: 'Shoulder', hint: 'Seam to seam across the back' },
  { key: 'sleeve', label: 'Sleeve', hint: 'Shoulder seam to cuff' },
  { key: 'length', label: 'Length', hint: 'High point of shoulder to hem' },
];

const BOTTOM_FIELDS: MeasurementField[] = [
  { key: 'waist_flat', label: 'Waist (flat)', hint: 'Across waistband, laid flat — buyers double it' },
  { key: 'inseam', label: 'Inseam', hint: 'Crotch seam to leg opening' },
  { key: 'rise', label: 'Rise', hint: 'Waistband top to crotch seam' },
  { key: 'leg_opening', label: 'Leg opening', hint: 'Across the hem, laid flat' },
];

const TOPS: GarmentType[] = [
  'TSHIRT', 'CASUAL_SHIRT', 'DRESS_SHIRT', 'POLO', 'SWEATER',
  'SWEATSHIRT_HOODIE', 'JACKET_COAT', 'VEST', 'SUIT_JACKET_BLAZER',
];
const BOTTOMS: GarmentType[] = ['JEANS', 'PANTS', 'SHORTS'];

/**
 * Required measurements per garment type. Vintage tag sizes lie; big & tall
 * buyers purchase by measurement — an item cannot leave INTAKE without these.
 */
export function requiredMeasurements(t: GarmentType): MeasurementField[] {
  if (TOPS.includes(t)) return TOP_FIELDS;
  if (BOTTOMS.includes(t)) return BOTTOM_FIELDS;
  if (t === 'SUIT') return [...TOP_FIELDS, ...BOTTOM_FIELDS];
  if (t === 'OVERALLS_COVERALLS') {
    return [
      { key: 'chest', label: 'Chest (flat)', hint: 'Across chest, laid flat' },
      ...BOTTOM_FIELDS.slice(0, 2),
    ];
  }
  return []; // hats, belts, accessories: freeform in notes
}

/** Auto-generated description block, identical on both platforms. */
export function measurementBlock(
  t: GarmentType,
  m: Record<string, number>,
): string {
  const fields = requiredMeasurements(t);
  if (fields.length === 0) return '';
  const lines = fields
    .filter((f) => m[f.key] != null)
    .map((f) => `• ${f.label}: ${m[f.key]}"`);
  return [
    'MEASUREMENTS (garment laid flat, in inches):',
    ...lines,
    'Please compare to a garment that fits you — vintage sizing runs small.',
  ].join('\n');
}
