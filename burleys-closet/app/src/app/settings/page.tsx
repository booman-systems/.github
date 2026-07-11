import { serverDb, isConfigured } from '@/lib/db';
import { ebayConfigured, EBAY_ENV } from '@/lib/ebay/config';
import { consentUrl, isConnected } from '@/lib/ebay/oauth';
import SettingsForms from './settings-forms';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ebay?: string; detail?: string }>;
}) {
  const { ebay: ebayStatus, detail } = await searchParams;

  if (!isConfigured()) {
    return <p className="text-stone-600">Supabase not configured.</p>;
  }
  const db = serverDb()!;

  const keysPresent = ebayConfigured();
  const connected = keysPresent ? await isConnected() : false;
  const url = keysPresent && !connected ? consentUrl() : null;

  const [{ data: policies }, { data: address }] = await Promise.all([
    db.from('settings').select('value').eq('key', 'ebay_policies').maybeSingle(),
    db.from('settings').select('value').eq('key', 'ship_from_address').maybeSingle(),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Settings</h1>

      {ebayStatus === 'connected' && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
          ✓ eBay account connected.
        </p>
      )}
      {ebayStatus === 'error' && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          eBay connection failed: {detail}
        </p>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">
          eBay <span className="text-xs font-normal text-stone-500">({EBAY_ENV})</span>
        </h2>
        {!keysPresent ? (
          <p className="text-sm text-stone-600">
            Set <code>EBAY_CLIENT_ID</code>, <code>EBAY_CLIENT_SECRET</code>, and{' '}
            <code>EBAY_RUNAME</code> env vars (from your developer.ebay.com keyset), then
            reload. Point the RuName&apos;s auth-accepted URL at{' '}
            <code>/api/ebay/callback</code>.
          </p>
        ) : connected ? (
          <p className="text-sm text-green-700">✓ Connected — tokens on file, auto-refreshing.</p>
        ) : (
          <a href={url!} className="btn-primary inline-block">
            Connect eBay account →
          </a>
        )}
      </section>

      <SettingsForms
        ebayReady={connected}
        savedPolicies={(policies?.value as Record<string, string>) ?? null}
        savedAddress={(address?.value as Record<string, string>) ?? null}
      />
    </div>
  );
}
