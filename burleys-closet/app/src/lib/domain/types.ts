export type ItemStatus =
  | 'INTAKE' | 'PHOTOGRAPHED' | 'DRAFTED' | 'REVIEW' | 'LISTED'
  | 'SOLD_PENDING_DELIST' | 'SOLD' | 'PACKED' | 'SHIPPED' | 'COMPLETE'
  | 'RETURN_OPEN' | 'RETURNED' | 'DONATED_OUT' | 'LIQUIDATED';

export type AcquisitionType = 'DONATED' | 'PURCHASED';

export type GarmentType =
  | 'TSHIRT' | 'CASUAL_SHIRT' | 'DRESS_SHIRT' | 'POLO' | 'SWEATER' | 'SWEATSHIRT_HOODIE'
  | 'JACKET_COAT' | 'VEST' | 'SUIT_JACKET_BLAZER' | 'SUIT'
  | 'JEANS' | 'PANTS' | 'SHORTS' | 'OVERALLS_COVERALLS'
  | 'HAT' | 'BELT' | 'OTHER_ACCESSORY';

export type ConditionGrade =
  | 'NEW_WITH_TAGS' | 'NEW_WITHOUT_TAGS' | 'NEW_WITH_IMPERFECTIONS'
  | 'PREOWNED_EXCELLENT' | 'PREOWNED_GOOD' | 'PREOWNED_FAIR';

export type SizeType = 'REGULAR' | 'BIG_AND_TALL' | 'TALL';
export type Platform = 'EBAY' | 'POSHMARK';

export interface Flaw {
  type: string;      // stain | hole | pilling | fading | repair | missing_button | odor | other
  location: string;  // e.g. "left cuff"
  note?: string;
  photo_index?: number;
}

export interface Item {
  sku: string;
  bin_code: string;
  status: ItemStatus;
  acquisition: AcquisitionType;
  acquisition_cost_cents: number;
  acquisition_source: string | null;
  acquired_on: string;
  brand: string | null;
  garment_type: GarmentType;
  tag_size: string | null;
  standard_size: string | null;
  size_type: SizeType;
  color: string | null;
  material: string | null;
  decade: string | null;
  measurements: Record<string, number>;
  condition: ConditionGrade | null;
  flaws: Flaw[];
  cleaned_confirmed: boolean;
  authenticity_flag: boolean;
  weight_oz: number | null;
  over_poshmark_limit: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
