export const LIME = "#CCFC57";
export const INK = "#0B0B0B";
export const LINE = "#242424";

export const WHATSAPP_NUMBER = "5527988499473";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
  if (typeof w.gtag === "function") w.gtag("event", event, params);
}

export type RunffEvent = {
  source_id: string;
  title: string;
  event_date: string | null;
  day_label: string | null;
  month_label: string | null;
  city: string | null;
  state: string | null;
  organizer: string | null;
  modality: string[] | null;
  image_url: string | null;
  event_url: string | null;
  status: string | null;
};
