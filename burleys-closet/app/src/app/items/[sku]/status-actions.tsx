'use client';

import { useState, useTransition } from 'react';
import { advanceStatus } from './actions';
import type { ItemStatus } from '@/lib/domain/types';

const ACTION_LABELS: Partial<Record<ItemStatus, string>> = {
  PHOTOGRAPHED: '✓ Photos done',
  DRAFTED: 'Mark drafted',
  REVIEW: 'Start review',
  LISTED: 'Mark listed',
  SOLD: 'Confirm delisted → SOLD',
  PACKED: '📦 Packed',
  SHIPPED: '🚚 Shipped',
  COMPLETE: 'Complete',
  DONATED_OUT: 'Donate out',
  LIQUIDATED: 'Liquidate',
  INTAKE: 'Back to intake',
  RETURN_OPEN: 'Return opened',
  RETURNED: 'Item returned',
};

export default function StatusActions({
  sku,
  transitions,
}: {
  sku: string;
  transitions: ItemStatus[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  if (transitions.length === 0) return null;

  const primary = transitions[0];
  const secondary = transitions.slice(1);

  function go(to: ItemStatus) {
    setError('');
    startTransition(async () => {
      const result = await advanceStatus(sku, to);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => go(primary)}
        disabled={pending}
        className="btn-primary w-full py-3"
      >
        {pending ? 'Saving…' : ACTION_LABELS[primary] ?? primary}
      </button>
      {secondary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {secondary.map((t) => (
            <button
              key={t}
              onClick={() => go(t)}
              disabled={pending}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-amber-600"
            >
              {ACTION_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
