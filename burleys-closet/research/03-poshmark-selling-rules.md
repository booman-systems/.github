# Poshmark Rules & Mechanics for Reselling — Research Report
### Focus: Men's Big & Tall Vintage Apparel | For "Burley's Closet" (Poshmark + eBay cross-listing software)
*Research date: July 8, 2026. Note: Poshmark changed significantly in late 2025–early 2026 (shipping overhaul, app redesign, automation crackdowns). Facts below reflect the newest information found.*

---

## 1. Account/Seller Requirements, Community Guidelines & Prohibited Items

**Account requirements**
- Anyone 13+ may use Poshmark; users 13–17 need parent/guardian permission, and sellers under 18 must have the parent/guardian as the legal account owner ([Terms of Service](https://poshmark.com/terms), [age requirement support article](https://support.poshmark.com/s/article/What-is-the-age-requirement-for-Poshmark?language=en_US)). Practically, an adult US-based account with a verified payout method is the norm.
- No fee to open an account or list. Poshmark also has a [Seller Verification Policy](https://poshmark.com/seller_verification_policy) (identity/tax info collection for higher-volume sellers).
- Taxes: For 2025, Poshmark issues Form 1099-K at $20,000 gross + 200 transactions (federal threshold; lower state thresholds also honored) ([Poshmark 1099-K support](https://support.poshmark.com/s/article/How-to-access-1099k?language=en_US), [Keeper Tax guide](https://www.keepertax.com/posts/poshmark-taxes)).

**What can be sold / condition rules for used clothing**
- Poshmark allows new and **pre-owned ("preloved") clothing, shoes, and accessories as long as items are clean and in good condition**, and "clearly and accurately represented" ([What can I sell on Poshmark?](https://support.poshmark.com/s/article/What-can-I-sell-on-Poshmark), [Poshmark blog: What You Can and Can't Sell](https://blog.poshmark.com/what-you-can-and-cant-sell-on-poshmark/)). Damage (stains, holes, repairs) must be disclosed and photographed — misrepresentation is the #1 trigger for returns (see §7).
- **Prohibited** ([Prohibited Items Policy](https://poshmark.com/prohibited_items_policy), [OneShop summary](https://tools.oneshop.com/blog/poshmark-prohibited-items)):
  - Counterfeits/replicas (strictly enforced; brand authenticity matters for vintage designer items)
  - **Used underwear** (used intimates — relevant exclusion for a clothing intake pipeline) and used makeup/personal-care items
  - Health/medical items, items with medical claims
  - Hazmat: aerosols, perfume, nail polish, lithium-battery products (restrictions)
  - Current airline/airport/TSA and similar active-duty uniforms (note for vintage militaria/workwear: current-issue uniforms are the problem; genuinely vintage uniform pieces are generally traded, but flag this category for manual review)
  - Items from endangered species (fur/exotic leather vintage pieces — flag real fur, python, etc. for review)
- Community behavior rules live at [Community Guidelines](https://poshmark.com/community_guidelines) — includes the "Automated Participation" clause (§6 below), no transaction off-platform, no spam.

**Software implication:** Intake module should have a prohibited-category checklist (used underwear, fur/exotic, current uniforms, counterfeits) and a required "condition disclosure" field with flaw photos.

## 2. Listing Requirements

Official sources: [How Do I List an Item? (Posh Guide)](https://poshmark.com/posh_guide/how_to_list_item), [Steps to a Perfect Listing](https://blog.poshmark.com/steps-to-a-perfect-listing/), [Listing Photography Guide](https://blog.poshmark.com/2020/01/16/the-poshmark-listing-photography-guide/), [listing video support article](https://support.poshmark.com/s/article/listing-video?language=en_US).

- **Photos: up to 16 photos + 1 video per listing.** The first photo is the **Covershot** — Poshmark recommends a clean, product-focused shot on white/simple background. Detail photos should include: brand/size tag, fabric tag, measurements/scale, and **all flaws** (rips, stains, wear).
- **MAJOR 2025–2026 change — portrait photos:** Poshmark's app redesign moved listing photos from square (1:1) to **portrait 3:4 aspect ratio** across the platform, with an auto-generated background-removed duplicate of the covershot ("hero shot"). Rollout was messy (app vs. web cropped differently) and seller backlash was significant ([Value Added Resource](https://www.valueaddedresource.net/poshmark-photo-aspect-ratio-item-condition-updates/), [Poshmark blog: Your Guide to Portrait Photos, Mar 2026](https://blog.poshmark.com/2026/03/25/your-guide-to-portrait-photos/)). **Your software should shoot/store photos so they crop safely to both 1:1 (eBay) and 3:4 (Poshmark).**
- **Required fields:** title, description, **category** (Dept > Category > Subcategory, e.g., Men > Shirts > Casual Button Down), **size**, **brand**, original/listing price, **color**, and now an expanded **item condition selector** (rolled out late 2025/2026 — moving beyond just the NWT checkbox, similar to eBay's condition tiers) ([Value Added Resource](https://www.valueaddedresource.net/poshmark-photo-aspect-ratio-item-condition-updates/)).
- **NWT** = New With Tags: only if 100% unworn with original retail tags physically attached; photograph the tag. There's no official NWOT checkbox — NWOT goes in title/description ([Vendoo NWT guide](https://blog.vendoo.co/nwt-meaning), [Sidekick](https://poshsidekick.com/what-is-nwt-on-poshmark/)).
- **Title conventions:** lead with brand + item type + key attributes/keywords (e.g., "Vintage 90s Carhartt Detroit Jacket Men's 3XLT Duck Canvas"). Titles are the main search surface; Poshmark titles max ~80 characters (same ballpark as eBay's 80 — convenient for cross-listing).
- **Sizes for men's big & tall:** Poshmark's men's size picker includes big & tall designations (e.g., **2XB/3XB/4XB, LT/XLT/2XLT/3XLT**, numeric sizes like 56L for suits), and there are dedicated browse pages for [men's big & tall](https://poshmark.com/brand/Big%20and%20Tall-Men) and style tags like [Tall](https://poshmark.com/style-tag/Tall) and [Men's big And tall](https://poshmark.com/style-tag/Men's%20big%20And%20tall). Also supports "Custom Size." For vintage (where tagged size ≠ modern size), list the tagged size but put **actual measurements (pit-to-pit, length, sleeve)** in description — standard practice for vintage.
- **Posh Stories:** still live — 48-hour ephemeral shoppable photo/video posts attached to your profile ([Posh Stories guide](https://blog.poshmark.com/posh-stories-the-ultimate-guide-to-using-stories-on-poshmark/)). Low priority for automation.
- **Videos:** 1 per listing; also **Posh Shows** (livestream selling) is now a major channel ([Posh Shows guide](https://blog.poshmark.com/your-guide-to-posh-shows-pre-show/)).
- **2025 PoshFest additions:** AI **price suggestions** at listing time (a "sells fast / hot deal" price and a "patient" price, with hot-deal badging) ([Value Added Resource PoshFest 2025 recap](https://www.valueaddedresource.net/poshmark-poshfest-2025-hackathon/)).

## 3. Fees & Payments (current as of 2025–2026)

Official page: [What are the fees for selling on Poshmark?](https://support.poshmark.com/s/article/297755057?language=en_US)

- **Sales under $15: flat $2.95 commission.**
- **Sales $15 and over: 20% commission (seller keeps 80%).**
- **No listing fees, no monthly fees, no separate payment-processing fees.** Fee applies to item price only, not the buyer's shipping payment ([Voolist 2026 breakdown](https://www.voolist.com/blog/poshmark-fees-2026), [Crosslist fee guide](https://crosslist.com/blog/poshmark-selling-fees)).
- **History note:** In Oct 2024 Poshmark tried a lower-commission + buyer-fee model, then **reverted to the classic $2.95/20% structure effective Oct 24, 2024** after backlash, removing the Buyer Protection Fee ([Voolist](https://www.voolist.com/blog/poshmark-fees-2026), [nifty.ai](https://nifty.ai/post/how-much-poshmark-take)). No further fee-structure change found as of July 2026.
- **Payouts** ([Posh Guide: How Do I Get Paid?](https://poshmark.com/posh_guide/how_to_get_paid), [redemption options](https://support.poshmark.com/s/article/redemption-options?language=en_US)): funds become redeemable after buyer acceptance (or auto-accept 72h after delivery). Methods: **Direct deposit (free, 2–3 business days), Instant Transfer to debit card ($2, ~30 min), PayPal ($0.35), Venmo ($0.35), mailed check**.

**Fee comparison note for pricing engine:** Poshmark's 20% vs. eBay's ~13–15% (category FVF + processing) means net-parity pricing requires listing ~6–8% higher on Poshmark, partially offset by Poshmark's buyer-paid shipping ([Vendoo Poshmark vs eBay](https://blog.vendoo.co/selling-on-poshmark-vs-ebay-which-is-better)).

## 4. Shipping Model — **changed September 2025, critical for Big & Tall**

- **As of September 12, 2025, Poshmark switched from USPS Priority Mail ($8.27 buyer-paid) to USPS Ground Advantage at a flat $6.49 buyer-paid**, for all orders up to 5 lb, delivery 2–5 business days ([Poshmark blog: Lower shipping starting September 12th](https://blog.poshmark.com/2025/09/08/lower-shipping-starting-september-12th/), [Value Added Resource](https://www.valueaddedresource.net/poshmark-usps-ground-advantage-shipping-update/)).
- **Packaging change:** USPS **Priority Mail branded boxes can no longer be used** (USPS may refuse/return them; using Priority packaging can incur a ~$5 fee). Use plain boxes, polymailers, or free Ground Advantage packaging ([Shippy Tape summary](https://www.shippytape.com/blogs/journal/poshmark-shipping-changes-ground-advantage), [Poshmark box rules](https://support.poshmark.com/s/article/160939138?language=en_US)).
- **Weight limit & upgrades — the big & tall pain point:** label covers **5 lb including packaging**. Heavier orders require a seller-paid label upgrade, deducted from earnings: reported at **+$5 for 5–10 lb and +$10 for 10–15 lb** under the new rate card ([Value Added Resource: heavier item rates](https://www.valueaddedresource.net/poshmark-new-shipping-rates-heavier-items/), [atoship 2026 guide](https://atoship.com/blog/how-to-ship-on-poshmark-2026)). Upgrade flow: Account > Sales > order > "Purchase Heavier Weight Label."
  - **Implication:** A 3XL–6XL vintage parka, leather jacket, or bundle of jeans easily exceeds 5 lb packed. Your intake flow should **capture item weight** and your pricing engine should bake the expected upgrade cost into Poshmark prices (eBay lets you charge calculated shipping instead).
- **Who pays:** buyer pays the $6.49 by default; **seller pays** any weight upgrade and any shipping discount offered. Sellers can offer discounted ($4.99, etc.) or free shipping on offers/closet-wide promos, with the difference deducted from earnings ([listing shipping discount article](https://support.poshmark.com/s/article/listing-shipping-discount?language=en_US)).
- Label arrives by email/app as prepaid PDF; no per-order postage purchase. Bundles ship on one label (§5).

## 5. Selling Mechanics Unique to Poshmark

- **Sharing:** the core visibility mechanic — self-sharing your listings bumps them in search/feed and party feeds; sharing others' listings builds reciprocity and followers ([Posh Guide](https://poshmark.com/posh_guide), [PosherVA: Why Sharing Still Matters](https://help.posherva.com/en-us/article/why-sharing-still-matters-on-poshmark-update-1knnsoy/)). Power sellers share their whole closet ~3x/day. **Late 2025 turbulence:** Poshmark **removed the in-app Bulk Sharing tool in Nov 2025 without announcement, then reinstated it after intense seller backlash** ([VAR: Kills Bulk Sharing](https://www.valueaddedresource.net/poshmark-kills-bulk-sharing-in-app/), [VAR: Bulk Sharing Comeback](https://www.valueaddedresource.net/poshmark-bulk-sharing-comeback/)) — a signal that Poshmark is de-emphasizing the share treadmill.
- **Share limits / "share jail":** unofficial cap around 10,000 shares/24h; community tools recommend staying ≤5,000–8,000. Exceeding triggers CAPTCHAs and temporary sharing blocks (1–24h) ([Vendoo share jail](https://blog.vendoo.co/poshmark-share-jail), [Reseller Tools](https://resellertools.zendesk.com/hc/en-us/articles/4407152817421-What-are-sharing-limits)).
- **Parties:** themed sharing events several times daily ([poshmark.com/parties](https://poshmark.com/parties)); in June 2024 Poshmark added **Posh Party LIVE** merging parties with livestream Posh Shows ([Poshmark PR](https://www.prnewswire.com/news-releases/poshmark-launches-posh-party-live-a-new-virtual-shopping-experience-fueled-by-the-power-of-curation-and-community-302171321.html)).
- **Followers:** follower count amplifies share reach; follow/re-follow is a common growth tactic (and a common bot target — see §6).
- **Offers / Offer to Likers (OTL):** buyers can "Make an Offer" on any listing ([Make an Offer support](https://support.poshmark.com/s/article/959994199?language=en_US)); sellers can send private offers to everyone who liked a listing. **OTL rules:** price must be **≥10% below** listing price (and at least 10% below the lowest offer that liker received in the last 90 days); offers expire in 24h; OTL is designed to include a **seller-paid shipping discount** (recent support docs suggest the shipping discount became optional in some flows — verify in-app; historically it was mandatory) ([What is Offer to Likers?](https://support.poshmark.com/s/article/831745541?language=en_US), [How to send an offer to likers](https://support.poshmark.com/s/article/759242802?language=en_US)). **2025 update:** minimum buyer offers now floor at 40% of list price, and "Smart Sell" auto-negotiation extends to OTL ([VAR PoshFest 2025](https://www.valueaddedresource.net/poshmark-poshfest-2025-hackathon/)).
- **Price drops:** public price drops of ≥10% notify likers with a temporary discounted-shipping promo ([Price Drop Policy](https://poshmark.com/price_drop_policy)).
- **Bundles:** buyers combine multiple items from one closet into one order, one shipping charge, one label; sellers set automatic bundle discounts (e.g., 15% off 3+) and can send **private bundle offers** ([What is a Posh Bundle?](https://support.poshmark.com/s/article/124959465?language=en_US), [Posh Guide: How Do I Bundle?](https://poshmark.com/posh_guide/how_to_bundle)). Big & tall buyers are repeat buyers — bundle discounts matter here.
- **Relisting — CAUTION:** delete-and-relist to refresh stale listings is a widespread community practice, but in **May 2025 Poshmark began enforcing an "excessive listing removal" policy — warning, then suspending accounts (many using cross-listing tools like Vendoo) for high-volume delete/relist activity**, sometimes with ~1 minute of warning ([Modern Retail](https://www.modernretail.co/technology/i-followed-their-rules-and-was-hit-anyway-poshmark-sellers-voice-frustrations-with-new-excessive-listing-policy/)). Poshmark later shipped an official **"Inactive Listings" tool** as a sanctioned refresh path ([VAR](https://www.valueaddedresource.net/poshmark-inactive-listings-tool/)). **Your software must rate-limit or avoid bulk delete/relist on Poshmark.**

## 6. Automation, Bots & APIs — the compliance core for your project

- **ToS position:** Poshmark's [Community Guidelines](https://poshmark.com/community_guidelines) "Automated Participation" section: *"Do not use programs or other forms of automation to participate on Poshmark. This includes, but is not limited to liking, sharing, following, and unfollowing."* The [Terms of Service](https://poshmark.com/terms) (§9 restrictions) prohibit unauthorized programs/scrapers/bots. Violations risk suspension or permanent ban ([Vendoo on bots](https://blog.vendoo.co/poshmark-bots-what-you-need-to-know-about-using-bots), [Closet Assistant](https://closetassistantpm.com/will-poshmark-ban-or-suspend-my-account-for-using-a-bot/)).
- **No official public API — confirmed current as of 2026.** Unlike eBay (full public Sell APIs), Poshmark offers **no public listing/developer API**. Only paths: private/enterprise integrations (e.g., via DSCO for wholesale), unofficial scraper "APIs" on RapidAPI/Apify (ToS-violating, read-only), or browser automation ([apitracker.io/poshmark](https://apitracker.io/a/poshmark), [Apify Poshmark API idea page](https://apify.com/ideas/poshmark-api-ccee49fc), [SellerChamp docs noting no Poshmark API](https://kb.sellerchamp.com/en/articles/9395162-sellerchamp-and-poshmark-integration-a-comprehensive-guide)).
- **How commercial cross-listers work:** Vendoo, List Perfectly, Crosslist, PrimeLister all use **browser-extension form-filling** — they store your inventory, then programmatically fill Poshmark's own listing form in your logged-in browser session (no API). Delist/relist and auto-delist-on-sale work the same way ([Vendoo Chrome extension](https://chromewebstore.google.com/detail/vendoo-crosslist-extensio/mnampbajndaipakjhcbbaihllmghlcdf), [Crosslist comparison](https://crosslist.com/blog/vendoo-vs-list-perfectly)). This is technically ToS-gray: Poshmark tolerates listing-assistance tools in practice but has never authorized them.
- **Enforcement history:**
  - Ongoing: CAPTCHAs + "share jail" throttling for high-velocity sharing (§5).
  - **May 2025:** suspensions for "excessive listing removal" hitting cross-lister users ([Modern Retail](https://www.modernretail.co/technology/i-followed-their-rules-and-was-hit-anyway-poshmark-sellers-voice-frustrations-with-new-excessive-listing-policy/)).
  - **Nov 2025:** reports of hundreds of accounts using third-party tools suspended with listings deleted; bulk-share removal in the same period; policy environment described as "more volatile than pre-2025" ([Flipsail 2026 bot guide](https://www.flipsail.io/blog/poshmark-bot-guide-2026), [CLOSO](https://closo.co/blogs/casestudies/auto-posher-2026-the-truth-about-bots-bans-and-the-nifty-rebrand)).
  - **Jan 2026:** Poshmark responded to backlash pledging "greater transparency" and new seller tools ([VAR](https://www.valueaddedresource.net/poshmark-updates-january-2026/)).
- **Risk model for Burley's Closet:** eBay side can be fully API-automated (safe). Poshmark side: listing-form assistance (human-in-the-loop, human-speed, via extension) is the industry-standard tolerated approach; **avoid** automated liking/following/sharing at bot velocity, bulk delete-relist, and headless/server-side automation of a live account. Keep Poshmark actions rate-limited, randomized, and attended.

## 7. Order Flow (Post-Sale)

Sources: [Posh Protect / returns support](https://support.poshmark.com/s/article/file-a-return-US?language=en_US), [delayed order cancellation](https://support.poshmark.com/s/article/520204343?language=en_US), [payment release](https://support.poshmark.com/s/article/773838096), [Sidekick return policy guide](https://poshsidekick.com/poshmark-return-policy/).

1. **Sale** → Poshmark emails prepaid label immediately; payment already captured from buyer.
2. **Ship:** target within 2 days; hard rules: **if unshipped after 7 full days, buyer may cancel on day 8; Poshmark auto-cancels unshipped orders at 21 days** ([support](https://support.poshmark.com/s/article/688293607?language=en_US), [Crosslist guide](https://crosslist.com/blog/how-to-cancel-a-poshmark-order)).
3. **Delivery → 3-day acceptance window:** buyer has 72 hours from delivery to accept or open a case; **no action = automatic acceptance and funds release**.
4. **Returns:** only for **"Item Not as Described"** (misrepresented condition, wrong item, undisclosed damage, authenticity) filed within 3 days of delivery. **No returns for fit, style, or buyer's remorse.** Seller has 24h to respond (accept return / offer partial refund) before Poshmark support adjudicates ([return process timeframe](https://support.poshmark.com/s/article/Return-Timeframe?language=en_US)). Accurate flaw photos/measurements are your defense — especially for vintage.
5. **Cancellations:** buyer may cancel an accidental purchase **within 3 hours** (full-price Buy It Now only; offers are binding); seller can cancel anytime pre-ship (hurts metrics).
6. **Funds:** released to Posh balance after acceptance → redeem via methods in §3.

## 8. Vintage & Big/Tall on Poshmark — Market Notes

- **Vintage treatment:** no dedicated vintage condition or certification on Poshmark — vintage is signaled via title keyword ("Vintage," era tags like "90s"), style tags ([style-tag pages exist, e.g. Tall](https://poshmark.com/style-tag/Tall)), and description. Condition rules still apply: vintage wear must be disclosed. Poshmark's buyer protection makes accurate measurement disclosure essential since vintage sizing runs different.
- **Big & tall demand:** Poshmark has dedicated browse surfaces for [men's big & tall](https://poshmark.com/brand/Big%20and%20Tall-Men) (pants, jackets, etc.) and supports B&T sizes (2XB–4XB, LT–3XLT, 56L suits). Supply is thinner than standard sizes, which favors sellers, but…
- **Poshmark skews ~70–80% female, ages 18–35, trend/brand-driven; eBay skews older and more male.** Consensus across comparison guides: **vintage menswear and men's utilitarian/workwear sells faster and often higher on eBay; Poshmark is a complementary secondary channel** for menswear, not the primary ([Voolist eBay vs Poshmark](https://www.voolist.com/blog/ebay-vs-poshmark), [Vendoo comparison](https://blog.vendoo.co/selling-on-poshmark-vs-ebay-which-is-better), [ZIK Analytics](https://www.zikanalytics.com/blog/poshmark-vs-ebay/), [Ultimate Thrifting](https://ultimatethrifting.com/poshmark-vs-ebay-clothing/)).
- **Practical tips synthesized:** lead titles with brand + "Vintage" + B&T size token (3XLT etc.); always include pit-to-pit/length/sleeve measurements; photograph tags (brand, size, union/era tags add value); price Poshmark ~10–20% above eBay net-parity to absorb the 20% fee and OTL discounting culture; use bundles to serve repeat B&T buyers; weigh everything at intake because of the 5 lb label ceiling.

---

## Key implications for Burley's Closet (summary)

1. **eBay = API-first automation; Poshmark = human-in-the-loop browser assistance.** No Poshmark public API exists; commercial tools use extension-based form filling. Design the Poshmark connector as an attended, rate-limited flow.
2. **Do not automate** sharing/liking/following at scale or bulk delete-relist — both have caused 2025 suspension waves. Use Poshmark's official Inactive Listings tool concept for refreshes.
3. **Intake schema:** weight (5 lb label ceiling; $5/$10 upgrade tiers), measurements, tagged size + modern-equivalent size, condition tier + flaw photos, prohibited-item flags, brand authenticity flag.
4. **Photos:** store masters croppable to both 3:4 (Poshmark portrait) and 1:1/4:3 (eBay); 16-photo + 1-video ceiling on Poshmark.
5. **Pricing engine:** $2.95 flat under $15 / 20% over; leave ~20–30% negotiation headroom for OTL (min 10% drop + shipping discount) and the new 40% offer floor.
6. **Order state machine:** sold → ship ≤7d (target ≤2d) → delivered → 72h acceptance → funds redeemable → payout method; returns only via 3-day INAD claims.

## Sources

**Official Poshmark**
- Terms of Service — https://poshmark.com/terms
- Community Guidelines (automation clause) — https://poshmark.com/community_guidelines
- Prohibited Items Policy — https://poshmark.com/prohibited_items_policy
- What can I sell on Poshmark? — https://support.poshmark.com/s/article/What-can-I-sell-on-Poshmark
- Fees — https://support.poshmark.com/s/article/297755057?language=en_US
- Redemption options — https://support.poshmark.com/s/article/redemption-options?language=en_US
- How Do I Get Paid? — https://poshmark.com/posh_guide/how_to_get_paid
- How Do I List an Item? — https://poshmark.com/posh_guide/how_to_list_item
- Listing video — https://support.poshmark.com/s/article/listing-video?language=en_US
- Photography Guide — https://blog.poshmark.com/2020/01/16/the-poshmark-listing-photography-guide/
- Steps to a Perfect Listing — https://blog.poshmark.com/steps-to-a-perfect-listing/
- Lower shipping starting September 12th (2025) — https://blog.poshmark.com/2025/09/08/lower-shipping-starting-september-12th/
- Box/packaging rules — https://support.poshmark.com/s/article/160939138?language=en_US
- Offer to Likers — https://support.poshmark.com/s/article/831745541?language=en_US ; https://support.poshmark.com/s/article/759242802?language=en_US
- Make an Offer — https://support.poshmark.com/s/article/959994199?language=en_US
- Listing shipping discount — https://support.poshmark.com/s/article/listing-shipping-discount?language=en_US
- Price Drop Policy — https://poshmark.com/price_drop_policy
- Bundles — https://support.poshmark.com/s/article/124959465?language=en_US ; https://poshmark.com/posh_guide/how_to_bundle
- Returns / Posh Protect — https://support.poshmark.com/s/article/file-a-return-US?language=en_US ; https://support.poshmark.com/s/article/Return-Timeframe?language=en_US
- Delayed order cancellation — https://support.poshmark.com/s/article/520204343?language=en_US
- Payment release timing — https://support.poshmark.com/s/article/773838096
- 1099-K — https://support.poshmark.com/s/article/How-to-access-1099k?language=en_US
- Age requirement — https://support.poshmark.com/s/article/What-is-the-age-requirement-for-Poshmark?language=en_US
- Seller Verification Policy — https://poshmark.com/seller_verification_policy
- Posh Party LIVE PR — https://www.prnewswire.com/news-releases/poshmark-launches-posh-party-live-a-new-virtual-shopping-experience-fueled-by-the-power-of-curation-and-community-302171321.html
- Portrait photos guide (2026) — https://blog.poshmark.com/2026/03/25/your-guide-to-portrait-photos/
- Big & tall browse — https://poshmark.com/brand/Big%20and%20Tall-Men

**Industry/News**
- Value Added Resource: Ground Advantage switch — https://www.valueaddedresource.net/poshmark-usps-ground-advantage-shipping-update/ ; heavier-item rates — https://www.valueaddedresource.net/poshmark-new-shipping-rates-heavier-items/ ; bulk sharing removal — https://www.valueaddedresource.net/poshmark-kills-bulk-sharing-in-app/ ; bulk sharing comeback — https://www.valueaddedresource.net/poshmark-bulk-sharing-comeback/ ; PoshFest 2025 — https://www.valueaddedresource.net/poshmark-poshfest-2025-hackathon/ ; photo/condition updates — https://www.valueaddedresource.net/poshmark-photo-aspect-ratio-item-condition-updates/ ; Jan 2026 response — https://www.valueaddedresource.net/poshmark-updates-january-2026/ ; inactive listings tool — https://www.valueaddedresource.net/poshmark-inactive-listings-tool/
- Modern Retail: excessive listing policy suspensions — https://www.modernretail.co/technology/i-followed-their-rules-and-was-hit-anyway-poshmark-sellers-voice-frustrations-with-new-excessive-listing-policy/

**Tooling/Guides (third-party)**
- Voolist fees 2026 — https://www.voolist.com/blog/poshmark-fees-2026 ; Crosslist fees — https://crosslist.com/blog/poshmark-selling-fees ; nifty.ai fees — https://nifty.ai/post/how-much-poshmark-take
- atoship shipping 2026 — https://atoship.com/blog/how-to-ship-on-poshmark-2026 ; Shippy Tape packaging — https://www.shippytape.com/blogs/journal/poshmark-shipping-changes-ground-advantage
- API status: https://apitracker.io/a/poshmark ; https://apify.com/ideas/poshmark-api-ccee49fc ; https://kb.sellerchamp.com/en/articles/9395162-sellerchamp-and-poshmark-integration-a-comprehensive-guide
- Bots/enforcement: https://blog.vendoo.co/poshmark-bots-what-you-need-to-know-about-using-bots ; https://www.flipsail.io/blog/poshmark-bot-guide-2026 ; https://closetassistantpm.com/will-poshmark-ban-or-suspend-my-account-for-using-a-bot/ ; share jail — https://blog.vendoo.co/poshmark-share-jail ; https://resellertools.zendesk.com/hc/en-us/articles/4407152817421-What-are-sharing-limits
- Cross-listers: https://www.vendoo.co/ ; https://chromewebstore.google.com/detail/vendoo-crosslist-extensio/mnampbajndaipakjhcbbaihllmghlcdf ; https://crosslist.com/blog/vendoo-vs-list-perfectly
- Market comparisons: https://www.voolist.com/blog/ebay-vs-poshmark ; https://blog.vendoo.co/selling-on-poshmark-vs-ebay-which-is-better ; https://www.zikanalytics.com/blog/poshmark-vs-ebay/ ; https://ultimatethrifting.com/poshmark-vs-ebay-clothing/
- NWT: https://blog.vendoo.co/nwt-meaning ; https://poshsidekick.com/what-is-nwt-on-poshmark/ ; returns guide — https://poshsidekick.com/poshmark-return-policy/ ; cancellations — https://crosslist.com/blog/how-to-cancel-a-poshmark-order ; taxes — https://www.keepertax.com/posts/poshmark-taxes

*Caveat: poshmark.com/support pages blocked direct fetching, so some exact figures (e.g., $5/$10 label-upgrade tiers, OTL shipping-discount optionality) are corroborated via multiple secondary sources rather than the primary page text; verify in-app before hard-coding into fee/shipping calculators. Poshmark is changing rapidly (app redesign, condition fields, portrait photos rolling out through 2026) — recheck quarterly.*
