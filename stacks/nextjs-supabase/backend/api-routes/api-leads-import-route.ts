import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Generic inbound endpoint for anything that isn't the site's own enquiry
// form: 99acres, Housing.com, Facebook/Google Lead Ads (usually via Zapier
// or a native webhook — neither platform pushes to an arbitrary URL on its
// own without one of those in between), a referral partner, anything.
//
// Guarded by a static API key rather than a Supabase session, since an
// external portal can't log in as a team member. Uses the service-role
// client because there's no authenticated user for RLS to scope against —
// the API key check IS the authorization here.
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key");
  if (!key || key !== process.env.LEADS_IMPORT_API_KEY) {
    return NextResponse.json({ error: "Invalid or missing API key." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, mobile, email, city, service, budget, timeline, notes, source } = body;

    if (!name || !mobile) {
      return NextResponse.json(
        { error: "name and mobile are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("leads")
      .insert({
        name,
        mobile,
        email: email || null,
        city: city || null,
        service: service || null,
        budget: budget || null,
        timeline: timeline || null,
        notes: notes || null,
        source: source || "External",
      })
      .select()
      .single();

    if (error) {
      console.error("Lead import error:", error);
      return NextResponse.json({ error: "Failed to save lead." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Lead import error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
