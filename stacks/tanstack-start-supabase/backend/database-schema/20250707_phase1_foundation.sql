-- ============================================================
-- Artspire V2 — Phase 1 Foundation Migration
-- Date: 2025-07-07
-- ============================================================

-- ============================================================
-- PART A: EXTEND EXISTING TABLES
-- ============================================================

-- artworks extensions
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS inquiry_count integer DEFAULT 0;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES profiles(id);

-- categories extensions
ALTER TABLE categories ADD COLUMN IF NOT EXISTS short_summary text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS card_overlay_opacity integer DEFAULT 25 CHECK (card_overlay_opacity BETWEEN 0 AND 100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS card_gradient_style text DEFAULT 'bottom-dark' CHECK (card_gradient_style IN ('bottom-dark', 'center-vignette', 'none'));
ALTER TABLE categories ADD COLUMN IF NOT EXISTS card_text_position text DEFAULT 'bottom-left' CHECK (card_text_position IN ('bottom-left', 'bottom-center', 'center'));
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES profiles(id);

-- artwork_tags extension
ALTER TABLE artwork_tags ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- faqs extensions
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'FAQPage' CHECK (schema_type IN ('FAQPage', 'QAPage'));
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES profiles(id);

-- Note: Columns referencing media_library and visual_assets will be added
-- after those tables are created in Part B below.

-- ============================================================
-- PART B: CREATE CORE TABLES (SPRINT 1)
-- ============================================================

-- media_library: centralized asset management
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  width integer,
  height integer,
  aspect_ratio numeric(5,2),
  file_size integer,
  mime_type text,
  variants jsonb DEFAULT '{}',
  alt_text text,
  title text,
  description text,
  caption text,
  tags text[],
  folder text DEFAULT 'uncategorized',
  ai_generated_alt text,
  ai_generated_tags text[],
  dominant_colors jsonb,
  usage_count integer DEFAULT 0,
  used_in jsonb DEFAULT '[]',
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- media_variants: separate table for query optimization
CREATE TABLE IF NOT EXISTS media_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media_library(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  width integer,
  height integer,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

-- media_usage_log: detailed usage tracking for dependency checking
CREATE TABLE IF NOT EXISTS media_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media_library(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  usage_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- visual_assets: non-photographic visual assets (overlays, textures, patterns)
CREATE TABLE IF NOT EXISTS visual_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('overlay', 'texture', 'pattern', 'gradient', 'icon', 'background', 'decorative')),
  storage_path text NOT NULL,
  public_url text NOT NULL,
  preview_url text,
  file_size integer,
  width integer,
  height integer,
  mime_type text,
  description text,
  default_opacity integer DEFAULT 25 CHECK (default_opacity BETWEEN 0 AND 100),
  category_suggestions text[],
  is_predefined boolean DEFAULT false,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- visual_asset_usage_log: track where visual assets are used
CREATE TABLE IF NOT EXISTS visual_asset_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES visual_assets(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  usage_type text NOT NULL,
  opacity integer,
  created_at timestamptz DEFAULT now()
);

-- website_content: key-value store for all website text/content
CREATE TABLE IF NOT EXISTS website_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text UNIQUE NOT NULL,
  page text NOT NULL,
  section text NOT NULL,
  field_name text NOT NULL,
  value_text text,
  value_html text,
  value_json jsonb,
  value_media_id uuid REFERENCES media_library(id),
  field_type text DEFAULT 'text' CHECK (field_type IN ('text', 'textarea', 'html', 'image', 'multi_image', 'repeater', 'select', 'toggle')),
  description text,
  placeholder text,
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- website_content_repeater_items: for repeater fields (team members, social links, etc.)
CREATE TABLE IF NOT EXISTS website_content_repeater_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_key text NOT NULL,
  display_order integer DEFAULT 0,
  item_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART C: ADD FOREIGN KEY COLUMNS (after target tables exist)
-- ============================================================

-- artworks: media references
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS main_image_id uuid REFERENCES media_library(id);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS thumbnail_image_id uuid REFERENCES media_library(id);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS before_image_id uuid REFERENCES media_library(id);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS after_image_id uuid REFERENCES media_library(id);

-- categories: media and visual asset references
ALTER TABLE categories ADD COLUMN IF NOT EXISTS card_artwork_image_id uuid REFERENCES media_library(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS card_overlay_id uuid REFERENCES visual_assets(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS banner_artwork_image_id uuid REFERENCES media_library(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS banner_overlay_id uuid REFERENCES visual_assets(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS thumbnail_image_id uuid REFERENCES media_library(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS og_image_id uuid REFERENCES media_library(id);

-- seo_metadata extensions (after media_library exists)
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS og_image_id uuid REFERENCES media_library(id);
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_image_id uuid REFERENCES media_library(id);
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES profiles(id);

-- faqs: section reference (after faq_sections created in Part E)
-- NOTE: This will be added in Part E after faq_sections is created

-- ============================================================
-- PART D: CREATE SUPPORTING TABLES (SPRINT 1-2)
-- ============================================================

-- category_gallery_images: gallery images for category pages
CREATE TABLE IF NOT EXISTS category_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media_library(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  caption text,
  alt_text text,
  created_at timestamptz DEFAULT now()
);

-- artwork_gallery_images: multiple gallery images per artwork
CREATE TABLE IF NOT EXISTS artwork_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media_library(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  caption text,
  alt_text text,
  created_at timestamptz DEFAULT now()
);

-- artwork_process_images: step-by-step creation photos
CREATE TABLE IF NOT EXISTS artwork_process_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media_library(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  step_title text,
  step_description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART E: FAQ MANAGEMENT TABLES
-- ============================================================

-- faq_sections: group FAQs by topic
CREATE TABLE IF NOT EXISTS faq_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add faq section reference to faqs (now that faq_sections exists)
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES faq_sections(id);

-- categories: faq section reference (for category-specific FAQs)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS faq_section_id uuid REFERENCES faq_sections(id);

-- artwork_faqs: junction for artwork-specific FAQs
CREATE TABLE IF NOT EXISTS artwork_faqs (
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  faq_id uuid REFERENCES faqs(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  PRIMARY KEY (artwork_id, faq_id)
);

-- category_faqs: junction for category-specific FAQs
CREATE TABLE IF NOT EXISTS category_faqs (
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  faq_id uuid REFERENCES faqs(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  PRIMARY KEY (category_id, faq_id)
);

-- ============================================================
-- PART F: PAGE SECTION MANAGER TABLES
-- ============================================================

-- pages: website pages registry
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  route text NOT NULL,
  is_active boolean DEFAULT true,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- page_sections: sections within a page
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  section_type text NOT NULL CHECK (section_type IN ('hero', 'category-grid', 'artwork-grid', 'testimonials', 'cta-banner', 'content-block', 'video', 'faq', 'image-gallery', 'custom-html')),
  section_name text NOT NULL,
  content_data jsonb NOT NULL DEFAULT '{}',
  background_image_id uuid REFERENCES media_library(id),
  background_color text,
  overlay_opacity integer DEFAULT 0,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  padding_top integer DEFAULT 60,
  padding_bottom integer DEFAULT 60,
  custom_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- section_type_definitions: available section types
CREATE TABLE IF NOT EXISTS section_type_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  default_config jsonb DEFAULT '{}',
  available_fields jsonb DEFAULT '[]',
  is_active boolean DEFAULT true
);

-- ============================================================
-- PART G: SEO CENTER TABLES
-- ============================================================

-- seo_metadata extensions (already partially exists, add missing columns)
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_card text DEFAULT 'summary_large_image' CHECK (twitter_card IN ('summary', 'summary_large_image'));
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS robots_meta text DEFAULT 'index, follow' CHECK (robots_meta IN ('index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'));
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'Article' CHECK (schema_type IN ('Article', 'Product', 'FAQPage', 'Organization', 'LocalBusiness', 'CreativeWork', 'BreadcrumbList'));
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS custom_schema jsonb;

-- Add seo_score generated column (PostgreSQL 12+ syntax for generated columns)
-- Note: If this fails, the application will compute the score in code instead
DO $$
BEGIN
  ALTER TABLE seo_metadata ADD COLUMN seo_score integer GENERATED ALWAYS AS (
    CASE WHEN meta_title IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN meta_description IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN canonical_url IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN og_image_id IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN og_title IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN og_description IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN structured_data IS NOT NULL THEN 15 ELSE 0 END
  ) STORED;
EXCEPTION WHEN duplicate_column THEN
  -- Column already exists, skip
  NULL;
END $$;

-- sitemap_entries
CREATE TABLE IF NOT EXISTS sitemap_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  sitemap_type text CHECK (sitemap_type IN ('index', 'pages', 'artworks', 'categories', 'images', 'videos')),
  lastmod timestamptz,
  changefreq text CHECK (changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  priority numeric(2,1) CHECK (priority BETWEEN 0.0 AND 1.0),
  status text DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- seo_page_inventory: list of all pages that need SEO
CREATE TABLE IF NOT EXISTS seo_page_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL CHECK (page_type IN ('homepage', 'about', 'contact', 'portfolio', 'artwork', 'category', 'faq')),
  page_id uuid,
  page_url text NOT NULL,
  page_title text,
  has_seo_metadata boolean DEFAULT false,
  last_checked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART H: LEAD CENTER TABLES (SPRINT 3)
-- ============================================================

-- leads: unified CRM lead table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  whatsapp_number text,
  location text,
  requirement text,
  category_id uuid REFERENCES categories(id),
  artwork_id uuid REFERENCES artworks(id),
  budget_range text CHECK (budget_range IN ('under-1000', '1000-5000', '5000-10000', '10000-25000', '25000+')),
  source text DEFAULT 'website' CHECK (source IN ('website-form', 'whatsapp', 'instagram', 'facebook', 'google', 'direct', 'referral')),
  source_detail text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'negotiating', 'confirmed', 'in-production', 'delivered', 'closed-won', 'closed-lost')),
  status_changed_at timestamptz DEFAULT now(),
  assigned_to uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- lead_activities: complete interaction history
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('inquiry', 'call', 'whatsapp', 'email', 'note', 'status-change', 'follow-up', 'quote-sent')),
  subject text,
  body text,
  direction text CHECK (direction IN ('inbound', 'outbound')),
  is_automated boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- lead_tags: for tagging leads
CREATE TABLE IF NOT EXISTS lead_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- lead_tag_items: junction
CREATE TABLE IF NOT EXISTS lead_tag_items (
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES lead_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

-- ============================================================
-- PART I: WHATSAPP CONVERSION TABLES (SPRINT 3)
-- ============================================================

-- whatsapp_clicks: track every WhatsApp CTA click
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_type text NOT NULL CHECK (cta_type IN ('floating-button', 'hero-cta', 'category-cta', 'artwork-cta', 'footer-cta', 'inline-cta')),
  page_url text,
  page_path text,
  artwork_id uuid REFERENCES artworks(id),
  category_id uuid REFERENCES categories(id),
  visitor_id text,
  user_agent text,
  ip_address text,
  country text,
  city text,
  clicked_at timestamptz DEFAULT now()
);

-- whatsapp_click_daily_rollup: aggregated analytics
CREATE TABLE IF NOT EXISTS whatsapp_click_daily_rollup (
  date date PRIMARY KEY,
  total_clicks integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  by_cta_type jsonb DEFAULT '{}',
  by_page jsonb DEFAULT '{}',
  by_category jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART J: DASHBOARD TABLES (SPRINT 3)
-- ============================================================

-- dashboard_metrics: materialized metrics for fast loading
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value integer DEFAULT 0,
  metric_value_numeric numeric(12,2),
  metric_period text CHECK (metric_period IN ('today', 'week', 'month', 'quarter', 'year')),
  change_value integer DEFAULT 0,
  change_percent numeric(5,2),
  trend text CHECK (trend IN ('up', 'down', 'flat')),
  calculated_at timestamptz DEFAULT now()
);

-- dashboard_activity_feed: recent activity log
CREATE TABLE IF NOT EXISTS dashboard_activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL CHECK (activity_type IN ('artwork_created', 'artwork_published', 'artwork_updated', 'artwork_deleted', 'category_updated', 'faq_created', 'faq_updated', 'lead_created', 'lead_status_changed', 'whatsapp_click', 'seo_updated', 'media_uploaded', 'content_updated')),
  title text NOT NULL,
  description text,
  entity_type text,
  entity_id uuid,
  entity_slug text,
  performed_by uuid REFERENCES profiles(id),
  performed_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART K: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_content_page ON website_content(page);
CREATE INDEX IF NOT EXISTS idx_website_content_key ON website_content(content_key);
CREATE INDEX IF NOT EXISTS idx_visual_assets_type ON visual_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_visual_assets_active ON visual_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_artworks_status_category ON artworks(status, category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(featured) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_artworks_homepage ON artworks(show_on_homepage) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_date ON whatsapp_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_activity_performed_at ON dashboard_activity_feed(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity ON seo_metadata(entity_type, entity_id);

-- ============================================================
-- PART L: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_asset_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content_repeater_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_process_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_type_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_click_daily_rollup ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_activity_feed ENABLE ROW LEVEL SECURITY;

-- Helper function for admin check
CREATE OR REPLACE FUNCTION is_admin_user(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Media Library policies
CREATE POLICY "Public read media" ON media_library FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Admin full access media" ON media_library FOR ALL USING (is_admin_user(auth.uid()));

-- Media variants policies
CREATE POLICY "Public read media_variants" ON media_variants FOR SELECT USING (true);
CREATE POLICY "Admin full access media_variants" ON media_variants FOR ALL USING (is_admin_user(auth.uid()));

-- Media usage log policies
CREATE POLICY "Public read media_usage_log" ON media_usage_log FOR SELECT USING (true);
CREATE POLICY "Admin full access media_usage_log" ON media_usage_log FOR ALL USING (is_admin_user(auth.uid()));

-- Visual assets policies
CREATE POLICY "Public read visual_assets" ON visual_assets FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access visual_assets" ON visual_assets FOR ALL USING (is_admin_user(auth.uid()));

-- Visual asset usage log policies
CREATE POLICY "Public read visual_asset_usage_log" ON visual_asset_usage_log FOR SELECT USING (true);
CREATE POLICY "Admin full access visual_asset_usage_log" ON visual_asset_usage_log FOR ALL USING (is_admin_user(auth.uid()));

-- Website content policies
CREATE POLICY "Public read website_content" ON website_content FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access website_content" ON website_content FOR ALL USING (is_admin_user(auth.uid()));

-- Website content repeater items policies
CREATE POLICY "Public read website_content_repeater_items" ON website_content_repeater_items FOR SELECT USING (true);
CREATE POLICY "Admin full access website_content_repeater_items" ON website_content_repeater_items FOR ALL USING (is_admin_user(auth.uid()));

-- Category gallery images policies
CREATE POLICY "Public read category_gallery_images" ON category_gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin full access category_gallery_images" ON category_gallery_images FOR ALL USING (is_admin_user(auth.uid()));

-- Artwork gallery images policies
CREATE POLICY "Public read artwork_gallery_images" ON artwork_gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin full access artwork_gallery_images" ON artwork_gallery_images FOR ALL USING (is_admin_user(auth.uid()));

-- Artwork process images policies
CREATE POLICY "Public read artwork_process_images" ON artwork_process_images FOR SELECT USING (true);
CREATE POLICY "Admin full access artwork_process_images" ON artwork_process_images FOR ALL USING (is_admin_user(auth.uid()));

-- FAQ sections policies
CREATE POLICY "Public read faq_sections" ON faq_sections FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access faq_sections" ON faq_sections FOR ALL USING (is_admin_user(auth.uid()));

-- Artwork FAQs policies
CREATE POLICY "Public read artwork_faqs" ON artwork_faqs FOR SELECT USING (true);
CREATE POLICY "Admin full access artwork_faqs" ON artwork_faqs FOR ALL USING (is_admin_user(auth.uid()));

-- Category FAQs policies
CREATE POLICY "Public read category_faqs" ON category_faqs FOR SELECT USING (true);
CREATE POLICY "Admin full access category_faqs" ON category_faqs FOR ALL USING (is_admin_user(auth.uid()));

-- Pages policies
CREATE POLICY "Public read pages" ON pages FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access pages" ON pages FOR ALL USING (is_admin_user(auth.uid()));

-- Page sections policies
CREATE POLICY "Public read page_sections" ON page_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access page_sections" ON page_sections FOR ALL USING (is_admin_user(auth.uid()));

-- Section type definitions policies
CREATE POLICY "Public read section_type_definitions" ON section_type_definitions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access section_type_definitions" ON section_type_definitions FOR ALL USING (is_admin_user(auth.uid()));

-- Sitemap entries policies
CREATE POLICY "Admin full access sitemap_entries" ON sitemap_entries FOR ALL USING (is_admin_user(auth.uid()));

-- SEO page inventory policies
CREATE POLICY "Admin full access seo_page_inventory" ON seo_page_inventory FOR ALL USING (is_admin_user(auth.uid()));

-- Leads policies (admin only)
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admin full access lead_activities" ON lead_activities FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admin full access lead_tags" ON lead_tags FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admin full access lead_tag_items" ON lead_tag_items FOR ALL USING (is_admin_user(auth.uid()));

-- WhatsApp clicks policies (admin only)
CREATE POLICY "Admin full access whatsapp_clicks" ON whatsapp_clicks FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admin full access whatsapp_click_daily_rollup" ON whatsapp_click_daily_rollup FOR ALL USING (is_admin_user(auth.uid()));

-- Dashboard policies (admin only)
CREATE POLICY "Admin full access dashboard_metrics" ON dashboard_metrics FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admin full access dashboard_activity_feed" ON dashboard_activity_feed FOR ALL USING (is_admin_user(auth.uid()));

-- ============================================================
-- PART M: STORAGE BUCKETS
-- ============================================================

-- Create media-library bucket for general CMS assets
-- Note: These are typically created via Supabase Dashboard or CLI
-- The following statements may need to be run via the Supabase Storage API
-- rather than SQL, but we include them for reference:

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('media-library', 'media-library', true, 10485760, ARRAY['image/*'])
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('visual-assets', 'visual-assets', true, 5242880, ARRAY['image/*'])
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
