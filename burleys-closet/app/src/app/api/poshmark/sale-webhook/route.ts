import { NextRequest, NextResponse } from 'next/server';
import { recordPoshmarkSale } from '@/lib/ebay/orders';
import { serverDb } from '@/lib/db';

/**
 * Inbound Poshmark sale notification. Two ways to feed it:
 *  1. Email automation (e.g. Zapier/Make watching the Poshmark "sold" email,
 *     or CloudMailin/Mailgun inbound forwarding) POSTs the email text here.
 *  2. The Chrome extension can POST directly when it detects a sale.
 *
 * Auth: `Authorization: Bearer <POSHMARK_WEBHOOK_SECRET>`.
 * Body: { "sku"?: "B07-013", "sale_price"?: 42.00, "text"?: "<raw email body>" }
 * If sku is absent, the SKU is extracted from the text (we embed "SKU: X"
 * in every Poshmark description, so the sold email's item description or a
 * copy of the listing page contains it).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.POSHMARK_WEBHOOK_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    sku?: string;
    sale_price?: number;
    text?: string;
  };

  let sku = body.sku?.trim();
  let priceCents = body.sale_price != null ? Math.round(body.sale_price * 100) : null;

  if (!sku && body.text) {
    const skuMatch = body.text.match(/SKU:\s*([A-Z0-9]+-\d{3})/i);
    sku = skuMatch?.[1]?.toUpperCase();
  }
  if (priceCents == null && body.text) {
    const priceMatch = body.text.match(/\$\s?(\d+(?:\.\d{2})?)/);
    if (priceMatch) priceCents = Math.round(Number(priceMatch[1]) * 100);
  }

  if (!sku) {
    return NextResponse.json(
      { error: 'Could not determine SKU from payload' },
      { status: 422 },
    );
  }

  // Fall back to the listed price when the email parse misses the amount.
  if (priceCents == null) {
    const db = serverDb();
    const { data } = (await db
      ?.from('listings')
      .select('price_cents')
      .eq('item_sku', sku)
      .eq('platform', 'POSHMARK')
      .maybeSingle()) ?? { data: null };
    priceCents = (data?.price_cents as number | undefined) ?? 0;
  }

  const result = await recordPoshmarkSale({ sku, salePriceCents: priceCents });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true, sku });
}
