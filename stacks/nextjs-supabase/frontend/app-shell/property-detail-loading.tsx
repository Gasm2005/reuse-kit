import Navbar from "@/components/Navbar";
import { Bar, Block } from "@/components/Skeleton";

// Shown the instant a property link is clicked, instead of the browser
// sitting on the previous page while the server works. Mirrors the real
// layout closely enough that nothing shifts when the content lands.
export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="py-10 sm:py-14 bg-shell">
        <div className="container-page">
          <Bar className="h-4 w-72 mb-8" />

          <Block className="h-[340px] sm:h-[440px]" />
          <div className="flex gap-3 mt-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Block key={i} className="w-20 h-16 shrink-0" />
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-14 mt-12">
            <div>
              <Bar className="h-4 w-40 mb-5" />
              <Bar className="h-12 w-4/5 mb-4" />
              <Bar className="h-5 w-1/3 mb-9" />
              <Bar className="h-10 w-52 mb-10" />

              <div className="surface rounded-lg p-7 grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <Bar className="h-3 w-16" />
                    <Bar className="h-5 w-24" />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-2/3" />
              </div>
            </div>

            <div className="space-y-5">
              <Block className="h-[420px]" />
              <Block className="h-[220px]" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
