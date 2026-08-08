// Shared skeleton primitives. Shapes deliberately match the real layout's
// dimensions — a skeleton that's a different size than what replaces it makes
// the page jump, which feels worse than no skeleton at all.

export function Bar({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

/** Matches PropertyCard: 300px image, then title / location / specs lines. */
export function PropertyCardSkeleton() {
  return (
    <div>
      <Block className="h-[300px]" />
      <div className="pt-5 space-y-3">
        <Bar className="h-5 w-3/4" />
        <Bar className="h-4 w-1/2" />
        <Bar className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
