'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { markPacked, markShipped } from './actions';

export interface PackingRow {
  id: string;
  platform: 'EBAY' | 'POSHMARK';
  sku: string;
  state: string;
  salePriceCents: number;
  shipBy: string | null;
  buyer: string | null;
  bin: string;
  label: string;
}

export default function PackingList({ rows }: { rows: PackingRow[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [shipForm, setShipForm] = useState<Record<string, { tracking: string; carrier: string; label: string }>>({});

  if (rows.length === 0) {
    return <p className="text-stone-500">Nothing to pack. 🎉</p>;
  }

  function urgency(shipBy: string | null): string {
    if (!shipBy) return '';
    const hours = (new Date(shipBy).getTime() - Date.now()) / 3_600_000;
    if (hours < 12) return 'border-red-400 bg-red-50';
    if (hours < 36) return 'border-amber-400 bg-amber-50';
    return '';
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {rows.map((row) => {
        const form = shipForm[row.id] ?? { tracking: '', carrier: 'USPS', label: '' };
        return (
          <div key={row.id} className={`card space-y-2 ${urgency(row.shipBy)}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="mr-2 rounded bg-stone-800 px-2 py-0.5 font-mono text-sm font-bold text-white">
                  {row.bin}
                </span>
                <Link href={`/items/${row.sku}`} className="font-semibold hover:underline">
                  {row.label}
                </Link>
              </div>
              <span className="text-xs font-medium text-stone-500">
                {row.platform} · ${(row.salePriceCents / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              SKU {row.sku}
              {row.buyer ? ` · buyer ${row.buyer}` : ''}
              {row.shipBy
                ? ` · ship by ${new Date(row.shipBy).toLocaleDateString()} ${new Date(row.shipBy).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : ''}
            </p>

            {row.state === 'NEW' ? (
              <button
                disabled={pending}
                onClick={() => {
                  setError('');
                  startTransition(async () => {
                    const r = await markPacked(row.id);
                    if (r.error) setError(r.error);
                  });
                }}
                className="btn-primary w-full"
              >
                📦 Packed
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                  <input
                    placeholder="Tracking number"
                    value={form.tracking}
                    onChange={(e) =>
                      setShipForm({ ...shipForm, [row.id]: { ...form, tracking: e.target.value } })
                    }
                    className="field-input"
                  />
                  <select
                    value={form.carrier}
                    onChange={(e) =>
                      setShipForm({ ...shipForm, [row.id]: { ...form, carrier: e.target.value } })
                    }
                    className="field-input"
                  >
                    {['USPS', 'UPS', 'FedEx'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Label $"
                    type="number"
                    step="0.01"
                    value={form.label}
                    onChange={(e) =>
                      setShipForm({ ...shipForm, [row.id]: { ...form, label: e.target.value } })
                    }
                    className="field-input"
                  />
                </div>
                <button
                  disabled={pending || (row.platform === 'EBAY' && !form.tracking)}
                  onClick={() => {
                    setError('');
                    startTransition(async () => {
                      const r = await markShipped({
                        orderId: row.id,
                        trackingNumber: form.tracking,
                        carrier: form.carrier,
                        labelCostCents: form.label ? Math.round(Number(form.label) * 100) : null,
                      });
                      if (r.error) setError(r.error);
                    });
                  }}
                  className="btn-primary w-full"
                >
                  🚚 Shipped{row.platform === 'EBAY' ? ' (uploads tracking to eBay)' : ''}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
