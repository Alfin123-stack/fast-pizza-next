"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

// Oversized closing line that settles into place as the footer is uncovered.
export default function GiantWord({ text }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // Function form on purpose: array ranges run natively and snap back at exactly 100% scroll.
  const t = (v) => Math.min(1, Math.max(0, (v - 0.93) / 0.065));
  const y = useTransform(scrollYProgress, (v) => 50 * (1 - t(v)));
  const opacity = useTransform(scrollYProgress, (v) => 0.25 + 0.75 * t(v));
  return (
    <m.p
      aria-hidden
      style={reduce ? undefined : { y, opacity }}
      className="px-6 py-10 text-center text-[clamp(44px,10.5vw,170px)] font-whisper leading-[0.95] tracking-[-0.04em] text-cream md:py-14"
    >
      {text}
    </m.p>
  );
}
