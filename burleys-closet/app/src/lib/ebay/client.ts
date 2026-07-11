import { EBAY } from './config';
import { accessToken } from './oauth';

export class EbayError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`eBay API ${status}: ${JSON.stringify(body)}`);
  }
}

/** Authenticated JSON call against the eBay REST APIs. */
export async function ebayFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${EBAY.apiBase}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
      Accept: 'application/json',
      'X-EBAY-C-MARKETPLACE-ID': EBAY.marketplaceId,
      ...init.headers,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) throw new EbayError(res.status, json ?? text);
  return json as T;
}
