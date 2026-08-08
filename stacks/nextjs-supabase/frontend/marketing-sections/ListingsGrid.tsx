"use client";

import { useState, useMemo } from "react";
import type { Property } from "@/lib/types";
import PropertyCard from "./PropertyCard";
import Reveal from "./Reveal";
import { Button } from "./Button";
import { Field, TextInput, Select, Pill } from "./Field";
import { SALE_BUDGETS, RENT_BUDGETS, budgetMatches, parsePrice } from "@/lib/price";

const TYPE_TABS = ["All", "Flat", "Villa", "Plot", "Rent", "Interior"];
const SORTS = ["Newest", "Price: low to high", "Price: high to low"] as const;
type Sort = (typeof SORTS)[number];

export default function ListingsGrid({
  properties,
  initialType,
  initialKeyword,
  initialBeds,
  initialBudget,
}: {
  properties: Property[];
  initialType?: string;
  initialKeyword?: string;
  initialBeds?: string;
  initialBudget?: number;
}) {
  const [keyword, setKeyword] = useState(initialKeyword ?? "");
  const [activeType, setActiveType] = useState(initialType || "All");
  const [bedrooms, setBedrooms] = useState(initialBeds || "Any");
  const [budgetIdx, setBudgetIdx] = useState(initialBudget ?? 0);
  const [sort, setSort] = useState<Sort>(SORTS[0]);

  // Rent is priced per month, everything else is a sale price, so the two
  // need different brackets.
  const budgets = activeType === "Rent" ? RENT_BUDGETS : SALE_BUDGETS;
  const budget = budgets[Math.min(budgetIdx, budgets.length - 1)];

  function selectType(t: string) {
    setActiveType(t);
    setBudgetIdx(0); // sale and rent brackets aren't interchangeable
  }

  function clearAll() {
    setActiveType("All");
    setBedrooms("Any");
    setKeyword("");
    setBudgetIdx(0);
  }

  const filtered = useMemo(() => {
    const rows = properties.filter((p) => {
      if (activeType !== "All" && p.property_type !== activeType) return false;
      if (bedrooms !== "Any" && p.bedrooms !== bedrooms) return false;
      if (!budgetMatches(p.price, "min" in budget ? budget.min : null, budget.max))
        return false;
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        const haystack = `${p.title} ${p.location}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sort === "Newest") return rows;

    // Rows with an unparseable price sink to the bottom rather than sorting
    // as if they were free.
    return [...rows].sort((a, b) => {
      const x = parsePrice(a.price);
      const y = parsePrice(b.price);
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      return sort === "Price: low to high" ? x - y : y - x;
    });
  }, [properties, activeType, bedrooms, keyword, budget, sort]);

  const activeFilters =
    (activeType !== "All" ? 1 : 0) +
    (bedrooms !== "Any" ? 1 : 0) +
    (budgetIdx > 0 ? 1 : 0) +
    (keyword.trim() ? 1 : 0);

  return (
    <div>
      <div className="mb-12 space-y-5">
        <div className="flex gap-2.5 flex-wrap">
          {TYPE_TABS.map((t) => (
            <Pill key={t} active={activeType === t} onClick={() => selectType(t)}>
              {t}
            </Pill>
          ))}
        </div>

        {/* Same tan panel and the same fields as the homepage search — one
            control set, so the two can't drift apart. */}
        <div className="surface-tan rounded-xl p-4 sm:p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]">
          <Field label="Search" htmlFor="lg-search">
            <TextInput
              id="lg-search"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Title or location…"
            />
          </Field>

          <Field label="Bedrooms" htmlFor="lg-beds">
            <Select
              id="lg-beds"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              aria-label="Bedrooms"
              options={["Any", "1", "2", "3", "4", "5"].map((b) => ({
                value: b,
                label: b === "Any" ? "Any" : `${b} BHK`,
              }))}
            />
          </Field>

          <Field
            label={activeType === "Rent" ? "Monthly rent" : "Budget"}
            htmlFor="lg-budget"
          >
            <Select
              id="lg-budget"
              value={String(budgetIdx)}
              onChange={(e) => setBudgetIdx(Number(e.target.value))}
              aria-label="Budget"
              options={budgets.map((b, i) => ({
                value: String(i),
                label: b.label,
              }))}
            />
          </Field>

          <Field label="Sort by" htmlFor="lg-sort">
            <Select
              id="lg-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort by"
              options={SORTS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <p className="text-sm text-ink-soft">
            {filtered.length}{" "}
            {filtered.length === 1 ? "property" : "properties"}
            {activeFilters > 0 && " matching your filters"}
          </p>
          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-brass hover:text-brass-bright transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface rounded-lg p-12 text-center">
          <p className="font-extrabold text-2xl mb-3">Nothing matches that yet.</p>
          <p className="text-ink-soft mb-6 max-w-md mx-auto">
            Try widening the budget or clearing a filter — or tell us what
            you&apos;re after and we&apos;ll go looking for it.
          </p>
          <Button onClick={clearAll}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 70}>
              <PropertyCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

