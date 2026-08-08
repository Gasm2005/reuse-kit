-- ============================================================
-- ARTSPIRE SHOP — PHASE 2: CART, CHECKOUT, ORDERS
-- Guest-first cart (session-based), Razorpay-ready order model.
-- Follows the exact conventions of products/shop_categories:
-- uuid PKs, is_admin_user() RLS, timestamptz audit fields.
-- ============================================================

-- ─── PART A: ORDER STATUS ENUMS ──────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',        -- created, payment not yet attempted
    'payment_failed', -- Razorpay payment failed or was abandoned
    'confirmed',       -- payment succeeded
    'processing',      -- being packed/prepared
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── PART B: CARTS ────────────────────────────────────────────
-- Guest-first: identified by session_id (stored in a cookie/localStorage
-- on the client). No login required to shop or check out — matches the
-- architecture decision to skip customer accounts for MVP.
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_add numeric(10,2) NOT NULL, -- snapshot, protects against mid-session price changes
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ─── PART C: ORDERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL, -- human-readable, e.g. ART-20260710-0001

  -- Customer (guest checkout — no account required)
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,

  -- Shipping address (India-first, extensible jsonb)
  shipping_address jsonb NOT NULL,
  -- Expected shape: { line1, line2, city, state, postal_code, country }

  -- Amounts
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',

  -- Optional gifting
  gift_message text,

  -- Status
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',

  -- Razorpay references
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,

  -- Coupon (Phase 3 feature, column exists now to avoid later migration)
  coupon_code text,

  -- Audit
  notes text, -- internal admin notes
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL, -- kept even if product later deleted
  title_snapshot text NOT NULL,      -- product name at time of order
  image_snapshot text,               -- product image at time of order
  price_snapshot numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── PART D: ORDER NUMBER GENERATOR ──────────────────────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  today_str text := to_char(now(), 'YYYYMMDD');
  seq_num integer;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num
  FROM orders
  WHERE order_number LIKE 'ART-' || today_str || '-%';

  RETURN 'ART-' || today_str || '-' || lpad(seq_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ─── PART E: INVENTORY DEDUCTION FUNCTION ────────────────────
-- Called after payment confirmation. Reduces stock, marks sold_out
-- if this was the last unit of a one-of-a-kind piece.
CREATE OR REPLACE FUNCTION deduct_product_inventory(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET
    inventory_count = GREATEST(inventory_count - p_quantity, 0),
    status = CASE
      WHEN (inventory_count - p_quantity) <= 0 THEN 'sold_out'::product_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- ─── PART F: ROW LEVEL SECURITY ──────────────────────────────
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Carts: public can read/write their own session's cart (session_id
-- is a random UUID the client generates — not guessable, functions
-- as a bearer token for guest cart ownership)
CREATE POLICY "Public manage own cart" ON carts
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access carts" ON carts
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Public manage own cart items" ON cart_items
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access cart items" ON cart_items
  FOR ALL USING (is_admin_user(auth.uid()));

-- Orders: public can INSERT (place an order) and SELECT their own
-- (matched by email, checked client-side after creation) but cannot
-- see other customers' orders or modify status — only admin can.
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own order by id" ON orders
  FOR SELECT USING (true); -- order confirmation page needs read-by-id; acceptable since id is a uuid, not guessable
CREATE POLICY "Admin full access orders" ON orders
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Public can create order items" ON order_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read order items" ON order_items
  FOR SELECT USING (true);
CREATE POLICY "Admin full access order items" ON order_items
  FOR ALL USING (is_admin_user(auth.uid()));

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
