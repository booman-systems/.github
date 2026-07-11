'use client';

import { useState, useTransition } from 'react';
import { fetchPolicies, savePolicies, saveLocation } from './actions';

type PolicyList = { id: string; name: string }[];

export default function SettingsForms({
  ebayReady,
  savedPolicies,
  savedAddress,
}: {
  ebayReady: boolean;
  savedPolicies: Record<string, string> | null;
  savedAddress: Record<string, string> | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lists, setLists] = useState<{
    fulfillment: PolicyList;
    payment: PolicyList;
    ret: PolicyList;
  } | null>(null);
  const [sel, setSel] = useState({
    fulfillmentPolicyId: savedPolicies?.fulfillmentPolicyId ?? '',
    paymentPolicyId: savedPolicies?.paymentPolicyId ?? '',
    returnPolicyId: savedPolicies?.returnPolicyId ?? '',
  });
  const [addr, setAddr] = useState({
    addressLine1: savedAddress?.addressLine1 ?? '',
    city: savedAddress?.city ?? '',
    stateOrProvince: savedAddress?.stateOrProvince ?? '',
    postalCode: savedAddress?.postalCode ?? '',
  });

  if (!ebayReady) return null;

  return (
    <>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{notice}</p>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">Business policies</h2>
        <p className="text-xs text-stone-500">
          Created in eBay Seller Hub (Account → Business Policies). Every listing
          references these three IDs.
          {savedPolicies?.fulfillmentPolicyId ? ' Currently saved ✓' : ''}
        </p>
        <button
          disabled={pending}
          onClick={() => {
            setError('');
            startTransition(async () => {
              const r = await fetchPolicies();
              if (r.error) setError(r.error);
              else
                setLists({
                  fulfillment: r.fulfillment ?? [],
                  payment: r.payment ?? [],
                  ret: r.ret ?? [],
                });
            });
          }}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium"
        >
          {pending ? 'Loading…' : 'Load policies from eBay'}
        </button>

        {lists && (
          <div className="space-y-2">
            {(
              [
                ['fulfillmentPolicyId', 'Shipping policy', lists.fulfillment],
                ['paymentPolicyId', 'Payment policy', lists.payment],
                ['returnPolicyId', 'Return policy', lists.ret],
              ] as const
            ).map(([key, label, options]) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <select
                  value={sel[key]}
                  onChange={(e) => setSel({ ...sel, [key]: e.target.value })}
                  className="field-input"
                >
                  <option value="">— pick —</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              disabled={
                pending ||
                !sel.fulfillmentPolicyId ||
                !sel.paymentPolicyId ||
                !sel.returnPolicyId
              }
              onClick={() => {
                setError('');
                startTransition(async () => {
                  const r = await savePolicies(sel);
                  if (r.error) setError(r.error);
                  else setNotice('Policies saved.');
                });
              }}
              className="btn-primary"
            >
              Save policies
            </button>
          </div>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Ship-from location</h2>
        <p className="text-xs text-stone-500">
          Registered with eBay as your inventory location (required to publish).
          {savedAddress?.postalCode ? ' Currently saved ✓' : ''}
        </p>
        <input
          placeholder="Street address"
          value={addr.addressLine1}
          onChange={(e) => setAddr({ ...addr, addressLine1: e.target.value })}
          className="field-input"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            placeholder="City"
            value={addr.city}
            onChange={(e) => setAddr({ ...addr, city: e.target.value })}
            className="field-input"
          />
          <input
            placeholder="State (MD)"
            value={addr.stateOrProvince}
            onChange={(e) => setAddr({ ...addr, stateOrProvince: e.target.value })}
            className="field-input"
          />
          <input
            placeholder="ZIP"
            value={addr.postalCode}
            onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })}
            className="field-input"
          />
        </div>
        <button
          disabled={pending || !addr.addressLine1 || !addr.city || !addr.postalCode}
          onClick={() => {
            setError('');
            startTransition(async () => {
              const r = await saveLocation(addr);
              if (r.error) setError(r.error);
              else setNotice('Location registered with eBay.');
            });
          }}
          className="btn-primary"
        >
          Save location
        </button>
      </section>
    </>
  );
}
