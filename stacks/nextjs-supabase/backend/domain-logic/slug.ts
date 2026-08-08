// Property URLs used to be a bare UUID — /property/9f3a4c2e-...  That tells
// Google nothing and can't be read out loud. Now they carry the title and
// locality, with the id kept on the end as the thing we actually look up, so
// a listing can be renamed without breaking old links.

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

export function propertySlug(p: {
  id: string;
  title: string;
  location: string;
}) {
  const words = slugify(`${p.title} ${p.location}`);
  return words ? `${words}-${p.id}` : p.id;
}

export function propertyHref(p: {
  id: string;
  title: string;
  location: string;
}) {
  return `/property/${propertySlug(p)}`;
}

/** Pull the id back out of a slug. Bare UUIDs still work, so old links live. */
export function idFromSlug(slug: string): string | null {
  const decoded = decodeURIComponent(slug);
  const match = decoded.match(UUID_RE);
  return match ? match[0] : null;
}
