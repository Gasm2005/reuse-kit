"use client";

import { useState } from "react";
import { IconPin } from "./Icons";
import { Button } from "./Button";
import { Field, TextInput, Select } from "./Field";

const SLOTS = [
  "Morning (10am – 1pm)",
  "Afternoon (1pm – 4pm)",
  "Evening (4pm – 7pm)",
];

// Site visits are where a listing turns into a deal, so the ask is right on
// the property page rather than behind a generic contact form. Kept to four
// fields — anything longer and people go back to WhatsApp.
export default function BookVisit({
  propertyId,
  propertyTitle,
  propertyLocation,
}: {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(SLOTS[0]);
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  // Visits can't be booked for a date that's already gone.
  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const maxDate = new Date(today.getTime() + 60 * 864e5)
    .toISOString()
    .slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, "").slice(-10))) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          propertyTitle: `${propertyTitle} — ${propertyLocation}`,
          name,
          mobile,
          preferredDate: date,
          preferredSlot: slot,
          notes,
          company,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not book the visit.");
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="surface-raised rounded-lg p-7 text-center">
        <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center mx-auto mb-5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-extrabold text-2xl mb-2.5">
          Visit requested
        </h3>
        <p className="text-ink-soft">
          We&apos;ll call you on {mobile} to confirm the time before the visit.
        </p>
      </div>
    );
  }

  return (
    <div className="surface rounded-xl p-7">
      <div className="flex items-center gap-2.5 mb-1.5">
        <IconPin className="w-[18px] h-[18px] text-brass" />
        <p className="label text-brass">Book a site visit</p>
      </div>
      <h3 className="font-extrabold text-2xl mb-6 leading-snug">
        See it in person.
      </h3>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Your name" htmlFor="bv-name">
          <TextInput
            id="bv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label="Mobile number" htmlFor="bv-mobile">
          <TextInput
            id="bv-mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            type="tel"
            inputMode="numeric"
            placeholder="10-digit number"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Preferred date" htmlFor="bv-date">
            <TextInput
              id="bv-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              type="date"
              min={minDate}
              max={maxDate}
            />
          </Field>

          <Field label="Time" htmlFor="bv-slot">
            <Select
              id="bv-slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              options={SLOTS}
            />
          </Field>
        </div>

        <Field label="Anything we should know (optional)" htmlFor="bv-notes">
          <TextInput
            id="bv-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={state === "sending"} className="w-full">
          {state === "sending" ? "Booking…" : "Request this visit"}
        </Button>

        <p className="text-xs text-ink-soft/80 text-center">
          No payment now — we confirm the slot by phone first.
        </p>
      </form>
    </div>
  );
}
