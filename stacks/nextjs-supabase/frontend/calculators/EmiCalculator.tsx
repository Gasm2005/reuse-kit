"use client";

import { useMemo, useState } from "react";

const fmt = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

// Compact Indian notation — ₹1.25 Cr reads faster than ₹1,25,00,000 in a
// summary line.
function short(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
}

export default function EmiCalculator({ price }: { price: number }) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, principal, totalInterest, totalPayable } = useMemo(() => {
    const principal = Math.max(0, price - (price * downPct) / 100);
    const n = years * 12;
    const r = rate / 12 / 100;

    // A zero rate would divide by zero in the standard formula.
    const emi =
      r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);

    const totalPayable = emi * n;
    return {
      emi,
      principal,
      totalInterest: totalPayable - principal,
      totalPayable,
    };
  }, [price, downPct, rate, years]);

  if (!price || price <= 0) return null;

  return (
    <div className="surface rounded-xl p-7">
      <p className="label text-brass mb-1.5">Loan estimate</p>
      <h3 className="font-extrabold text-2xl mb-6 leading-snug">
        What this costs monthly.
      </h3>

      <div className="surface-tan rounded-lg px-6 py-5 mb-7">
        <p className="text-sm text-ink-soft mb-1">Estimated EMI</p>
        <p className="font-extrabold text-4xl text-ink leading-none">
          {fmt(emi)}
        </p>
        <p className="text-sm text-ink-soft mt-2">per month for {years} years</p>
      </div>

      <div className="space-y-6">
        <Slider
          label="Down payment"
          value={downPct}
          onChange={setDownPct}
          min={0}
          max={60}
          step={5}
          display={`${downPct}%  ·  ${short((price * downPct) / 100)}`}
        />
        <Slider
          label="Interest rate"
          value={rate}
          onChange={setRate}
          min={6}
          max={14}
          step={0.1}
          display={`${rate.toFixed(1)}% p.a.`}
        />
        <Slider
          label="Tenure"
          value={years}
          onChange={setYears}
          min={5}
          max={30}
          step={1}
          display={`${years} years`}
        />
      </div>

      <dl className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-ink/10">
        <Figure label="Loan amount" value={short(principal)} />
        <Figure label="Total interest" value={short(totalInterest)} />
        <Figure label="Total payable" value={short(totalPayable)} />
      </dl>

      <p className="text-xs text-ink-soft/75 mt-6 leading-relaxed">
        An estimate only. Your actual rate and eligibility depend on the bank,
        your credit history and income. We can put you in touch with lenders
        we&apos;ve worked with.
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-2.5">
        <label className="text-sm font-bold text-ink">{label}</label>
        <span className="text-sm text-ink-soft tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="emi-range w-full"
      />
      <style jsx>{`
        .emi-range {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--ink) 12%, transparent);
          outline: none;
        }
        .emi-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--ink);
          cursor: pointer;
          border: 3px solid var(--shell);
          box-shadow: var(--shadow-e1);
        }
        .emi-range::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--ink);
          cursor: pointer;
          border: 3px solid var(--shell);
        }
        .emi-range:focus-visible {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--brass) 40%, transparent);
        }
      `}</style>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label text-[0.625rem] text-ink-soft/70 mb-1.5">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}
