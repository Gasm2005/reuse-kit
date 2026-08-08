import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, mobile, service, city, budget, timeline, notes, company } = body;

    // Honeypot — real users never fill this hidden field. If it's filled,
    // pretend success without touching the database or sending email.
    if (company) {
      return NextResponse.json({ success: true, emailSent: false });
    }

    if (!name || !mobile || !service || !city || !budget || !timeline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert lead into Supabase (anonymous insert — allowed by RLS policy)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: insertError } = await supabase.from("leads").insert({
      name,
      mobile,
      service,
      city,
      budget,
      timeline,
      notes: notes || null,
      source: "Website",
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Send email notification — failure here should never block the lead
    // from being saved, so it's wrapped separately.
    let emailSent = false;
    let emailError: string | null = null;
    try {
      if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
          from: "Beig Estates <onboarding@resend.dev>",
          to: process.env.NOTIFY_EMAIL,
          subject: `New Lead: ${name} — ${service}`,
          html: `
            <h2>New Enquiry — Beig Estates</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Timeline:</strong> ${timeline}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
            <hr />
            <p><a href="https://wa.me/91${mobile}">Message on WhatsApp</a></p>
          `,
        });
        if (result.error) {
          emailError = JSON.stringify(result.error);
        } else {
          emailSent = true;
        }
      } else {
        emailError = "Missing RESEND_API_KEY or NOTIFY_EMAIL env var";
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
    }

    return NextResponse.json({ success: true, emailSent, emailError });
  } catch (err) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
