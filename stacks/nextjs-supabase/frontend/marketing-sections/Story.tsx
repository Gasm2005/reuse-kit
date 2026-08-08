// A tan panel rather than a full-bleed dark band. Three dark sections stacked
// was most of what made this page feel heavy next to the reference, which is
// light the whole way down.
export default function Story() {
  return (
    <section className="bg-paper py-10 sm:py-14">
      <div className="container-page">
        <div className="surface-tan rounded-xl px-6 sm:px-14 py-20 sm:py-24 text-center max-w-4xl mx-auto">
          <div className="label text-brass flex items-center justify-center gap-3 mb-8">
            <span className="w-8 h-px bg-brass" />
            Our Approach
            <span className="w-8 h-px bg-brass" />
          </div>

          <h2 className="font-extrabold text-3xl sm:text-[2.75rem] leading-[1.15] tracking-tight text-ink mb-8">
            A city of real people, real deals, and one person you can actually
            call.
          </h2>

          <p className="text-ink-soft leading-relaxed">
            Lucknow is full of good properties and good deals — what&apos;s
            missing is someone accountable to walk you through it. No blasting
            your number to ten agents. No listings that vanished last month. No
            disappearing after you&apos;ve paid a token. Just one dedicated
            point of contact, from the first enquiry to the day you hold the
            keys — or hand them over.
          </p>
        </div>
      </div>
    </section>
  );
}
