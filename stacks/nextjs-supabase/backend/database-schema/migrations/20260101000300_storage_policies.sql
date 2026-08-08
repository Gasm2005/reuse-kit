-- Run this in Supabase SQL Editor AFTER creating the "property-photos"
-- bucket via Dashboard → Storage → New bucket (mark it Public).
-- This allows anyone to VIEW photos, but only admins to UPLOAD/DELETE.
-- Needs supabase-schema.sql (or supabase-migration-admin-rls.sql) to
-- have run first — that's where public.is_admin() comes from.

create policy "Public can view property photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "Admins can upload property photos"
  on storage.objects for insert
  with check (bucket_id = 'property-photos' and public.is_admin());

create policy "Admins can delete property photos"
  on storage.objects for delete
  using (bucket_id = 'property-photos' and public.is_admin());
