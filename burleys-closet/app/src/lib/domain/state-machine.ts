import type { ItemStatus } from './types';

/**
 * Mirror of the transition rules enforced by the `items_transition` trigger
 * in the database. The DB is the authority; this copy exists so the UI can
 * show/hide actions without a round trip.
 */
export const TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  INTAKE: ['PHOTOGRAPHED', 'DONATED_OUT', 'LIQUIDATED'],
  PHOTOGRAPHED: ['DRAFTED', 'INTAKE', 'DONATED_OUT', 'LIQUIDATED'],
  DRAFTED: ['REVIEW', 'PHOTOGRAPHED'],
  REVIEW: ['LISTED', 'DRAFTED', 'PHOTOGRAPHED'],
  LISTED: ['SOLD_PENDING_DELIST', 'SOLD', 'REVIEW', 'DONATED_OUT', 'LIQUIDATED'],
  SOLD_PENDING_DELIST: ['SOLD'],
  SOLD: ['PACKED', 'RETURN_OPEN'],
  PACKED: ['SHIPPED', 'SOLD'],
  SHIPPED: ['COMPLETE', 'RETURN_OPEN'],
  COMPLETE: ['RETURN_OPEN'],
  RETURN_OPEN: ['RETURNED', 'COMPLETE'],
  RETURNED: ['INTAKE', 'DONATED_OUT', 'LIQUIDATED'],
  DONATED_OUT: [],
  LIQUIDATED: [],
};

export function canTransition(from: ItemStatus, to: ItemStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Pipeline stages shown on the dashboard, in conveyor-belt order. */
export const PIPELINE: { status: ItemStatus; label: string }[] = [
  { status: 'INTAKE', label: 'Needs photos' },
  { status: 'PHOTOGRAPHED', label: 'Awaiting draft' },
  { status: 'DRAFTED', label: 'Ready for review' },
  { status: 'REVIEW', label: 'In review' },
  { status: 'LISTED', label: 'Live' },
  { status: 'SOLD_PENDING_DELIST', label: '⚠ Delist pending' },
  { status: 'SOLD', label: 'To pack' },
  { status: 'PACKED', label: 'To ship' },
  { status: 'SHIPPED', label: 'In transit' },
];
