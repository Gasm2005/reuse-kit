// Used to also export a default ProblemSolution section — a "typical
// search vs. us" comparison table with a red/green X and checkmark list.
// It was only ever rendered on /about, and read as a landing-page pitch
// rather than company information, so it's gone from that page. SectionLabel
// is still used by most of the site's sections, so it stays.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="label text-brass mb-4 flex items-center gap-2.5">
      <span className="w-[18px] h-px bg-brass" />
      {children}
    </div>
  );
}
