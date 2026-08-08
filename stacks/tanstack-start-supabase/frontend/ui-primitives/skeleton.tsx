import { cn } from "@/lib/utils";

// Base skeleton with warm cream pulse — matches Artspire's paper/parchment feel
function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#E8E0D5]", className)}
      style={style}
      {...props}
    />
  );
}

// Artwork card skeleton — matches the portfolio grid card layout
function ArtworkCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden bg-white border border-border/40 shadow-sm",
        className,
      )}
    >
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Portfolio grid skeleton — 3-column grid of artwork cards
function PortfolioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ArtworkCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Artwork detail page skeleton — matches the real page layout exactly to prevent shift
function ArtworkDetailSkeleton() {
  return (
    <div className="container-main py-8 md:py-14">
      {/* Breadcrumb */}
      <Skeleton className="h-3 w-64 mb-8" />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
        {/* Left: image placeholder — same aspect ratio as real image area */}
        <div className="w-full lg:w-1/2">
          <Skeleton
            className="w-full rounded-2xl"
            style={{ aspectRatio: "3/4", maxHeight: "85vh" }}
          />
        </div>

        {/* Right: content */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {/* Category badge */}
          <Skeleton className="h-6 w-28 rounded-full" />
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-3/4" />
          </div>
          {/* Story */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* Details card */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
          {/* CTAs */}
          <Skeleton className="h-[54px] w-full rounded-xl" />
          <Skeleton className="h-[48px] w-full rounded-xl" />
          {/* Trust note */}
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Category card skeleton
function CategoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl overflow-hidden aspect-[4/3] relative", className)}>
      <Skeleton className="absolute inset-0 rounded-xl" />
    </div>
  );
}

// Admin table skeleton
function AdminTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div
        className="grid gap-4 px-5 py-3 border-b border-border bg-cream/50"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-4 px-5 py-4 border-b border-border/50 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton key={col} className="h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Form skeleton
function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-[44px] w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-[44px] w-36 rounded-xl mt-2" />
    </div>
  );
}

// SEO / admin section skeleton
function AdminSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-sm">
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
}

export {
  Skeleton,
  ArtworkCardSkeleton,
  PortfolioGridSkeleton,
  ArtworkDetailSkeleton,
  CategoryCardSkeleton,
  AdminTableSkeleton,
  FormSkeleton,
  AdminSectionSkeleton,
};
