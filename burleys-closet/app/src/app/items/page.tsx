import Link from 'next/link';
import { serverDb, isConfigured } from '@/lib/db';
import type { Item } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  if (!isConfigured()) {
    return <p className="text-stone-600">Supabase not configured — see the dashboard.</p>;
  }

  const db = serverDb()!;
  let query = db
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const { data: items, error } = await query;

  if (error) {
    return <p className="text-red-600">Error loading items: {error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Items{status ? ` — ${status.replaceAll('_', ' ')}` : ''}
        </h1>
        <Link href="/items/new" className="btn-primary">+ Intake</Link>
      </div>

      {(items as Item[] | null)?.length ? (
        <ul className="space-y-2">
          {(items as Item[]).map((item) => (
            <li key={item.sku} className="card flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {item.brand ?? 'Unbranded'} · {item.garment_type.replaceAll('_', ' ').toLowerCase()}
                  {item.tag_size ? ` · ${item.tag_size}` : ''}
                </div>
                <div className="text-sm text-stone-500">
                  SKU {item.sku} · bin {item.bin_code}
                  {item.over_poshmark_limit ? ' · ⚠ >5 lb' : ''}
                </div>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                {item.status.replaceAll('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-stone-500">No items{status ? ' in this stage' : ''} yet.</p>
      )}
    </div>
  );
}
