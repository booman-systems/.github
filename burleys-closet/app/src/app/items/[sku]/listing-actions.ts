'use server';

import { revalidatePath } from 'next/cache';
import { serverDb } from '@/lib/db';
import { generateDraft } from '@/lib/ai/draft';
import { suggestCategories } from '@/lib/ebay/taxonomy';
import { publishToEbay, ebayImageUrls, type PolicyIds } from '@/lib/ebay/publish';
import { recordPoshmarkSale } from '@/lib/ebay/orders';
import type { Item } from '@/lib/domain/types';

export interface DraftResult {
  error?: string;
  categories?: { categoryId: string; categoryName: string; path: string }[];
}

/** AI-draft both platform listings; item PHOTOGRAPHED -> DRAFTED -> REVIEW. */
export async function draftListings(sku: string): Promise<DraftResult> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const { data: item } = await db.from('items').select('*').eq('sku', sku).single();
  if (!item) return { error: 'Item not found' };
  const typed = item as Item;

  if (!['PHOTOGRAPHED', 'DRAFTED', 'REVIEW'].includes(typed.status)) {
    return { error: `Item must be photographed first (currently ${typed.status})` };
  }

  let draft;
  try {
    draft = await generateDraft(typed);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Draft generation failed' };
  }

  // Category suggestions from eBay (best-effort; picker shown in review UI).
  let categories: DraftResult['categories'] = [];
  try {
    categories = await suggestCategories(draft.category_query);
  } catch {
    categories = [];
  }

  const rows = [
    {
      item_sku: sku,
      platform: 'EBAY',
      state: 'QUEUED',
      title: draft.title,
      description: draft.description,
      specifics: {
        aspects: draft.aspects,
        categoryId: categories?.[0]?.categoryId ?? null,
        categoryPath: categories?.[0]?.path ?? null,
        reasoning: draft.reasoning,
      },
      price_cents: draft.suggested_price_cents,
      offer_floor_cents: draft.offer_floor_cents,
    },
    {
      item_sku: sku,
      platform: 'POSHMARK',
      state: 'QUEUED',
      title: draft.title,
      description: draft.description,
      specifics: { reasoning: draft.reasoning },
      price_cents: draft.poshmark_price_cents,
      offer_floor_cents: Math.round(draft.poshmark_price_cents * 0.7),
    },
  ];
  const { error } = await db
    .from('listings')
    .upsert(rows, { onConflict: 'item_sku,platform' });
  if (error) return { error: error.message };

  if (typed.status === 'PHOTOGRAPHED') {
    await db.from('items').update({ status: 'DRAFTED' }).eq('sku', sku);
    await db.from('items').update({ status: 'REVIEW' }).eq('sku', sku);
  }

  revalidatePath(`/items/${sku}`);
  return { categories };
}

export interface SaveDraftInput {
  sku: string;
  platform: 'EBAY' | 'POSHMARK';
  title: string;
  description: string;
  priceCents: number;
  offerFloorCents: number | null;
  categoryId?: string | null;
}

export async function saveDraft(input: SaveDraftInput): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const { data: listing } = await db
    .from('listings')
    .select('id, specifics')
    .eq('item_sku', input.sku)
    .eq('platform', input.platform)
    .single();
  if (!listing) return { error: 'Draft not found' };

  const specifics = (listing.specifics as Record<string, unknown>) ?? {};
  if (input.categoryId) specifics.categoryId = input.categoryId;

  const { error } = await db
    .from('listings')
    .update({
      title: input.title.slice(0, 80),
      description: input.description,
      price_cents: input.priceCents,
      offer_floor_cents: input.offerFloorCents,
      specifics,
      price_last_changed_at: new Date().toISOString(),
    })
    .eq('id', listing.id);
  if (error) return { error: error.message };
  revalidatePath(`/items/${input.sku}`);
  return {};
}

/** Publish the eBay draft via the Inventory API; item REVIEW -> LISTED. */
export async function publishEbayListing(sku: string): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };

  const [{ data: item }, { data: listing }, { data: policySetting }] = await Promise.all([
    db.from('items').select('*').eq('sku', sku).single(),
    db.from('listings').select('*').eq('item_sku', sku).eq('platform', 'EBAY').single(),
    db.from('settings').select('value').eq('key', 'ebay_policies').single(),
  ]);
  if (!item) return { error: 'Item not found' };
  if (!listing) return { error: 'No eBay draft — generate one first' };
  const policies = policySetting?.value as PolicyIds | undefined;
  if (!policies?.fulfillmentPolicyId) {
    return { error: 'eBay business policies not configured — visit /settings' };
  }

  const typed = item as Item;
  const specifics = (listing.specifics as Record<string, unknown>) ?? {};
  const categoryId = specifics.categoryId as string | null;
  if (!categoryId) return { error: 'Pick an eBay category first' };
  if (!typed.condition) return { error: 'Item has no condition grade' };

  const imageUrls = await ebayImageUrls(sku);
  if (imageUrls.length === 0) return { error: 'Item has no photos' };

  try {
    const result = await publishToEbay({
      sku,
      title: listing.title,
      description: listing.description ?? '',
      categoryId,
      aspects: (specifics.aspects as Record<string, string[]>) ?? {},
      condition: typed.condition,
      conditionDescription:
        ((typed.flaws ?? []) as { type: string; location: string }[])
          .map((f) => `${f.type} at ${f.location}`)
          .join('; ') || undefined,
      priceCents: listing.price_cents,
      offerFloorCents: listing.offer_floor_cents,
      autoAcceptCents: listing.auto_accept_cents,
      weightOz: typed.weight_oz,
      imageUrls,
      policies,
    });

    await db
      .from('listings')
      .update({
        state: 'ACTIVE',
        external_id: result.listingId,
        listed_at: new Date().toISOString(),
      })
      .eq('id', listing.id);

    if (typed.status === 'REVIEW') {
      await db.from('items').update({ status: 'LISTED' }).eq('sku', sku);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Publish failed' };
  }

  revalidatePath(`/items/${sku}`);
  revalidatePath('/');
  return {};
}

/** Extension/manual confirmation that the Poshmark listing is live. */
export async function markPoshmarkListed(
  sku: string,
  externalUrl?: string,
): Promise<{ error?: string }> {
  const db = serverDb();
  if (!db) return { error: 'Supabase not configured' };
  const { error } = await db
    .from('listings')
    .update({
      state: 'ACTIVE',
      external_id: externalUrl ?? null,
      listed_at: new Date().toISOString(),
    })
    .eq('item_sku', sku)
    .eq('platform', 'POSHMARK');
  if (error) return { error: error.message };

  // If eBay isn't live yet, LISTED still applies once either platform is up.
  const { data: item } = await db.from('items').select('status').eq('sku', sku).single();
  if (item?.status === 'REVIEW') {
    await db.from('items').update({ status: 'LISTED' }).eq('sku', sku);
  }
  revalidatePath(`/items/${sku}`);
  revalidatePath('/poshmark');
  return {};
}

/** "It sold on Poshmark" — records the order and delists from eBay via API. */
export async function soldOnPoshmark(
  sku: string,
  salePriceCents: number,
): Promise<{ error?: string }> {
  const result = await recordPoshmarkSale({ sku, salePriceCents });
  revalidatePath(`/items/${sku}`);
  revalidatePath('/');
  revalidatePath('/packing');
  return result;
}
