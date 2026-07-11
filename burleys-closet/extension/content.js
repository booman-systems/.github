/* Burley's Closet — Poshmark Bridge content script.
 *
 * Fills Poshmark's create-listing form from queue data: photos (fetched and
 * injected as Files), title, description, price, and original price. Category,
 * size, and the final Publish click stay HUMAN actions on purpose — this keeps
 * the tool in "listing assistance" territory (like Vendoo/List Perfectly) and
 * away from Poshmark's automated-participation red lines.
 *
 * Poshmark ships DOM changes regularly. All selectors live in SELECTORS below —
 * when a fill step stops working, fix the selector here, nothing else.
 */

const SELECTORS = {
  // Multiple candidates per field, tried in order.
  photoInput: [
    'input[type="file"][accept*="image"]',
    'input[type="file"]',
  ],
  title: [
    'input[placeholder*="What are you selling" i]',
    'input[data-vv-name="title"]',
    'input[name="title"]',
  ],
  description: [
    'textarea[placeholder*="Describe" i]',
    'textarea[data-vv-name="description"]',
    'textarea[name="description"]',
  ],
  originalPrice: [
    'input[placeholder*="Original" i]',
    'input[data-vv-name="originalPrice"]',
  ],
  listingPrice: [
    'input[placeholder*="Listing Price" i]',
    'input[data-vv-name="listingPrice"]',
    'input[placeholder*="price" i]:not([placeholder*="Original" i])',
  ],
};

function find(candidates) {
  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

/** Set a field the way React/Vue expect: native setter + input event. */
function setValue(el, value) {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

async function injectPhotos(urls) {
  const input = find(SELECTORS.photoInput);
  if (!input) return { ok: false, error: 'photo input not found' };

  const files = [];
  for (let i = 0; i < urls.length; i++) {
    const res = await fetch(urls[i]);
    if (!res.ok) continue;
    const blob = await res.blob();
    files.push(new File([blob], `photo-${i + 1}.jpg`, { type: 'image/jpeg' }));
  }
  if (!files.length) return { ok: false, error: 'no photos downloadable' };

  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return { ok: true, count: files.length };
}

async function fillListing(data) {
  if (!location.pathname.startsWith('/create-listing')) {
    return { ok: false, error: 'Not on poshmark.com/create-listing' };
  }

  const photoResult = await injectPhotos(data.photoUrls ?? []);

  // Give Poshmark's uploader a moment to ingest before touching text fields.
  await new Promise((r) => setTimeout(r, 1500));

  const steps = [];
  const title = find(SELECTORS.title);
  if (title) { setValue(title, (data.title ?? '').slice(0, 80)); steps.push('title'); }

  const desc = find(SELECTORS.description);
  if (desc) { setValue(desc, data.description ?? ''); steps.push('description'); }

  const listPrice = find(SELECTORS.listingPrice);
  if (listPrice) { setValue(listPrice, data.price ?? ''); steps.push('price'); }

  const origPrice = find(SELECTORS.originalPrice);
  if (origPrice && data.price) {
    // Original price: 2.5x listing as a defensible retail anchor.
    setValue(origPrice, String(Math.round(Number(data.price) * 2.5)));
    steps.push('originalPrice');
  }

  return {
    ok: true,
    photos: photoResult.ok ? photoResult.count : 0,
    photoError: photoResult.ok ? null : photoResult.error,
    filled: steps,
    remaining: 'category, size, color, availability — then YOU press Publish',
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FILL_LISTING') {
    fillListing(message.data)
      .then(sendResponse)
      .catch((e) => sendResponse({ ok: false, error: String(e.message ?? e) }));
    return true; // async response
  }
});
