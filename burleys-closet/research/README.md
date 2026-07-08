# Burley's Closet — Platform Research

**Project:** Custom software for a vintage clothing resale business focused on **men's big & tall**, streamlining the full pipeline: **intake → photography → listing → cross-posting (eBay + Poshmark) → sale → delist → shipping → accounting**.

**Research date:** July 8, 2026. Four research reports live in this folder:

| Doc | Covers |
|---|---|
| [01-ebay-selling-rules.md](01-ebay-selling-rules.md) | eBay seller standards, clothing listing rules, fees, listing formats, returns/MBG, shipping, vintage & big-and-tall specifics |
| [02-ebay-developer-apis.md](02-ebay-developer-apis.md) | eBay Developers Program, OAuth, Sell API suite (Inventory/Fulfillment/Account/Finances/Taxonomy/Media), notifications, labels, rate limits |
| [03-poshmark-selling-rules.md](03-poshmark-selling-rules.md) | Poshmark listing rules, fees, prepaid shipping model, sharing/offers mechanics, automation & bot policy, order flow |
| [04-cross-listing-and-operations.md](04-cross-listing-and-operations.md) | Running both platforms in tandem, overselling prevention, competitor tools, reseller workflow & data model, shipping strategy, the big & tall niche |

---

## Executive summary — the 10 facts that shape the software

1. **eBay is automatable via official APIs; Poshmark is not.** eBay offers a full Sell API suite (create listings, detect orders, upload tracking). Poshmark has **no public API** — every commercial tool automates it through browser-extension form-filling, which is technically against Poshmark's ToS but tolerated when human-in-the-loop and rate-limited. Architecture: **API-native on eBay, attended browser-assist on Poshmark.**

2. **The core product is the inventory state machine.** Vintage items are quantity-1. When an item sells on one platform it must be delisted from the other within minutes. Target ≤5-minute sale detection (eBay webhooks + polling fallback; Poshmark polling).

3. **Cancellation budgets are tiny.** eBay: out-of-stock cancellation = permanent defect; ≤2% keeps Above Standard, ≤0.5% for Top Rated (12-month window at low volume). Poshmark: >3% seller-initiated cancellations in 90 days = restrictions. A single double-sell can matter at low volume.

4. **Fees (config values, not constants):** eBay clothing FVF 13.25% (12.35% with Basic store) + $0.30–0.40/order, on item+shipping+tax. Poshmark: $2.95 flat under $15, 20% at $15+. Price ~6–8% higher on Poshmark for net parity.

5. **Shipping models differ completely.** eBay: seller-configured (calculated recommended for heavy items), labels bought through eBay auto-upload tracking. Poshmark: buyer-paid flat $6.49 USPS Ground Advantage prepaid label, **5 lb cap** — over that the seller pays upgrades ($5 for 5–10 lb, $10 for 10–15 lb). **Big & tall garments regularly exceed 5 lb packed** — weigh every item at intake and flag ">5 lb: eBay-preferred or price up on Poshmark."

6. **Measurements are the niche's currency.** Vintage tag sizes run small and big & tall buyers buy by measurement: pit-to-pit, shoulder, sleeve, length (tops); waist, inseam, rise (bottoms). Make them required fields per garment type; auto-generate description blocks for both platforms.

7. **Required listing data:** eBay requires Brand, Style, Size Type (= "Big & Tall"), Size, Condition — and from **July 2026 enforces standard size values** (listings held otherwise). eBay condition uses 6 values (NWT/NWOT/New-imperfect, Pre-owned Excellent/Good/Fair). Poshmark requires category, size, brand, color + rolled out its own condition tiers. Photos: eBay up to 24 (min 500px, target 1600px, 1:1); Poshmark up to 16 + 1 video (**3:4 portrait** since 2025-26). Store photo masters croppable to both.

8. **Hard content rules:** no used underwear/socks (both platforms — block at intake), used clothing must be cleaned and stated as cleaned (eBay policy), counterfeits banned, all flaws photographed and disclosed (the defense against not-as-described returns on both platforms).

9. **Poshmark automation red lines:** no bot-velocity sharing/liking/following, no bulk delete-and-relist (2025 suspension waves hit cross-lister users). Listing-form assistance at human speed is the tolerated norm.

10. **Compliance/accounting:** 1099-K federal threshold is $20,000 AND 200 transactions (2025–2026), but all profit is taxable — software should track COGS, fees, label costs per item and export a Schedule C-ready annual report. eBay developer accounts must handle the marketplace account-deletion notification requirement before first production API call.

## Recommended platform roles

eBay is the **primary channel** for vintage menswear/big & tall (buyer demographics skew male, item specifics power size-filtered search, international demand via eBay International Shipping). Poshmark is the **complementary secondary channel** (female-skewing, social selling, but real big & tall browse surfaces and bundle-friendly repeat buyers).

## Suggested next step

Define the software's functional spec: data model (SKU/location/COGS/measurements/weight/condition/flaws/photos), the listing pipeline per platform, sale-detection + auto-delist engine, shipping workflow, and dashboards (defect budget, death pile aging, profit per item).
