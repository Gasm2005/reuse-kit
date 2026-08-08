import { getProperties } from "@/lib/properties";
import ListingsGrid from "./ListingsGrid";

// No page-title block above this anymore — it was breadcrumb + "Property
// listings in Lucknow" sitting on its own before a visitor reached anything
// useful. Navbar leads straight into the grid and its filters.
export default async function Listings({
  filterType,
  initialKeyword,
  initialBeds,
  initialBudget,
}: {
  filterType?: string;
  initialKeyword?: string;
  initialBeds?: string;
  initialBudget?: number;
}) {
  const properties = await getProperties();

  return (
    <section id="listings" className="py-16 sm:py-20 bg-shell">
      <div className="container-page">
        {properties.length === 0 ? (
          <div className="surface rounded-lg p-12 text-center">
            <p className="font-extrabold text-2xl mb-3">No listings up yet.</p>
            <p className="text-ink-soft max-w-md mx-auto">
              We&apos;re adding properties as they come in. Tell us what
              you&apos;re looking for and we&apos;ll get in touch when
              something fits.
            </p>
          </div>
        ) : (
          <ListingsGrid
            properties={properties}
            initialType={filterType}
            initialKeyword={initialKeyword}
            initialBeds={initialBeds}
            initialBudget={initialBudget}
          />
        )}
      </div>
    </section>
  );
}
