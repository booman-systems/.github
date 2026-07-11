import { NextRequest, NextResponse } from 'next/server';
import { syncEbayOrders } from '@/lib/ebay/orders';
import { isConnected } from '@/lib/ebay/oauth';

export const maxDuration = 60;

/**
 * Vercel Cron target (see vercel.json — every 5 minutes). This is the
 * polling safety net that catches every eBay sale even if notifications
 * are missed; it drives the delist engine.
 */
export async function GET(req: NextRequest) {
  // Vercel cron sends Authorization: Bearer $CRON_SECRET when set.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isConnected())) {
    return NextResponse.json({ skipped: 'eBay not connected' });
  }

  try {
    const result = await syncEbayOrders(30);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'sync failed' },
      { status: 500 },
    );
  }
}
