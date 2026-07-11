import { serverDb } from '@/lib/db';
import { EBAY, EBAY_SCOPES } from './config';

interface StoredTokens {
  access_token: string;
  access_expires_at: number; // epoch ms
  refresh_token: string;
  refresh_expires_at: number;
}

const SETTINGS_KEY = 'ebay_tokens';

export function consentUrl(): string {
  const params = new URLSearchParams({
    client_id: EBAY.clientId,
    redirect_uri: EBAY.ruName,
    response_type: 'code',
    scope: EBAY_SCOPES,
  });
  return `${EBAY.authBase}/oauth2/authorize?${params.toString()}`;
}

function basicAuth(): string {
  return Buffer.from(`${EBAY.clientId}:${EBAY.clientSecret}`).toString('base64');
}

async function tokenRequest(body: URLSearchParams): Promise<Record<string, unknown>> {
  const res = await fetch(`${EBAY.apiBase}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`eBay token error ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

export async function exchangeCode(code: string): Promise<void> {
  const json = await tokenRequest(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: EBAY.ruName,
    }),
  );
  const now = Date.now();
  const tokens: StoredTokens = {
    access_token: String(json.access_token),
    access_expires_at: now + Number(json.expires_in ?? 7200) * 1000 - 60_000,
    refresh_token: String(json.refresh_token),
    refresh_expires_at:
      now + Number(json.refresh_token_expires_in ?? 47304000) * 1000,
  };
  await saveTokens(tokens);
}

async function saveTokens(tokens: StoredTokens): Promise<void> {
  const db = serverDb();
  if (!db) throw new Error('Supabase not configured');
  await db
    .from('settings')
    .upsert({ key: SETTINGS_KEY, value: tokens, updated_at: new Date().toISOString() });
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const db = serverDb();
  if (!db) return null;
  const { data } = await db.from('settings').select('value').eq('key', SETTINGS_KEY).single();
  return (data?.value as StoredTokens) ?? null;
}

/** Returns a valid access token, refreshing if necessary. */
export async function accessToken(): Promise<string> {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('eBay not connected — visit /settings');

  if (Date.now() < tokens.access_expires_at) return tokens.access_token;

  if (Date.now() > tokens.refresh_expires_at) {
    throw new Error('eBay refresh token expired (18-month limit) — reconnect in /settings');
  }

  const json = await tokenRequest(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      scope: EBAY_SCOPES,
    }),
  );
  const updated: StoredTokens = {
    ...tokens,
    access_token: String(json.access_token),
    access_expires_at: Date.now() + Number(json.expires_in ?? 7200) * 1000 - 60_000,
  };
  await saveTokens(updated);
  return updated.access_token;
}

export async function isConnected(): Promise<boolean> {
  const tokens = await loadTokens();
  return Boolean(tokens && Date.now() < tokens.refresh_expires_at);
}
