"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import HeroArt from "./HeroArt";
import { Leaf } from "@/components/ui/Illustrations";

// Big pizza on a flat "table" that turns and drifts as you scroll away from the hero.
export default function HeroScene() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const rotate = useTransform(scrollY, [0, 900], [0, 45]);
  const y = useTransform(scrollY, [0, 900], [0, 140]);
  const scale = useTransform(scrollY, [0, 900], [1, 1.14]);
  const ringY = useTransform(scrollY, [0, 900], [0, 70]);
  const still = reduce ? undefined : { rotate, y, scale };

  const leaves = [
    { cls: "right-[44%] top-[26%] hidden w-8 md:block md:w-12", delay: 0, deg: -20 },
    { cls: "right-[8%] top-[22%] hidden w-6 md:block md:w-9", delay: 0.8, deg: 35 },
    { cls: "right-[30%] bottom-[16%] w-7 md:w-10", delay: 1.6, deg: 120 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <m.div
        style={reduce ? undefined : { y: ringY }}
        className="absolute -bottom-[30%] -right-[38%] size-[125vw] rounded-full border border-cream/10 md:-right-[16%] md:size-[980px]"
      />
      <div className="absolute -bottom-[18%] -right-[26%] size-[96vw] rounded-full border border-cream/10 md:-right-[8%] md:size-[760px]" />
      <m.div
        style={still}
        className="absolute -bottom-[6%] -right-[16%] w-[92vw] md:-bottom-[12%] md:-right-[8%] md:w-[50vw] md:max-w-[700px]"
      >
        <div className="absolute inset-[3%] rounded-full bg-black/20" />
        <HeroArt className="relative w-full" />
      </m.div>
      {leaves.map((l, i) => (
        <m.div
          key={i}
          className={`absolute ${l.cls}`}
          style={{ rotate: l.deg }}
          animate={reduce ? undefined : { y: [0, -14, 0], rotate: [l.deg, l.deg + 12, l.deg] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: l.delay }}
        >
          <Leaf className="w-full" fill={i === 1 ? "#ffd166" : "#657a38"} vein="#3b1510" />
        </m.div>
      ))}
    </div>
  );
}
