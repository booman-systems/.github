'use server';

import { revalidatePath } from 'next/cache';
import { serverDb } from '@/lib/db';
import { uploadEbayTracking } from '@/lib/ebay/orders';

export async function markPacked(orderId: string): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const { data: order } = await db
    .from('orders')
    .select('item_sku, state')
    .eq('id', orderId)
    .single();
  if (!order) return { error: 'Order not found' };

  await db.from('orders').update({ state: 'PACKED' }).eq('id', orderId);
  await db.from('items').update({ status: 'PACKED' }).eq('sku', order.item_sku);
  revalidatePath('/packing');
  return {};
}

export async function markShipped(input: {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  labelCostCents: number | null;
}): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const { data: order } = await db
    .from('orders')
    .select('id, platform, external_order_id, item_sku, sale_price_cents')
    .eq('id', input.orderId)
    .single();
  if (!order) return { error: 'Order not found' };

  // eBay: push tracking via API so the order shows shipped and the
  // on-time-shipping metric is protected. Poshmark tracking is automatic
  // (their prepaid label) — nothing to upload.
  if (order.platform === 'EBAY' && input.trackingNumber) {
    try {
      await uploadEbayTracking({
        externalOrderId: order.external_order_id,
        trackingNumber: input.trackingNumber,
        carrier: input.carrier || 'USPS',
      });
    } catch (e) {
      return {
        error: `Tracking upload to eBay failed: ${e instanceof Error ? e.message : e}`,
      };
    }
  }

  await db
    .from('orders')
    .update({
      state: 'SHIPPED',
      shipped_at: new Date().toISOString(),
      tracking_number: input.trackingNumber || null,
      carrier: input.carrier || null,
      label_cost_cents: input.labelCostCents,
    })
    .eq('id', input.orderId);
  await db.from('items').update({ status: 'SHIPPED' }).eq('sku', order.item_sku);

  if (input.labelCostCents && input.labelCostCents > 0) {
    await db.from('ledger_entries').insert({
      kind: 'SHIPPING_LABEL',
      amount_cents: -input.labelCostCents,
      platform: order.platform,
      item_sku: order.item_sku,
      order_id: order.id,
      memo: `${input.carrier || 'USPS'} ${input.trackingNumber}`,
    });
  }

  revalidatePath('/packing');
  revalidatePath('/');
  return {};
}
