import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Coins,
  MapPin,
  Minus,

  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Counter, Marquee, Reveal, SectionTag, SectionTitle } from "@/components/runff/ui";
import heroLoop from "@/assets/runff/hero-loop.mp4.asset.json";
import heroPoster from "@/assets/runff/hero-poster.jpg.asset.json";
import perfilCorredor from "@/assets/runff/perfil-corredor.jpg.asset.json";
import perfilCreator from "@/assets/runff/perfil-creator.jpg.asset.json";
import perfilLider from "@/assets/runff/perfil-lider.jpg.asset.json";
import ogImage from "@/assets/runff/og.jpg.asset.json";
import { LIME, LINE, track, whatsappLink, type RunffEvent } from "@/lib/runff/config";

const SITE = "https://project--3390aa7f-a718-4ee1-8ee0-b9306c88086b.lovable.app";
const OG_IMAGE = `${SITE}${ogImage.url}`;
const TITLE = "Runff Creators | Ganhe com corrida e corra de graça";
const DESCRIPTION =
  "Divulgue corridas Runff e ganhe até 10% por inscrição, com cupom opcional. E ainda pode conquistar inscrição + kit completo gravando 10 conteúdos aprovados.";

export const Route = createFileRoute("/runff-creators")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/runff-creators` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Runff Creators" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE}/runff-creators` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${SITE}/runff-creators`,
          primaryImageOfPage: OG_IMAGE,
        }),
      },
    ],
  }),
  component: RunffCreatorsPage,
});


const STICKY_LABEL: Record<string, string> = {
  topo: "Quero participar",
  "como-funciona": "Quero participar",
  ganhos: "Quero ganhar com isso",
  
  corridas: "Escolher minha corrida",
  cadastro: "Garantir minha vaga",
  faq: "Ainda tenho dúvidas",
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* CTA padrão reutilizado nas seções: WhatsApp (primário) ou scroll ao cadastro */
function CtaWhats({
  heroMsg,
  label,
  origem,
  className = "",
}: {
  heroMsg: string;
  label: string;
  origem: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappLink(heroMsg)}
      target="_blank"
      rel="noopener"
      onClick={() => track("whatsapp_open", { origem })}
      className={`group inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-7 text-[12px] font-semibold uppercase tracking-[0.18em] sm:w-auto ${className}`}
      style={{ background: LIME, color: "#0B0B0B" }}
    >
      {label}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

function CtaCadastro({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button
      onClick={() => scrollToId("cadastro")}
      className={`hidden min-h-[52px] w-full items-center justify-center gap-2 border px-7 sm:inline-flex text-[12px] font-semibold uppercase tracking-[0.18em] transition hover:border-white/60 sm:w-auto ${className}`}
      style={{ borderColor: "rgba(255,255,255,0.35)" }}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

/* máscara de telefone brasileira: (11) 91234-5678 */
function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function daysUntil(date: string | null) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  return diff < 0 ? null : diff;
}

function RunffCreatorsPage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  const [scrolled, setScrolled] = useState(false);
  const [cidade, setCidade] = useState<string | null>(null);
  const [events, setEvents] = useState<RunffEvent[] | null>(null);
  const [eventsError, setEventsError] = useState(false);
  const [section, setSection] = useState("topo");

  useEffect(() => {
    fetch("/api/public/runff-events")
      .then((r) => r.json())
      .then((json) => setEvents(json.events ?? []))
      .catch(() => setEventsError(true));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["topo", "como-funciona", "ganhos", "corridas", "cadastro", "faq"];
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setSection(best.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("cidade");
    if (c) setCidade(c);
    track("page_view_runff_creators", { cidade: c });
  }, []);

  const heroMsg = `Oi! Vi a página Runff Creators e quero participar.${
    cidade ? ` Minha cidade é ${cidade}.` : ""
  }`;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white antialiased">

      <motion.div
        className="fixed left-0 top-0 z-[60] h-[3px] origin-left"
        style={{ scaleX: progress, background: LIME, width: "100%" }}
      />

      <Header scrolled={scrolled} heroMsg={heroMsg} />
      <Hero cidade={cidade} heroMsg={heroMsg} />
      <StatsBand heroMsg={heroMsg} />
      <ComoFunciona />
      <Simulador heroMsg={heroMsg} />
      
      <Corridas events={events} error={eventsError} cidade={cidade} heroMsg={heroMsg} />
      <Cadastro cidade={cidade} events={events} />
      <Faq heroMsg={heroMsg} />
      <Fechamento heroMsg={heroMsg} />
      <Footer />
      <StickyCta
        heroMsg={heroMsg}
        visible={scrolled}
        label={STICKY_LABEL[section] ?? "Garantir minha vaga"}
        onForm={() => scrollToId("cadastro")}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- header */

function Header({ scrolled, heroMsg }: { scrolled: boolean; heroMsg: string }) {
  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all"
        style={{
          background: scrolled ? "rgba(11,11,11,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : undefined,
          borderBottom: "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 md:px-10 md:py-4">
          <button onClick={() => scrollToId("topo")} className="flex items-baseline gap-2">
            <span className="font-display text-xl uppercase tracking-tight md:text-2xl">RUNFF</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: LIME }}
            >
              Creators
            </span>
          </button>

          <a
            href={whatsappLink(heroMsg)}
            target="_blank"
            rel="noopener"
            onClick={() => track("whatsapp_open", { origem: "header" })}
            className="inline-flex min-h-[40px] items-center gap-2 px-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] sm:min-h-[44px] sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
            style={{ background: LIME, color: "#0B0B0B" }}
          >
            Garantir vaga
          </a>
        </div>

        <Marquee

          items={["CORRA", "INFLUENCIE", "GANHE", "REPITA", "RUNFF CREATORS"]}
          dark
          className={`!border-0 bg-black/50 py-2 md:py-2.5 ${scrolled ? "hidden md:flex" : "flex"} [&>div]:gap-6 [&_span]:gap-6 [&_span]:text-[11px] [&_span]:font-bold [&_span]:tracking-[0.24em] [&_span]:text-white/95`}
        />

      </header>

    </>
  );
}

/* ------------------------------------------------------------------ hero */

function Hero({ cidade, heroMsg }: { cidade: string | null; heroMsg: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const lines = ["NUNCA MAIS", "PAGUE PARA", "CORRER!"];

  return (
    <section
      id="topo"
      ref={ref}
      className="relative flex min-h-[58svh] flex-col justify-center overflow-hidden pb-10 pt-28 md:min-h-[70svh] md:pb-16 md:pt-32"
    >
      <motion.div className="absolute inset-0" style={{ y }}>
        <video
          className="h-[135%] w-full object-cover"
          style={{ objectPosition: "center 18%" }}
          src={heroLoop.url}
          poster={heroPoster.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Corredora em treino de rua"
        />
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(11,11,11,0.82) 0%, rgba(11,11,11,0.55) 42%, rgba(11,11,11,0.25) 60%, rgba(11,11,11,0.82) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-[380px] w-[380px] rounded-full blur-[120px]"
        style={{ background: LIME, opacity: 0.12 }}
      />

      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto grid w-full max-w-[1500px] gap-6 px-5 md:px-10 lg:grid-cols-1 lg:items-center"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display uppercase leading-[0.88] tracking-[-0.015em] text-[clamp(2.5rem,8vw,6.5rem)]">
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  style={{ color: i === 2 ? LIME : "inherit" }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto mt-6 max-w-2xl font-display uppercase leading-[1.05] text-[clamp(1.2rem,2.4vw,1.7rem)] text-white/80"
          >
            CORRA SEM CUSTOS, GANHE EQUIPAMENTOS, RECEBA KITS DAS CORRIDAS E AINDA GANHE COMISSOES PARA ISSO!
          </motion.p>

        </div>

      </motion.div>


      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Role</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-8 w-px"
          style={{ background: LIME }}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- statsband */

function StatsBand({ heroMsg }: { heroMsg: string }) {
  const stats = [
    { value: <Counter to={10} suffix="%" />, label: "de comissão por inscrição" },
    { value: "Cupom", label: "de desconto opcional" },
    { value: "Kit", label: "COMPLETO + INSCRIÇÃO NA CORRIDA" },
    { value: "Equipe", label: "ativa no seu conteúdo" },
  ];

  return (
    <section className="border-b px-5 py-10 md:px-10 md:py-12" style={{ borderColor: LINE }}>
      <div className="mx-auto max-w-[1500px]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p className="font-display leading-none text-[clamp(2rem,7vw,4rem)]" style={{ color: LIME }}>
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] uppercase leading-snug tracking-[0.12em] text-white/45 md:text-[13px]">{stat.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CtaWhats heroMsg={heroMsg} label="Quero participar agora" origem="stats" />
            <CtaCadastro label="Fazer meu cadastro" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- como funciona */

const PASSOS = [
  {
    icon: Users,
    t: "Cadastre-se",
    d: "Dois minutos. O time valida sua entrada no WhatsApp.",
  },
  {
    icon: Ticket,
    t: "Receba seu link",
    d: "Link próprio de divulgação. Cupom de desconto, se você quiser.",
  },
  {
    icon: Sparkles,
    t: "Divulgue com apoio",
    d: "Uma equipe ao seu lado: ideias, conteúdo e vendas.",
  },
  {
    icon: Coins,
    t: "Ganhe comissão",
    d: "Até 10% por inscrição. Todo mês.",
  },
];

function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-28 px-5 py-14 md:scroll-mt-32 md:px-10 md:py-24" style={{ background: "#101010" }}>
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <SectionTag n="01">Como funciona</SectionTag>
          <SectionTitle className="mt-4 md:mt-6 max-w-3xl">
            Do cadastro à comissão em quatro passos.
          </SectionTitle>
        </Reveal>

        <div className="mt-8 grid gap-px md:mt-14 md:grid-cols-2 lg:grid-cols-4" style={{ background: LINE }}>
          {PASSOS.map((passo, i) => {
            const Icon = passo.icon;
            return (
              <Reveal key={passo.t} delay={i * 0.06}>
                <div className="h-full p-6 md:p-7" style={{ background: "#101010" }}>
                  <Icon className="h-6 w-6" style={{ color: LIME }} />
                  <p className="font-mono mt-4 text-[12px]" style={{ color: LIME }}>
                    0{i + 1}
                  </p>
                  <h3 className="mt-2 font-display text-[21px] uppercase leading-tight md:mt-3 md:text-[24px]">{passo.t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/60">{passo.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 border p-6 md:p-8" style={{ borderColor: LINE, background: "#0E0E0E" }}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  GERE CONTEÚDOS PARA REDES SOCIAIS E CORRA SEM CUSTOS!
                </p>
                <h3 className="mt-1.5 font-display text-[22px] uppercase leading-tight md:text-[28px]">
                  10 conteúdos aprovados = corrida de graça, com kit completo
                </h3>
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/70">
                  <span className="font-semibold" style={{ color: LIME }}>Vagas limitadas por corrida.</span>{" "}
                  A aprovação não é automática: nossa equipe valida cada pedido antes de confirmar a vaga.
                </p>
              </div>
              <button
                onClick={() => scrollToId("cadastro")}
                className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 px-6 text-[11px] md:w-auto font-semibold uppercase tracking-[0.18em] transition hover:opacity-90"
                style={{ background: LIME, color: "#0B0B0B" }}
              >
                Quero essa vaga <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- simulador */

function Simulador({ heroMsg }: { heroMsg: string }) {
  const [ticket, setTicket] = useState(120);
  const [vendas, setVendas] = useState(40);
  const ganho = ticket * 0.1 * vendas;

  return (
    <section id="ganhos" className="scroll-mt-28 px-5 py-14 md:scroll-mt-32 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
        <Reveal>
          <SectionTag n="02">Quanto você pode ganhar</SectionTag>
          <SectionTitle className="mt-4 md:mt-6">Quanto vale a sua audiência?</SectionTitle>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            Arraste e descubra.*
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border p-7 md:p-9" style={{ borderColor: LINE, background: "#0E0E0E" }}>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="ticket" className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Ticket médio da inscrição
                </label>
                <span className="font-display text-3xl" style={{ color: LIME }}>
                  R$ {ticket}
                </span>
              </div>
              <input
                id="ticket"
                type="range"
                min={60}
                max={300}
                step={10}
                value={ticket}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="mt-4 w-full accent-[#CCFC57]"
              />
            </div>
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <label htmlFor="vendas" className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Inscrições vendidas por mês
                </label>
                <span className="font-display text-3xl" style={{ color: LIME }}>
                  {vendas}
                </span>
              </div>
              <input
                id="vendas"
                type="range"
                min={5}
                max={300}
                step={5}
                value={vendas}
                onChange={(e) => setVendas(Number(e.target.value))}
                className="mt-4 w-full accent-[#CCFC57]"
              />
            </div>
            <div className="mt-9 border-t pt-7" style={{ borderColor: LINE }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                Estimativa de ganho mensal
              </p>
              <p className="mt-1 font-display leading-none text-[clamp(3rem,7vw,4.6rem)]" style={{ color: LIME }}>
                {ganho.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-white/40">
                * Simulação com 10% de comissão. Cupom opcional: comissão + cupom, no máximo 10%.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <CtaWhats heroMsg={heroMsg} label="Quero ganhar com isso" origem="simulador" />
            <CtaCadastro label="Fazer meu cadastro" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- corridas */

function Corridas({
  events,
  error,
  cidade,
  heroMsg,
}: {
  events: RunffEvent[] | null;
  error: boolean;
  cidade: string | null;
  heroMsg: string;
}) {
  const [filtro, setFiltro] = useState<"todas" | "regiao" | "mes">("todas");
  const scroller = useRef<HTMLDivElement>(null);

  function nudge(dir: number) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 900), behavior: "smooth" });
  }

  const list = useMemo(() => {
    if (!events) return [];
    const norm = (v: string | null) =>
      (v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let out = [...events];
    if (filtro === "mes") {
      const now = new Date();
      const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      out = out.filter((e) => (e.event_date || "").startsWith(prefix));
    }
    if (cidade) {
      out.sort((a, b) => {
        const ai = norm(a.city).includes(norm(cidade)) ? 0 : 1;
        const bi = norm(b.city).includes(norm(cidade)) ? 0 : 1;
        return ai - bi;
      });
    }
    return out;
  }, [events, filtro, cidade]).slice(0, 24);

  return (
    <section id="corridas" className="scroll-mt-28 px-5 py-14 md:scroll-mt-32 md:px-10 md:py-24" style={{ background: "#101010" }}>
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <SectionTag n="04">Próximas corridas</SectionTag>
          <SectionTitle className="mt-4 md:mt-6 max-w-3xl">Qual prova você quer ganhar?</SectionTitle>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/65">
            Escolha a sua. Vagas sujeitas à aprovação do time.
          </p>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-center gap-2 md:mt-10">
          {(
            [
              ["todas", "Todas"],
              ["regiao", cidade ? `Perto de ${cidade}` : "Minha região"],
              ["mes", "Este mês"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              disabled={key === "regiao" && !cidade}
              className="min-h-[44px] border px-5 text-[11px] uppercase tracking-[0.16em] transition disabled:opacity-30"
              style={
                filtro === key
                  ? { background: LIME, color: "#0B0B0B", borderColor: LIME }
                  : { borderColor: LINE, color: "rgba(255,255,255,0.7)" }
              }
            >
              {label}
            </button>
          ))}
          <div className="ml-auto hidden gap-2 md:flex">
            <button
              onClick={() => nudge(-1)}
              aria-label="Corridas anteriores"
              className="flex h-11 w-11 items-center justify-center border transition hover:border-white/60"
              style={{ borderColor: LINE }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Próximas corridas"
              className="flex h-11 w-11 items-center justify-center border transition hover:border-white/60"
              style={{ borderColor: LINE }}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-10 text-[14px] text-white/50">
            Não conseguimos carregar o calendário agora. Fale com a gente no WhatsApp que enviamos as
            próximas provas.
          </p>
        )}

        <div
          ref={scroller}
          className="runff-scroll -mx-5 mt-6 flex snap-x md:mt-10 snap-mandatory gap-px overflow-x-auto px-5 pb-4 md:mx-0 md:px-0"
        >
          {!events &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[360px] w-[300px] shrink-0 animate-pulse md:w-[340px]"
                style={{ background: "#141414" }}
              />
            ))}

          {list.map((event, i) => {
            const dias = daysUntil(event.event_date);
            return (
              <a
                key={event.source_id}
                href={event.event_url ?? "https://runff.com.br/#lista_eventos"}
                target="_blank"
                rel="noopener"
                onClick={() => track("event_card_click", { id: event.source_id, cidade: event.city })}
                className="group flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col border sm:w-[300px] md:w-[340px]"
                style={{ background: "#0E0E0E", borderColor: "#1F1F1F" }}
              >
                <div className="relative aspect-[16/10] overflow-hidden" style={{ background: "#1A1A1A" }}>
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={`Capa da corrida ${event.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute left-0 top-0 px-3 py-2 text-center" style={{ background: LIME, color: "#0B0B0B" }}>
                    <p className="font-display text-2xl leading-none">{event.day_label ?? "--"}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em]">{event.month_label ?? ""}</p>
                  </div>
                  {dias !== null && (
                    <div
                      className="absolute bottom-0 right-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{ background: "rgba(11,11,11,0.85)", color: LIME }}
                    >
                      {dias === 0 ? "É hoje" : `Faltam ${dias} dias`}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="font-display text-[22px] uppercase leading-[1.03]">{event.title}</h3>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-white/55">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.city}
                    {event.state ? `/${event.state}` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(event.modality ?? []).map((m) => (
                      <span
                        key={m}
                        className="border px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60"
                        style={{ borderColor: LINE }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <span
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: LIME }}
                  >
                    Ver corrida
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            onClick={() => scrollToId("cadastro")}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 px-7 text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ background: LIME, color: "#0B0B0B" }}
          >
            <Ticket className="h-4 w-4" />
            Escolher minha corrida
          </button>
          <a
            href="https://runff.com.br/#lista_eventos"
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 border px-6 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-white/60"
            style={{ borderColor: LINE }}
          >
            <CalendarDays className="h-4 w-4" />
            Calendário oficial Runff
          </a>
          <span className="text-[11px] uppercase tracking-[0.16em] text-white/35 md:hidden">
            Arraste para o lado
          </span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- cadastro */

const CONEXOES = [
  "Corro por conta própria",
  "Faço parte de um grupo de corrida",
  "Sou assessor ou treinador",
  "Organizo eventos ou grupos",
  "Produzo conteúdo sobre corrida",
  "Estou começando agora",
];

const SEGUIDORES = ["Até 1 mil", "1 mil a 5 mil", "5 mil a 20 mil", "20 mil a 100 mil", "Acima de 100 mil"];

const ETAPAS = ["Quem é você", "Onde você corre", "Sua vaga"];

function Cadastro({ cidade, events }: { cidade: string | null; events: RunffEvent[] | null }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    city: cidade ?? "",
    state: "",
    social_profile: "",
    follower_range: "",
    running_connection: "",
    event_interest: "",
    motivation: "",
    wants_coupon: "",
  });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const started = useRef(false);

  function update(key: keyof typeof form, value: string) {
    if (!started.current) {
      started.current = true;
      track("form_start");
    }
    setForm((prev) => ({ ...prev, [key]: key === "whatsapp" ? maskPhone(value) : value }));
  }

  function next() {
    if (step === 1 && (form.name.trim().length < 2 || form.whatsapp.replace(/\D/g, "").length < 10)) {
      setError("Preencha nome e WhatsApp (com DDD) para continuar.");
      return;
    }
    if (
      step === 2 &&
      (form.social_profile.trim().length < 2 || form.city.trim().length < 2 || form.state.trim().length < 2)
    ) {
      setError("Preencha perfil, cidade e UF para continuar.");
      return;
    }
    setError(null);
    track("form_step", { etapa: step + 1 });
    setStep((s) => s + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.running_connection) {
      setError("Conte como você se conecta à corrida.");
      return;
    }
    if (!form.event_interest.trim()) {
      setError("Escolha uma corrida de interesse.");
      return;
    }
    if (!consent) {
      setError("É preciso aceitar o contato para continuar.");
      return;
    }
    setSending(true);
    const params = new URLSearchParams(window.location.search);
    try {
      const res = await fetch("/api/public/runff-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          whatsapp: form.whatsapp,
          city: form.city,
          state: form.state.toUpperCase(),
          social_profile: form.social_profile,
          follower_range: form.follower_range || null,
          running_connection: form.running_connection,
          event_interest: form.event_interest || null,
          motivation: form.motivation || null,
          consent: true,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          utm_content: params.get("utm_content"),
          landing_variant: cidade ? `cidade:${cidade}` : "padrao",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        track("form_submit_error");
        setError(json.error || "Não foi possível enviar agora.");
        return;
      }
      track("form_submit_success");
      const couponText = form.wants_coupon === "sim" ? " e quero criar cupom de desconto" : "";
      const msg = `Oi, time Runff! Acabei de enviar meu cadastro para o Runff Creators. Meu nome é ${form.name}, sou de ${form.city}/${form.state} e quero a vaga na corrida ${form.event_interest}${couponText}.`;
      const link = whatsappLink(msg);
      setWaLink(link);
      track("whatsapp_open", { origem: "formulario" });
      window.open(link, "_blank", "noopener");
    } catch {
      track("form_submit_error");
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "min-h-[48px] w-full border bg-transparent px-4 text-[15px] text-white outline-none transition focus:border-[#CCFC57] placeholder:text-white/30";

  return (
    <section id="cadastro" className="scroll-mt-28 px-5 py-14 md:scroll-mt-32 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <SectionTag n="05">Cadastro</SectionTag>
            <SectionTitle className="mt-4 md:mt-6">
              Garanta sua vaga.{" "}
              <span style={{ color: LIME }}>Dois minutos.</span>
            </SectionTitle>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
              Depois abrimos o WhatsApp com tudo pronto.
            </p>
            <ul className="mt-6 space-y-3 md:mt-8 md:space-y-4">
              {[
                "Até 10% por inscrição",
                "10 conteúdos aprovados = kit + inscrição",
                "Cupom de desconto, se você quiser",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-white/70">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: LIME }} />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="border p-6 md:p-8" style={{ borderColor: LINE, background: "#0E0E0E" }}>
            <div className="mb-7">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/45">
                <span>Etapa {step} de 3</span>
                <span>{ETAPAS[step - 1]}</span>
              </div>
              <div className="mt-3 h-[3px] w-full" style={{ background: "#232323" }}>
                <motion.div
                  className="h-full"
                  style={{ background: LIME }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <form onSubmit={submit}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28 }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {step === 1 && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-nome">
                          Nome completo *
                        </label>
                        <input
                          id="f-nome"
                          autoComplete="name"
                          placeholder="Seu nome"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-wpp">
                          WhatsApp *
                        </label>
                        <input
                          id="f-wpp"
                          autoComplete="tel"
                          maxLength={16}
                          inputMode="tel"
                          placeholder="(00) 00000-0000"
                          value={form.whatsapp}
                          onChange={(e) => update("whatsapp", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE }}
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-perfil">
                          Instagram ou TikTok *
                        </label>
                        <input
                          id="f-perfil"
                          placeholder="@seuperfil"
                          value={form.social_profile}
                          onChange={(e) => update("social_profile", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-cidade">
                          Cidade *
                        </label>
                        <input
                          id="f-cidade"
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-uf">
                          UF *
                        </label>
                        <input
                          id="f-uf"
                          maxLength={2}
                          placeholder="SP"
                          value={form.state}
                          onChange={(e) => update("state", e.target.value.toUpperCase())}
                          className={inputClass}
                          style={{ borderColor: LINE }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-seg">
                          Seguidores (aproximado)
                        </label>
                        <select
                          id="f-seg"
                          value={form.follower_range}
                          onChange={(e) => update("follower_range", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE, background: "#0E0E0E" }}
                        >
                          <option value="">Prefiro não informar</option>
                          {SEGUIDORES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-con">
                          Como você se conecta à corrida? *
                        </label>
                        <select
                          id="f-con"
                          value={form.running_connection}
                          onChange={(e) => update("running_connection", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE, background: "#0E0E0E" }}
                        >
                          <option value="">Selecione</option>
                          {CONEXOES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-int">
                          Qual corrida você quer receber? *
                        </label>
                        <select
                          id="f-int"
                          value={form.event_interest}
                          onChange={(e) => update("event_interest", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE, background: "#0E0E0E" }}
                        >
                          <option value="">Selecione uma corrida</option>
                          {events?.slice(0, 30).map((e) => (
                            <option key={e.source_id} value={e.title}>
                              {e.title} — {e.city}{e.state ? `/${e.state}` : ""}
                            </option>
                          ))}
                          <option value="Outra">Outra / Ainda não sei</option>
                        </select>
                        <div className="mt-3 border-l-2 bg-white/[0.03] p-3" style={{ borderColor: LIME }}>
                          <p className="text-[12px] leading-relaxed text-white/80">
                            <span className="font-semibold" style={{ color: LIME }}>Vagas limitadas por corrida.</span>{" "}
                            Enviar o cadastro não garante a vaga: nossa equipe avalia e entra em contato para confirmar.
                          </p>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-cupom">
                          Quer criar cupom de desconto?
                        </label>
                        <select
                          id="f-cupom"
                          value={form.wants_coupon}
                          onChange={(e) => update("wants_coupon", e.target.value)}
                          className={inputClass}
                          style={{ borderColor: LINE, background: "#0E0E0E" }}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim, quero oferecer cupom</option>
                          <option value="nao">Não, prefiro apenas o kit + inscrição</option>
                          <option value="duvida">Quero entender melhor</option>
                        </select>
                        <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                          O cupom é opcional. O cálculo é baseado nos 10% de comissão: você escolhe
                          como compor sua comissão + o cupom, dentro do limite de 10% total.
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/50" htmlFor="f-mot">
                          Por que quer ser Runff Creator?
                        </label>
                        <textarea
                          id="f-mot"
                          maxLength={300}
                          rows={3}
                          value={form.motivation}
                          onChange={(e) => update("motivation", e.target.value)}
                          className="w-full border bg-transparent p-4 text-[15px] text-white outline-none transition focus:border-[#CCFC57] placeholder:text-white/30"
                          style={{ borderColor: LINE }}
                        />
                      </div>
                      <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-white/60 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-1 h-4 w-4 accent-[#CCFC57]"
                        />
                        <span>
                          Autorizo o contato da Runff sobre o programa Runff Creators e oportunidades
                          relacionadas, conforme a Política de Privacidade da Runff.
                        </span>
                      </label>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && (
                <p className="mt-4 text-[13px]" style={{ color: "#ff6b6b" }}>
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep((s) => s - 1);
                    }}
                    className="inline-flex min-h-[52px] items-center gap-2 border px-6 text-[11px] uppercase tracking-[0.18em] transition hover:border-white/60"
                    style={{ borderColor: LINE }}
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-8 text-[12px] font-semibold uppercase tracking-[0.18em] sm:flex-none"
                    style={{ background: LIME, color: "#0B0B0B" }}
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-8 text-[12px] font-semibold uppercase tracking-[0.18em] transition disabled:opacity-60 sm:flex-none"
                    style={{ background: LIME, color: "#0B0B0B" }}
                  >
                    {sending ? "Enviando..." : "Enviar e falar com a Runff"}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {waLink && (
                <div className="mt-6 border p-5 text-[14px]" style={{ borderColor: LIME }}>
                  <p className="text-white/80">Cadastro enviado. Se o WhatsApp não abriu sozinho:</p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em]"
                    style={{ color: LIME }}
                  >
                    Abrir conversa agora <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- faq */

const FAQ: [string, string][] = [
  [
    "Como ganho comissão?",
    "Você recebe um link próprio de divulgação e ganha até 10% por cada inscrição vendida com ele.",
  ],
  [
    "Como funciona o cupom de desconto?",
    "O cupom é opcional. O cálculo é baseado nos seus 10% de comissão: você escolhe como compor comissão + cupom, dentro do limite de 10% total.",
  ],
  [
    "O que é a campanha dos 10 conteúdos?",
    "Um diferencial com vagas limitadas: você escolhe uma corrida e, gravando 10 conteúdos validados e aprovados sobre o evento, recebe inscrição + kit completo de presente — sem precisar vender nada.",
  ],
  [
    "A vaga da campanha é garantida?",
    "Não. As vagas são limitadas e a aprovação depende da validação da equipe de atendimento Runff.",
  ],
  [
    "Preciso pagar alguma coisa para participar?",
    "Não. O cadastro é gratuito e a comissão é sua. Na campanha de conteúdo, o kit e a inscrição são presente.",
  ],
  [
    "Qual o papel da equipe Runff?",
    "Uma equipe fica à disposição para auxiliar ativamente na construção de conteúdos, ideias e acompanhamento de vendas.",
  ],
  [
    "Posso escolher qualquer corrida?",
    "Você indica a corrida de interesse no cadastro. Para a campanha de conteúdo, a equipe valida se ainda há vaga para aquela prova.",
  ],
];

function Faq({ heroMsg }: { heroMsg: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-28 px-5 py-14 md:scroll-mt-32 md:px-10 md:py-24" style={{ background: "#101010" }}>
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <SectionTag n="06">Perguntas frequentes</SectionTag>
          <SectionTitle className="mt-4 md:mt-6">Sem pegadinha.</SectionTitle>
        </Reveal>

        <div className="mt-8 border-t md:mt-12" style={{ borderColor: LINE }}>
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b" style={{ borderColor: LINE }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left md:min-h-[64px] md:gap-6 md:py-5"
              >
                <span className="font-display text-[18px] uppercase leading-tight md:text-[22px]">{q}</span>
                {open === i ? (
                  <Minus className="h-5 w-5 shrink-0" style={{ color: LIME }} />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-white/50" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl pb-6 text-[15px] leading-relaxed text-white/65">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CtaWhats heroMsg={heroMsg} label="Falar com a equipe" origem="faq" />
            <CtaCadastro label="Garantir minha vaga" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ fechamento */

function Fechamento({ heroMsg }: { heroMsg: string }) {
  return (
    <section className="relative overflow-hidden px-5 py-16 md:px-10 md:py-32">
      <img
        src={heroPoster.url}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,11,0.65) 0%, rgba(11,11,11,0.9) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <h2 className="max-w-4xl font-display uppercase leading-[0.9] text-[clamp(2.3rem,7vw,6rem)]">
            SEU CORRE MOVE PESSOAS. <span style={{ color: LIME }}>HORA DE LUCRAR COM ISSO.</span>
          </h2>
          <a
            href={whatsappLink(heroMsg)}
            target="_blank"
            rel="noopener"
            onClick={() => track("whatsapp_open", { origem: "fechamento" })}
            className="group mt-8 inline-flex min-h-[56px] w-full items-center justify-center gap-3 px-8 text-center sm:w-auto md:mt-10 text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ background: LIME, color: "#0B0B0B" }}
          >
            Quero garantir minha vaga no WhatsApp
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <>
      <Marquee items={["RUN FAST", "RUN FORWARD", "RUNFF CREATORS"]} reverse dark />
      <footer className="border-t px-5 pb-28 pt-10 md:px-10 lg:py-10" style={{ borderColor: "#1D1D1D" }}>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>Runff Creators · Programa de parceiros regionais da Runff.</p>
          <p>
            Vagas limitadas. Aprovação sujeita à validação da equipe Runff. Percentuais e benefícios
            podem variar por corrida.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ----------------------------------------------------------- sticky cta */

function StickyCta({
  heroMsg,
  visible,
  label,
  onForm,
}: {
  heroMsg: string;
  visible: boolean;
  label: string;
  onForm: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
          style={{ borderColor: LINE, background: "rgba(11,11,11,0.95)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex gap-2">
            <button
              onClick={onForm}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center border px-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ borderColor: LINE }}
            >
              <Users className="mr-2 h-4 w-4" /> Cadastro
            </button>
            <a
              href={whatsappLink(heroMsg)}
              target="_blank"
              rel="noopener"
              onClick={() => track("whatsapp_open", { origem: "sticky" })}
              className="inline-flex min-h-[48px] flex-[1.4] items-center justify-center gap-2 px-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ background: LIME, color: "#0B0B0B" }}
            >
              <BadgeCheck className="h-4 w-4" />
              {label}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
