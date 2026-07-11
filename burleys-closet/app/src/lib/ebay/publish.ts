import { serverDb } from '@/lib/db';
import type { ConditionGrade } from '@/lib/domain/types';
import { ebayFetch, EbayError } from './client';
import { EBAY } from './config';

/** Map our six clothing conditions to eBay Inventory API ConditionEnum. */
const CONDITION_MAP: Record<ConditionGrade, string> = {
  NEW_WITH_TAGS: 'NEW',
  NEW_WITHOUT_TAGS: 'NEW_OTHER',
  NEW_WITH_IMPERFECTIONS: 'NEW_WITH_DEFECTS',
  PREOWNED_EXCELLENT: 'USED_EXCELLENT',
  PREOWNED_GOOD: 'USED_VERY_GOOD',
  PREOWNED_FAIR: 'USED_GOOD',
};

export interface PolicyIds {
  fulfillmentPolicyId: string;
  paymentPolicyId: string;
  returnPolicyId: string;
}

export async function listPolicies(): Promise<{
  fulfillment: { id: string; name: string }[];
  payment: { id: string; name: string }[];
  ret: { id: string; name: string }[];
}> {
  const mp = `marketplace_id=${EBAY.marketplaceId}`;
  const [f, p, r] = await Promise.all([
    ebayFetch<{ fulfillmentPolicies?: { fulfillmentPolicyId: string; name: string }[] }>(
      `/sell/account/v1/fulfillment_policy?${mp}`,
    ),
    ebayFetch<{ paymentPolicies?: { paymentPolicyId: string; name: string }[] }>(
      `/sell/account/v1/payment_policy?${mp}`,
    ),
    ebayFetch<{ returnPolicies?: { returnPolicyId: string; name: string }[] }>(
      `/sell/account/v1/return_policy?${mp}`,
    ),
  ]);
  return {
    fulfillment: (f.fulfillmentPolicies ?? []).map((x) => ({
      id: x.fulfillmentPolicyId,
      name: x.name,
    })),
    payment: (p.paymentPolicies ?? []).map((x) => ({ id: x.paymentPolicyId, name: x.name })),
    ret: (r.returnPolicies ?? []).map((x) => ({ id: x.returnPolicyId, name: x.name })),
  };
}

/** Idempotent: create the merchant inventory location if missing. */
export async function ensureLocation(address: {
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
}): Promise<void> {
  try {
    await ebayFetch(`/sell/inventory/v1/location/${EBAY.merchantLocationKey}`);
    return; // exists
  } catch (e) {
    if (!(e instanceof EbayError) || e.status !== 404) throw e;
  }
  await ebayFetch(`/sell/inventory/v1/location/${EBAY.merchantLocationKey}`, {
    method: 'POST',
    body: {
      location: { address: { ...address, country: 'US' } },
      name: "Burley's Closet",
      merchantLocationStatus: 'ENABLED',
      locationTypes: ['WAREHOUSE'],
    },
  });
}

export interface PublishInput {
  sku: string;
  title: string;
  description: string;
  categoryId: string;
  aspects: Record<string, string[]>;
  condition: ConditionGrade;
  conditionDescription?: string;
  priceCents: number;
  offerFloorCents?: number | null;
  autoAcceptCents?: number | null;
  weightOz?: number | null;
  imageUrls: string[]; // eBay copies these to EPS at publish time
  policies: PolicyIds;
}

export interface PublishResult {
  offerId: string;
  listingId: string;
}

/** Full Inventory API flow: inventory item -> offer -> publish. */
export async function publishToEbay(input: PublishInput): Promise<PublishResult> {
  // 1. Inventory item (full replace — send everything every time).
  await ebayFetch(`/sell/inventory/v1/inventory_item/${encodeURIComponent(input.sku)}`, {
    method: 'PUT',
    body: {
      availability: { shipToLocationAvailability: { quantity: 1 } },
      condition: CONDITION_MAP[input.condition],
      ...(input.conditionDescription
        ? { conditionDescription: input.conditionDescription }
        : {}),
      ...(input.weightOz
        ? {
            packageWeightAndSize: {
              weight: { value: Math.max(1, Math.round(input.weightOz)), unit: 'OUNCE' },
            },
          }
        : {}),
      product: {
        title: input.title.slice(0, 80),
        description: input.description,
        aspects: input.aspects,
        imageUrls: input.imageUrls.slice(0, 24),
      },
    },
  });

  // 2. Offer (find existing for idempotency, else create).
  const existing = await ebayFetch<{ offers?: { offerId: string }[] }>(
    `/sell/inventory/v1/offer?sku=${encodeURIComponent(input.sku)}&marketplace_id=${EBAY.marketplaceId}`,
  ).catch(() => ({ offers: [] as { offerId: string }[] }));

  const offerBody = {
    sku: input.sku,
    marketplaceId: EBAY.marketplaceId,
    format: 'FIXED_PRICE',
    availableQuantity: 1,
    categoryId: input.categoryId,
    listingDescription: input.description,
    merchantLocationKey: EBAY.merchantLocationKey,
    pricingSummary: {
      price: { value: (input.priceCents / 100).toFixed(2), currency: 'USD' },
    },
    listingPolicies: {
      fulfillmentPolicyId: input.policies.fulfillmentPolicyId,
      paymentPolicyId: input.policies.paymentPolicyId,
      returnPolicyId: input.policies.returnPolicyId,
      ...(input.offerFloorCents || input.autoAcceptCents
        ? {
            bestOfferTerms: {
              bestOfferEnabled: true,
              ...(input.autoAcceptCents
                ? {
                    autoAcceptPrice: {
                      value: (input.autoAcceptCents / 100).toFixed(2),
                      currency: 'USD',
                    },
                  }
                : {}),
              ...(input.offerFloorCents
                ? {
                    autoDeclinePrice: {
                      value: (input.offerFloorCents / 100).toFixed(2),
                      currency: 'USD',
                    },
                  }
                : {}),
            },
          }
        : {}),
    },
  };

  let offerId: string;
  if (existing.offers?.length) {
    offerId = existing.offers[0].offerId;
    await ebayFetch(`/sell/inventory/v1/offer/${offerId}`, {
      method: 'PUT',
      body: offerBody,
    });
  } else {
    const created = await ebayFetch<{ offerId: string }>(`/sell/inventory/v1/offer`, {
      method: 'POST',
      body: offerBody,
    });
    offerId = created.offerId;
  }

  // 3. Publish.
  const published = await ebayFetch<{ listingId: string }>(
    `/sell/inventory/v1/offer/${offerId}/publish`,
    { method: 'POST' },
  );

  return { offerId, listingId: published.listingId };
}

/** Delist: withdraw the offer (keeps the inventory item for relisting). */
export async function withdrawEbayListing(sku: string): Promise<void> {
  const existing = await ebayFetch<{ offers?: { offerId: string; status?: string }[] }>(
    `/sell/inventory/v1/offer?sku=${encodeURIComponent(sku)}&marketplace_id=${EBAY.marketplaceId}`,
  );
  const offer = existing.offers?.[0];
  if (!offer) return;
  await ebayFetch(`/sell/inventory/v1/offer/${offer.offerId}/withdraw`, { method: 'POST' });
}

/** Signed URLs for an item's eBay crops, ordered for the listing. */
export async function ebayImageUrls(sku: string): Promise<string[]> {
  const db = serverDb();
  if (!db) return [];
  const { data: photos } = await db
    .from('photos')
    .select('ebay_path, master_path, sort')
    .eq('item_sku', sku)
    .order('sort');
  const urls: string[] = [];
  for (const p of photos ?? []) {
    const path = (p.ebay_path as string) ?? (p.master_path as string);
    // 7 days — eBay copies to EPS at publish, but leave slack for retries.
    const { data } = await db.storage.from('item-photos').createSignedUrl(path, 604800);
    if (data?.signedUrl) urls.push(data.signedUrl);
  }
  return urls;
}
