import { serverDb, isConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface LedgerRow {
  kind: string;
  amount_cents: number;
  occurred_on: string;
}

function summarize(rows: LedgerRow[]) {
  const by = (kinds: string[]) =>
    rows.filter((r) => kinds.includes(r.kind)).reduce((s, r) => s + r.amount_cents, 0);
  const sales = by(['SALE']);
  const fees = by(['PLATFORM_FEE', 'AD_FEE']);
  const shipping = by(['SHIPPING_LABEL', 'SHIPPING_UPGRADE', 'PACKAGING']);
  const cogs = by(['COGS', 'SUPPLY']);
  const refunds = by(['REFUND']);
  return {
    sales,
    fees,
    shipping,
    cogs,
    refunds,
    net: sales + fees + shipping + cogs + refunds, // non-sale kinds are negative
  };
}

const fmt = (cents: number) =>
  `${cents < 0 ? '−' : ''}$${Math.abs(cents / 100).toFixed(2)}`;

export default async function MoneyPage() {
  if (!isConfigured()) {
    return <p className="text-stone-600">Supabase not configured.</p>;
  }
  const db = serverDb()!;

  const { data } = await db
    .from('ledger_entries')
    .select('kind, amount_cents, occurred_on')
    .order('occurred_on', { ascending: false })
    .limit(5000);
  const rows = (data ?? []) as LedgerRow[];

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const thisMonth = summarize(rows.filter((r) => r.occurred_on >= monthStart));
  const allTime = summarize(rows);

  const soldCount = rows.filter(
    (r) => r.kind === 'SALE' && r.occurred_on >= monthStart,
  ).length;
  const GOAL_CENTS = 2_000_000; // $20k/month
  const pct = Math.min(100, Math.round((thisMonth.sales / GOAL_CENTS) * 100));

  const Section = ({ title, s }: { title: string; s: ReturnType<typeof summarize> }) => (
    <section className="card space-y-1 text-sm">
      <h2 className="font-semibold">{title}</h2>
      <dl className="grid grid-cols-2 gap-y-1">
        <dt className="text-stone-500">Sales</dt>
        <dd className="text-right font-medium">{fmt(s.sales)}</dd>
        <dt className="text-stone-500">Platform/ad fees</dt>
        <dd className="text-right">{fmt(s.fees)}</dd>
        <dt className="text-stone-500">Shipping & packaging</dt>
        <dd className="text-right">{fmt(s.shipping)}</dd>
        <dt className="text-stone-500">Cost of goods</dt>
        <dd className="text-right">{fmt(s.cogs)}</dd>
        <dt className="text-stone-500">Refunds</dt>
        <dd className="text-right">{fmt(s.refunds)}</dd>
        <dt className="border-t border-stone-200 pt-1 font-semibold">Net</dt>
        <dd
          className={`border-t border-stone-200 pt-1 text-right font-bold ${s.net >= 0 ? 'text-green-700' : 'text-red-600'}`}
        >
          {fmt(s.net)}
        </dd>
      </dl>
    </section>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Money</h1>

      <section className="card">
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-semibold">This month vs $20k goal</span>
          <span className="text-stone-500">
            {fmt(thisMonth.sales)} · {soldCount} sales
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-amber-600" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-stone-500">{pct}% of goal</p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Section title="This month" s={thisMonth} />
        <Section title="All time" s={allTime} />
      </div>

      <p className="text-xs text-stone-500">
        Ledger-based; fee entries land as payouts reconcile. Year-end Schedule C
        export comes from these same rows.
      </p>
    </div>
  );
}
