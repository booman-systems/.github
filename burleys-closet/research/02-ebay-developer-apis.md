# eBay Developer Platform Research for "Burley's Closet" Reseller Software

Research date: July 8, 2026. Focus: building custom intake → listing → sale → shipping software for a vintage men's big & tall clothing reseller that lists programmatically on eBay (US marketplace, `EBAY_US`).

---

## 1. eBay Developers Program: Registration, Keysets, Sandbox, Compliance

### Registration
- Membership in the eBay Developers Program is **free** and is required to make any eBay API calls, use the Sandbox, and access support. You register at developer.ebay.com (user icon → Register), accept the eBay API License Agreement, and register an application by giving it an Application Title. ([KB 456](https://developer.ebay.com/support/kb-article?KBid=456))
- A standard account gets **one application keyset per environment**; additional keysets require a special request. ([KB 1359](https://developer.ebay.com/support/kb-article?KBid=1359))

### Keysets: Sandbox vs Production
- Each application gets separate **Sandbox** and **Production** keysets, each consisting of an **App ID (Client ID), Dev ID, and Cert ID (Client Secret)**. You create each keyset from the developer portal ("Create a keyset"). ([Create the eBay API keysets](https://developer.ebay.com/api-docs/static/gs_create-the-ebay-api-keysets.html), [Understand application keysets](https://developer.ebay.com/api-docs/static/gs_understand-application-keysets.html))
- The **Sandbox** (`api.sandbox.ebay.com`) is a self-contained virtual environment mirroring production: mock listings, test users, and transactions with no real money or live listings. You create sandbox test users in the portal and should fully test listing/order flows there before going live. Caveat: the sandbox is known to be flaky in places (search doesn't work well, some category metadata is stale), so plan a small controlled production test too. ([Sandbox](https://developer.ebay.com/develop/tools/sandbox))

### Compliance: Marketplace Account Deletion Notifications (mandatory)
This is the biggest "gotcha" for new developers:

- **Every developer must either subscribe to, or formally opt out of, eBay Marketplace Account Deletion/Closure notifications before making their first production API call.** Non-compliance leads to reduced or terminated API access. ([Marketplace Account Deletion workflow](https://developer.ebay.com/marketplace-account-deletion), [Guide](https://developer.ebay.com/develop/guides-v2/marketplace-user-account-deletion))
- Setup (in the developer portal's **Alerts & Notifications** page): provide an alert email, an HTTPS **endpoint URL**, and a **verification token (32–80 chars, alphanumeric/underscore/hyphen)**.
- Your endpoint must support **GET and POST**: eBay sends a GET with a `challenge_code`; you must respond with `SHA-256(challengeCode + verificationToken + endpointURL)` as a JSON `challengeResponse`. POSTed deletion notifications must be acknowledged with **200/201/202/204**.
- Unacknowledged notifications are retried; after 24 hours of failures the endpoint is marked down, and you have **30 days** to fix it before being marked non-compliant.
- On receiving a deletion notice, you're obligated to delete that eBay user's personal data from your systems.
- Practical note for a single-seller tool: since your app only manages *your own* account, you can likely **opt out** (the portal asks you to attest you don't persist other eBay users' data) — but if your software stores buyer data (names/addresses from orders), subscribing and handling it is the safer, compliant route. eBay's own listener SDKs (Node.js/Java/.NET) implement the challenge/verification logic. ([event-notification-nodejs-sdk](https://github.com/eBay/event-notification-nodejs-sdk))

### Application Growth Check
- Default call limits are for individuals/small businesses. To raise limits, you submit an **Application Growth Check** — a free compliance review verifying your app follows eBay policies and the API License Agreement (proper OAuth use, efficient call patterns, notification compliance). ([API Call Limits](https://developer.ebay.com/develop/get-started/api-call-limits), [KB 456](https://developer.ebay.com/support/kb-article?KBid=456))
- For a single-seller reseller app, default limits are almost certainly sufficient (see §8).

---

## 2. Authentication: OAuth 2.0

eBay REST APIs use OAuth 2.0 with two grant types ([Using OAuth to access eBay APIs](https://developer.ebay.com/api-docs/static/oauth-scopes.html), [Quick OAuth Guide KB 5075](https://developer.ebay.com/support/kb-article?KBid=5075)):

| Flow | Token type | Use for | Lifetime |
|---|---|---|---|
| **Client credentials grant** | Application access token | Public/app-level data: Taxonomy API, Metadata API (mostly), Browse | ~2 hours (7,200 s); re-mint as needed |
| **Authorization code grant** | User access token + refresh token | Everything acting on the seller's account: Inventory, Fulfillment, Account, Finances, Marketing, Media | Access token: **2 hours (7,200 s)**; Refresh token: **18 months (47,304,000 s)** |

Key facts:
- In the auth-code flow, the seller consents once via eBay's sign-in page (your configured RuName/redirect URL), you exchange the code for an access + refresh token, then silently mint new 2-hour access tokens from the refresh token until it expires at ~18 months, at which point the seller must re-consent. ([Exchanging the authorization code](https://developer.ebay.com/api-docs/static/oauth-auth-code-grant-request.html), [Refresh token request](https://developer.ebay.com/api-docs/static/oauth-refresh-token-request.html), [OAuth best practices](https://developer.ebay.com/api-docs/static/oauth-best-practices.html))
- **Scopes**: request all scopes you'll ever need at consent time (space-separated, URL-encoded). Refresh-token minting can only use scopes granted originally. For your build, request at minimum:
  - `https://api.ebay.com/oauth/api_scope` (base)
  - `.../sell.inventory` — create/manage inventory, offers, listings
  - `.../sell.account` — business policies, seller programs
  - `.../sell.fulfillment` — orders and shipping fulfillments
  - `.../sell.finances` — payouts/transactions
  - `.../sell.marketing` — Promoted Listings (optional)
  - `.../commerce.notification.subscription` — Notification API subscriptions (optional)
  - ([Scope list reference](https://apitut.com/ebay/api/scopelist.html), [oauth-scopes](https://developer.ebay.com/api-docs/static/oauth-scopes.html))
- Since it's your own account, you only run the consent flow once for yourself; store the refresh token securely and build automatic access-token refresh into your API client. eBay publishes OAuth client libraries ([Python](https://github.com/eBay/ebay-oauth-python-client), [Java](https://github.com/eBay/ebay-oauth-java-client)).
- Note: the legacy Trading API also accepts OAuth user tokens now (via the `X-EBAY-API-IAF-TOKEN` header), so one token system covers both REST and any legacy calls.

---

## 3. The Modern Sell API Suite

All REST, JSON, hosted under `https://api.ebay.com/sell/...` and `https://api.ebay.com/commerce/...`. ([How to develop a selling application](https://developer.ebay.com/api-docs/sell/static/dev-app.html))

### Inventory API (`sell/inventory/v1`) — listing engine
([Overview](https://developer.ebay.com/api-docs/sell/inventory/static/overview.html))
- **Model**: you create SKU-keyed **inventory items** (`createOrReplaceInventoryItem` — title, description, aspects/item specifics, condition, images, package weight & dimensions, quantity), then an **offer** per marketplace (`createOffer` — price, category ID, listing policies, merchant location), then **`publishOffer`** to make it live. The published listing gets a normal eBay listing ID.
- **Prerequisites**: you must create at least one **merchant location** (`createInventoryLocation`) and have **business policies** set up (Account API) and be opted in to `SELLING_POLICY_MANAGEMENT`.
- **Variations**: handled via **inventory item groups** (e.g., same shirt in 2XL/3XL/4XL) with `createOrReplaceInventoryItemGroup` + `publishOfferByInventoryItemGroup`. For one-of-a-kind vintage pieces you mostly won't need this — each garment is its own SKU.
- **Bulk methods**: `bulkCreateOrReplaceInventoryItem`, `bulkUpdatePriceQuantity`, etc. — max **25 items per batch call**.
- Aspects (Brand, Size, Color, etc.) go in `product.aspects` and must satisfy the category's required aspects (see Taxonomy API).

### Fulfillment API (`sell/fulfillment/v1`) — orders & shipping
([Overview](https://developer.ebay.com/api-docs/sell/fulfillment/overview.html))
- `getOrders` — search orders by creation/modification date or fulfillment status; default returns last 90 days. This is your primary "did something sell?" poll.
- `getOrder` — full order detail (buyer, ship-to address, line items, totals).
- `createShippingFulfillment` — upload tracking: one call per package, with **tracking number + `shippingCarrierCode` (mutually required)**. Tracking numbers must be **alphanumeric only — no spaces or hyphens**. ([createShippingFulfillment](https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/createShippingFulfillment))
- Also handles cancellations, and payment disputes.

### Finances API (`sell/finances/v1`) — money
([Overview](https://developer.ebay.com/api-docs/sell/finances/overview.html))
- `getPayouts` / `getPayout` / `getPayoutSummary` — payouts to your bank, filterable by date/status; `getTransactions` / `getTransactionSummary` — order-level sales, refunds, fees, shipping-label charges. Great for bookkeeping/P&L per garment.
- Only returns data for the calling user. Note: **digital signatures are required on Finances API calls only for EU/UK-domiciled sellers** (via the Key Management API); US sellers are currently exempt.

### Account API (`sell/account/v1`) — business policies
([Business policies guide](https://developer.ebay.com/api-docs/sell/static/seller-accounts/business-policies.html), [Overview](https://developer.ebay.com/api-docs/sell/account/overview.html))
- `createFulfillmentPolicy` (shipping services, handling time, free shipping or calculated), `createPaymentPolicy` (mostly boilerplate under managed payments), `createReturnPolicy` (returns accepted?, window, who pays return shipping).
- Offers reference policies by ID — so you define, e.g., one "USPS Ground Advantage, 1-day handling, 30-day returns" policy and reuse it on every listing.
- `optInToProgram` for `SELLING_POLICY_MANAGEMENT` is required before policies can be used.

### Marketing API (`sell/marketing/v1`) — Promoted Listings
([Overview](https://developer.ebay.com/api-docs/sell/marketing/overview.html), [Promoted Listings](https://developer.ebay.com/api-docs/sell/static/marketing/promoted-listings.html))
- `createCampaign` with `fundingModel: COST_PER_SALE` creates a **general strategy** campaign: you pay the ad-rate % only when a click leads to a sale within 30 days. Add listings via `bulkCreateAdsByListingId`/`createAdsByInventoryReference` (key-based) or rules-based selection. Ad rate is set via `bidPercentage`. Very common for clothing resellers; easy to bolt on later.

### Metadata API (`sell/metadata/v1`) — marketplace policy data
([Marketplace metadata guide](https://developer.ebay.com/develop/guides-v2/marketplace-metadata/marketplace-metadata-guide))
- Per-category rules: `getItemConditionPolicies` (which condition values a category allows — clothing categories support "Pre-owned" etc.), `getListingStructurePolicies` (variation support), `getReturnPolicies`, `getAutomotivePartsCompatibilityPolicies`. Mostly works with a client-credentials app token.

### Taxonomy API (`commerce/taxonomy/v1`) — categories & required aspects
([getItemAspectsForCategory](https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getItemAspectsForCategory))
- `getDefaultCategoryTreeId` (US = `0`) → `getCategoryTree` / `getCategorySuggestions` (pass a title like "vintage Pendleton wool flannel shirt 3XLT" and get suggested leaf categories).
- **`getItemAspectsForCategory`** is essential: for a leaf category (e.g., Men's Casual Button-Down Shirts) it returns every aspect with metadata — **whether required**, whether usable for variations, allowed values, data type, single/multi-value. Required aspects come first in the response. For menswear expect required/near-required aspects like **Brand, Size, Size Type (Big & Tall!), Color, Type, Department**. `fetchItemAspects` downloads a zip of all aspects for the whole marketplace if you'd rather cache locally. ([AspectMetadata](https://developer.ebay.com/api-docs/commerce/taxonomy/types/txn:AspectMetadata))

---

## 4. Legacy Trading API vs Inventory API

- The **Trading API** (XML, `AddItem`/`AddFixedPriceItem`/`ReviseFixedPriceItem`/`GetOrders`…) is the legacy interface. It is **not yet decommissioned** (only specific calls have deprecation dates, e.g., `ExtendSiteHostedPictures` decommissioned July 2025, `GetCategoryFeatures` slated for May 2026), but eBay is steadily migrating functionality to REST and recommends REST for new development. ([API Deprecation Status](https://developer.ebay.com/develop/get-started/api-deprecation-status), [Q2 2025 Newsletter](https://developer.ebay.com/updates/newsletter/q2_2025))
- **Recommendation for a new build: use the Inventory API** (plus the rest of the Sell suite). It's the strategic platform, JSON/REST, and matches a SKU-centric intake→listing workflow perfectly.
- **Known limitations / quirks of the Inventory API** to design around:
  - **One-way street**: listings created via the Inventory API **cannot be revised with Trading API calls** (`ReviseItem`, `ReviseFixedPriceItem`, `ReviseInventoryStatus`) and historically have had editing restrictions/oddities in Seller Hub. All revisions should go back through the Inventory API. ([ReviseFixedPriceItem docs](https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseFixedPriceItem.html), [forum report](https://forums.developer.ebay.com/questions/21137/seller-hub-does-not-show-inventory-items-created-t.html))
  - Existing Trading-API-created listings can be migrated in with `bulkMigrateListing`. ([Migrating listings](https://developer.ebay.com/api-docs/sell/static/inventory/migrating-listings.html))
  - **Auction format**: the Inventory API is fixed-price-centric (auction support was only partially added); if you ever want true auctions for rare vintage pieces, that's a case where `AddItem` (Trading API) is still used. For a standard resale catalog, fixed-price + best offer via Inventory API is fine.
  - **Item group update quirk**: updates via `createOrReplaceInventoryItemGroup` sometimes appear successful in GET calls but don't propagate to the live listing without an additional `bulkCreateOrReplaceInventoryItem` touch. ([forum](https://forums.developer.ebay.com/questions/42334/inventory-api-problems.html))
  - **`createOrReplaceInventoryItem` is a full replace** — omitting a field deletes it. Always send the complete item record.
  - Batch calls cap at 25 entries.
  - Some niche Trading API features (e.g., certain listing upgrades/scheduling nuances) still lack REST equivalents; check the [features comparison](https://developer.ebay.com/api-docs/commerce/static/migration-features-comparison.html).

---

## 5. Notifications: Reacting to Sales Fast (Cross-Listing Delisting)

You have three mechanisms; a robust cross-lister uses push + a polling safety net:

1. **Commerce Notification API** (`commerce/notification/v1`) — the modern push platform. You register a **destination** (HTTPS webhook, verified via the same challenge-code scheme as account deletion), then create **subscriptions** to **topics**. Call **`getTopics`** to enumerate currently available topics and their required scopes — the catalog has been expanding (MARKETPLACE_ACCOUNT_DELETION, item revision/availability topics, and newer order-related topics). Every notification carries an **`X-EBAY-SIGNATURE` header (ECDSA)**; verify it using the Notification API's public-key endpoint — eBay's listener SDKs (Node.js/Java/.NET) do challenge handling + signature verification for you. ([Notification API Overview](https://developer.ebay.com/api-docs/commerce/notification/overview.html), [getTopics](https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopics), [Listener SDKs blog](https://innovation.ebayinc.com/tech/engineering/ebay-event-notification-platform-listener-sdks/), [Node SDK](https://github.com/eBay/event-notification-nodejs-sdk))
2. **Legacy Platform Notifications** (Trading API) — still the workhorse for seller order events. `SetNotificationPreferences` subscribes your app/user to events like **`FixedPriceTransaction`** (fixed-price item sold), **`AuctionCheckoutComplete`** (checkout complete — the classic "order ready" signal), `ItemSold`, `ItemListed`, `ItemClosed`, delivered as XML POSTs to your HTTPS endpoint. Many production cross-listers (this is exactly the Vendoo/List Perfectly/Crosslist problem) rely on these. ([Platform Notifications](https://developer.ebay.com/api-docs/static/platform-notifications-landing.html), [NotificationEventTypeCodeType](https://developer.ebay.com/devzone/xml/docs/reference/ebay/types/NotificationEventTypeCodeType.html), [community thread on order webhooks](https://community.ebay.com/t5/RESTful-Sell-APIs-Fulfillment/Ebay-Order-Web-hooks-Order-notification-API/td-p/34503751))
3. **Polling fallback**: `getOrders` (Fulfillment API) with `lastmodifieddate` filter every 1–5 minutes. Notifications are at-least-once but not guaranteed-instant; a poller guarantees you never miss a sale (critical when the same jacket is also on Poshmark/Mercari).

**"eBay Digital Signatures"** in the *API-call* sense (Key Management API, `x-ebay-signature` request headers) is a separate thing: it applies to calls **made on behalf of EU/UK sellers** to Finances API, `getFundingPlan`, issueRefund, etc. As a US seller you don't need it — but you *do* need to verify the ECDSA signature header on incoming webhooks. ([Finances API Overview](https://developer.ebay.com/api-docs/sell/finances/overview.html))

---

## 6. Buying Shipping Labels Programmatically

- eBay **does** have a label API — the **Logistics API** (`sell/logistics/v1`): `createShippingQuote` → rate shop at eBay-negotiated rates → `createFromShippingQuote` → `downloadLabelFile`. **BUT it is a Limited Release API restricted to whitelisted partners approved by eBay business units**, and it only supports **USPS, US-origin** shipments. A small independent developer generally cannot get access. ([Logistics API Overview](https://developer.ebay.com/api-docs/sell/logistics/overview.html), [createFromShippingQuote](https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/createFromShippingQuote))
- **Practical options for Burley's Closet:**
  1. **Buy labels in eBay's UI** (Seller Hub / mobile) at eBay-discounted rates. eBay auto-uploads tracking to the order — zero API work, but breaks your "one app" flow.
  2. **Third-party label APIs**: **EasyPost, Shippo, ShipStation, Pirate Ship** (Pirate Ship is UI-only, no public API for your own app; EasyPost and Shippo have excellent developer APIs with USPS Commercial rates). Your software pulls the order + ship-to address via `getOrders`, buys the label via EasyPost/Shippo, then uploads tracking to eBay.
  3. **Hybrid**: buy on eBay UI for eBay orders (best rates + automatic tracking), use a third-party API for other marketplaces.
- **Tracking upload**: whenever the label isn't bought through eBay, call **`createShippingFulfillment`** (Fulfillment API) with `lineItems`, `trackingNumber` (alphanumeric only), `shippingCarrierCode` (e.g., `USPS`), and optionally `shippedDate`. This marks the order shipped and starts buyer tracking. ([createShippingFulfillment](https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/createShippingFulfillment))

---

## 7. Pictures / Media

- **Media API** (`commerce/media/v1`) is the modern replacement for Trading API's `UploadSiteHostedPictures` (EPS — eBay Picture Services). Methods: **`createImageFromFile`** (multipart upload) and **`createImageFromUrl`**; both return an EPS-hosted image URL/imageId you reference in `inventoryItem.product.imageUrls`. Supported formats: **JPG, GIF (non-animated), PNG, BMP, TIFF, AVIF, HEIC, WEBP**. ([Media API Overview](https://developer.ebay.com/api-docs/commerce/media/overview.html), [createImageFromFile](https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/createImageFromFile), [Managing images](https://developer.ebay.com/api-docs/sell/static/inventory/managing-image-media.html))
- **Requirements** ([eBay picture policy](https://www.ebay.com/help/policies/listing-policies/picture-policy?id=4370)):
  - Minimum **500 px on the longest side** (eBay recommends **1600 px+** for zoom — do this for clothing; buyers zoom on fabric/tags/flaws).
  - Max file size ~**12 MB**.
  - JPEG quality ≥ 90 recommended.
  - **Up to 24 pictures per listing** (free). You can't mix self-hosted and EPS URLs in one listing — just use EPS for everything. ([PictureDetailsType](https://developer.ebay.com/devzone/xml/docs/reference/ebay/types/PictureDetailsType.html), [EPS FAQ KB 1063](https://developer.ebay.com/support/kb-article?KBid=1063))
  - No added borders, text, watermarks, or marketing graphics.
- EPS images expire after ~90 days if unused in a listing (they persist while the listing is active), so upload at listing time, not months ahead.
- You can also just pass externally hosted HTTPS `imageUrls` in the inventory item and let eBay copy them to EPS — simplest path if your app already stores photos in S3/Supabase storage.

---

## 8. Rate Limits & Quotas

- Limits are **per application, per API (or per call family), per day**, resetting daily (Pacific time). Check live usage with the **Developer Analytics API `getRateLimits`/`getUserRateLimits`**. ([API Call Limits](https://developer.ebay.com/develop/get-started/api-call-limits), [getRateLimits](https://developer.ebay.com/api-docs/developer/analytics/resources/rate_limit/methods/getRateLimits))
- Typical defaults relevant to you (confirm on the API Call Limits page / your keyset dashboard, as they vary by API):
  - Trading API: **5,000 calls/day** default across most calls.
  - Sell REST APIs: generally generous defaults — Inventory API methods commonly have per-method daily limits in the tens of thousands to 2M range for compliant apps; Fulfillment/Account/Taxonomy similar. Media uploads and Feed API have their own limits. ([forum: Call Limits with REST Inventory API](https://forums.developer.ebay.com/questions/20453/call-limits-with-rest-inventory-api.html))
  - OAuth token minting itself is rate-limited (don't mint a new token per request — cache the 2-hour token). ([Access token rate limits](https://developer.ebay.com/api-docs/static/oauth-rate-limits.html))
- **Approval to exceed defaults**: yes — the **Application Growth Check** (free, submitted from the developer portal) reviews your app for policy compliance and grants raised limits. Separately, sellers themselves have **selling limits** (account-level listing caps for newer sellers) and possible temporary blocks for excessive Add-call frequency — those are seller-account matters, not API keyset matters. ([API Call Limits](https://developer.ebay.com/develop/get-started/api-call-limits), [AddItem notes](https://developer.ebay.com/devzone/xml/docs/reference/ebay/additem.html))
- Reality check: a single-seller closet app doing intake, listing ~10–50 items/day, polling orders every few minutes, and syncing inventory will use a few thousand calls/day at most — **default limits are ample; no growth check needed initially.**

---

## Suggested Build Order (synthesis)

1. Register developer account → create Sandbox + Production keysets → complete the **account-deletion notification subscribe/opt-out** before first production call.
2. Implement OAuth auth-code flow once for your seller account; persist refresh token; auto-refresh access tokens.
3. Account API: create fulfillment/payment/return policies; create an inventory location.
4. Taxonomy + Metadata: category suggestion + `getItemAspectsForCategory` to drive your intake form (auto-require Brand, Size, Size Type = Big & Tall, Color, etc.).
5. Media API: upload photos → Inventory API: `createOrReplaceInventoryItem` → `createOffer` → `publishOffer`.
6. Sales loop: Notification API/platform notifications webhook + `getOrders` poll → on sale, delist from other marketplaces immediately, mark sold in your DB.
7. Shipping: buy label (eBay UI or EasyPost/Shippo API) → `createShippingFulfillment` to upload tracking.
8. Finances API for payout reconciliation; Marketing API for Promoted Listings later.

---

## Sources

**Program, keysets, sandbox, growth check**
- https://developer.ebay.com/support/kb-article?KBid=456 (Accounts and keys required)
- https://developer.ebay.com/api-docs/static/gs_create-the-ebay-api-keysets.html
- https://developer.ebay.com/api-docs/static/gs_understand-application-keysets.html
- https://developer.ebay.com/develop/tools/sandbox
- https://developer.ebay.com/support/kb-article?KBid=1359 (Requesting additional keysets)
- https://developer.ebay.com/develop/get-started/api-call-limits

**Account deletion compliance**
- https://developer.ebay.com/marketplace-account-deletion
- https://developer.ebay.com/develop/guides-v2/marketplace-user-account-deletion

**OAuth**
- https://developer.ebay.com/api-docs/static/oauth-scopes.html (Using OAuth to access eBay APIs)
- https://developer.ebay.com/api-docs/static/oauth-auth-code-grant-request.html
- https://developer.ebay.com/api-docs/static/oauth-refresh-token-request.html
- https://developer.ebay.com/api-docs/static/oauth-best-practices.html
- https://developer.ebay.com/api-docs/static/oauth-rate-limits.html
- https://developer.ebay.com/support/kb-article?KBid=5075 (Quick OAuth Guide)
- https://github.com/eBay/ebay-oauth-python-client · https://github.com/eBay/ebay-oauth-java-client
- https://apitut.com/ebay/api/scopelist.html (scope list reference)

**Sell API suite**
- https://developer.ebay.com/api-docs/sell/static/dev-app.html (How to develop a selling application)
- https://developer.ebay.com/api-docs/sell/inventory/static/overview.html
- https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
- https://developer.ebay.com/api-docs/sell/fulfillment/overview.html
- https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
- https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/createShippingFulfillment
- https://developer.ebay.com/api-docs/sell/finances/overview.html
- https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayouts
- https://developer.ebay.com/api-docs/sell/static/seller-accounts/business-policies.html
- https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/createFulfillmentPolicy
- https://developer.ebay.com/api-docs/sell/marketing/overview.html
- https://developer.ebay.com/api-docs/sell/static/marketing/promoted-listings.html
- https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/createCampaign
- https://developer.ebay.com/develop/guides-v2/marketplace-metadata/marketplace-metadata-guide
- https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getItemAspectsForCategory
- https://developer.ebay.com/api-docs/commerce/taxonomy/types/txn:AspectMetadata

**Trading API vs Inventory API**
- https://developer.ebay.com/devzone/xml/docs/reference/ebay/additem.html
- https://developer.ebay.com/devzone/xml/docs/reference/ebay/AddFixedPriceItem.html
- https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseFixedPriceItem.html
- https://developer.ebay.com/develop/get-started/api-deprecation-status
- https://developer.ebay.com/api-docs/sell/static/inventory/migrating-listings.html
- https://developer.ebay.com/api-docs/commerce/static/migration-features-comparison.html
- https://forums.developer.ebay.com/questions/42334/inventory-api-problems.html
- https://forums.developer.ebay.com/questions/21137/seller-hub-does-not-show-inventory-items-created-t.html

**Notifications**
- https://developer.ebay.com/api-docs/commerce/notification/overview.html
- https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopics
- https://developer.ebay.com/api-docs/static/platform-notifications-landing.html
- https://developer.ebay.com/devzone/xml/docs/reference/ebay/types/NotificationEventTypeCodeType.html
- https://innovation.ebayinc.com/tech/engineering/ebay-event-notification-platform-listener-sdks/
- https://github.com/eBay/event-notification-nodejs-sdk
- https://community.ebay.com/t5/RESTful-Sell-APIs-Fulfillment/Ebay-Order-Web-hooks-Order-notification-API/td-p/34503751

**Shipping labels**
- https://developer.ebay.com/api-docs/sell/logistics/overview.html
- https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/createFromShippingQuote
- https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/downloadLabelFile

**Media/pictures**
- https://developer.ebay.com/api-docs/commerce/media/overview.html
- https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/createImageFromFile
- https://developer.ebay.com/api-docs/sell/static/inventory/managing-image-media.html
- https://developer.ebay.com/support/kb-article?KBid=1063 (EPS FAQ)
- https://www.ebay.com/help/policies/listing-policies/picture-policy?id=4370

**Rate limits**
- https://developer.ebay.com/api-docs/developer/analytics/resources/rate_limit/methods/getRateLimits
- https://forums.developer.ebay.com/questions/20453/call-limits-with-rest-inventory-api.html

Caveats: developer.ebay.com blocked direct page fetches during this research (403), so details were assembled from search-indexed doc content plus official forum/KB pages; exact per-method call limits and the current Notification API topic catalog should be verified in your developer-portal keyset dashboard and via a live `getTopics` call once registered.
