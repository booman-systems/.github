export const EBAY_ENV = (process.env.EBAY_ENV ?? 'sandbox') as 'sandbox' | 'production';

export const EBAY = {
  apiBase:
    EBAY_ENV === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com',
  authBase:
    EBAY_ENV === 'production' ? 'https://auth.ebay.com' : 'https://auth.sandbox.ebay.com',
  clientId: process.env.EBAY_CLIENT_ID ?? '',
  clientSecret: process.env.EBAY_CLIENT_SECRET ?? '',
  // eBay calls this the RuName; it doubles as redirect_uri in OAuth calls.
  ruName: process.env.EBAY_RUNAME ?? '',
  marketplaceId: 'EBAY_US',
  categoryTreeId: '0', // US
  merchantLocationKey: 'burleys-closet-home',
} as const;

export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  'https://api.ebay.com/oauth/api_scope/sell.finances',
].join(' ');

export function ebayConfigured(): boolean {
  return Boolean(EBAY.clientId && EBAY.clientSecret && EBAY.ruName);
}
