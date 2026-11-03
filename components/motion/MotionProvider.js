"use client";

import { LazyMotion, domAnimation } from "motion/react";

// Loads Motion's animation features lazily: same animations, smaller initial JavaScript.
export default function MotionProvider({ children }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
