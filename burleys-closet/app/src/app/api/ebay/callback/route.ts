import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/ebay/oauth';

/**
 * OAuth redirect target. Set your eBay RuName's "Your auth accepted URL"
 * to https://<your-app>/api/ebay/callback
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/settings?ebay=denied', req.url));
  }
  try {
    await exchangeCode(code);
    return NextResponse.redirect(new URL('/settings?ebay=connected', req.url));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.redirect(
      new URL(`/settings?ebay=error&detail=${encodeURIComponent(msg.slice(0, 200))}`, req.url),
    );
  }
}
