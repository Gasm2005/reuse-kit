"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SALE_BUDGETS, RENT_BUDGETS } from "@/lib/price";
import { Field, TextInput, Select } from "./Field";
import { Button } from "./Button";

const TYPES = ["Any type", "Flat", "Villa", "Plot", "Rent", "Interior"];
const BEDS = ["Any", "1", "2", "3", "4", "5"];

// Rent was already one of the property types, so a separate Buy/Rent toggle
// was a second control saying the same thing — picking "Rent" up top and
// "Flat" below it was a contradiction the form couldn't answer. One type
// dropdown, and the budget brackets follow it.
export default function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState(TYPES[0]);
  const [where, setWhere] = useState("");
  const [beds, setBeds] = useState(BEDS[0]);
  const [budget, setBudget] = useState(0);

  const isRent = type === "Rent";
  const budgets = isRent ? RENT_BUDGETS : SALE_BUDGETS;

  function selectType(t: string) {
    setType(t);
    setBudget(0); // monthly rent and sale price aren't the same scale
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type !== TYPES[0]) params.set("type", type);
    if (where.trim()) params.set("q", where.trim());
    if (beds !== BEDS[0]) params.set("beds", beds);
    if (budget > 0) params.set("budget", String(budget));
    router.push(`/listings${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="surface-tan rounded-xl p-4 sm:p-5 grid gap-4
                 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.1fr)_auto]
                 lg:items-end"
    >
      <Field label="Locality" htmlFor="hs-where">
        <TextInput
          id="hs-where"
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="Gomti Nagar, Sushant Golf City…"
          aria-label="Locality or area"
        />
      </Field>

      <Field label="Type" htmlFor="hs-type">
        <Select
          id="hs-type"
          value={type}
          onChange={(e) => selectType(e.target.value)}
          options={TYPES}
          aria-label="Property type"
        />
      </Field>

      <Field label="Bedrooms" htmlFor="hs-beds">
        <Select
          id="hs-beds"
          value={beds}
          onChange={(e) => setBeds(e.target.value)}
          options={BEDS.map((b) => ({
            value: b,
            label: b === "Any" ? "Any" : `${b} BHK`,
          }))}
          aria-label="Bedrooms"
        />
      </Field>

      <Field label={isRent ? "Monthly rent" : "Budget"} htmlFor="hs-budget">
        <Select
          id="hs-budget"
          value={String(budget)}
          onChange={(e) => setBudget(Number(e.target.value))}
          options={budgets.map((b, i) => ({ value: String(i), label: b.label }))}
          aria-label="Budget"
        />
      </Field>

      <Button type="submit" className="w-full lg:w-auto">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:scale-110"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        Search
      </Button>
    </form>
  );
}
