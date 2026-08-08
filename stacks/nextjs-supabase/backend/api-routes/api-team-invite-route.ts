import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";

// Creates a real Supabase Auth account for a team member (or, for an
// existing one, refreshes their access) and returns a link the owner
// copies and sends however they want — WhatsApp, email, anything.
//
// Deliberately never calls inviteUserByEmail or resetPasswordForEmail —
// both trigger Supabase's own mail sending, which sits behind a low rate
// limit on the default/shared mailer. During testing today that limit got
// hit after a handful of invites. generateLink creates the same account
// and the same valid link WITHOUT sending anything, so repeated
// create/delete/resend cycles can't exhaust a mail quota that was never
// used in the first place. Nobody's password, including the owner's, ever
// passes through this code.
export async function POST(req: NextRequest) {
  try {
    // Verify against the CALLER'S OWN session, never anything the request
    // body claims. Anyone can put "roleId": "<owner's role>" in a POST body;
    // only a real session tied to an owner-role team_members row gets past
    // this.
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const { data: isOwner } = await supabase.rpc("is_owner");
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the owner can add team members." },
        { status: 403 }
      );
    }

    const { email, name, phone, roleId } = await req.json();

    if (!email || !name || !roleId) {
      return NextResponse.json(
        { error: "Name, email, and department are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    // Not req.nextUrl.origin — that's whatever machine happened to make this
    // request. Send the invite from a local dev server and the recipient
    // gets a link to your laptop instead of the real site.
    const redirectTo = `${SITE_URL}/admin/accept-invite`;

    const { data: invite, error: inviteError } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { data: { name }, redirectTo },
    });

    let userId: string | null = null;
    let resent = false;

    if (invite?.user) {
      userId = invite.user.id;

      // team_members.id references auth.users.id directly, so this row can
      // exist immediately — the person shows up on the roster right away,
      // before they've done anything with the link.
      const { error: rowError } = await supabase.from("team_members").insert({
        id: userId,
        role_id: roleId,
        name,
        phone: phone || null,
        email,
      });

      if (rowError) {
        // The auth account now exists but isn't a team member — clean it up
        // rather than leaving an orphaned login nobody can see or manage.
        await admin.auth.admin.deleteUser(userId);
        return NextResponse.json({ error: rowError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        resent: false,
        link: invite.properties.action_link,
      });
    }

    // The common retry/resend case: this email already has an auth
    // account — from a previous invite, or from clicking "Resend" on the
    // roster. generateLink's "invite" type refuses a second time for an
    // existing account; "recovery" works regardless of confirmation state,
    // and lands on the same /admin/accept-invite page either way, since
    // that page just calls updateUser({ password }).
    if (inviteError?.message.includes("already been registered")) {
      const { data: existing } = await admin.auth.admin.listUsers();
      const existingUser = existing?.users.find((u) => u.email === email);

      if (!existingUser) {
        return NextResponse.json(
          { error: "Could not find that existing account." },
          { status: 500 }
        );
      }
      userId = existingUser.id;
      resent = true;

      const { error: upsertError } = await supabase
        .from("team_members")
        .upsert({ id: userId, role_id: roleId, name, phone: phone || null, email });

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }

      const { data: recovery, error: recoveryError } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });

      if (recoveryError) {
        return NextResponse.json({ error: recoveryError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        resent,
        link: recovery.properties.action_link,
      });
    }

    return NextResponse.json(
      { error: inviteError?.message || "Could not create the invite." },
      { status: 400 }
    );
  } catch (err) {
    console.error("Team invite error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
