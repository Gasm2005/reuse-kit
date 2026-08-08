-- ─── BLOG / JOURNAL ───────────────────────────────────────────
-- Admin-managed articles for content marketing + SEO/GEO/AEO.
-- Public reads only published posts; admin manages everything.

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text,                       -- HTML (authored in admin)
  cover_image_url text,
  author text DEFAULT 'Himangi Pandey',
  category text,                   -- e.g. "Craft", "Gift Guides", "Studio Notes"
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  meta_title text,
  meta_description text,
  og_image_url text,
  reading_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read only published posts
CREATE POLICY "Public read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admin full access blog" ON blog_posts
  FOR ALL USING (is_admin_user(auth.uid()));
