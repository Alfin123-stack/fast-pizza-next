"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Inertial smooth scrolling for the landing page. Native scroll position is kept,
// so Motion's useScroll and CSS sticky keep working.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Modal dialogs (the pizza detail and the login prompt) scroll natively: the page behind stays put.
    const lenis = new Lenis({ lerp: 0.1, anchors: true, prevent: (node) => !!node.closest?.('[role="dialog"][aria-modal="true"]') });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
