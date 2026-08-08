-- ─── CLOSE PII EXPOSURE ON ORDERS ──────────────────────────────
-- Audit finding: `orders` and `order_items` had `FOR SELECT USING (true)`,
-- meaning anyone who obtained an order UUID (e.g. by guessing, log
-- exposure, shared screenshot, or browser history) could read the
-- full row directly via the Supabase client — name, email, phone,
-- shipping address — with no expiry and no ownership check.
--
-- Public order lookups (order-confirmation page, track-order page) now
-- go through server functions (src/lib/orders-access.server.ts) that
-- verify the customer's phone number matches before returning data,
-- using the service_role key. Direct table access from the browser is
-- no longer possible for non-admins.

DROP POLICY IF EXISTS "Public can read own order by id" ON orders;
DROP POLICY IF EXISTS "Public can read order items" ON order_items;

-- orders/order_items now have exactly two ways to be read:
--   1. Admin, via the existing "Admin full access" FOR ALL policies
--   2. Anyone, via a server function using service_role (bypasses RLS
--      entirely, but only after verifying phone-number ownership)
-- No public SELECT policy remains on either table.
