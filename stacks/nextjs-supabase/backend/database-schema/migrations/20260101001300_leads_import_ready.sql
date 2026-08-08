-- ============================================================
-- Relax leads' NOT NULL constraints so an external source can hand over a
-- lead. The website's own enquiry form always fills service/city/budget/
-- timeline, but 99acres and most portals typically only ever give a name,
-- a phone number, and maybe a message — forcing our exact field set on
-- every import source would make external intake impossible.
-- ============================================================

alter table leads alter column service drop not null;
alter table leads alter column city drop not null;
alter table leads alter column budget drop not null;
alter table leads alter column timeline drop not null;

-- Facebook/Google Lead Ads forms commonly collect an email address; the
-- site's own enquiry form never asked for one, so this stayed missing.
alter table leads add column if not exists email text;
