import { supabase } from "@/integrations/supabase/client";

// ─── LEADS (admin-side read/update) ────────────────────────────
// Public submission happens via the server function in leads.server.ts
// (service_role). These admin helpers use the normal client — the admin
// is authenticated, and the `leads` table's "Admin full access" RLS
// policy (is_admin_user) permits read/update for them.

export type LeadStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "negotiating"
  | "confirmed"
  | "in-production"
  | "delivered"
  | "closed-won"
  | "closed-lost";

export interface Lead {
  id: string;
  lead_number: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  location: string | null;
  requirement: string | null;
  budget_range: string | null;
  category_id: string | null;
  size: string | null;
  needed_by: string | null;
  source: string | null;
  source_detail: string | null;
  status: LeadStatus;
  notes: string | null;
  photo_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export async function getAllLeads(opts?: { status?: LeadStatus; limit?: number }): Promise<Lead[]> {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  // `unknown` bridge: photo_urls (Task 0C) isn't in the generated Row type
  // until types are regenerated after its additive migration.
  return (data ?? []) as unknown as Lead[];
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({
      status,
      status_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);
  if (error) throw error;
}
