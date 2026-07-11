# Burley's Closet — Poshmark Bridge extension

Chrome extension (Manifest V3) that connects your Poshmark browser session to
the Burley's Closet app. **Human-in-the-loop by design**: it fills forms and
tracks state, but *you* pick category/size and press Publish/delist. This is
the same operating model as commercial tools (Vendoo, List Perfectly) and it
stays away from the bot behaviors Poshmark actively bans (auto-sharing,
auto-following, bulk delete/relist).

## Install (unpacked)

1. Chrome → `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → select this `extension/` folder.
3. Click the extension icon → enter your app URL
   (`https://your-app.vercel.app`) and the **bridge secret**
   (the `BRIDGE_SECRET` env var you set in Vercel).

## Daily flow

**Listing:** open `poshmark.com/create-listing`, click the extension, hit
**Fill current tab** on a queue item. Photos (3:4 crops), title, description,
and prices are injected. You choose category/size/color and press Publish,
then hit **✓ Published** in the popup — the app marks the listing ACTIVE.

**Delisting (sold on eBay):** the popup's red section lists items that just
sold on eBay. Open the listing, mark it **Not for Sale** on Poshmark, hit
**✓ Delisted** — the app closes the delist job and the dashboard alarm stops.

## When the fill stops working

Poshmark changes their page markup regularly. Every selector lives in the
`SELECTORS` object at the top of `content.js` — update the failing one there.
