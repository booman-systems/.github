'use server';

import { revalidatePath } from 'next/cache';
import { serverDb } from '@/lib/db';
import { canTransition } from '@/lib/domain/state-machine';
import type { ItemStatus } from '@/lib/domain/types';

export async function advanceStatus(
  sku: string,
  to: ItemStatus,
): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const { data: item, error: fetchError } = await db
    .from('items')
    .select('status')
    .eq('sku', sku)
    .single();
  if (fetchError || !item) return { error: 'Item not found' };

  if (!canTransition(item.status as ItemStatus, to)) {
    return { error: `Cannot go from ${item.status} to ${to}` };
  }

  // The DB trigger re-validates and writes the audit event.
  const { error } = await db.from('items').update({ status: to }).eq('sku', sku);
  if (error) return { error: error.message };

  revalidatePath(`/items/${sku}`);
  revalidatePath('/items');
  revalidatePath('/');
  return {};
}
