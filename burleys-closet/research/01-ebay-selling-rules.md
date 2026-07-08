# eBay Rules & Best Practices for Selling Used/Vintage Clothing
## Research Report for Burley's Closet (Men's Big & Tall Vintage Apparel)

**Research date: July 8, 2026.** Fee figures reflect eBay's US fee schedule as updated **February 14, 2025** (the most recent major final value fee change) and policy changes announced through mid-2026. eBay adjusts fees roughly annually (announced via Seller Updates), so the software should treat all fee percentages as **configuration values, not hardcoded constants**, and re-verify against [ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822) before each fee-sensitive release.

---

## 1. Seller Account Requirements & Seller Levels

### Account setup
- Register at ebay.com/register as a **personal or business account**. A business account (recommended for a reseller operating as "Burley's Closet") requires business name, EIN (or SSN for sole proprietor), identity verification, and a linked checking account for payouts through eBay's managed payments system ([FlowLister business account guide](https://flowlister.com/blog/ebay-business-account/), [eBay Seller Center — Payments](https://www.ebay.com/sellercenter/payments-and-fees/payments-and-earnings)).
- **Taxes:** Under the July 2025 tax law, the federal Form 1099-K threshold was permanently restored to **$20,000 AND 200 transactions** per year (aggregated across accounts sharing a tax ID). Several states have lower thresholds (e.g., MA, VA, MD, IL, NJ, VT at $600–$1,000ish) — the software should track gross sales for tax reporting regardless ([eBay 1099-K FAQ](https://www.ebay.com/sellercenter/resources/changes-to-ebay-and-your-1099-k), [eBay Help — Form 1099-K](https://www.ebay.com/help/selling/fees-credits-invoices/ebay-form-1099k?id=4794)).

### Seller levels
eBay evaluates sellers on the **20th of each month** and assigns one of three levels ([Seller performance overview, id=4080](https://www.ebay.com/help/selling/seller-levels-performance-standards/seller-levels-performance-standards?id=4080); [Seller standards policy, id=4347](https://www.ebay.com/help/policies/selling-policies/seller-standards-policy?id=4347)):

| Level | Requirements |
|---|---|
| **Above Standard** | Transaction defect rate ≤ **2%**; cases closed without seller resolution ≤ 0.3%; late shipment rate ≤ **7%** |
| **Top Rated** | Account active ≥ 90 days; **≥ 100 transactions and ≥ $1,000 in sales with US buyers in the last 12 months**; defect rate ≤ **0.5%** (and ≤ 3 defects from unique buyers); cases closed without seller resolution ≤ **0.3%** (≤ 2 cases); late shipment rate ≤ **3%** (≤ 5 late shipments); tracking uploaded within stated handling time with carrier validation for **≥ 95%** of US transactions |
| **Below Standard** | Defect rate > 2% or cases-closed-without-resolution > 0.3%. Penalties: an **additional 6% on final value fees** the following month, reduced search visibility, possible selling limits ([Seller standards policy](https://www.ebay.com/help/policies/selling-policies/seller-standards-policy?id=4347)) |

**Defects** = seller-initiated cancellations for being out of stock, and cases closed without seller resolution. **This is the single most important metric for the software to protect** (see §8 on cross-listing).

**Top Rated Plus** (per-listing seal + benefits): a Top Rated Seller's listing qualifies when it offers **same-day or 1-day handling AND 30-day (or longer) free returns**. Benefit: **10% discount on final value fees** for those sales, plus a badge and better placement ([Top Rated Seller Program](https://www.ebay.com/sellercenter/protections/top-rated-program), [Auction Nudge TRS guide](https://www.auctionnudge.com/guides/understanding-ebay-top-rated-seller-status-top-rated-plus-listings/)).

**Software implication:** track defect rate, late-shipment rate, and tracking-upload timeliness internally; alert before eBay's 20th-of-month evaluation.

---

## 2. Listing Rules for Clothing

### Used clothing / cleanliness policy
Per eBay's [Used clothing policy (id=4281)](https://www.ebay.com/help/policies/prohibited-restricted-items/used-clothing-policy?id=4281):
- Used clothing **may be sold only if properly cleaned**, and the listing **must state the item has been properly cleaned**. Items must be free of stains (buyers are promised "clean, stain-free" items).
- **Prohibited entirely: used underwear and used socks — even if cleaned.** Includes boxer shorts, briefs, panties, diapers, athletic supporters. (Bras are allowed.) Relevant for big & tall: **used socks and underwear must be blocked at intake**; vintage sock listings are only OK if new/deadstock.
- Listings may not contain language or images that **fetishize** the item (e.g., statements about the person who wore/modeled it).

**Software implication:** intake form should auto-append a "properly cleaned" statement to descriptions and hard-block used underwear/socks categories.

### Prohibited/authenticity rules
- **Counterfeits are banned outright**; "replica," "inspired by," or faux-branded items cannot be listed. Violations lead to listing removal, restrictions, or suspension ([Counterfeit policy, id=4276](https://www.ebay.com/help/policies/prohibited-restricted-items/counterfeit-item-policy?id=4276)).
- **Authenticity Guarantee** applies automatically to certain categories: **sneakers** and **streetwear sold at $200+** (also watches, handbags, jewelry, trading cards). Items route through eBay's authenticators before reaching the buyer; counterfeits are confiscated ([eBay Authenticity Guarantee — sneakers](https://www.ebay.com/authenticity-guarantee/sneakers), [streetwear](https://www.ebay.com/authenticity-guarantee/streetwear), [Retail TouchPoints](https://www.retailtouchpoints.com/topics/digital-commerce/street-legal-ebay-expands-authenticity-guarantee-to-cover-streetwear)). Mostly affects vintage band tees/hoodies/jackets from hyped brands crossing $200.

### Photo requirements
Per [Adding pictures to your listings (id=4148)](https://www.ebay.com/help/selling/listings/adding-pictures-listings?id=4148) and [Photo tips](https://www.ebay.com/sellercenter/listings/photo-tips):
- **Minimum 1 photo, up to 24 per listing**; max 12 MB each; JPEG/PNG/GIF/TIFF supported.
- Minimum **500×500 px**; **zoom requires ≥1000 px**; eBay recommends **~1600×1600 px**.
- **No added text, borders, badges, or watermarks** — these can hurt search placement.
- **Stock photos are only allowed for new items** — used clothing must have actual photos of the actual garment.
- Best practice for used clothing: neutral background, all flaws photographed (this is also what protects you in "not as described" disputes — see §5).

### Item specifics for men's clothing
Per [Item specifics requirements](https://www.ebay.com/sellercenter/listings/item-specifics-requirements) and [export.ebay.com item specifics](https://export.ebay.com/en/manage-listings/item-specifics/):
- **Required** for Clothing, Shoes & Accessories: **Brand, Style, Size Type, Size** (Size Type is where "Big & Tall" lives — values include Regular, Big & Tall, etc.). **Condition** is also required.
- **2026 enforcement change:** starting **July 2026**, new/revised apparel listings with missing or non-standard **Size** values are put on hold until fixed — the software must map to eBay's standard size values (S/M/L/XL/2XL/3XL etc.) rather than free text ([List Perfectly on 2026 size rules](https://listperfectly.com/selling/ebay-fashion-size-rules-resellers-2026/)).
- **Recommended/filterable specifics** the software should capture at intake (these power buyer search filters, which matter more than title keywords for filtered searches): **Chest Size, Neck Size, Sleeve Length, Waist Size, Inseam, Color, Material/Fabric, Fit, Pattern, Theme, Decade** (for vintage: Pre-1890 → 1990s), **Vintage: Yes**, Department (Men), Type, Features. Listings with 10+ specifics consistently outperform sparse ones ([Optimizing for Best Match, id=4166](https://www.ebay.com/help/selling/listings/listing-tips/optimising-listings-best-match?id=4166), [Marqetir listing score](https://marqetir.com/tools/ebay-listing-score)).
- **Measurements matter more than tag size for vintage** (vintage sizes run small): capture pit-to-pit chest, sleeve from center-back-neck, waist flat, inseam, length ([The Tailored Co — how to measure shirts for eBay](https://www.thetailoredco.com/how-to-measure-shirts-for-ebay/)).

### Condition values for clothing (changed Feb 2025)
eBay replaced the single "Pre-owned" condition for clothing with three tiers ([Seller Update Jan 2025 — new item conditions](https://www.ebay.com/sellercenter/resources/seller-updates/2025-january/new-item-conditions), [community announcement](https://community.ebay.com/t5/Seller-Update-January-2025/Introducing-new-conditions-for-pre-loved-clothing/td-p/34908723)):
- **New with tags** / **New without tags** / **New with imperfections** (renamed from "New with defects")
- **Pre-owned – Excellent** / **Pre-owned – Good** / **Pre-owned – Fair** (all imperfections must be shown and described). Existing "Pre-owned" listings were auto-migrated to "Pre-owned – Good."

**Software implication:** the intake condition-grading field should map 1:1 to these six values (eBay condition IDs are documented in the [Sell API ConditionEnum](https://developer.ebay.com/api-docs/sell/inventory/types/slr:ConditionEnum)).

---

## 3. Fees (US site, effective Feb 14, 2025 schedule; verified July 2026)

Source: [Selling fees (id=4822)](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822), [Jan 2025 Seller Update — FVF changes](https://www.ebay.com/sellercenter/resources/seller-updates/2025-january/final-value-fee), [Store subscriptions and fees](https://www.ebay.com/sellercenter/payments-and-fees/subscriptions-and-fees).

### Insertion fees
- **250 zero-insertion-fee listings/month** without a store; **$0.35 per listing** after that. Store tiers raise the allotment (below). **Good 'Til Cancelled listings consume one insertion each monthly auto-renewal.**

### Final value fees (FVF) — Clothing, Shoes & Accessories
- **13.25%** of total sale amount (no store) / **12.35%** (Basic store or higher) on the portion up to $7,500, **plus a per-order fee: $0.30 for orders ≤ $10, $0.40 for orders > $10**.
- FVF is calculated on the **total amount of the sale: item price + shipping charged to buyer + sales tax** ([FlowLister FVF guide](https://flowlister.com/blog/ebay-final-value-fees-explained/), [Taxomate fee guide](https://taxomate.com/blog/ebay-seller-fees)).
- Modifiers: **+1.65% international fee** when the buyer's registered address is outside the US; **+6%** if Below Standard; **−10%** Top Rated Plus discount on qualifying listings ([Selling fees id=4822](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822)).

### Store subscription tiers (annual-billing prices)
([eDesk store guide](https://www.edesk.com/blog/ebay-store-subscription-worth-it/), [ZIK Analytics store levels](https://www.zikanalytics.com/blog/ebay-store-levels/), [eBay Stores overview id=4071](https://www.ebay.com/help/selling/ebay-stores/ebay-stores?id=4071)):

| Tier | $/mo (annual) | Free listings/mo | FVF discount | Notes |
|---|---|---|---|---|
| Starter | $4.95 | 250 | none | storefront only |
| **Basic** | **$21.95** | **1,000** | **~0.9% lower (12.35% in clothing)** | + $25/qtr shipping-supplies coupon, Discounts Manager/markdown sales, Terapeak |
| Premium | $59.95 | 10,000 | same discount | for high listing volume |
| Anchor | $299.95 | 25,000 | same | |
| Enterprise | $2,995 | 100,000 | same | |

Break-even for Basic is roughly **$2,500/month in sales or 300+ listings/month** ([ListingForge store analysis](https://www.listing-forge.com/blog/ebay-store-subscription)). **Recommendation for Burley's Closet: Basic store once past ~250 active listings** — required anyway for markdown sale events (§4).

### Promoted Listings
([Promoted Listings overview, id=5295](https://www.ebay.com/help/selling/listings/promoted-listings-overview?id=5295), [General campaign strategy, id=4164](https://www.ebay.com/help/selling/ebay-advertising/promoted-listings/general-campaign-strategy?id=4164)):
- **General (cost-per-sale):** you set an ad rate (2%–100% of total sale amount), charged only when a promoted item sells within 30 days of an ad click. **Important Jan 13, 2026 change:** attribution broadened — a fee applies if *any* buyer clicked the ad and *any* buyer purchases within 30 days, pushing attribution to 80–90%+ of sales; treat the ad rate as a near-certain fee on promoted items ([MyListerHub on the 2026 change](https://www.mylisterhub.com/articles/ebay-promoted-listings-change)). Practitioner consensus: ignore eBay's "suggested" rates (often 10%+); start at **2–3%** ([Underpriced ROI guide](https://www.underpriced.app/blog/ebay-promoted-listings-roi-guide-2026)).
- **Priority (cost-per-click):** keyword-targeted, budget/bid-based, exclusive access to the top search slot; pay per click whether or not it sells ([Priority campaign strategy, id=5299](https://www.ebay.com/help/selling/ebay-advertising/promoted-listings/priority-campaign-strategy?id=5299)). Generally for high-volume sellers; General is the right fit for one-of-a-kind vintage.

### Payments & payouts (eBay Managed Payments)
All selling funds flow through eBay's managed payments (no separate PayPal fee); fees are deducted before payout. Payout schedules: **daily (initiated within ~2 days of buyer payment confirmation), weekly/biweekly/monthly (initiated Tuesdays)**, plus on-demand payouts; bank settlement typically 1–3 business days; debit-card "express" payouts arrive in minutes for a fee ([Getting paid, id=4814](https://www.ebay.com/help/selling/getting-paid/payouts-work-managed-payments-sellers?id=4814), [Payments and earnings](https://www.ebay.com/sellercenter/payments-and-fees/payments-and-earnings)). New sellers may experience initial payout holds ([Underpriced payout guide](https://www.underpriced.app/blog/ebay-managed-payments-payout-holds-guide-2026)).

---

## 4. Listing Formats

([Listing durations, id=4652](https://www.ebay.com/help/selling/listings/selecting-listing-duration?id=4652), [Relisting items, id=4147](https://www.ebay.com/help/selling/listings/creating-managing-listings/relisting-items?id=4147), [Best Offer, id=4144](https://www.ebay.com/help/selling/listings/selling-buy-now/adding-best-offer-listing?id=4144))

- **Fixed price (Buy It Now)** is the only duration **Good 'Til Cancelled (GTC)** — auto-relists monthly on the same day until sold or ended, consuming an insertion (free if within allotment) each cycle. This is the standard format for one-of-a-kind used clothing; community consensus strongly favors fixed price + Best Offer for clothing ([eBay community thread](https://community.ebay.com/t5/Selling/Best-listing-format-for-clothing/td-p/35109369)).
- **Auction:** durations 1/3/5/7/10 days (1-day requires feedback ≥10). Best reserved for rare/hype vintage pieces with proven bidder demand; everything else stalls at low prices.
- **Best Offer:** enable on fixed-price listings; supports **auto-accept ≥ $X and auto-decline < $Y** thresholds (buyers can't see them; auto-accept must be below BIN price). Counteroffers supported. Sellers can also **send offers to watchers/interested buyers**. The software should store floor prices per item to drive auto-decline and "send offer" automation.
- **Markdown sale events (Discounts Manager):** requires a **store subscription** and fixed-price listings; shows strikethrough was/now pricing; items must have been **at the same price for 14 days** before the sale; up to 10,000 items per event. Other promo types: order discounts, volume pricing, coupons, shipping discounts ([Sale events — Seller Center](https://www.ebay.com/sellercenter/growth/seller-hub-discounts/sale-events), [Discounts Manager, id=4094](https://www.ebay.com/help/selling/selling-tools/promotions-manager?id=4094)). **Software implication: track "price last changed" per listing to maintain markdown eligibility.**
- **Duplicate listings policy** ([id=4255](https://www.ebay.com/help/policies/listing-policies/duplicate-listings-policy?id=4255)): no more than one **fixed-price** listing of an identical item at a time from the same seller, and no listing the same item in multiple categories. Duplicate auctions (no BIN) are allowed but only one shows at a time. An auction-with-BIN duplicating a fixed-price listing of the same item is prohibited. First offense: removal; repeats: restrictions/suspension. For one-of-a-kind vintage this mostly means: **never list the same garment twice on eBay** (e.g., don't relist before ending the original).

---

## 5. Returns & eBay Money Back Guarantee (MBG)

- **Seller-chosen return policy options:** no returns; 30-day or 60-day returns, buyer-paid or seller-paid ("free returns"). **30-day free returns + 1-day handling = Top Rated Plus** (10% FVF discount and badge) and eBay states that longer/free return windows get a **visibility boost in search** ([How returns work — export.ebay.com](https://export.ebay.com/en/seller-performance/transactions/how-returns-work/), [Top Rated Program](https://www.ebay.com/sellercenter/protections/top-rated-program)).
- **"No returns" doesn't mean no returns.** Under the **eBay Money Back Guarantee**, buyers can always return items that are **not as described (INAD)** — and for INAD returns the **seller pays return shipping regardless of the stated policy**. Only "remorse" returns can be refused under a no-returns policy ([ZIK Analytics returns guide](https://www.zikanalytics.com/blog/ebay-return-policy/), [export.ebay.com returns](https://export.ebay.com/en/seller-performance/transactions/how-returns-work/)).
- **Timelines that create defects if missed:** respond to a return request within **3 business days**; after a returned item shows delivered, the seller has **2 business days** to refund or ask eBay to step in — otherwise **eBay auto-refunds on your behalf**, and cases eBay resolves against you count as "cases closed without seller resolution" (the harshest defect). The software should surface return deadlines as urgent tasks.
- For used clothing specifically, thorough flaw photography + accurate condition tier (Pre-owned Excellent/Good/Fair) is the primary INAD defense.
- Free returns also let sellers issue **partial refunds** for items returned used/damaged.

---

## 6. Shipping

- **eBay Labels:** buy USPS/UPS/FedEx labels inside eBay at commercial discounted rates; tracking auto-uploads to the order — the biggest operational reason to buy labels through eBay ([Shipping discounts, id=4168](https://www.ebay.com/help/selling/shipping-items/shipping-rates/shipping-discounts?id=4168), [Rollo label guide](https://www.rollo.com/blog/money-saving-ebay-shipping-label-guide/)).
- **Calculated vs flat:** calculated uses item weight/dimensions + buyer ZIP (ideal for heavy big & tall outerwear/jeans where zone differences are large); flat rate suits predictable-weight items like t-shirts. Calculated combines better for multi-item orders ([Shipping FAQs](https://www.ebay.com/sellercenter/shipping/faqs), [community discussion](https://community.ebay.com/t5/Shipping/Calculated-shipping-vs-Flat-rate-USPS/td-p/34640315)). **Software implication: capture weight + box dimensions at intake.** Big & tall garments are heavier than average menswear — a 3XL winter coat can exceed 4–5 lbs packed, so calculated shipping protects margins.
- **Handling time:** you commit to a stated handling time (same-day up to 30 days). "On time" = **acceptance scan within stated handling time**; late shipments feed the late-shipment rate metric. Same/1-day handling is required for Top Rated Plus.
- **Tracking:** upload validated tracking; Top Rated requires tracking uploaded within handling time with carrier scans on ≥95% of US transactions. General guidance: tracking uploaded by end of next business day after payment ([Shipping FAQs](https://www.ebay.com/sellercenter/shipping/faqs)).
- **eBay International Shipping (EIS):** default international program for eligible US sellers — you ship to a **US domestic hub**; eBay handles customs, international legs, and duties. **Your transaction is complete when the hub accepts the item**: you're protected from INR claims, chargebacks, international returns (eBay refunds the buyer at no cost to you and you keep the sale), and hub/transit damage; related negative feedback is removed ([eBay International Shipping, id=5348](https://www.ebay.com/help/selling/shipping-items/setting-shipping-options/ebay-international-shipping-program?id=5348), [Seller Center EIS](https://www.ebay.com/sellercenter/shipping/ebay-international-shipping)). Strong recommendation to enable — vintage Americana (Carhartt, Levi's, band tees) has heavy demand from Japan/Europe with essentially zero added seller risk.

---

## 7. Vintage Clothing Specifics

### Definition
eBay doesn't enforce a formal definition, but marketplace convention is **20–100 years old = vintage** (100+ = antique). As of 2026 that makes early-2000s (Y2K) items legitimately "vintage" ([TopBubbleIndex eBay vintage guide](https://www.topbubbleindex.com/blog/ebay-vintage-clothing/), [Duct Tape and Denim](https://ducttapeanddenim.com/what-does-vintage-mean/)). Don't label 2010s items vintage — buyers report it and it erodes trust.

### Category structure
Dedicated category: **Clothing, Shoes & Accessories > Specialty > Vintage > Men's Vintage Clothing** (browse node 182044), with subcategories: Casual Shirts, Dress Shirts, Jeans, Outerwear Coats & Jackets, Pants, Shorts, Sleepwear & Robes, Suit Jackets & Blazers, Suits, Sweaters, Sweats & Tracksuits, Swimwear, T-Shirts, Vests, Other ([eBay Men's Vintage Clothing browse](https://www.ebay.com/b/Mens-Vintage-Clothing/182044/bn_2309544)). Buyer-side filters include **Decade** (Pre-1890 → 1990s; 1990s and 1980s dominate inventory), Material, Color — so populate the **Decade** and **Vintage: Yes** item specifics. Correct niche categorization measurably improves impressions and sell-through ([nifty.ai vintage guide](https://nifty.ai/post/how-sell-vintage-items)). Note: choose *either* the vintage category *or* the modern equivalent — listing in both violates the duplicate-listings policy.

### Title best practices (80 characters)
([3Dsellers title optimization](https://www.3dsellers.com/blog/ebay-title-optimization), [CLOSO keyword guide](https://closo.co/blogs/optimization-growth-strategies/best-keywords-for-your-ebay-listing-the-complete-2025-guide), [Hustle & Slow keywords](https://www.hustleandslow.com/keywords-poshmark-ebay/))
- Formula: **Brand + Gender/Dept + Item Type + Size + Key Descriptors** (era, fabric, fit, color). Front-load brand/type — the algorithm weights early words most.
- Use **"VTG"** alongside or instead of "Vintage" to save characters; include the decade ("90s", "80s") — buyers search by decade.
- **Always include size in the title** — big & tall buyers search "3XL", "XLT", "Big Tall", "50x30" directly. Example: `VTG 90s Carhartt Detroit Jacket Men 3XL Big Tall Blanket Lined Distressed USA`.
- Include fabric/construction keywords buyers search (flannel, wool, leather, USA made, single stitch, talon zipper for era authentication).
- No filler ("L@@K", "WOW"), no keyword stuffing (search-manipulation policy violation), and nothing in the title you can't point to on the garment.
- Mine **sold listings** (Terapeak, included with store subscriptions) for proven title keywords.

### What sells in big & tall
- Persistent supply/demand imbalance: big & tall is scarce in thrift supply but has dedicated buyers who filter by **Size Type: Big & Tall** and sizes 2XL–6XL, XLT–3XLT. eBay carries ~110k listings in 2XL and ~77k in 3XL in the men's B&T shirt node alone, with dedicated brand nodes ([eBay Big & Tall browse](https://www.ebay.com/b/Big-Tall-Clothing-for-Men/1059/bn_4116887)).
- Strong resale brands in B&T: **Polo Ralph Lauren, Carhartt, Tommy Bahama, Eddie Bauer, L.L. Bean, Pro Club, KingSize, Duluth Trading, Pendleton, adidas/Nike athletic**; in vintage specifically: **Levi's/denim, band & concert tees (70s–90s), workwear (Carhartt/Dickies), varsity/leather jackets, flannels, western wear, USA-made anything** ([eBay B&T shirts browse](https://www.ebay.com/b/Big-Tall-Shirts-for-Men/185100/bn_115062909), [TopBubbleIndex](https://www.topbubbleindex.com/blog/ebay-vintage-clothing/)).
- Caveat: true vintage (pre-1990s) in big sizes is rare because sizing ran smaller historically — which is exactly why it commands premiums. Always list garment **measurements**, since a vintage "XL" often measures like a modern L.

---

## 8. Cross-Listing on Multiple Marketplaces

- **Allowed:** neither eBay, Poshmark, nor Mercari prohibits listing the same item on multiple marketplaces simultaneously. eBay's duplicate-listing policy governs only duplicates **within eBay** ([Duplicate listings policy, id=4255](https://www.ebay.com/help/policies/listing-policies/duplicate-listings-policy?id=4255); [Voolist cross-listing guide](https://www.voolist.com/blog/how-to-cross-list-2026)).
- **The risk is overselling:** the item sells on platform A, then sells on eBay before you delist. Canceling an eBay order as "out of stock" is a **transaction defect**. With eBay's tight thresholds (0.5% for Top Rated, 2% for Above Standard), a handful of oversell cancellations can drop a small seller a full level — costing the 10% TRP discount, adding the 6% Below Standard surcharge at worst, and tanking search visibility ([Voolist overselling guide](https://www.voolist.com/blog/how-to-avoid-overselling), [CLOSO crosslisting survival guide](https://closo.co/blogs/crosslisting/what-tools-help-resellers-avoid-getting-suspended-for-duplicate-listings-or-policy-violations-when-crossposting-a-survival-guide)).
- **Upside:** resellers cross-listing on 3+ platforms report materially higher sell-through (one industry figure: ~180% higher), and fee arbitrage exists (Poshmark 20%, eBay ~13%, Mercari ~10%) ([secnd cross-listing guide](https://www.secnd.ca/blog/how-to-cross-list-multiple-platforms)).
- **Mitigations the software should build in** (this is a core feature justification for Burley's Closet's custom system):
  1. Single source-of-truth inventory state (Available / Listed / Sold / Shipped) with a **sold-anywhere → delist-everywhere** trigger, ideally webhook/API-driven (eBay Sell APIs support ending listings programmatically).
  2. If manual, enforce a "check all platforms within minutes of any sale notification" workflow ([Voolist](https://www.voolist.com/blog/how-to-avoid-overselling)).
  3. Optionally add a small delist-latency buffer (e.g., mark eBay listing quantity 0 before confirming the other sale).
  4. Log every cancellation with reason code to reconcile against eBay's defect report.
  - Existing tools in this space (Vendoo, Crosslist, List Perfectly) auto-delist on eBay/Poshmark/Mercari/Depop — useful as feature benchmarks ([Vendoo](https://www.vendoo.co/), [Crosslist](https://crosslist.com/)).

---

## Quick-Reference: System Design Checklist

| Pipeline stage | eBay constraint to encode |
|---|---|
| **Intake** | Block used underwear/socks; capture brand, size + size type (Big & Tall), standard eBay size value, measurements (chest/sleeve/waist/inseam), fabric, decade, condition tier (6 values), weight/dims, flaw photos, "properly cleaned" flag |
| **Listing** | Fixed price GTC + Best Offer (with floor for auto-decline); ≥1 photo ≥500px (target 1600px, no watermarks, max 24); 80-char title builder (Brand+Type+Size+Era); required item specifics validation; correct vintage category node; one eBay listing per unique garment |
| **Pricing/Promo** | Fee calculator: 13.25%/12.35% + $0.30–0.40 per order on item+shipping+tax; optional 2–3% promoted ad rate; 14-day price stability tracker for markdown events |
| **Sale** | Sold-anywhere → delist-everywhere; never cancel as out-of-stock |
| **Shipping** | Handling-time countdown (target 1-day for TRP); buy label via eBay (auto tracking); calculated shipping for heavy items; EIS enabled for international |
| **Post-sale** | Return-request SLA timers (3 business days respond, 2 business days refund after return delivery); defect-rate dashboard against 0.5%/2% thresholds; monthly eval on the 20th |

---

## Sources

**Official eBay (help/policy pages):**
- Seller performance overview — https://www.ebay.com/help/selling/seller-levels-performance-standards/seller-levels-performance-standards?id=4080
- Seller standards policy — https://www.ebay.com/help/policies/selling-policies/seller-standards-policy?id=4347
- Top Rated Seller Program — https://www.ebay.com/sellercenter/protections/top-rated-program
- Used clothing policy — https://www.ebay.com/help/policies/prohibited-restricted-items/used-clothing-policy?id=4281
- Counterfeit policy — https://www.ebay.com/help/policies/prohibited-restricted-items/counterfeit-item-policy?id=4276
- Authenticity Guarantee (sneakers / streetwear) — https://www.ebay.com/authenticity-guarantee/sneakers ; https://www.ebay.com/authenticity-guarantee/streetwear
- Selling fees — https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822
- Final value fee changes (Jan 2025 Seller Update, effective Feb 14, 2025) — https://www.ebay.com/sellercenter/resources/seller-updates/2025-january/final-value-fee
- New item conditions for pre-loved clothing (Jan 2025 Seller Update) — https://www.ebay.com/sellercenter/resources/seller-updates/2025-january/new-item-conditions ; https://community.ebay.com/t5/Seller-Update-January-2025/Introducing-new-conditions-for-pre-loved-clothing/td-p/34908723
- Item specifics requirements — https://www.ebay.com/sellercenter/listings/item-specifics-requirements
- Adding pictures to listings — https://www.ebay.com/help/selling/listings/adding-pictures-listings?id=4148 ; photo tips — https://www.ebay.com/sellercenter/listings/photo-tips
- eBay Stores overview / subscriptions — https://www.ebay.com/help/selling/ebay-stores/ebay-stores?id=4071 ; https://www.ebay.com/sellercenter/payments-and-fees/subscriptions-and-fees
- Promoted Listings overview / General / Priority — https://www.ebay.com/help/selling/listings/promoted-listings-overview?id=5295 ; https://www.ebay.com/help/selling/ebay-advertising/promoted-listings/general-campaign-strategy?id=4164 ; https://www.ebay.com/help/selling/ebay-advertising/promoted-listings/priority-campaign-strategy?id=5299
- Getting paid / payouts — https://www.ebay.com/help/selling/getting-paid/payouts-work-managed-payments-sellers?id=4814 ; https://www.ebay.com/sellercenter/payments-and-fees/payments-and-earnings
- Listing durations — https://www.ebay.com/help/selling/listings/selecting-listing-duration?id=4652 ; Relisting — https://www.ebay.com/help/selling/listings/creating-managing-listings/relisting-items?id=4147
- Best Offer — https://www.ebay.com/help/selling/listings/selling-buy-now/adding-best-offer-listing?id=4144
- Duplicate listings policy — https://www.ebay.com/help/policies/listing-policies/duplicate-listings-policy?id=4255
- Discounts Manager / sale events — https://www.ebay.com/help/selling/selling-tools/promotions-manager?id=4094 ; https://www.ebay.com/sellercenter/growth/seller-hub-discounts/sale-events
- How returns work — https://export.ebay.com/en/seller-performance/transactions/how-returns-work/
- Shipping discounts / FAQs — https://www.ebay.com/help/selling/shipping-items/shipping-rates/shipping-discounts?id=4168 ; https://www.ebay.com/sellercenter/shipping/faqs
- eBay International Shipping — https://www.ebay.com/help/selling/shipping-items/setting-shipping-options/ebay-international-shipping-program?id=5348 ; https://www.ebay.com/sellercenter/shipping/ebay-international-shipping
- Optimizing for Best Match — https://www.ebay.com/help/selling/listings/listing-tips/optimising-listings-best-match?id=4166
- 1099-K FAQs — https://www.ebay.com/sellercenter/resources/changes-to-ebay-and-your-1099-k ; https://www.ebay.com/help/selling/fees-credits-invoices/ebay-form-1099k?id=4794
- Men's Vintage Clothing category — https://www.ebay.com/b/Mens-Vintage-Clothing/182044/bn_2309544 ; Big & Tall — https://www.ebay.com/b/Big-Tall-Clothing-for-Men/1059/bn_4116887
- eBay Developers (condition IDs) — https://developer.ebay.com/api-docs/sell/inventory/types/slr:ConditionEnum

**Secondary/industry sources:**
- FlowLister FVF guide — https://flowlister.com/blog/ebay-final-value-fees-explained/ ; Taxomate fee guide — https://taxomate.com/blog/ebay-seller-fees
- eDesk store subscription analysis — https://www.edesk.com/blog/ebay-store-subscription-worth-it/ ; ZIK Analytics store levels — https://www.zikanalytics.com/blog/ebay-store-levels/ ; ListingForge — https://www.listing-forge.com/blog/ebay-store-subscription
- MyListerHub on Jan 2026 Promoted Listings attribution change — https://www.mylisterhub.com/articles/ebay-promoted-listings-change ; Underpriced PL ROI guide — https://www.underpriced.app/blog/ebay-promoted-listings-roi-guide-2026
- Value Added Resource on 2025 condition changes — https://www.valueaddedresource.net/ebay-pre-loved-fashion-conditions-2025-updates/ ; List Perfectly on 2026 size enforcement — https://listperfectly.com/selling/ebay-fashion-size-rules-resellers-2026/
- ZIK Analytics returns guide — https://www.zikanalytics.com/blog/ebay-return-policy/ ; Auction Nudge TRS guide — https://www.auctionnudge.com/guides/understanding-ebay-top-rated-seller-status-top-rated-plus-listings/
- TopBubbleIndex vintage clothing guide — https://www.topbubbleindex.com/blog/ebay-vintage-clothing/ ; nifty.ai vintage guide — https://nifty.ai/post/how-sell-vintage-items ; Duct Tape and Denim (vintage definition) — https://ducttapeanddenim.com/what-does-vintage-mean/
- 3Dsellers title optimization — https://www.3dsellers.com/blog/ebay-title-optimization ; CLOSO keyword guide — https://closo.co/blogs/optimization-growth-strategies/best-keywords-for-your-ebay-listing-the-complete-2025-guide ; Hustle & Slow — https://www.hustleandslow.com/keywords-poshmark-ebay/
- The Tailored Co (measuring shirts) — https://www.thetailoredco.com/how-to-measure-shirts-for-ebay/
- Voolist overselling/cross-listing guides — https://www.voolist.com/blog/how-to-avoid-overselling ; https://www.voolist.com/blog/how-to-cross-list-2026 ; secnd cross-listing guide — https://www.secnd.ca/blog/how-to-cross-list-multiple-platforms ; CLOSO crosslisting survival guide — https://closo.co/blogs/crosslisting/what-tools-help-resellers-avoid-getting-suspended-for-duplicate-listings-or-policy-violations-when-crossposting-a-survival-guide
- Vendoo — https://www.vendoo.co/ ; Crosslist — https://crosslist.com/
- FlowLister business account guide — https://flowlister.com/blog/ebay-business-account/ ; MyListerHub 1099-K explainer — https://www.mylisterhub.com/articles/ebay-1099-k-explained-for-2025-thresholds-write-offs-and-what-to-do
- Retail TouchPoints (Authenticity Guarantee streetwear) — https://www.retailtouchpoints.com/topics/digital-commerce/street-legal-ebay-expands-authenticity-guarantee-to-cover-streetwear

**Note on freshness:** direct fetches of ebay.com help pages were blocked in this environment (HTTP 403), so official-page contents were corroborated via search excerpts and multiple independent secondary sources dated 2025–2026. Fee percentages, store pricing, and promoted-listings mechanics change roughly annually — re-verify against the official pages above before encoding them.
