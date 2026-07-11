import { notFound } from 'next/navigation';
import { serverDb, isConfigured } from '@/lib/db';
import { TRANSITIONS } from '@/lib/domain/state-machine';
import { requiredMeasurements } from '@/lib/domain/measurements';
import { CONDITION_LABELS } from '@/lib/domain/guardrails';
import type { Flaw, Item, ItemStatus } from '@/lib/domain/types';
import PhotoUploader from './photo-uploader';
import StatusActions from './status-actions';

export const dynamic = 'force-dynamic';

interface PhotoRow {
  id: string;
  kind: string;
  sort: number;
  ebay_path: string | null;
  master_path: string;
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  if (!isConfigured()) {
    return <p className="text-stone-600">Supabase not configured.</p>;
  }
  const db = serverDb()!;

  const { data: item } = await db.from('items').select('*').eq('sku', sku).single();
  if (!item) notFound();
  const typedItem = item as Item;

  const { data: photos } = await db
    .from('photos')
    .select('id, kind, sort, ebay_path, master_path')
    .eq('item_sku', sku)
    .order('sort');
  const photoRows = (photos ?? []) as PhotoRow[];

  // Signed thumbnails (bucket is private).
  const signed = await Promise.all(
    photoRows.map(async (p) => {
      const path = p.ebay_path ?? p.master_path;
      const { data } = await db.storage.from('item-photos').createSignedUrl(path, 3600);
      return { ...p, url: data?.signedUrl ?? null };
    }),
  );

  const fields = requiredMeasurements(typedItem.garment_type);
  const flaws = (typedItem.flaws ?? []) as Flaw[];
  const transitions = TRANSITIONS[typedItem.status as ItemStatus] ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {typedItem.brand ?? 'Unbranded'} ·{' '}
            {typedItem.garment_type.replaceAll('_', ' ').toLowerCase()}
          </h1>
          <p className="text-sm text-stone-500">
            SKU {typedItem.sku} · bin {typedItem.bin_code} ·{' '}
            {typedItem.tag_size ?? 'no tag size'}
            {typedItem.over_poshmark_limit ? ' · ⚠ over 5 lb' : ''}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {typedItem.status.replaceAll('_', ' ')}
        </span>
      </div>

      {/* Photos */}
      <section className="card space-y-3">
        <h2 className="font-semibold">Photos ({signed.length})</h2>
        {signed.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {signed.map((p) =>
              p.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.kind}
                  className="aspect-square rounded-lg object-cover"
                />
              ) : null,
            )}
          </div>
        )}
        <PhotoUploader itemSku={sku} existingCount={signed.length} />
      </section>

      {/* Facts */}
      <section className="card space-y-2 text-sm">
        <h2 className="font-semibold">Details</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          <dt className="text-stone-500">Condition</dt>
          <dd>{typedItem.condition ? CONDITION_LABELS[typedItem.condition] : '—'}</dd>
          <dt className="text-stone-500">Size type</dt>
          <dd>{typedItem.size_type.replaceAll('_', ' ')}</dd>
          <dt className="text-stone-500">Color / material</dt>
          <dd>
            {[typedItem.color, typedItem.material].filter(Boolean).join(' / ') || '—'}
          </dd>
          <dt className="text-stone-500">Decade</dt>
          <dd>{typedItem.decade ?? '—'}</dd>
          <dt className="text-stone-500">Weight</dt>
          <dd>
            {typedItem.weight_oz
              ? `${typedItem.weight_oz} oz (${(typedItem.weight_oz / 16).toFixed(1)} lb)`
              : '—'}
          </dd>
          <dt className="text-stone-500">Acquired</dt>
          <dd>
            {typedItem.acquisition === 'DONATED'
              ? 'Donated'
              : `$${(typedItem.acquisition_cost_cents / 100).toFixed(2)}`}
            {typedItem.acquisition_source ? ` — ${typedItem.acquisition_source}` : ''}
          </dd>
        </dl>

        {fields.length > 0 && (
          <>
            <h3 className="pt-2 font-semibold">Measurements</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
              {fields.map((f) => (
                <div key={f.key} className="contents">
                  <dt className="text-stone-500">{f.label}</dt>
                  <dd>
                    {typedItem.measurements?.[f.key] != null
                      ? `${typedItem.measurements[f.key]}"`
                      : '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {flaws.length > 0 && (
          <>
            <h3 className="pt-2 font-semibold">Flaws</h3>
            <ul className="list-inside list-disc">
              {flaws.map((f, i) => (
                <li key={i}>
                  {f.type}
                  {f.location ? ` — ${f.location}` : ''}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Pipeline actions */}
      <StatusActions sku={sku} transitions={transitions} />
    </div>
  );
}
