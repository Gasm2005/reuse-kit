-- ─── PRODUCT REVIEWS ──────────────────────────────────────────
-- Guest reviews (no account needed, matches guest-checkout pattern).
-- New reviews start unapproved; admin moderates before they go public,
-- to keep spam/fake reviews off the site.

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL, -- optional: link to a verified purchase
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id, is_approved);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read only approved reviews
CREATE POLICY "Public read approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

-- Public (guests) can submit a review — starts unapproved
CREATE POLICY "Public insert reviews" ON product_reviews
  FOR INSERT WITH CHECK (is_approved = false);

-- Admins can do everything (read all incl. unapproved, update, delete)
CREATE POLICY "Admin full access reviews" ON product_reviews
  FOR ALL USING (is_admin_user(auth.uid()));
