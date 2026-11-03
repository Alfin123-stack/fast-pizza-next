"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { CodePill } from "@/components/ui/Badge";
import PizzaArt from "@/components/ui/PizzaArt";
import { IngredientRing } from "@/components/ui/Illustrations";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import Parallax from "@/components/motion/Parallax";
import { PIZZA_EXTRAS } from "@/lib/helpers";
import { DISCOVER } from "@/content/landing";

// Chip positions (% of the panel) and how fast each drifts.
const SPOTS = [
  [8, 10, 0.12], [58, 6, -0.1], [30, 22, 0.16], [70, 30, -0.14], [6, 40, -0.08],
  [74, 56, 0.1], [14, 62, 0.14], [50, 72, -0.12], [30, 86, 0.08], [64, 88, -0.06], [4, 82, 0.1],
];

export default function Discover() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const spin = useTransform(scrollYProgress, [0, 1], [-40, 140]);

  return (
    <section id="ingredients" aria-labelledby="discover-title" className="scroll-mt-20 bg-cream">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-28">
        <div className="relative md:min-h-[480px]">
          <Reveal className="font-mono text-label uppercase text-pewter"><p>{DISCOVER.eyebrow}</p></Reveal>
          <SplitText
            id="discover-title"
            text={DISCOVER.title}
            className="mt-6 max-w-[11em] text-heading-lg font-whisper md:text-display"
          />
          <Reveal delay={0.25} blur className="mt-4 max-w-md">
            <p className="text-body-sm">{DISCOVER.body}</p>
          </Reveal>
          <Reveal delay={0.4} className="mt-8">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-3 rounded-pill bg-oven-dark py-2 pl-6 pr-2 text-body-sm text-cream transition-colors hover:bg-oven-dark/85"
            >
              {DISCOVER.cta}
              <span aria-hidden className="grid size-8 place-items-center rounded-full bg-cream/15 transition-transform duration-300 group-hover:translate-x-0.5">
                ▸
              </span>
            </Link>
          </Reveal>

        </div>

        <Reveal y={50} scale={0.97} className="relative">
          <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-panel bg-flour md:aspect-[5/6]">
            <m.div
              style={reduce ? undefined : { rotate: spin }}
              className="absolute left-1/2 top-1/2 w-[112%] -translate-x-1/2 -translate-y-1/2"
            >
              <IngredientRing className="w-full" />
            </m.div>
            <Parallax speed={0.04} className="absolute left-1/2 top-1/2 w-[38%] -translate-x-1/2 -translate-y-1/2">
              <PizzaArt crust="#3b1510" sauce="#c23a25" topping="#ffd166" className="w-full" />
            </Parallax>
            <div role="list" aria-label={DISCOVER.listLabel} className="absolute inset-0">
            {PIZZA_EXTRAS.map((name, i) => {
              const [x, y, speed] = SPOTS[i % SPOTS.length];
              return (
                <Parallax key={name} role="listitem" fill speed={speed} className="absolute inset-0">
                  <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                    <CodePill className="bg-cream">{name}</CodePill>
                  </div>
                </Parallax>
              );
            })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
