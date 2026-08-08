import type { Property } from "./types";
import { propertyHref } from "./slug";

// Kept out of HeroShowcase.tsx: that file is "use client", and a function
// exported from a client module can't be called during server rendering.

export type Slide = {
  id: string;
  href: string;
  image: string;
  title: string;
  location: string;
  price: string;
  type: string;
};

/** Null when a listing has no photo — it can't carry a full-bleed hero. */
export function toSlide(p: Property): Slide | null {
  const image = p.images?.[0] ?? p.image_url;
  if (!image) return null;

  return {
    id: p.id,
    href: propertyHref(p),
    image,
    title: p.title,
    location: p.location,
    price: p.price,
    type: p.property_type,
  };
}
