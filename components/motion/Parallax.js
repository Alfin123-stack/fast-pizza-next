"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

// Moves its child against the scroll. speed 0.1 = drifts about 10% of its own height.
export default function Parallax({ speed = 0.1, rotate = 0, fill = false, className = "", children, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const r = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);
  return (
    <div ref={ref} className={className} {...rest}>
      <m.div className={fill ? "size-full" : undefined} style={reduce ? undefined : { y, rotate: r }}>{children}</m.div>
    </div>
  );
}
