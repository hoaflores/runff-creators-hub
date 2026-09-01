import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { LIME, LINE } from "@/lib/runff/config";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTag({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/45">
      <span className="font-mono" style={{ color: LIME }}>
        {n}
      </span>
      <span className="h-px w-8" style={{ background: LINE }} />
      <span>{children}</span>
    </div>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(2rem,6vw,4.6rem)] ${className}`}
    >
      {children}
    </h2>
  );
}

export function Marquee({
  items,
  reverse = false,
  dark = false,
}: {
  items: string[];
  reverse?: boolean;
  dark?: boolean;
}) {
  const loop = [...items, ...items, ...items];
  return (
    <div
      className="flex overflow-hidden border-y py-4"
      style={{ borderColor: LINE, background: dark ? "transparent" : LIME }}
    >
      <div
        className={`flex min-w-full shrink-0 items-center gap-8 whitespace-nowrap ${
          reverse ? "animate-[runff-marquee-rev_28s_linear_infinite]" : "animate-[runff-marquee_24s_linear_infinite]"
        }`}
      >
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-8 font-display text-[clamp(1.1rem,2.6vw,2rem)] uppercase"
            style={{ color: dark ? "rgba(255,255,255,0.35)" : "#0B0B0B" }}
          >
            {item}
            <span style={{ color: dark ? LIME : "#0B0B0B" }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Counter({
  to,
  duration = 1.4,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
