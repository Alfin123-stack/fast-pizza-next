"use client";

import { useEffect, useState } from "react";
import PizzaArt from "@/components/ui/PizzaArt";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { TESTIMONIALS } from "@/content/landing";

// Placeholder reviews: replace with real customer quotes.
const PEOPLE = [
  {
    name: "Ayu R.", short: "Ayu", meta: "Orders weekly",
    text: "I changed the address after ordering and it just worked. The PIN made it painless.",
    card: "bg-oven-dark text-cream", art: { crust: "#e8a24b", sauce: "#c23a25", topping: "#ffd166" },
  },
  {
    name: "Daniel K.", short: "Daniel", meta: "Member since 2025",
    text: "Taking the olives off took two taps. Pizza showed up hot and exactly how I built it.",
    card: "bg-tomato text-cream", art: { crust: "#fff8ec", sauce: "#e8a24b", topping: "#3b1510" },
  },
  {
    name: "Mira T.", short: "Mira", meta: "Orders on weekends",
    text: "Priority really is about twenty minutes. Ordered at kickoff, ate by the first goal.",
    card: "bg-crust text-oven-dark", art: { crust: "#3b1510", sauce: "#657a38", topping: "#ffd166" },
  },
];

const AUTOPLAY_MS = 6500;

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const n = PEOPLE.length;
  const go = (k) => setI(((k % n) + n) % n);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((c) => (c + 1) % n), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [i, playing, n]);

  return (
    <section aria-roledescription="carousel" aria-labelledby="stories-title" className="bg-cream pb-16 md:pb-28">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <SplitText
          id="stories-title"
          text={TESTIMONIALS.title}
          className="mx-auto max-w-[16em] text-heading-lg font-whisper md:text-display"
        />
        <Reveal delay={0.2} className="mt-3 text-caption text-pewter">
          <p>{TESTIMONIALS.sub}</p>
        </Reveal>
      </div>

      <Reveal y={50} className="mt-10 w-full overflow-hidden" amount={0.1}>
        <div style={{ "--w": "min(86vw, 780px)" }}>
          <div
            className="flex gap-4 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              marginLeft: "calc(50% - var(--w) / 2)",
              transform: `translateX(calc(${-i} * (var(--w) + 1rem)))`,
            }}
          >
            {PEOPLE.map((p, k) => (
              <figure
                key={p.name}
                aria-hidden={k !== i}
                aria-roledescription="slide"
                onClick={() => k !== i && go(k)}
                style={{ width: "var(--w)" }}
                className={`relative aspect-[4/5] shrink-0 overflow-hidden rounded-panel p-6 transition-all duration-700 md:aspect-[16/10] md:p-12 ${p.card} ${
                  k === i ? "opacity-100" : "cursor-pointer scale-[0.94] opacity-60"
                }`}
              >
                <div className="pointer-events-none absolute -bottom-[26%] -right-[22%] w-[78%] animate-[spin_90s_linear_infinite] md:-bottom-[40%] md:-right-[8%] md:w-[52%]">
                  <PizzaArt {...p.art} className="w-full" />
                </div>
                <div className="relative flex h-full flex-col justify-between text-left">
                  <div className="flex items-center justify-between text-label uppercase tracking-wide">
                    <span>Fast React Pizza</span>
                    <span className="opacity-90">{TESTIMONIALS.label}</span>
                  </div>
                  <div>
                    <blockquote className="max-w-[16em] text-subheading font-whisper md:max-w-[18em] md:text-heading-sm">
                      “{p.text}”
                    </blockquote>
                    <figcaption className="mt-5 text-body-sm md:mt-6">
                      <span className="text-heading-sm font-whisper md:text-heading">{p.name}</span>
                      <span className="mt-1 block opacity-90">{p.meta}</span>
                    </figcaption>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>

      <div role="group" aria-label={`${TESTIMONIALS.label} controls`} className="mt-6 flex items-center justify-center gap-3">
        <p className="sr-only" aria-live={playing ? "off" : "polite"}>{`Story ${i + 1} of ${n}: ${PEOPLE[i].name}`}</p>
        <Button variant="round" aria-label={TESTIMONIALS.prev} onClick={() => go(i - 1)}>
          ←
        </Button>
        <div className="flex items-center gap-1 rounded-pill bg-flour p-1.5">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "Pause autoplay" : "Play autoplay"}
            className="hit grid size-8 place-items-center rounded-full bg-oven-dark text-micro text-cream"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          {PEOPLE.map((p, k) => (
            <button
              key={p.name}
              type="button"
              onClick={() => go(k)}
              aria-label={`${p.name}, show testimonial`}
              aria-current={k === i}
              className={`hit flex h-8 items-center gap-2 rounded-pill pl-1 text-caption transition-all duration-500 ${
                k === i ? "bg-cream pr-3" : "pr-1 opacity-70 hover:opacity-100"
              }`}
            >
              <span className="grid size-6 place-items-center rounded-full bg-tomato text-micro text-cream">
                {p.short[0]}
              </span>
              {k === i && <span>{p.short}</span>}
            </button>
          ))}
        </div>
        <Button variant="round" aria-label={TESTIMONIALS.next} onClick={() => go(i + 1)}>
          →
        </Button>
      </div>
    </section>
  );
}
