"use client";

import { useEffect, useRef, useState } from "react";

// On desktop the footer stays pinned behind the page and is uncovered as you reach the end.
// Falls back to a normal footer on small screens or when the footer is taller than the window.
export default function FooterReveal({ children }) {
  const ref = useRef(null);
  const [state, setState] = useState({ h: null, pinned: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      const pinned = window.innerWidth >= 768 && h <= window.innerHeight;
      setState((s) => (s.h === h && s.pinned === pinned ? s : { h, pinned }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      className="relative"
      style={state.pinned ? { height: state.h, clipPath: "inset(0)" } : undefined}
    >
      <div ref={ref} className={state.pinned ? "fixed inset-x-0 bottom-0 z-0" : ""}>
        {children}
      </div>
    </div>
  );
}
