import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(8).max(40),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(2),
  social_profile: z.string().trim().min(2).max(120),
  follower_range: z.string().trim().max(60).nullable().optional(),
  running_connection: z.string().trim().min(2).max(120),
  event_interest: z.string().trim().max(200).nullable().optional(),
  motivation: z.string().trim().max(300).nullable().optional(),
  consent: z.literal(true),
  utm_source: z.string().trim().max(120).nullable().optional(),
  utm_medium: z.string().trim().max(120).nullable().optional(),
  utm_campaign: z.string().trim().max(120).nullable().optional(),
  utm_content: z.string().trim().max(120).nullable().optional(),
  landing_variant: z.string().trim().max(120).nullable().optional(),
});

export const Route = createFileRoute("/api/public/runff-lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Payload inválido." }, { status: 400 });
        }

        const parsed = leadSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Confira os campos obrigatórios e tente de novo." },
            { status: 400 },
          );
        }

        const d = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("creators_leads").insert({
          name: d.name,
          whatsapp: d.whatsapp,
          city: d.city,
          state: d.state.toUpperCase(),
          social_profile: d.social_profile,
          follower_range: d.follower_range ?? null,
          running_connection: d.running_connection,
          event_interest: d.event_interest ?? null,
          motivation: d.motivation ?? null,
          consent: d.consent,
          utm_source: d.utm_source ?? null,
          utm_medium: d.utm_medium ?? null,
          utm_campaign: d.utm_campaign ?? null,
          utm_content: d.utm_content ?? null,
          landing_variant: d.landing_variant ?? null,
        });


        if (error) {
          console.error("[runff-lead]", error.message);
          return Response.json(
            { ok: false, error: "Não foi possível enviar agora. Tente novamente." },
            { status: 500 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
