-- ============================================================
-- Type-specific details.
--
-- A plot needs facing, road width, dimensions and approval status. A flat
-- needs floor, total floors, parking and age. A villa needs plot area and
-- built-up area separately. An interior job needs scope and duration.
--
-- Adding a column per field means roughly thirty columns on properties, all
-- but a handful null on any given row, and a migration every time a new kind
-- of listing turns up. One jsonb column holds whatever that type needs, and
-- which fields apply to which type is defined in the app (lib/property-schema)
-- so the admin form and the detail page stay in step.
-- ============================================================

alter table properties
  add column if not exists attributes jsonb not null default '{}'::jsonb;

-- Lets us filter on a key later — "plots facing east", "flats with parking" —
-- without a full scan.
create index if not exists properties_attributes_idx
  on properties using gin (attributes);
