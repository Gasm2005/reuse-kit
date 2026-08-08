-- Add SEO heading columns to artworks table
-- Date: 2025-07-07
-- Minimal schema extension for simplified artwork form

ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS h1_heading text,
  ADD COLUMN IF NOT EXISTS h2_heading text,
  ADD COLUMN IF NOT EXISTS h3_heading text;
