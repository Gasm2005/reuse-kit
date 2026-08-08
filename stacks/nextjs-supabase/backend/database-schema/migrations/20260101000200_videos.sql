-- Run this in Supabase SQL Editor to add video support to properties.
-- (Run this AFTER the images migration if you haven't already.)

alter table properties add column if not exists videos jsonb default '[]'::jsonb;
