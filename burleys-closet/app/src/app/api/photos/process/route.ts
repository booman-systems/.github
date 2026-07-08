import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { serverDb } from '@/lib/db';

export const maxDuration = 60;

/**
 * Photo pipeline: accepts one photo (multipart form: file, item_sku, kind, sort),
 * converts HEIC→JPEG if needed, and produces three derivatives in Supabase
 * storage:
 *   master:   original orientation, max 3000px, q90 JPEG
 *   ebay:     1:1 center crop, 1600px, q90       (eBay recommends ~1600px)
 *   poshmark: 3:4 portrait center crop, 1200x1600, q90
 */
export async function POST(req: NextRequest) {
  const db = serverDb();
  if (!db) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const itemSku = String(form.get('item_sku') ?? '');
  const kind = String(form.get('kind') ?? 'detail');
  const sort = Number(form.get('sort') ?? 0);

  if (!(file instanceof File) || !itemSku) {
    return NextResponse.json({ error: 'file and item_sku are required' }, { status: 400 });
  }

  let buffer = Buffer.from(await file.arrayBuffer());

  // iPhones shoot HEIC; sharp's prebuilt binaries can't decode it.
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name);
  if (isHeic) {
    const { default: heicConvert } = await import('heic-convert');
    const converted = await heicConvert({
      buffer: buffer as unknown as ArrayBuffer,
      format: 'JPEG',
      quality: 0.95,
    });
    buffer = Buffer.from(converted);
  }

  const base = sharp(buffer).rotate(); // apply EXIF orientation
  const meta = await base.metadata();

  const [master, ebayCrop, poshCrop] = await Promise.all([
    base
      .clone()
      .resize({ width: 3000, height: 3000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer(),
    base
      .clone()
      .resize({ width: 1600, height: 1600, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 90 })
      .toBuffer(),
    base
      .clone()
      .resize({ width: 1200, height: 1600, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 90 })
      .toBuffer(),
  ]);

  const stamp = Date.now();
  const dir = `${itemSku}/${stamp}`;
  const uploads: [string, Buffer][] = [
    [`${dir}/master.jpg`, master],
    [`${dir}/ebay.jpg`, ebayCrop],
    [`${dir}/poshmark.jpg`, poshCrop],
  ];

  for (const [path, data] of uploads) {
    const { error } = await db.storage
      .from('item-photos')
      .upload(path, data, { contentType: 'image/jpeg', upsert: true });
    if (error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
  }

  const { data: photo, error: dbError } = await db
    .from('photos')
    .insert({
      item_sku: itemSku,
      kind,
      sort,
      master_path: `${dir}/master.jpg`,
      ebay_path: `${dir}/ebay.jpg`,
      poshmark_path: `${dir}/poshmark.jpg`,
      width: meta.width ?? null,
      height: meta.height ?? null,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ photo });
}
