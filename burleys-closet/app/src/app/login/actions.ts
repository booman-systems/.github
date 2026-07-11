'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authToken, AUTH_COOKIE } from '@/lib/auth';

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const password = process.env.APP_PASSWORD;
  const submitted = String(formData.get('password') ?? '');

  if (!password) redirect('/'); // gate disabled

  if (submitted !== password) {
    return { error: 'Wrong password.' };
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, await authToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90, // 90 days — it's your own phone
    path: '/',
  });
  redirect('/');
}
