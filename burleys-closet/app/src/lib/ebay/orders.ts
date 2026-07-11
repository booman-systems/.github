import { serverDb } from '@/lib/db';
import { ebayFetch } from './client';
import { withdrawEbayListing } from './publish';

interface EbayOrder {
  orderId: string;
  creationDate: string;
  buyer?: { username?: string };
  pricingSummary?: {
    total?: { value?: string };
    deliveryCost?: { value?: string };
  };
  lineItems?: {
    sku?: string;
    total?: { value?: string };
    lineItemFulfillmentInstructions?: { shipByDate?: string };
  }[];
}

/**
 * Poll eBay for orders modified in the lookback window; upsert into our
 * orders table; flip sold items to SOLD_PENDING_DELIST and open a delist
 * job targeting Poshmark. Idempotent — safe to run every few minutes.
 */
export async function syncEbayOrders(lookbackMinutes = 30): Promise<{
  seen: number;
  newOrders: string[];
}> {
  const db = serverDb();
  if (!db) throw new Error('Supabase not configured');

  const since = new Date(Date.now() - lookbackMinutes * 60_000).toISOString();
  const filter = encodeURIComponent(`lastmodifieddate:[${since}..]`);
  const json = await ebayFetch<{ orders?: EbayOrder[] }>(
    `/sell/fulfillment/v1/order?filter=${filter}&limit=50`,
  );

  const newOrders: string[] = [];
  for (const order of json.orders ?? []) {
    for (const line of order.lineItems ?? []) {
      const sku = line.sku;
      if (!sku) continue; // not one of ours (all our listings carry SKUs)

      const { data: item } = await db
        .from('items')
        .select('sku, status')
        .eq('sku', sku)
        .single();
      if (!item) continue;

      const { data: existing } = await db
        .from('orders')
        .select('id')
        .eq('platform', 'EBAY')
        .eq('external_order_id', order.orderId)
        .maybeSingle();
      if (existing) continue; // already ingested

      const salePriceCents = Math.round(Number(line.total?.value ?? 0) * 100);
      const { data: inserted, error } = await db
        .from('orders')
        .insert({
          platform: 'EBAY',
          external_order_id: order.orderId,
          item_sku: sku,
          sale_price_cents: salePriceCents,
          shipping_charged_cents: Math.round(
            Number(order.pricingSummary?.deliveryCost?.value ?? 0) * 100,
          ),
          buyer_handle: order.buyer?.username ?? null,
          ship_by: line.lineItemFulfillmentInstructions?.shipByDate ?? null,
          sold_at: order.creationDate,
        })
        .select('id')
        .single();
      if (error || !inserted) continue;

      newOrders.push(order.orderId);

      // Mark listing sold, item pending delist, open delist job for Poshmark.
      await db
        .from('listings')
        .update({ state: 'SOLD', ended_at: new Date().toISOString() })
        .eq('item_sku', sku)
        .eq('platform', 'EBAY');

      if (item.status === 'LISTED') {
        const { data: poshListing } = await db
          .from('listings')
          .select('id, state')
          .eq('item_sku', sku)
          .eq('platform', 'POSHMARK')
          .maybeSingle();

        const needsDelist = poshListing && ['ACTIVE', 'QUEUED'].includes(poshListing.state);
        if (needsDelist) {
          // Free the listings_guard: mark the other side DELISTED-pending first.
          await db
            .from('listings')
            .update({ state: 'DELISTED', ended_at: new Date().toISOString() })
            .eq('id', poshListing.id);
        }
        await db
          .from('items')
          .update({ status: needsDelist ? 'SOLD_PENDING_DELIST' : 'SOLD' })
          .eq('sku', sku);
        if (needsDelist) {
          await db.from('delist_jobs').insert({
            order_id: inserted.id,
            item_sku: sku,
            target_platform: 'POSHMARK',
          });
        }
      }

      // Ledger: the sale.
      await db.from('ledger_entries').insert({
        kind: 'SALE',
        amount_cents: salePriceCents,
        platform: 'EBAY',
        item_sku: sku,
        order_id: inserted.id,
        memo: `eBay order ${order.orderId}`,
      });
    }
  }
  return { seen: json.orders?.length ?? 0, newOrders };
}

/** Record a Poshmark sale (manual entry or email ingest) and delist from eBay. */
export async function recordPoshmarkSale(input: {
  sku: string;
  salePriceCents: number;
  externalOrderId?: string;
}): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const { data: item } = await db
    .from('items')
    .select('sku, status')
    .eq('sku', input.sku)
    .single();
  if (!item) return { error: 'Item not found' };
  if (item.status !== 'LISTED') return { error: `Item is ${item.status}, not LISTED` };

  const externalId = input.externalOrderId ?? `posh-${input.sku}-${Date.now()}`;
  const { data: order, error } = await db
    .from('orders')
    .insert({
      platform: 'POSHMARK',
      external_order_id: externalId,
      item_sku: input.sku,
      sale_price_cents: input.salePriceCents,
      // Poshmark: ship within 7 days or the buyer can cancel; target 2.
      ship_by: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    })
    .select('id')
    .single();
  if (error || !order) return { error: error?.message ?? 'Order insert failed' };

  await db
    .from('listings')
    .update({ state: 'SOLD', ended_at: new Date().toISOString() })
    .eq('item_sku', input.sku)
    .eq('platform', 'POSHMARK');

  // eBay side: withdraw via API immediately (this is the whole point).
  const { data: ebayListing } = await db
    .from('listings')
    .select('id, state')
    .eq('item_sku', input.sku)
    .eq('platform', 'EBAY')
    .maybeSingle();

  if (ebayListing && ['ACTIVE', 'QUEUED'].includes(ebayListing.state)) {
    await db
      .from('items')
      .update({ status: 'SOLD_PENDING_DELIST' })
      .eq('sku', input.sku);
    const { data: job } = await db
      .from('delist_jobs')
      .insert({ order_id: order.id, item_sku: input.sku, target_platform: 'EBAY' })
      .select('id')
      .single();

    try {
      await withdrawEbayListing(input.sku);
      await db
        .from('listings')
        .update({ state: 'DELISTED', ended_at: new Date().toISOString() })
        .eq('id', ebayListing.id);
      if (job) {
        await db
          .from('delist_jobs')
          .update({ confirmed_at: new Date().toISOString() })
          .eq('id', job.id);
      }
      await db.from('items').update({ status: 'SOLD' }).eq('sku', input.sku);
    } catch (e) {
      // Job stays open; dashboard shows the red banner until resolved.
      return {
        error: `Poshmark sale recorded but eBay delist FAILED — delist manually now! (${e instanceof Error ? e.message : e})`,
      };
    }
  } else {
    await db.from('items').update({ status: 'SOLD' }).eq('sku', input.sku);
  }

  await db.from('ledger_entries').insert({
    kind: 'SALE',
    amount_cents: input.salePriceCents,
    platform: 'POSHMARK',
    item_sku: input.sku,
    order_id: order.id,
    memo: `Poshmark sale`,
  });
  return {};
}

/** Upload tracking to eBay so the order shows shipped. */
export async function uploadEbayTracking(input: {
  externalOrderId: string;
  trackingNumber: string;
  carrier: string;
}): Promise<void> {
  await ebayFetch(
    `/sell/fulfillment/v1/order/${input.externalOrderId}/shipping_fulfillment`,
    {
      method: 'POST',
      body: {
        trackingNumber: input.trackingNumber.replace(/[\s-]/g, ''),
        shippingCarrierCode: input.carrier,
        shippedDate: new Date().toISOString(),
      },
    },
  );
}
