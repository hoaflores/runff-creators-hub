import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Gift,
  MapPin,
  MessageCircle,
  Play,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";

import heroLoop from "@/assets/runff/hero-loop.mp4.asset.json";
import heroPoster from "@/assets/runff/hero-poster.jpg.asset.json";
import ogImage from "@/assets/runff/og.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { track, whatsappLink, type RunffEvent } from "@/lib/runff/config";

const SITE = "https://runff-creators-hub.lovable.app";
const TITLE = "Runff Creators B | Corra, crie e ganhe";
const DESCRIPTION =
  "Seja Runff Creator: ganhe até 10% por inscrição e concorra a kit completo mais inscrição ao criar conteúdo para uma corrida.";
const OG_IMAGE = `${SITE}${ogImage.url}`;

export const Route = createFileRoute("/runff-creators-B")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/runff-creators-B` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE}/runff-creators-B` }],
  }),
  component: RunffCreatorsB,
});

const CONNECTIONS = [
  "Corro por conta própria",
  "Faço parte de um grupo de corrida",
  "Sou assessor ou treinador",
  "Organizo eventos ou grupos",
  "Produzo conteúdo sobre corrida",
  "Estou começando agora",
];

const FOLLOWERS = ["Até 1 mil", "1 mil a 5 mil", "5 mil a 20 mil", "20 mil a 100 mil", "Acima de 100 mil"];

const FAQ = [
  ["Preciso ter muitos seguidores?", "Não. A equipe avalia seu perfil, sua conexão com corrida e o potencial do conteúdo."],
  ["Como funciona a comissão?", "Você ganha até 10% por inscrição realizada pelo seu link exclusivo."],
  ["O cupom é obrigatório?", "Não. Você escolhe se quer oferecer desconto e como dividir os 10% entre cupom e comissão."],
  ["A campanha dos 10 conteúdos é automática?", "Não. As vagas são limitadas e cada participação precisa ser aprovada pela equipe Runff."],
] as const;

function scrollToForm() {
  document.getElementById("cadastro-b")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function Fade({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function PrimaryCta({ children, onClick = scrollToForm }: { children: ReactNode; onClick?: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-14 rounded-none bg-runff-ink px-7 font-semibold uppercase tracking-normal text-runff-paper shadow-none hover:bg-runff-lime hover:text-runff-ink"
    >
      {children}
      <ArrowRight />
    </Button>
  );
}

function RunffCreatorsB() {
  const [events, setEvents] = useState<RunffEvent[]>([]);

  useEffect(() => {
    fetch("/api/public/runff-events")
      .then((response) => response.json())
      .then((result) => setEvents(result.events ?? []))
      .catch(() => setEvents([]));
    track("page_view_runff_creators", { variant: "B" });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-runff-paper font-sans text-runff-ink antialiased selection:bg-runff-lime selection:text-runff-ink">
      <Header />
      <main>
        <Hero />
        <PromiseBand />
        <HowItWorks />
        <ContentCampaign />
        <Earnings />
        <Events events={events} />
        <Support />
        <LeadForm events={events} />
        <Faq />
      </main>
      <Footer />
      <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <PrimaryCta>Quero ser creator</PrimaryCta>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-runff-line bg-runff-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-10">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-baseline gap-2">
          <span className="font-display text-3xl uppercase leading-none">Runff</span>
          <span className="text-xs font-semibold uppercase text-runff-ink/50">Creators</span>
        </button>
        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase md:flex">
          <a href="#como-funciona" className="transition-colors hover:text-runff-ink/50">Como funciona</a>
          <a href="#corridas-b" className="transition-colors hover:text-runff-ink/50">Corridas</a>
          <a href="#duvidas-b" className="transition-colors hover:text-runff-ink/50">Dúvidas</a>
        </nav>
        <Button onClick={scrollToForm} className="h-10 rounded-none bg-runff-lime px-4 text-xs font-semibold uppercase text-runff-ink shadow-none hover:bg-runff-ink hover:text-runff-paper md:h-11 md:px-6">
          Quero participar
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid min-h-[92svh] grid-cols-1 pt-16 md:pt-20 lg:grid-cols-12">
      <div className="relative flex flex-col justify-between overflow-hidden border-b border-runff-line px-5 py-12 md:px-10 md:py-16 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-[7vw] lg:py-20">
        <div className="pointer-events-none absolute -bottom-10 -left-6 select-none font-display text-[13rem] uppercase leading-none text-runff-ink/[0.035] md:text-[22rem]">Run</div>
        <Fade className="relative z-10">
          <p className="mb-10 flex items-center gap-3 text-xs font-semibold uppercase text-runff-ink/55 md:mb-16">
            <span className="h-2.5 w-2.5 bg-runff-lime" /> Programa oficial de creators
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(4.4rem,10vw,9rem)] uppercase leading-[0.82] tracking-normal">
            Corra.<br />Crie.<br /><span className="text-runff-lime [text-shadow:1px_1px_0_var(--runff-ink),-1px_-1px_0_var(--runff-ink)]">Ganhe.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-runff-ink/65 md:text-xl">
            Transforme sua influência em comissão, experiências e novas linhas de chegada.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta>Quero ser Runff Creator</PrimaryCta>
            <Button asChild variant="outline" className="h-14 rounded-none border-runff-line bg-transparent px-7 font-semibold uppercase tracking-normal text-runff-ink shadow-none hover:bg-runff-soft">
              <a href="#como-funciona">Entender em 30 segundos <ArrowUpRight /></a>
            </Button>
          </div>
        </Fade>
        <div className="relative z-10 mt-14 flex items-center gap-3 text-[11px] font-semibold uppercase text-runff-ink/45">
          <span>01 Cadastre-se</span><span className="h-px w-6 bg-runff-line" />
          <span>02 Divulgue</span><span className="h-px w-6 bg-runff-line" />
          <span>03 Ganhe</span>
        </div>
      </div>
      <div className="relative min-h-[56svh] overflow-hidden bg-runff-ink lg:col-span-5 lg:min-h-0">
        <video autoPlay muted loop playsInline poster={heroPoster.url} className="absolute inset-0 h-full w-full object-cover grayscale" aria-label="Corredores em prova de rua">
          <source src={heroLoop.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-runff-ink/20" />
        <div className="absolute right-5 top-6 [writing-mode:vertical-rl] font-display text-base uppercase text-runff-paper md:right-10 md:top-10">Seu corre. Sua voz.</div>
        <div className="absolute bottom-0 left-0 bg-runff-lime p-6 text-runff-ink md:p-9">
          <p className="font-display text-5xl uppercase leading-none md:text-7xl">Até 10%</p>
          <p className="mt-2 text-xs font-semibold uppercase">por inscrição vendida</p>
        </div>
      </div>
    </section>
  );
}

function PromiseBand() {
  const items = [
    { icon: CircleDollarSign, title: "Até 10%", text: "de comissão" },
    { icon: Ticket, title: "Cupom", text: "se você quiser" },
    { icon: Users, title: "Equipe", text: "ao seu lado" },
    { icon: Gift, title: "Kit + prova", text: "em campanha especial" },
  ];
  return (
    <section className="border-b border-runff-line">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className={`px-5 py-8 md:px-8 md:py-10 ${index < items.length - 1 ? "border-r border-runff-line" : ""}`}>
            <Icon className="mb-5 h-5 w-5" />
            <p className="font-display text-3xl uppercase md:text-4xl">{title}</p>
            <p className="mt-1 text-sm text-runff-ink/50">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <Fade className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-runff-ink/45">Como funciona</p>
            <h2 className="mt-4 font-display text-6xl uppercase leading-[0.9] md:text-8xl">Simples<br />assim.</h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-runff-ink/60 md:justify-self-end">Você divulga corridas com um link próprio. A equipe ajuda com ideias e acompanha suas vendas. Você recebe por resultado.</p>
        </Fade>
        <div className="mt-14 grid border-y border-runff-line md:grid-cols-3">
          {[
            ["01", "Entre", "Envie seu perfil para avaliação."],
            ["02", "Compartilhe", "Receba link e cupom opcional."],
            ["03", "Ganhe", "Até 10% por inscrição vendida."],
          ].map(([n, title, text], index) => (
            <Fade key={n} delay={index * 0.06} className={`py-8 md:px-8 md:py-12 ${index > 0 ? "border-t border-runff-line md:border-l md:border-t-0" : ""}`}>
              <span className="text-xs font-semibold text-runff-ink/40">{n}</span>
              <h3 className="mt-8 font-display text-4xl uppercase">{title}</h3>
              <p className="mt-2 text-runff-ink/55">{text}</p>
            </Fade>
          ))}
        </div>
        <div className="mt-8 flex justify-end"><PrimaryCta>Começar agora</PrimaryCta></div>
      </div>
    </section>
  );
}

function ContentCampaign() {
  return (
    <section className="bg-runff-ink px-5 py-20 text-runff-paper md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <Fade>
          <p className="text-xs font-semibold uppercase text-runff-lime">Vagas limitadas</p>
          <h2 className="mt-5 max-w-4xl font-display text-[clamp(4rem,9vw,8rem)] uppercase leading-[0.84]">10 conteúdos.<br /><span className="text-runff-lime">1 corrida.</span><br />Kit completo.</h2>
        </Fade>
        <Fade delay={0.08} className="lg:pb-2">
          <p className="max-w-md text-lg leading-relaxed text-runff-paper/65">Escolha uma prova. Crie 10 conteúdos aprovados sobre ela. Receba inscrição e kit completo sem precisar vender.</p>
          <p className="mt-5 border-l-2 border-runff-lime pl-4 text-sm text-runff-paper/50">A participação não é automática. A equipe Runff valida cada vaga.</p>
          <div className="mt-8"><Button onClick={scrollToForm} className="h-14 rounded-none bg-runff-lime px-7 font-semibold uppercase text-runff-ink shadow-none hover:bg-runff-paper">Quero essa oportunidade <ArrowRight /></Button></div>
        </Fade>
      </div>
    </section>
  );
}

function Earnings() {
  const [sales, setSales] = useState(30);
  const earnings = sales * 12;
  return (
    <section className="border-b border-runff-line px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-2 lg:items-center">
        <Fade>
          <p className="text-xs font-semibold uppercase text-runff-ink/45">Sua influência vale</p>
          <h2 className="mt-5 font-display text-6xl uppercase leading-[0.9] md:text-8xl">Venda.<br />Ganhe.<br />Repita.</h2>
          <p className="mt-6 max-w-md text-runff-ink/55">Estimativa com inscrição média de R$ 120 e comissão de 10%.</p>
        </Fade>
        <Fade delay={0.08} className="border-l-4 border-runff-lime pl-6 md:pl-10">
          <label htmlFor="sales-b" className="text-xs font-semibold uppercase text-runff-ink/45">Inscrições por mês</label>
          <div className="mt-3 flex items-end justify-between gap-6"><span className="font-display text-7xl md:text-9xl">{sales}</span><span className="pb-3 text-sm text-runff-ink/50">vendas</span></div>
          <input id="sales-b" type="range" min="5" max="200" step="5" value={sales} onChange={(event) => setSales(Number(event.target.value))} className="mt-5 w-full accent-runff-ink" />
          <div className="mt-10 border-t border-runff-line pt-7">
            <p className="text-xs font-semibold uppercase text-runff-ink/45">Estimativa mensal</p>
            <p className="mt-2 font-display text-6xl uppercase md:text-8xl">R$ {earnings.toLocaleString("pt-BR")}</p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-runff-ink/45">* O cupom é opcional. Comissão + desconto compartilham o limite total de 10%.</p>
        </Fade>
      </div>
    </section>
  );
}

function Events({ events }: { events: RunffEvent[] }) {
  const visible = useMemo(() => events.slice(0, 3), [events]);
  return (
    <section id="corridas-b" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <Fade className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-semibold uppercase text-runff-ink/45">Escolha sua próxima linha de chegada</p><h2 className="mt-4 font-display text-6xl uppercase md:text-8xl">Corridas abertas.</h2></div>
          <PrimaryCta>Quero escolher uma</PrimaryCta>
        </Fade>
        <div className="mt-12 grid gap-px bg-runff-line md:grid-cols-3">
          {(visible.length ? visible : [null, null, null]).map((event, index) => (
            <article key={event?.source_id ?? index} className="group bg-runff-paper">
              <div className="aspect-[4/3] overflow-hidden bg-runff-soft">
                {event?.image_url ? <img src={event.image_url} alt={`Corrida ${event.title}`} loading="lazy" className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0" /> : <div className="flex h-full items-center justify-center"><Play className="h-9 w-9 text-runff-ink/25" /></div>}
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase text-runff-ink/40">{event?.day_label ?? "Em breve"} {event?.month_label ?? ""}</p>
                <h3 className="mt-3 font-display text-3xl uppercase leading-none">{event?.title ?? "Novas provas Runff"}</h3>
                <p className="mt-5 flex items-center gap-2 text-sm text-runff-ink/50"><MapPin className="h-4 w-4" />{event ? `${event.city ?? "Brasil"}${event.state ? `/${event.state}` : ""}` : "Confira o calendário"}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section className="bg-runff-lime px-5 py-16 md:px-10 md:py-20">
      <Fade className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-5"><MessageCircle className="mt-1 h-8 w-8 shrink-0" /><div><h2 className="font-display text-4xl uppercase md:text-6xl">Você não corre sozinho.</h2><p className="mt-3 max-w-2xl text-runff-ink/65">Conteúdo, ideias e acompanhamento de vendas com uma equipe à disposição.</p></div></div>
        <Button asChild className="h-14 shrink-0 rounded-none bg-runff-ink px-7 font-semibold uppercase text-runff-paper shadow-none hover:bg-runff-paper hover:text-runff-ink"><a href={whatsappLink("Oi! Quero conhecer o Runff Creators.")} target="_blank" rel="noopener">Falar com a equipe <ArrowUpRight /></a></Button>
      </Fade>
    </section>
  );
}

type FormData = {
  name: string; whatsapp: string; city: string; state: string; social_profile: string;
  follower_range: string; running_connection: string; event_interest: string; wants_coupon: string;
};

function LeadForm({ events }: { events: RunffEvent[] }) {
  const [form, setForm] = useState<FormData>({ name: "", whatsapp: "", city: "", state: "", social_profile: "", follower_range: "", running_connection: "", event_interest: "", wants_coupon: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const started = useRef(false);

  function update(key: keyof FormData, value: string) {
    if (!started.current) { started.current = true; track("form_start", { variant: "B" }); }
    setForm((current) => ({ ...current, [key]: key === "whatsapp" ? maskPhone(value) : value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.name.trim().length < 2 || form.whatsapp.replace(/\D/g, "").length < 10 || form.city.trim().length < 2 || form.state.length !== 2 || form.social_profile.trim().length < 2 || !form.running_connection || !form.event_interest || !consent) {
      setError("Preencha os campos obrigatórios para continuar."); return;
    }
    setSending(true); setError("");
    const params = new URLSearchParams(window.location.search);
    try {
      const response = await fetch("/api/public/runff-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, motivation: null, follower_range: form.follower_range || null, event_interest: form.event_interest, consent: true, utm_source: params.get("utm_source"), utm_medium: params.get("utm_medium"), utm_campaign: params.get("utm_campaign"), utm_content: params.get("utm_content"), landing_variant: "B" }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error("submit");
      setSent(true); track("form_submit_success", { variant: "B" });
      window.open(whatsappLink(`Oi, time Runff! Enviei meu cadastro como Runff Creator. Meu nome é ${form.name} e tenho interesse na corrida ${form.event_interest}.`), "_blank", "noopener");
    } catch { setError("Não foi possível enviar agora. Tente novamente."); }
    finally { setSending(false); }
  }

  const field = "h-12 w-full rounded-none border border-runff-line bg-transparent px-4 text-base outline-none transition placeholder:text-runff-ink/30 focus:border-runff-ink";
  return (
    <section id="cadastro-b" className="scroll-mt-16 bg-runff-ink px-5 py-20 text-runff-paper md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.75fr_1.25fr]">
        <Fade><p className="text-xs font-semibold uppercase text-runff-lime">Seu lugar na largada</p><h2 className="mt-5 font-display text-6xl uppercase leading-[0.88] md:text-8xl">Pronto<br />para entrar?</h2><p className="mt-6 max-w-sm text-runff-paper/55">Envie seus dados. A conversa continua no WhatsApp.</p></Fade>
        <Fade delay={0.08}>
          {sent ? <div className="border border-runff-lime p-8"><Check className="h-8 w-8 text-runff-lime" /><h3 className="mt-5 font-display text-4xl uppercase">Cadastro enviado.</h3><p className="mt-3 text-runff-paper/60">Agora é só continuar a conversa com a equipe Runff.</p></div> : (
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs uppercase text-runff-paper/55 sm:col-span-2">Nome completo *<input autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} className={`${field} mt-2`} placeholder="Seu nome" /></label>
              <label className="text-xs uppercase text-runff-paper/55">WhatsApp *<input type="tel" inputMode="tel" autoComplete="tel" maxLength={16} value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className={`${field} mt-2`} placeholder="(00) 00000-0000" /></label>
              <label className="text-xs uppercase text-runff-paper/55">Instagram ou TikTok *<input value={form.social_profile} onChange={(e) => update("social_profile", e.target.value)} className={`${field} mt-2`} placeholder="@seuperfil" /></label>
              <label className="text-xs uppercase text-runff-paper/55">Cidade *<input autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} className={`${field} mt-2`} /></label>
              <label className="text-xs uppercase text-runff-paper/55">UF *<input autoComplete="address-level1" maxLength={2} value={form.state} onChange={(e) => update("state", e.target.value.toUpperCase())} className={`${field} mt-2`} placeholder="SP" /></label>
              <label className="text-xs uppercase text-runff-paper/55">Seu perfil de corrida *<select value={form.running_connection} onChange={(e) => update("running_connection", e.target.value)} className={`${field} mt-2 bg-runff-ink`}><option value="">Selecione</option>{CONNECTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs uppercase text-runff-paper/55">Seguidores<select value={form.follower_range} onChange={(e) => update("follower_range", e.target.value)} className={`${field} mt-2 bg-runff-ink`}><option value="">Prefiro não informar</option>{FOLLOWERS.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs uppercase text-runff-paper/55 sm:col-span-2">Corrida de interesse *<select value={form.event_interest} onChange={(e) => update("event_interest", e.target.value)} className={`${field} mt-2 bg-runff-ink`}><option value="">Selecione</option>{events.slice(0, 30).map((item) => <option key={item.source_id} value={item.title}>{item.title} — {item.city}/{item.state}</option>)}<option value="Outra">Outra / Ainda não sei</option></select></label>
              <label className="text-xs uppercase text-runff-paper/55 sm:col-span-2">Quer criar cupom?<select value={form.wants_coupon} onChange={(e) => update("wants_coupon", e.target.value)} className={`${field} mt-2 bg-runff-ink`}><option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option><option value="duvida">Quero entender melhor</option></select><span className="mt-2 block normal-case leading-relaxed text-runff-paper/35">Opcional. Cupom + comissão respeitam o limite de 10%.</span></label>
              <label className="flex items-start gap-3 text-sm leading-relaxed text-runff-paper/55 sm:col-span-2"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-runff-lime" /><span>Autorizo o contato da Runff sobre o programa e oportunidades relacionadas.</span></label>
              {error && <p className="text-sm text-runff-danger sm:col-span-2">{error}</p>}
              <Button type="submit" disabled={sending} className="h-14 rounded-none bg-runff-lime px-8 font-semibold uppercase text-runff-ink shadow-none hover:bg-runff-paper sm:col-span-2 sm:justify-self-start">{sending ? "Enviando..." : "Enviar cadastro"}<ArrowUpRight /></Button>
            </form>
          )}
        </Fade>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="duvidas-b" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-[0.7fr_1.3fr]">
        <Fade><p className="text-xs font-semibold uppercase text-runff-ink/45">Dúvidas rápidas</p><h2 className="mt-4 font-display text-6xl uppercase md:text-7xl">Antes de correr.</h2></Fade>
        <div className="border-t border-runff-line">
          {FAQ.map(([question, answer], index) => (
            <div key={question} className="border-b border-runff-line">
              <button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left font-semibold"><span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>
              {open === index && <p className="max-w-xl pb-6 text-runff-ink/55">{answer}</p>}
            </div>
          ))}
          <div className="mt-8"><PrimaryCta>Quero participar</PrimaryCta></div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-runff-line px-5 py-10 pb-24 md:px-10 md:pb-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-display text-4xl uppercase">Runff Creators</p><p className="mt-2 text-sm text-runff-ink/45">Seu corre pode levar você mais longe.</p></div>
        <p className="text-xs uppercase text-runff-ink/35">© {new Date().getFullYear()} Runff</p>
      </div>
    </footer>
  );
}