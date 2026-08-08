-- ============================================================
-- Make price sortable and filterable in the database.
--
-- price is free text, so the app was pulling digits out of it with a regex
-- in the browser to do budget filtering and price sorting. That works for
-- "₹42,00,000" and silently fails for anything else — and one live listing
-- was already stored as a bare "18000", which renders on the site as the
-- word 18000 with no currency and no period.
-- ============================================================

-- ---------- 1. Normalise the one malformed row ----------
-- Rent is quoted per month; sale prices are absolute. Only touches rows that
-- are bare digits, so correctly formatted prices are left alone.
update properties
set price = '₹' || to_char(price::bigint, 'FM99,99,99,999') ||
            case when property_type = 'Rent' then ' / month' else '' end
where price ~ '^[0-9]+$';

-- ---------- 2. A real number to sort and filter on ----------
-- Generated, so it can never drift from price — it is recomputed by Postgres
-- on every write and cannot be set by hand.
alter table properties
  add column if not exists price_numeric bigint
  generated always as (
    nullif(regexp_replace(coalesce(price, ''), '[^0-9]', '', 'g'), '')::bigint
  ) stored;

-- Budget filters read "this type, in this range, newest first".
create index if not exists properties_price_idx
  on properties (price_numeric);

create index if not exists properties_type_price_idx
  on properties (property_type, price_numeric);
