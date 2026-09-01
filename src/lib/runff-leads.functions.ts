import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(120),
});

const ADMIN_USER = "runff";
const ADMIN_PASSWORD = "Unifast";

export type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  whatsapp: string;
  city: string;
  state: string;
  social_profile: string;
  follower_range: string | null;
  running_connection: string;
  event_interest: string | null;
  motivation: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  landing_variant: string | null;
};

export const listRunffLeads = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => credentialsSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; leads: LeadRow[]; error?: string }> => {
    if (data.username !== ADMIN_USER || data.password !== ADMIN_PASSWORD) {
      return { ok: false, leads: [], error: "Usuário ou senha inválidos." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("creators_leads")
      .select(
        "id,created_at,name,whatsapp,city,state,social_profile,follower_range,running_connection,event_interest,motivation,utm_source,utm_campaign,landing_variant",
      )
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("[runff-leads]", error.message);
      return { ok: false, leads: [], error: "Não foi possível carregar os cadastros." };
    }

    return { ok: true, leads: (rows ?? []) as LeadRow[] };
  });
