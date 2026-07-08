import Link from 'next/link';
import { serverDb, isConfigured } from '@/lib/db';
import { PIPELINE } from '@/lib/domain/state-machine';

export const dynamic = 'force-dynamic';

async function pipelineCounts(): Promise<Record<string, number>> {
  const db = serverDb();
  if (!db) return {};
  const counts: Record<string, number> = {};
  const { data } = await db.from('items').select('status');
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export default async function Dashboard() {
  if (!isConfigured()) {
    return (
      <div className="card">
        <h1 className="mb-2 text-xl font-bold">Setup needed</h1>
        <p className="text-stone-600">
          Supabase is not configured. Copy <code>.env.example</code> to{' '}
          <code>.env.local</code>, fill in your project URL and keys, and apply{' '}
          <code>supabase/migrations/0001_init.sql</code> to your project.
        </p>
      </div>
    );
  }

  const counts = await pipelineCounts();
  const delistPending = counts['SOLD_PENDING_DELIST'] ?? 0;

  return (
    <div className="space-y-6">
      {delistPending > 0 && (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
          <p className="font-bold text-red-700">
            ⚠ {delistPending} item{delistPending > 1 ? 's' : ''} sold — DELIST from the
            other platform NOW to avoid a double-sell.
          </p>
        </div>
      )}

      <section>
        <h1 className="mb-3 text-xl font-bold">Pipeline</h1>
        <div className="grid grid-cols-3 gap-3">
          {PIPELINE.map((stage) => (
            <Link
              key={stage.status}
              href={`/items?status=${stage.status}`}
              className="card text-center hover:border-amber-600"
            >
              <div className="text-2xl font-bold text-amber-800">
                {counts[stage.status] ?? 0}
              </div>
              <div className="mt-1 text-xs text-stone-600">{stage.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/items/new" className="btn-primary w-full py-4 text-lg">
        + Intake a garment
      </Link>
    </div>
  );
}
