import { serverDb, isConfigured } from '@/lib/db';
import PackingList from './packing-list';

export const dynamic = 'force-dynamic';

export default async function PackingPage() {
  if (!isConfigured()) {
    return <p className="text-stone-600">Supabase not configured.</p>;
  }
  const db = serverDb()!;

  const { data: orders } = await db
    .from('orders')
    .select('id, platform, external_order_id, item_sku, state, sale_price_cents, ship_by, buyer_handle, tracking_number')
    .in('state', ['NEW', 'PACKED'])
    .order('ship_by', { ascending: true, nullsFirst: false });

  // Bin locations for the pick list.
  const skus = (orders ?? []).map((o) => o.item_sku as string);
  const { data: items } = skus.length
    ? await db.from('items').select('sku, bin_code, brand, garment_type, tag_size').in('sku', skus)
    : { data: [] };
  const itemBySku = new Map((items ?? []).map((i) => [i.sku as string, i]));

  const rows = (orders ?? []).map((o) => {
    const item = itemBySku.get(o.item_sku as string);
    return {
      id: o.id as string,
      platform: o.platform as 'EBAY' | 'POSHMARK',
      sku: o.item_sku as string,
      state: o.state as string,
      salePriceCents: o.sale_price_cents as number,
      shipBy: o.ship_by as string | null,
      buyer: o.buyer_handle as string | null,
      bin: (item?.bin_code as string) ?? '?',
      label: item
        ? `${item.brand ?? 'Unbranded'} ${String(item.garment_type).replaceAll('_', ' ').toLowerCase()} ${item.tag_size ?? ''}`
        : o.item_sku as string,
    };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Packing queue ({rows.length})</h1>
      <p className="text-sm text-stone-500">
        Sorted by ship-by deadline. Poshmark labels: print from the sale email.
        eBay labels: buy in Seller Hub, then enter tracking here — it uploads to
        eBay automatically.
      </p>
      <PackingList rows={rows} />
    </div>
  );
}
