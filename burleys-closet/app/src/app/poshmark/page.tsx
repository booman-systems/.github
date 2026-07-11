import Link from 'next/link';
import { serverDb, isConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PoshmarkQueuePage() {
  if (!isConfigured()) {
    return <p className="text-stone-600">Supabase not configured.</p>;
  }
  const db = serverDb()!;

  const [{ data: queued }, { data: jobs }] = await Promise.all([
    db
      .from('listings')
      .select('item_sku, title, price_cents')
      .eq('platform', 'POSHMARK')
      .eq('state', 'QUEUED')
      .order('created_at'),
    db
      .from('delist_jobs')
      .select('item_sku, created_at')
      .eq('target_platform', 'POSHMARK')
      .is('confirmed_at', null),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Poshmark</h1>

      {(jobs?.length ?? 0) > 0 && (
        <section className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
          <h2 className="font-bold text-red-700">⚠ Delist now — sold on eBay</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {jobs!.map((j) => (
              <li key={j.item_sku}>
                <Link href={`/items/${j.item_sku}`} className="font-medium underline">
                  {j.item_sku}
                </Link>{' '}
                — mark &quot;Not for Sale&quot; in your Poshmark closet, then confirm in the
                extension popup.
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-2">
        <h2 className="font-semibold">Ready to post ({queued?.length ?? 0})</h2>
        <p className="text-xs text-stone-500">
          Use the Chrome extension: open poshmark.com/create-listing → extension →
          &quot;Fill current tab&quot;. Photos, title, description, and price are injected;
          you pick category/size and press Publish.
        </p>
        <ul className="space-y-2">
          {(queued ?? []).map((l) => (
            <li key={l.item_sku}>
              <Link
                href={`/items/${l.item_sku}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 hover:border-amber-600"
              >
                <span className="text-sm font-medium">{l.title}</span>
                <span className="text-sm text-stone-500">
                  ${((l.price_cents as number) / 100).toFixed(2)}
                </span>
              </Link>
            </li>
          ))}
          {(queued?.length ?? 0) === 0 && (
            <li className="text-sm text-stone-500">Queue is empty.</li>
          )}
        </ul>
      </section>

      <section className="card space-y-1 text-xs text-stone-500">
        <h2 className="text-sm font-semibold text-stone-700">House rules (account safety)</h2>
        <p>• Post and delist at human speed, with you present — never headless.</p>
        <p>• No auto-sharing/liking/following. No bulk delete-and-relist.</p>
        <p>• Double-sell playbook: message the buyer and ask THEM to cancel (buyer-requested cancels don&apos;t count against your 3% limit).</p>
      </section>
    </div>
  );
}
