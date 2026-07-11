'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [result, formAction, pending] = useActionState<{ error: string } | null, FormData>(
    login,
    null,
  );

  return (
    <div className="mx-auto max-w-sm pt-16">
      <form action={formAction} className="card space-y-4">
        <h1 className="text-xl font-bold">Burley&apos;s Closet</h1>
        {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Password"
          className="field-input"
        />
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
