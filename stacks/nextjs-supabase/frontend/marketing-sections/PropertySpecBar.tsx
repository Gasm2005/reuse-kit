// The icon + value + label stat row from the reference (Rooms / Area / Floor
// sitting beside the price). Ours doesn't put a CTA in the same bar — the
// sidebar's booking form does that job — so this is just the facts, in a
// tan panel with hairline dividers between items.

export type SpecItem = {
  Icon: (props: { className?: string }) => React.ReactNode;
  value: string;
  label: string;
};

// Tailwind's scanner needs literal class strings, not `sm:grid-cols-${n}` —
// a template-interpolated class is invisible to it and would render unstyled.
const COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function PropertySpecBar({
  items,
  className = "",
}: {
  items: SpecItem[];
  className?: string;
}) {
  if (items.length === 0) return null;
  const cols = COLS[Math.min(items.length, 4)] ?? COLS[4];

  return (
    <div
      className={`surface-tan rounded-xl grid grid-cols-2 ${cols} divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-ink/10 ${className}`}
    >
      {items.map(({ Icon, value, label }) => (
        <div key={label} className="flex items-center gap-3.5 px-6 py-5">
          <Icon className="w-7 h-7 text-brass shrink-0" />
          <div>
            <div className="font-extrabold text-xl leading-tight">{value}</div>
            <div className="text-sm text-ink-soft">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
