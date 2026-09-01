import { createFileRoute } from "@tanstack/react-router";

const SOURCE_URL = "https://runff.com.br/";
const CACHE_HOURS = 2;

const MONTHS: Record<string, number> = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
};

type ScrapedEvent = {
  source_id: string;
  title: string;
  event_date: string | null;
  day_label: string | null;
  month_label: string | null;
  city: string | null;
  state: string | null;
  organizer: string | null;
  modality: string[];
  image_url: string | null;
  event_url: string | null;
  status: string | null;
};

function decode(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function guessModality(title: string): string[] {
  const t = title.toLowerCase();
  const out: string[] = [];
  if (t.includes("trail")) out.push("Trail");
  if (t.includes("kids") || t.includes("infantil")) out.push("Kids");
  if (t.includes("ciclis") || t.includes("bike") || t.includes("pedal")) out.push("Ciclismo");
  if (t.includes("triathlon") || t.includes("duathlon")) out.push("Multisport");
  if (t.includes("caminhada")) out.push("Caminhada");
  if (out.length === 0) out.push("Corrida");
  return out;
}

function toIsoDate(day: string | null, month: string | null): string | null {
  if (!day || !month) return null;
  const m = MONTHS[month.slice(0, 3).toLowerCase()];
  const d = Number(day);
  if (!m || !d) return null;
  const now = new Date();
  let year = now.getUTCFullYear();
  // The calendar only shows day + month; assume the next occurrence.
  if (m < now.getUTCMonth() + 1 - 1) year += 1;
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function scrape(html: string): ScrapedEvent[] {
  const blocks = html.split("cadaEvento").slice(1);
  const seen = new Set<string>();
  const events: ScrapedEvent[] = [];

  for (const raw of blocks) {
    const block = raw.slice(0, 8000);
    const idMatch = block.match(/runff\.com\.br\/evento\/(\d+)/);
    if (!idMatch) continue;
    const sourceId = idMatch[1]!;
    if (seen.has(sourceId)) continue;

    const titleMatch = block.match(/class="text-wrapper-20 event-title"[^>]*title="([^"]+)"/);
    if (!titleMatch) continue;

    const imgMatch = block.match(/class="capaEvento"\s+src="([^"]+)"/);
    const statusMatch = block.match(/class="text-wrapper-17"[^>]*>([^<]+)</);
    const dayMatch = block.match(/class="text-wrapper-18"[^>]*>\s*([0-9]{1,2})\s*</);
    const monthMatch = block.match(/class="text-wrapper-19"[^>]*>\s*([A-Za-zçÇ]{3,})\s*</);
    const locMatch = block.match(/class="text-wrapper-21"[^>]*>\s*([^<]+?)\s*</);
    const organizerMatch = block.match(/runff\.com\.br\/o\/[^"]*"\s+title="([^"]+)"/);

    const loc = locMatch ? decode(locMatch[1]!) : "";
    const [city, state] = loc.includes("/") ? loc.split("/") : [loc, ""];
    const title = decode(titleMatch[1]!);
    const day = dayMatch ? dayMatch[1]! : null;
    const month = monthMatch ? decode(monthMatch[1]!) : null;

    seen.add(sourceId);
    events.push({
      source_id: sourceId,
      title,
      event_date: toIsoDate(day, month),
      day_label: day ? day.padStart(2, "0") : null,
      month_label: month,
      city: city?.trim() || null,
      state: state?.trim() || null,
      organizer: organizerMatch ? decode(organizerMatch[1]!) : null,
      modality: guessModality(title),
      image_url: imgMatch ? imgMatch[1]! : null,
      event_url: `https://runff.com.br/evento/${sourceId}`,
      status: statusMatch ? decode(statusMatch[1]!) : null,
    });
  }

  return events;
}

export const Route = createFileRoute("/api/public/runff-events")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const force = new URL(request.url).searchParams.get("refresh") === "1";

        const { data: cached } = await supabaseAdmin
          .from("runff_events")
          .select("*")
          .order("event_date", { ascending: true });

        const newest = cached?.reduce<string | null>((acc, row) => {
          const value = row.fetched_at as string;
          return !acc || value > acc ? value : acc;
        }, null);

        const fresh =
          !force &&
          newest !== null &&
          Date.now() - new Date(newest).getTime() < CACHE_HOURS * 60 * 60 * 1000;

        if (fresh && cached && cached.length > 0) {
          return Response.json({ ok: true, stale: false, events: cached });
        }

        try {
          const res = await fetch(SOURCE_URL, {
            headers: { "user-agent": "Mozilla/5.0 (compatible; RunffCreators/1.0)" },
          });
          if (!res.ok) throw new Error(`source ${res.status}`);
          const scraped = scrape(await res.text());
          if (scraped.length === 0) throw new Error("no events parsed");

          const fetchedAt = new Date().toISOString();
          const rows = scraped.map((event) => ({ ...event, fetched_at: fetchedAt }));

          const { error } = await supabaseAdmin
            .from("runff_events")
            .upsert(rows, { onConflict: "source_id" });
          if (error) console.error("[runff-events] upsert", error.message);

          const { data: refreshed } = await supabaseAdmin
            .from("runff_events")
            .select("*")
            .order("event_date", { ascending: true });


          return Response.json({
            ok: true,
            stale: false,
            events: refreshed ?? rows,
          });
        } catch (error) {
          console.error("[runff-events]", error);
          if (cached && cached.length > 0) {
            return Response.json({ ok: true, stale: true, events: cached });
          }
          return Response.json({ ok: false, stale: true, events: [] }, { status: 502 });
        }
      },
    },
  },
});
