'use client';

import { useState, useTransition } from 'react';
import {
  draftListings,
  saveDraft,
  publishEbayListing,
  markPoshmarkListed,
  soldOnPoshmark,
} from './listing-actions';

export interface ListingRow {
  platform: 'EBAY' | 'POSHMARK';
  state: string;
  title: string;
  description: string | null;
  price_cents: number;
  offer_floor_cents: number | null;
  external_id: string | null;
  specifics: {
    categoryId?: string | null;
    categoryPath?: string | null;
    reasoning?: string;
  } | null;
}

export default function ListingPanel({
  sku,
  status,
  listings,
}: {
  sku: string;
  status: string;
  listings: ListingRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [poshSalePrice, setPoshSalePrice] = useState('');

  const ebay = listings.find((l) => l.platform === 'EBAY');
  const posh = listings.find((l) => l.platform === 'POSHMARK');
  const canDraft = ['PHOTOGRAPHED', 'DRAFTED', 'REVIEW'].includes(status);
  const isLive = status === 'LISTED';

  function run(fn: () => Promise<{ error?: string }>, okMsg: string) {
    setError('');
    setNotice('');
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else setNotice(okMsg);
    });
  }

  return (
    <section className="card space-y-4">
      <h2 className="font-semibold">Listings</h2>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {notice && (
        <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{notice}</p>
      )}

      {canDraft && (
        <button
          onClick={() =>
            run(
              () => draftListings(sku).then((r) => ({ error: r.error })),
              'Drafts generated — review below.',
            )
          }
          disabled={pending}
          className="btn-primary w-full py-3"
        >
          {pending ? 'Working…' : ebay ? '↻ Regenerate AI drafts' : '✨ Generate AI drafts'}
        </button>
      )}

      {ebay && (
        <DraftEditor
          key={`ebay-${ebay.title}-${ebay.price_cents}`}
          sku={sku}
          listing={ebay}
          pending={pending}
          onSave={(fields) =>
            run(
              () => saveDraft({ sku, platform: 'EBAY', ...fields }),
              'eBay draft saved.',
            )
          }
          onPublish={
            ebay.state === 'QUEUED' && status === 'REVIEW'
              ? () =>
                  run(() => publishEbayListing(sku), '🎉 Live on eBay!')
              : undefined
          }
        />
      )}

      {posh && (
        <DraftEditor
          key={`posh-${posh.title}-${posh.price_cents}`}
          sku={sku}
          listing={posh}
          pending={pending}
          onSave={(fields) =>
            run(
              () => saveDraft({ sku, platform: 'POSHMARK', ...fields }),
              'Poshmark draft saved.',
            )
          }
          onMarkListed={
            posh.state === 'QUEUED'
              ? () =>
                  run(
                    () => markPoshmarkListed(sku),
                    'Marked live on Poshmark.',
                  )
              : undefined
          }
        />
      )}

      {isLive && posh?.state === 'ACTIVE' && (
        <div className="space-y-2 rounded-lg border border-stone-200 p-3">
          <p className="text-sm font-semibold">Sold on Poshmark?</p>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="Sale price $"
              value={poshSalePrice}
              onChange={(e) => setPoshSalePrice(e.target.value)}
              className="field-input"
            />
            <button
              disabled={pending || !poshSalePrice}
              onClick={() =>
                run(
                  () => soldOnPoshmark(sku, Math.round(Number(poshSalePrice) * 100)),
                  'Poshmark sale recorded — eBay delisted automatically.',
                )
              }
              className="btn-primary whitespace-nowrap"
            >
              Record sale
            </button>
          </div>
          <p className="text-xs text-stone-500">
            Recording the sale withdraws the eBay listing via API immediately.
          </p>
        </div>
      )}
    </section>
  );
}

function DraftEditor({
  listing,
  pending,
  onSave,
  onPublish,
  onMarkListed,
}: {
  sku: string;
  listing: ListingRow;
  pending: boolean;
  onSave: (fields: {
    title: string;
    description: string;
    priceCents: number;
    offerFloorCents: number | null;
  }) => void;
  onPublish?: () => void;
  onMarkListed?: () => void;
}) {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description ?? '');
  const [price, setPrice] = useState((listing.price_cents / 100).toFixed(2));
  const [floor, setFloor] = useState(
    listing.offer_floor_cents != null ? (listing.offer_floor_cents / 100).toFixed(2) : '',
  );

  const stateBadge: Record<string, string> = {
    QUEUED: 'bg-stone-100 text-stone-700',
    ACTIVE: 'bg-green-100 text-green-800',
    SOLD: 'bg-amber-100 text-amber-800',
    DELISTED: 'bg-red-100 text-red-700',
    ENDED: 'bg-stone-100 text-stone-500',
  };

  return (
    <div className="space-y-2 rounded-lg border border-stone-200 p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {listing.platform === 'EBAY' ? 'eBay' : 'Poshmark'}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateBadge[listing.state] ?? ''}`}
        >
          {listing.state}
        </span>
      </div>

      {listing.platform === 'EBAY' && listing.specifics?.categoryPath && (
        <p className="text-xs text-stone-500">📁 {listing.specifics.categoryPath}</p>
      )}
      {listing.specifics?.reasoning && (
        <p className="text-xs italic text-stone-500">💡 {listing.specifics.reasoning}</p>
      )}

      <div>
        <div className="flex justify-between">
          <label className="field-label">Title</label>
          <span className={`text-xs ${title.length > 80 ? 'text-red-600' : 'text-stone-400'}`}>
            {title.length}/80
          </span>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="field-input"
          disabled={listing.state !== 'QUEUED'}
        />
      </div>
      <div>
        <label className="field-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="field-input text-sm"
          disabled={listing.state !== 'QUEUED'}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="field-input"
            disabled={listing.state !== 'QUEUED'}
          />
        </div>
        <div>
          <label className="field-label">Offer floor ($)</label>
          <input
            type="number"
            step="0.01"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="field-input"
            disabled={listing.state !== 'QUEUED'}
          />
        </div>
      </div>

      {listing.state === 'QUEUED' && (
        <div className="flex gap-2">
          <button
            disabled={pending}
            onClick={() =>
              onSave({
                title,
                description,
                priceCents: Math.round(Number(price) * 100),
                offerFloorCents: floor ? Math.round(Number(floor) * 100) : null,
              })
            }
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium"
          >
            Save
          </button>
          {onPublish && (
            <button disabled={pending} onClick={onPublish} className="btn-primary flex-1">
              🚀 Publish to eBay
            </button>
          )}
          {onMarkListed && (
            <button disabled={pending} onClick={onMarkListed} className="btn-primary flex-1">
              ✓ Listed on Poshmark
            </button>
          )}
        </div>
      )}
      {listing.state === 'ACTIVE' && listing.external_id && listing.platform === 'EBAY' && (
        <a
          href={`https://www.ebay.com/itm/${listing.external_id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-amber-800 underline"
        >
          View on eBay ↗
        </a>
      )}
    </div>
  );
}
