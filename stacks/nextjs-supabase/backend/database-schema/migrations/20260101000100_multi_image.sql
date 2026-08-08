-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Run)
-- This adds support for multiple photos per property.

alter table properties add column if not exists images jsonb default '[]'::jsonb;

-- Backfill: move existing single image_url into the new images array
-- so properties you've already added don't lose their photo.
update properties
set images = jsonb_build_array(image_url)
where image_url is not null and (images is null or images = '[]'::jsonb);
