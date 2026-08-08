// One form control set for the whole site.
//
// There were five of these: Field in EnquiryForm, a different Field in
// HeroSearch, FilterField in ListingsGrid, Input in BookVisit and
// LabeledInput in PropertiesManager — each with its own label size, border
// and padding. Same job, five looks. Everything imports from here now.

import React from "react";

const control =
  "w-full rounded-lg border-[1.5px] border-ink/12 bg-paper/55 px-4 py-3.5 " +
  "text-base text-ink outline-none transition-colors duration-200 " +
  "placeholder:text-ink-soft/50 hover:border-ink/25 " +
  "focus:border-brass focus:bg-shell " +
  "disabled:opacity-55 disabled:pointer-events-none";

export function Field({
  label,
  htmlFor,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-bold text-ink mb-2"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft/75 mt-1.5">{hint}</p>}
    </div>
  );
}

export function TextInput({
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${control} ${className}`} />;
}

export function Textarea({
  className = "",
  rows = 3,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...rest} rows={rows} className={`${control} resize-none ${className}`} />
  );
}

export type Option = { value: string; label: string };

export function Select({
  options,
  placeholder,
  className = "",
  ...rest
}: {
  // readonly so an `as const` tuple (LEAD_STAGES, LEAD_TAGS) can be passed
  // directly instead of needing a spread at every call site.
  options: readonly (Option | string)[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const items: Option[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  return (
    <div className="relative min-w-0">
      <select
        {...rest}
        // pr-10 keeps the value clear of the chevron; appearance-none drops
        // the OS arrow so every browser shows the same control.
        className={`${control} appearance-none cursor-pointer truncate pr-10 ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

/** Filter tab — the rounded pills above the listings grid. */
export function Pill({
  active,
  className = "",
  children,
  ...rest
}: {
  active?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...rest}
      className={`px-6 py-3 rounded-full font-bold border-[1.5px] transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass
        focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
          active
            ? "bg-ink text-paper border-ink"
            : "bg-shell border-ink/15 text-ink-soft hover:border-ink hover:text-ink"
        } ${className}`}
    >
      {children}
    </button>
  );
}

/** Label-over-value pair, used in spec grids and lead cards. */
export function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="label text-[0.625rem] text-ink-soft/70 mb-1.5">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
