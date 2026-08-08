-- ============================================================
-- Indexes. Run once in Supabase SQL Editor.
--
-- Without these, every "other properties in this locality" block and every
-- category filter is a full table scan. Fine at 50 rows, not at 5,000.
-- ============================================================

-- Property pages query siblings by locality.
create index if not exists properties_location_idx on properties (location);

-- Category pages and the homepage quick-explore filter on this.
create index if not exists properties_type_idx on properties (property_type);

-- Everything is ordered newest-first.
create index if not exists properties_created_at_idx
  on properties (created_at desc);

-- Combined index for the common "this type, newest first" query.
create index if not exists properties_type_created_idx
  on properties (property_type, created_at desc);

-- Admin lead list filters by status and sorts by date.
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_created_at_idx on leads (created_at desc);
