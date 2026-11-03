"use client";

import { m, useReducedMotion } from "motion/react";
import { wedge, toppingAt } from "@/components/ui/PizzaArt";

// The one load-time moment on the page: slices land one after another.
export default function HeroArt({ className = "" }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Illustration of a sliced pizza" className={className}>
      {Array.from({ length: 8 }, (_, i) => (
        <m.g
          key={i}
          style={{ transformOrigin: "100px 100px" }}
          initial={reduce ? false : { opacity: 0, scale: 0.55, rotate: -24 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.15 + i * 0.08 }}
        >
          <path d={wedge(i, 94)} fill="#e8a24b" />
          <path d={wedge(i, 78, 2.4)} fill="#c23a25" />
          <circle cx={toppingAt(i)[0]} cy={toppingAt(i)[1]} r="7" fill="#ffd166" />
        </m.g>
      ))}
    </svg>
  );
}
