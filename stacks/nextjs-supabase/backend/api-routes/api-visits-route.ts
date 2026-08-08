import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { SITE } from "@/lib/site";

// Keeps user-supplied text from breaking out of the notification email.
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyId,
      propertyTitle,
      name,
      mobile,
      preferredDate,
      preferredSlot,
      notes,
      company,
    } = body;

    // Honeypot — pretend success without writing anything.
    if (company) return NextResponse.json({ success: true });

    if (!propertyTitle || !name || !mobile || !preferredDate || !preferredSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const digits = String(mobile).replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Don't accept bookings in the past or absurdly far out.
    const when = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today.getTime() + 90 * 864e5);
    if (Number.isNaN(when.getTime()) || when < today || when > limit) {
      return NextResponse.json(
        { error: "Pick a date within the next three months." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: insertError } = await supabase.from("visits").insert({
      property_id: propertyId || null,
      property_title: propertyTitle,
      name,
      mobile: digits,
      preferred_date: preferredDate,
      preferred_slot: preferredSlot,
      notes: notes || null,
    });

    if (insertError) {
      console.error("Visit insert error:", insertError);
      return NextResponse.json(
        { error: "Could not save the booking. Please call us instead." },
        { status: 500 }
      );
    }

    // A booking nobody sees is worse than no booking, but a mail failure
    // shouldn't lose one that's already saved.
    let emailSent = false;
    try {
      if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
          from: "Beig Estates <onboarding@resend.dev>",
          to: process.env.NOTIFY_EMAIL,
          subject: `Site visit: ${name} — ${propertyTitle}`,
          html: `
            <h2>New site visit request</h2>
            <p><strong>Property:</strong> ${esc(propertyTitle)}</p>
            <p><strong>Name:</strong> ${esc(name)}</p>
            <p><strong>Mobile:</strong> ${esc(digits)}</p>
            <p><strong>Date:</strong> ${esc(preferredDate)}</p>
            <p><strong>Slot:</strong> ${esc(preferredSlot)}</p>
            ${notes ? `<p><strong>Notes:</strong> ${esc(notes)}</p>` : ""}
            <hr />
            <p><a href="https://wa.me/91${digits}">Message on WhatsApp</a> ·
               <a href="tel:+91${digits}">Call</a></p>
            <p style="color:#6E6045">Sent from ${esc(SITE.name)}</p>
          `,
        });
        emailSent = !result.error;
      }
    } catch (err) {
      console.error("Visit email error:", err);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    console.error("Visit booking error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
