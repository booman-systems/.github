/**
 * Single-user password gate. Uses Web Crypto so it runs in both the edge
 * middleware and Node server actions. Replace with real auth (Supabase Auth)
 * if the business adds employees.
 */
const SALT = 'burleys-closet-v1';

export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const AUTH_COOKIE = 'bc_auth';
