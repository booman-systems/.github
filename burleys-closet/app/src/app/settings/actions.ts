'use server';

import { revalidatePath } from 'next/cache';
import { serverDb } from '@/lib/db';
import { listPolicies, ensureLocation, type PolicyIds } from '@/lib/ebay/publish';

export async function fetchPolicies(): Promise<{
  error?: string;
  fulfillment?: { id: string; name: string }[];
  payment?: { id: string; name: string }[];
  ret?: { id: string; name: string }[];
}> {
  try {
    return await listPolicies();
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to fetch policies' };
  }
}

export async function savePolicies(input: PolicyIds): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };
  const { error } = await db.from('settings').upsert({
    key: 'ebay_policies',
    value: input,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath('/settings');
  return {};
}

export async function saveLocation(input: {
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
}): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };
  try {
    await ensureLocation(input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Location setup failed' };
  }
  await db.from('settings').upsert({
    key: 'ship_from_address',
    value: input,
    updated_at: new Date().toISOString(),
  });
  revalidatePath('/settings');
  return {};
}
