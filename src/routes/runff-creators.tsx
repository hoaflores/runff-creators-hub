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
  Gift,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Ticket,
  Users,
  Video,
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

const NAV = [
  { id: "como-funciona", label: "Como funciona" },
  { id: "ganhos", label: "Ganhos" },
  { id: "recompensas", label: "Benefícios" },
  { id: "corridas", label: "Corridas" },
  { id: "faq", label: "FAQ" },
];

const STICKY_LABEL: Record<string, string> = {
  topo: "Quero participar",
  "como-funciona": "Quero participar",
  ganhos: "Quero ganhar com isso",
  recompensas: "Quero esses benefícios",
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
      className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 border px-7 text-[12px] font-semibold uppercase tracking-[0.18em] transition hover:border-white/60 sm:w-auto ${className}`}
      style={{ borderColor: "rgba(255,255,255,0.35)" }}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
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
    const ids = ["topo", "como-funciona", "ganhos", "recompensas", "corridas", "cadastro", "faq"];
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
      <Marquee items={["CORRA", "INFLUENCIE", "GANHE", "REPITA", "RUNFF CREATORS"]} />
      <StatsBand heroMsg={heroMsg} />
      <ComoFunciona />
      <Simulador heroMsg={heroMsg} />
      <Recompensas heroMsg={heroMsg} />
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all"
        style={{
          background: scrolled ? "rgba(11,11,11,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : undefined,
          borderBottom: scrolled ? `1px solid ${LINE}` : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
          <button onClick={() => scrollToId("topo")} className="flex items-baseline gap-2">
            <span className="font-display text-2xl uppercase tracking-tight">RUNFF</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: LIME }}
            >
              Creators
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                className="text-[12px] uppercase tracking-[0.16em] text-white/60 transition hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
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
            <button
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center border lg:hidden"
              style={{ borderColor: LINE }}
            >
              {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t lg:hidden"
              style={{ borderColor: LINE, background: "#0B0B0B" }}
            >
              <div className="flex flex-col px-5 py-3">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setOpen(false);
                      scrollToId(item.id);
                    }}
                    className="py-3 text-left font-display text-xl uppercase"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setOpen(false);
                    scrollToId("cadastro");
                  }}
                  className="mt-2 mb-3 inline-flex min-h-[52px] items-center justify-center gap-2 px-6 text-[12px] font-semibold uppercase tracking-[0.18em]"
                  style={{ background: LIME, color: "#0B0B0B" }}
                >
                  Garantir minha vaga
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      className="relative flex min-h-[88svh] flex-col justify-center overflow-hidden pb-16 pt-28 md:min-h-[92svh] md:pb-20 md:pt-32"
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
        className="relative mx-auto grid w-full max-w-[1500px] gap-10 px-5 md:px-10 lg:grid-cols-2 lg:items-end"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: LIME, color: LIME }}
          >
            <Sparkles className="h-3 w-3" />
            Comissão de até 10% · Campanha de kit completo com vagas limitadas
          </motion.div>

          <h1 className="mt-6 font-display uppercase leading-[0.88] tracking-[-0.015em] text-[clamp(2.5rem,8vw,6.5rem)]">
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
            className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/70 md:text-[16px]"
          >
            Divulgue as corridas Runff e ganhe <strong>até 10% por inscrição</strong>. E tem mais: você ainda pode escolher uma prova e conquistar{" "}
            <strong>inscrição + kit completo</strong> gravando 10 conteúdos aprovados.
          </motion.p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(heroMsg)}
              target="_blank"
              rel="noopener"
              onClick={() => track("whatsapp_open", { origem: "hero" })}
              className="group inline-flex min-h-[50px] items-center justify-center gap-2 px-7 text-[12px] font-semibold uppercase tracking-[0.18em]"
              style={{ background: LIME, color: "#0B0B0B" }}
            >
              QUERO SER INFLUENCER RUNFF
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <button
              onClick={() => scrollToId("cadastro")}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 border px-7 text-[12px] font-semibold uppercase tracking-[0.18em] transition hover:border-white/60"
              style={{ borderColor: "rgba(255,255,255,0.35)" }}
            >
              Fazer meu cadastro
            </button>
          </div>

          <p className="mt-6 text-[13px] text-white/45">
            Aprovação sujeita à validação da equipe Runff. Vagas limitadas por corrida.
            {cidade ? ` Corridas perto de ${cidade}.` : ""}
          </p>
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
    <section className="border-b px-5 py-12 md:px-10" style={{ borderColor: LINE }}>
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p className="font-display leading-none text-[clamp(2.2rem,10vw,4rem)]" style={{ color: LIME }}>
                {stat.value}
              </p>
              <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-white/45">{stat.label}</p>
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
    d: "Preencha o formulário e nosso time de atendimento valida sua entrada pelo WhatsApp.",
  },
  {
    icon: Ticket,
    t: "Receba seu link e cupom",
    d: "Você recebe link próprio de divulgação e escolhe se quer criar um cupom de desconto.",
  },
  {
    icon: Sparkles,
    t: "Divulgue com apoio",
    d: "Uma equipe à disposição para auxiliar ativamente: ideias, construção de conteúdos e acompanhamento de vendas.",
  },
  {
    icon: Coins,
    t: "Ganhe comissão",
    d: "Até 10% por inscrição vendida, com pagamento recorrente enquanto suas vendas saírem.",
  },
];

function ComoFunciona() {
  return (
    <section id="como-funciona" className="px-5 py-20 md:px-10 md:py-24" style={{ background: "#101010" }}>
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <SectionTag n="01">Como funciona</SectionTag>
          <SectionTitle className="mt-6 max-w-3xl">
            Quatro passos do cadastro à comissão.
          </SectionTitle>
        </Reveal>

        <div className="mt-14 grid gap-px md:grid-cols-2 lg:grid-cols-4" style={{ background: LINE }}>
          {PASSOS.map((passo, i) => {
            const Icon = passo.icon;
            return (
              <Reveal key={passo.t} delay={i * 0.06}>
                <div className="h-full p-7" style={{ background: "#101010" }}>
                  <Icon className="h-6 w-6" style={{ color: LIME }} />
                  <p className="font-mono mt-5 text-[12px]" style={{ color: LIME }}>
                    0{i + 1}
                  </p>
                  <h3 className="mt-3 font-display text-[24px] uppercase leading-tight">{passo.t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/60">{passo.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 border p-7 md:p-9" style={{ borderColor: LIME, background: "#0D1206" }}>
            <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
              <Video className="h-9 w-9" style={{ color: LIME }} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: LIME }}>
                  Diferencial da campanha · Vagas limitadas
                </p>
                <h3 className="mt-2 font-display text-[28px] uppercase leading-tight md:text-[34px]">
                  Grave 10 conteúdos aprovados e corra de graça com kit completo
                </h3>
                <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-white/65">
                  Escolha uma corrida Runff e, cumprindo 10 conteúdos validados e aprovados sobre o
                  evento, você recebe inscrição + kit completo de presente, sem precisar vender nada.
                  {"\n"}Atenção! Não é automático: a vaga é validada com nossa equipe de atendimento.
                </p>
              </div>
              <button
                onClick={() => scrollToId("cadastro")}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 px-7 text-[12px] font-semibold uppercase tracking-[0.18em]"
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
    <section id="ganhos" className="px-5 py-20 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionTag n="02">Quanto você pode ganhar</SectionTag>
          <SectionTitle className="mt-6">Faça as contas da sua audiência.</SectionTitle>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
            Arraste e veja uma estimativa. O valor é uma simulação com 10% de comissão, os ganhos
            reais dependem das suas vendas e de como você compõe comissão + cupom.*
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
                * Simulação com comissão de 10%. O cupom de desconto é opcional e seu cálculo é
                baseado nos seus 10% de comissão: você escolhe como compor comissão + cupom, dentro
                do limite de 10% total.
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

/* ---------------------------------------------------------- recompensas */

const TRILHA = [
  {
    icon: Coins,
    marco: "Comissão",
    premio: "Até 10% por inscrição",
    detalhe: "Cada venda com seu link rende comissão, paga de forma recorrente.",
  },
  {
    icon: Gift,
    marco: "Campanha de conteúdo",
    premio: "Inscrição + kit completo",
    detalhe: "Grave 10 conteúdos aprovados sobre o evento e corra de graça, sem precisar vender.",
  },
  {
    icon: Ticket,
    marco: "Cupom opcional",
    premio: "Desconto para sua base",
    detalhe: "Você escolhe se cria cupom. A composição sai dos seus 10% de comissão.",
  },
  {
    icon: Users,
    marco: "Equipe à disposição",
    premio: "Apoio ativo de verdade",
    detalhe: "Ideias, construção de conteúdos e acompanhamento de vendas com o time Runff.",
  },
];

function Recompensas({ heroMsg }: { heroMsg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <section id="recompensas" className="px-5 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <SectionTag n="03">O que você recebe</SectionTag>
          <SectionTitle className="mt-6 max-w-3xl">Comissão, kit, cupom e apoio de verdade.</SectionTitle>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/65">
             Ganhe com suas vendas e, se quiser, participe da campanha de conteúdo para correr de
             graça com kit completo, sempre com uma equipe do seu lado.
          </p>
        </Reveal>

        <div ref={ref} className="relative mt-14">
          <div className="absolute left-0 right-0 top-0 h-px" style={{ background: LINE }} />
          <motion.div
            className="absolute left-0 top-0 h-px origin-left"
            style={{ scaleX: line, background: LIME, width: "100%" }}
          />
          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4" style={{ background: LINE }}>
            {TRILHA.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.marco} delay={i * 0.06}>
                  <div className="h-full p-7" style={{ background: "#0B0B0B" }}>
                    <Icon className="h-6 w-6" style={{ color: LIME }} />
                    <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {item.marco}
                    </p>
                    <h3 className="mt-2 font-display text-[26px] uppercase leading-tight">
                      {item.premio}
                    </h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-white/55">{item.detalhe}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-white/40">
          * Cupom de desconto é opcional. O cálculo do cupom é baseado nos 10% de comissão do
          influencer: você escolhe como compor sua comissão + o cupom, dentro do limite de 10% total.
          Vagas limitadas e aprovação sujeita à validação da equipe.
        </p>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaWhats heroMsg={heroMsg} label="Quero esses benefícios" origem="recompensas" />
            <CtaCadastro label="Garantir minha vaga" />
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
    <section id="corridas" className="px-5 py-20 md:px-10 md:py-24" style={{ background: "#101010" }}>
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <SectionTag n="04">Próximas corridas</SectionTag>
          <SectionTitle className="mt-6 max-w-3xl">Escolha a prova que você quer receber.</SectionTitle>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/65">
             Corridas abertas no calendário oficial Runff. Você pode divulgar qualquer uma delas com
             seu link e cupom e também solicitar a vaga da campanha de conteúdo, sujeita à
            aprovação do time.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center gap-2">
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
          className="runff-scroll -mx-5 mt-10 flex snap-x snap-mandatory gap-px overflow-x-auto px-5 pb-4 md:mx-0 md:px-0"
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
              <motion.a
                key={event.source_id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.05 }}
                href={event.event_url ?? "https://runff.com.br/#lista_eventos"}
                target="_blank"
                rel="noopener"
                onClick={() => track("event_card_click", { id: event.source_id, cidade: event.city })}
                className="group flex w-[300px] shrink-0 snap-start flex-col border md:w-[340px]"
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
                <div className="flex flex-1 flex-col p-6">
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
              </motion.a>
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
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step === 1 && (form.name.trim().length < 2 || form.whatsapp.trim().length < 8)) {
      setError("Preencha nome e WhatsApp para continuar.");
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
    <section id="cadastro" className="px-5 py-20 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <SectionTag n="05">Cadastro</SectionTag>
            <SectionTitle className="mt-6">
              Garanta sua vaga.{" "}
              <span style={{ color: LIME }}>A conversa continua no WhatsApp.</span>
            </SectionTitle>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
              Leva menos de dois minutos. Depois de enviar, abrimos o WhatsApp com a mensagem pronta
              para o time Runff validar sua entrada.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Comissão de até 10% por inscrição vendida",
                "Campanha: 10 conteúdos aprovados = kit completo + inscrição",
                "Cupom de desconto opcional (composição dos seus 10%)",
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
    <section id="faq" className="px-5 py-20 md:px-10 md:py-24" style={{ background: "#101010" }}>
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <SectionTag n="06">Perguntas frequentes</SectionTag>
          <SectionTitle className="mt-6">Sem pegadinha.</SectionTitle>
        </Reveal>

        <div className="mt-12 border-t" style={{ borderColor: LINE }}>
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b" style={{ borderColor: LINE }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex min-h-[64px] w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-[22px] uppercase leading-tight">{q}</span>
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
    <section className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32">
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
            "linear-gradient(105deg, rgba(204,252,87,0.92) 0%, rgba(204,252,87,0.9) 30%, rgba(11,11,11,0.9) 30%, rgba(11,11,11,0.95) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <h2 className="max-w-4xl font-display uppercase leading-[0.9] text-[clamp(2.3rem,7vw,6rem)]">
            SEU CORRE JÁ MOVE PESSOAS. AGORA ELE TAMBÉM PODE RENDER E TE LEVAR PRA LARGADA DE GRAÇA.
          </h2>
          <a
            href={whatsappLink(heroMsg)}
            target="_blank"
            rel="noopener"
            onClick={() => track("whatsapp_open", { origem: "fechamento" })}
            className="group mt-10 inline-flex min-h-[56px] items-center gap-3 px-8 text-[12px] font-semibold uppercase tracking-[0.18em]"
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
          className="fixed inset-x-0 bottom-0 z-50 border-t px-4 py-3 lg:hidden"
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
