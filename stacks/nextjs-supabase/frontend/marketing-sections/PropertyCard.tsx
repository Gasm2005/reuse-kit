import Link from "next/link";
import Image from "next/image";
import type { Property } from "@/lib/types";
import { propertyHref } from "@/lib/slug";

export default function PropertyCard({ p }: { p: Property }) {
  const cover = p.images && p.images.length > 0 ? p.images[0] : p.image_url;
  const specs = [
    p.area,
    p.bedrooms && `${p.bedrooms} Bed`,
    p.bathrooms && `${p.bathrooms} Bath`,
  ].filter(Boolean);

  return (
    <Link href={propertyHref(p)} className="group block">
      <div className="h-[300px] relative bg-paper-dim overflow-hidden rounded-md shadow-e2 transition-shadow duration-500 group-hover:shadow-e4">
        {cover && (
          <Image
            src={cover}
            alt={`${p.title} in ${p.location} — ${p.price}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,17,11,0.88)_0%,rgba(20,17,11,0.18)_45%,transparent_70%)]" />

        <span className="absolute top-4 left-4 label text-[0.6875rem] bg-paper/95 text-ink px-3 py-1.5 rounded">
          {p.property_type}
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="font-extrabold text-2xl text-paper mb-1">
            {p.price}
          </div>
          <div className="text-sm text-paper/70">{p.status}</div>
        </div>
      </div>

      <div className="pt-5">
        <h3 className="font-semibold text-lg leading-snug mb-1.5 transition-colors duration-300 group-hover:text-brass">
          {p.title}
        </h3>
        <p className="text-sm text-ink-soft mb-3">{p.location}</p>
        {specs.length > 0 && (
          <p className="text-sm text-ink-soft">{specs.join("  ·  ")}</p>
        )}
        {/* Looks and behaves like a button, but it's a span — the whole card
            is already the link, and nesting an <a> inside an <a> is invalid. */}
        <span className="mt-5 inline-flex items-center justify-center gap-2.5 w-full px-6 py-3 rounded-md border-[1.5px] border-ink/30 text-sm font-semibold transition-all duration-300 group-hover:border-brass group-hover:text-brass group-hover:bg-brass/5">
          View property
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
