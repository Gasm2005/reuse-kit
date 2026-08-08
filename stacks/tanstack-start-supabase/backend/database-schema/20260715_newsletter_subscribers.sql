-- ─── NEWSLETTER / MARKETING SUBSCRIBERS ───────────────────────
-- Lightweight capture separate from the commission `leads` CRM —
-- this is just for building a marketing list (email/WhatsApp) to
-- notify about new pieces, offers, etc.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  source text DEFAULT 'footer', -- 'footer', 'checkout', 'popup', etc.
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email) WHERE email IS NOT NULL;

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can sign up (insert only — cannot read others' data)
CREATE POLICY "Public can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only admin can view/manage the list
CREATE POLICY "Admin full access subscribers" ON newsletter_subscribers
  FOR ALL USING (is_admin_user(auth.uid()));
