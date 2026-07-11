import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db';
import { recordPoshmarkSale } from '@/lib/ebay/orders';

/**
 * Bridge API for the Chrome extension. One endpoint, action-dispatched, so
 * the extension needs a single URL + secret.
 *
 * Auth: Authorization: Bearer <BRIDGE_SECRET>
 *
 * GET  ?action=queue         -> Poshmark listings to create (with photo URLs)
 * GET  ?action=delist-queue  -> open delist jobs targeting Poshmark
 * POST {action:"mark-listed", sku, url?}
 * POST {action:"confirm-delist", sku}
 * POST {action:"sale", sku, sale_price?}
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.BRIDGE_SECRET;
  return Boolean(secret && req.headers.get('authorization') === `Bearer ${secret}`);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = serverDb();
  if (!db) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const action = req.nextUrl.searchParams.get('action') ?? 'queue';

  if (action === 'delist-queue') {
    const { data: jobs } = await db
      .from('delist_jobs')
      .select('id, item_sku, created_at')
      .eq('target_platform', 'POSHMARK')
      .is('confirmed_at', null)
      .order('created_at');
    const enriched = [];
    for (const job of jobs ?? []) {
      const { data: listing } = await db
        .from('listings')
        .select('external_id, title')
        .eq('item_sku', job.item_sku)
        .eq('platform', 'POSHMARK')
        .maybeSingle();
      enriched.push({
        sku: job.item_sku,
        title: listing?.title ?? job.item_sku,
        url: listing?.external_id ?? null,
        openedAt: job.created_at,
      });
    }
    return NextResponse.json({ jobs: enriched });
  }

  // Default: the create-listing queue.
  const { data: listings } = await db
    .from('listings')
    .select('item_sku, title, description, price_cents')
    .eq('platform', 'POSHMARK')
    .eq('state', 'QUEUED')
    .order('created_at')
    .limit(25);

  const queue = [];
  for (const listing of listings ?? []) {
    const { data: item } = await db
      .from('items')
      .select('brand, tag_size, color, garment_type, condition, status')
      .eq('sku', listing.item_sku)
      .single();
    // Only items in REVIEW/LISTED are ready for Poshmark posting.
    if (!item || !['REVIEW', 'LISTED'].includes(item.status)) continue;

    const { data: photos } = await db
      .from('photos')
      .select('poshmark_path, master_path, sort')
      .eq('item_sku', listing.item_sku)
      .order('sort')
      .limit(16);
    const photoUrls: string[] = [];
    for (const p of photos ?? []) {
      const path = (p.poshmark_path as string) ?? (p.master_path as string);
      const { data } = await db.storage.from('item-photos').createSignedUrl(path, 3600);
      if (data?.signedUrl) photoUrls.push(data.signedUrl);
    }

    queue.push({
      sku: listing.item_sku,
      title: listing.title,
      description: listing.description,
      price: (listing.price_cents / 100).toFixed(2),
      brand: item.brand,
      size: item.tag_size,
      color: item.color,
      garmentType: item.garment_type,
      condition: item.condition,
      photoUrls,
    });
  }
  return NextResponse.json({ queue });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = serverDb();
  if (!db) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    sku?: string;
    url?: string;
    sale_price?: number;
  };
  if (!body.sku) return NextResponse.json({ error: 'sku required' }, { status: 400 });

  switch (body.action) {
    case 'mark-listed': {
      const { error } = await db
        .from('listings')
        .update({
          state: 'ACTIVE',
          external_id: body.url ?? null,
          listed_at: new Date().toISOString(),
        })
        .eq('item_sku', body.sku)
        .eq('platform', 'POSHMARK');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const { data: item } = await db
        .from('items')
        .select('status')
        .eq('sku', body.sku)
        .single();
      if (item?.status === 'REVIEW') {
        await db.from('items').update({ status: 'LISTED' }).eq('sku', body.sku);
      }
      return NextResponse.json({ ok: true });
    }

    case 'confirm-delist': {
      await db
        .from('delist_jobs')
        .update({ confirmed_at: new Date().toISOString() })
        .eq('item_sku', body.sku)
        .eq('target_platform', 'POSHMARK')
        .is('confirmed_at', null);
      const { data: item } = await db
        .from('items')
        .select('status')
        .eq('sku', body.sku)
        .single();
      if (item?.status === 'SOLD_PENDING_DELIST') {
        await db.from('items').update({ status: 'SOLD' }).eq('sku', body.sku);
      }
      return NextResponse.json({ ok: true });
    }

    case 'sale': {
      const priceCents =
        body.sale_price != null ? Math.round(body.sale_price * 100) : 0;
      const result = await recordPoshmarkSale({ sku: body.sku, salePriceCents: priceCents });
      if (result.error) return NextResponse.json({ error: result.error }, { status: 409 });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
