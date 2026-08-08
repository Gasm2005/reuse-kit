# Database Schema

> Generated from `assets.json`. Do not edit by hand.

## Reusable Postgres schemas (CMS, media, commerce, blog, CRM)
🟡 adapt · `sql` · runs: server
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `20250707_phase1_foundation.sql`, `20260710_shop_cart_checkout_orders.sql`, `20260718_blog_posts.sql`, `20260715_newsletter_subscribers.sql`, `20260714_product_reviews.sql`
Generic tables with RLS already written: media_library/media_variants/media_usage_log, website_content + repeaters, pages/page_sections, carts/cart_items/orders/order_items, blog_posts, newsletter_subscribers, product_reviews, and a leads mini-CRM.
**Adapting it:** phase1_foundation is a large file that also contains Artspire's artwork tables — take the table blocks you need, not the whole file. Drop razorpay_* columns from orders if using another gateway.
**Tags:** schema, migration, cms, media, ecommerce, cart, orders, blog, newsletter, reviews, crm, rls
