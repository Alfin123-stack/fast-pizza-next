"use client";

import { m, useReducedMotion } from "motion/react";

export const EASE = [0.22, 1, 0.36, 1];

// Fade + rise when the element scrolls into view (once).
export default function Reveal({
  as = "div",
  y = 28,
  x = 0,
  scale = 1,
  blur = false,
  delay = 0,
  duration = 0.9,
  amount = 0.2,
  className = "",
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Tag = m[as] ?? m.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y, x, scale, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount, margin: "0px 0px -6% 0px" }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
