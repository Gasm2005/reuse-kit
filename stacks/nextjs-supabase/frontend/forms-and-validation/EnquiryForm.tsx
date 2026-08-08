"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Field, TextInput, Select, Textarea } from "./Field";

const initialState = {
  name: "",
  mobile: "",
  service: "",
  city: "",
  budget: "",
  timeline: "",
  notes: "",
  company: "", // honeypot — real users never fill this; bots often do
};

const SERVICES = [
  "Buy Property",
  "Sell Property",
  "Rent Property (Looking to Rent)",
  "List Property for Rent",
  "Buy Plot",
  "Interior Design",
  "Real Estate Consultation",
];

const BUDGETS = [
  "Below ₹25L",
  "₹25L – ₹75L",
  "₹75L – ₹1.5Cr",
  "Above ₹1.5Cr",
  "Below ₹3L (interior)",
  "₹3L – ₹8L (interior)",
  "₹8L – ₹15L (interior)",
  "Above ₹15L (interior)",
];

const TIMELINES = [
  "Immediately",
  "Within 30 days",
  "Within 3 months",
  "Just exploring",
];

export default function EnquiryForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );

  useEffect(() => {
    const preselected = sessionStorage.getItem("beig_intent_service");
    const preNotes = sessionStorage.getItem("beig_intent_notes");
    if (preselected || preNotes) {
      setForm((f) => ({
        ...f,
        service: preselected || f.service,
        notes: preNotes || f.notes,
      }));
      sessionStorage.removeItem("beig_intent_notes");
    }
  }, []);

  function update<K extends keyof typeof initialState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check — if this hidden field is filled, silently pretend
    // success without hitting the API (it's very likely a bot).
    if (form.company) {
      setStatus("done");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("done");
      setForm(initialState);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="surface-tan rounded-xl p-8 text-center">
        <p className="font-extrabold text-2xl mb-2">Thank you!</p>
        <p className="text-ink-soft">
          Your requirement has been received. We&apos;ll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from real users, present in the DOM for bots. */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" htmlFor="name">
          <TextInput
            required
            id="name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field label="Mobile number" htmlFor="mobile">
          <TextInput
            required
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            placeholder="10-digit number"
          />
        </Field>
      </div>

      <Field label="What are you looking for?" htmlFor="service">
        <Select
          required
          id="service"
          name="service"
          value={form.service}
          onChange={(e) => update("service", e.target.value)}
          placeholder="Choose an option"
          options={SERVICES}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="City / locality" htmlFor="city">
          <TextInput
            required
            id="city"
            name="city"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Gomti Nagar, Hazratganj…"
          />
        </Field>

        <Field label="Budget range" htmlFor="budget">
          <Select
            required
            id="budget"
            name="budget"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            placeholder="Choose a range"
            options={BUDGETS}
          />
        </Field>
      </div>

      <Field label="When do you plan to proceed?" htmlFor="timeline">
        <Select
          required
          id="timeline"
          name="timeline"
          value={form.timeline}
          onChange={(e) => update("timeline", e.target.value)}
          placeholder="Choose a timeline"
          options={TIMELINES}
        />
      </Field>

      <Field label="Anything else? (optional)" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Floor preference, parking, possession date…"
        />
      </Field>

      {status === "error" && (
        <p className="text-sm text-danger">
          Something went wrong submitting your requirement. Please try again or
          reach out on WhatsApp directly.
        </p>
      )}

      <Button
        type="submit"
        variant="secondary"
        disabled={status === "submitting"}
        className="w-full mt-2"
        arrow={status !== "submitting"}
      >
        {status === "submitting" ? "Submitting…" : "Submit requirement"}
      </Button>
    </form>
  );
}
