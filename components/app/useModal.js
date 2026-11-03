"use client";

import { useEffect, useRef } from "react";

// Shared behaviour of the modal dialogs: lock page scroll, keep focus inside, close on Escape,
// and give focus back to whatever opened the dialog.
export default function useModal(open, { onClose, opener, selector }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const openerRef = useRef(opener);
  openerRef.current = opener;

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onFocusIn = (event) => {
      const dialog = document.querySelector(selector);
      if (!dialog || dialog.contains(event.target)) return;
      dialog.querySelector("button, a[href]")?.focus({ preventScroll: true });
    };
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      const el = openerRef.current;
      if (el && document.contains(el)) el.focus?.({ preventScroll: true });
    };
  }, [open, selector]);
}
