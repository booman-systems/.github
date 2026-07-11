'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const SHOT_LIST = [
  'Front (cover)',
  'Back',
  'Brand tag',
  'Size tag',
  'Fabric/care tag',
  'Each flaw close-up',
];

export default function PhotoUploader({
  itemSku,
  existingCount,
}: {
  itemSku: string;
  existingCount: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    let done = 0;
    for (const file of Array.from(files)) {
      setProgress(`Processing ${done + 1}/${files.length}…`);
      const form = new FormData();
      form.append('file', file);
      form.append('item_sku', itemSku);
      form.append('kind', existingCount + done === 0 ? 'cover' : 'detail');
      form.append('sort', String(existingCount + done));
      const res = await fetch('/api/photos/process', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(`Upload failed on photo ${done + 1}: ${body.error ?? res.status}`);
        break;
      }
      done += 1;
    }
    setBusy(false);
    setProgress('');
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
        <p className="mb-1 font-semibold">Shot list:</p>
        <p>{SHOT_LIST.join(' · ')}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="btn-primary w-full py-3"
      >
        {busy ? progress || 'Processing…' : '📷 Add photos'}
      </button>
      <p className="text-center text-xs text-stone-500">
        Each photo is auto-converted and cropped for eBay (1:1) and Poshmark (3:4).
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
