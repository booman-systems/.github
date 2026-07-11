import { serverDb } from '@/lib/db';
import { measurementBlock } from '@/lib/domain/measurements';
import { CONDITION_LABELS } from '@/lib/domain/guardrails';
import { poshmarkParityPrice } from '@/lib/config/fees';
import type { Flaw, Item } from '@/lib/domain/types';

export interface ListingDraft {
  title: string;
  description: string;
  aspects: Record<string, string[]>;
  category_query: string;
  suggested_price_cents: number;
  offer_floor_cents: number;
  poshmark_price_cents: number;
  reasoning: string;
}

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';

/**
 * Draft a listing from the item's facts + up to 4 photos (cover, tags,
 * flaws) using the Claude API. Returns structured fields ready for the
 * review screen.
 */
export async function generateDraft(item: Item): Promise<ListingDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  const db = serverDb();
  if (!db) throw new Error('Supabase not configured');

  // Grab up to 4 useful photos as signed URLs (cover + tags + first flaw).
  const { data: photos } = await db
    .from('photos')
    .select('ebay_path, master_path, kind, sort')
    .eq('item_sku', item.sku)
    .order('sort')
    .limit(4);
  const imageBlocks: unknown[] = [];
  for (const p of photos ?? []) {
    const path = (p.ebay_path as string) ?? (p.master_path as string);
    const { data } = await db.storage.from('item-photos').createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      imageBlocks.push({ type: 'image', source: { type: 'url', url: data.signedUrl } });
    }
  }

  const flaws = (item.flaws ?? []) as Flaw[];
  const facts = [
    `Brand: ${item.brand ?? 'unknown — identify from photos if possible'}`,
    `Garment type: ${item.garment_type}`,
    `Tag size: ${item.tag_size ?? 'unknown'} (size type: ${item.size_type})`,
    `Color: ${item.color ?? 'see photos'} | Material: ${item.material ?? 'see photos'}`,
    `Decade: ${item.decade ?? 'not vintage / unknown'}`,
    `Condition: ${item.condition ? CONDITION_LABELS[item.condition] : 'unknown'}`,
    `Flaws: ${flaws.length ? flaws.map((f) => `${f.type} at ${f.location}`).join('; ') : 'none recorded'}`,
    `Measurements: ${JSON.stringify(item.measurements)}`,
    `Weight: ${item.weight_oz ?? '?'} oz`,
  ].join('\n');

  const prompt = `You are an expert vintage menswear reseller specializing in big & tall.
Draft an eBay listing for this garment.

FACTS FROM INTAKE:
${facts}

Respond with ONLY a JSON object (no markdown fence) with these keys:
- "title": eBay title, MAX 80 chars. Front-load brand + type + size. Include size prominently (big & tall buyers search by size: "3XL", "Big Tall", "XLT"). Use "VTG" + decade if vintage. No filler words.
- "description": 3 short paragraphs of plain text: (1) what it is and why it's good, (2) fit notes referencing measurements, (3) honest condition summary naming every flaw. Do NOT invent flaws or features not in the facts/photos. End with "Item has been properly cleaned." if pre-owned.
- "aspects": object of eBay item specifics, keys like "Brand","Type","Size","Size Type","Color","Material","Department","Style","Pattern","Fit","Theme","Vintage","Decade" (only include what you can support; values are arrays of strings; "Department":["Men"]; "Size Type":["Big & Tall"] when applicable).
- "category_query": short phrase for eBay category search, e.g. "men's vintage casual button down shirt".
- "suggested_price_cents": integer. Typical sold prices for comparable vintage big & tall menswear on eBay; be realistic, not aspirational.
- "offer_floor_cents": integer, ~70% of suggested price.
- "reasoning": one sentence on the pricing logic.

If the photos reveal brand/era details missing from the facts, use them (e.g., read the tag).`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: prompt }],
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = json.content.find((c) => c.type === 'text')?.text ?? '';
  const cleaned = text.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Draft response was not valid JSON: ${text.slice(0, 200)}`);
  }

  const suggested = Math.max(500, Number(parsed.suggested_price_cents) || 2500);
  const draft: ListingDraft = {
    title: String(parsed.title ?? '').slice(0, 80),
    description: [
      String(parsed.description ?? ''),
      '',
      measurementBlock(item.garment_type, item.measurements ?? {}),
      '',
      `SKU: ${item.sku}`,
    ].join('\n'),
    aspects: (parsed.aspects as Record<string, string[]>) ?? {},
    category_query: String(parsed.category_query ?? 'mens vintage clothing'),
    suggested_price_cents: suggested,
    offer_floor_cents: Number(parsed.offer_floor_cents) || Math.round(suggested * 0.7),
    poshmark_price_cents: poshmarkParityPrice(suggested, item.weight_oz),
    reasoning: String(parsed.reasoning ?? ''),
  };
  return draft;
}
