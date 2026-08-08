-- ============================================================
-- Photos become rows, with a room label and an explicit order.
--
-- images was a flat jsonb array of URLs. Someone looking at a 4BHK wants to
-- see the hall, each bedroom, the bathrooms and the balcony — and to know
-- which photo is which. A bare array can't say that, can't be reordered
-- without rewriting the whole value, and can't be queried.
--
-- properties.images and properties.image_url are left in place and still
-- populated, so nothing breaks while the app is moved over. image_url stays
-- as the denormalised cover so listing grids don't need a join.
-- ============================================================

create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  url text not null,

  -- Free text rather than an enum: a flat has "Bedroom 1..4", a plot has
  -- "Road frontage", an interior job has "Before"/"After". An enum would
  -- need a migration every time a new kind of listing turns up.
  room text,
  caption text,

  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Galleries always load by property, in order.
create index if not exists property_images_property_idx
  on property_images (property_id, sort_order);

-- ---------- Backfill from the existing jsonb arrays ----------
-- Ordinality preserves the order they were in, and the first one keeps its
-- place as the cover. Guarded so re-running doesn't duplicate rows.
insert into property_images (property_id, url, sort_order)
select p.id, img.url, (img.ord - 1)::int
from properties p
cross join lateral jsonb_array_elements_text(coalesce(p.images, '[]'::jsonb))
  with ordinality as img(url, ord)
where not exists (
  select 1 from property_images pi where pi.property_id = p.id
);

-- Properties whose only photo was image_url, with no images array.
insert into property_images (property_id, url, sort_order)
select p.id, p.image_url, 0
from properties p
where p.image_url is not null
  and not exists (select 1 from property_images pi where pi.property_id = p.id);

-- ---------- Policies ----------
alter table property_images enable row level security;

drop policy if exists "Public can view property images" on property_images;
drop policy if exists "Admins can manage property images" on property_images;

create policy "Public can view property images"
  on property_images for select
  using (true);

create policy "Admins can manage property images"
  on property_images for all
  using (public.is_admin())
  with check (public.is_admin());
