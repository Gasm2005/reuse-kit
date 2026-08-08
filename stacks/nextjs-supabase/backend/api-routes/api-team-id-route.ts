import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Removing a team member deletes the actual Auth account, not just the
// roster row — team_members.id references auth.users.id with
// on delete cascade, so removing the account takes the row with it. A
// removed employee should genuinely lose access, not just disappear from a
// list while their login still works.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Only the owner can remove team members." },
        { status: 403 }
      );
    }

    if (id === user.id) {
      return NextResponse.json(
        { error: "You can't remove your own account from here." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Team remove error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
