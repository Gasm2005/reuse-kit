import Navbar from "@/components/Navbar";
import { Bar, PropertyGridSkeleton } from "@/components/Skeleton";

// Mirrors the real page: no header block anymore, straight into the
// filter bar and grid.
export default function Loading() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-16 sm:py-20 bg-shell">
          <div className="container-page">
            <div className="mb-12 space-y-5">
              {/* Widths roughly track the real tab labels so the row doesn't
                  visibly resize when the filters mount. */}
              <div className="flex gap-2.5 flex-wrap">
                {["w-16", "w-20", "w-20", "w-16", "w-20", "w-24"].map((w, i) => (
                  <Bar key={i} className={`h-11 rounded-full ${w}`} />
                ))}
              </div>
              <Bar className="h-11 w-full max-w-xl" />
            </div>
            <PropertyGridSkeleton count={6} />
          </div>
        </section>
      </main>
    </>
  );
}
