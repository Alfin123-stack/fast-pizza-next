"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuHeart, LuLogOut, LuClipboardList } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { AnimatePresence, m, useReducedMotion } from "motion/react";

// Signed-in menu: one round button with the user's initial instead of several links in the bar.
// Opens a small panel with Orders, Favourites and Sign out. Escape or a click outside closes it.
export default function AccountMenu({ name, signOutAction, dark = false }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  const reduce = useReducedMotion();
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e) => {
      if (root.current && !root.current.contains(e.target)) setOpen(false);
    };
    const onFocusOut = (e) => {
      if (root.current && e.relatedTarget && !root.current.contains(e.relatedTarget)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    const el = root.current;
    el?.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      el?.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  const item = "hit flex w-full items-center gap-2.5 rounded-input px-3 py-2.5 text-left text-body-sm transition-colors hover:bg-oven-dark/[0.06]";

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={name ? `Account menu, ${name}` : "Account menu"}
        onClick={() => setOpen((o) => !o)}
        className={`hit flex size-10 items-center justify-center rounded-pill border-[1.5px] text-body-sm font-medium transition-colors duration-200 ${
          dark ? "border-cream text-cream hover:bg-cream/10" : "border-oven-dark text-oven-dark hover:bg-flour"
        } ${open ? (dark ? "bg-cream/10" : "bg-flour") : ""}`}
      >
        {initial}
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            id="account-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.2 }}
            className="absolute right-0 top-full z-50 mt-3 w-56 rounded-card border border-oven-dark/10 bg-cream p-2 text-oven-dark shadow-[0_20px_50px_-20px_rgba(59,21,16,0.4)]"
          >
            {name && <p className="px-3 pb-2 pt-1 text-caption text-pewter">Signed in as {name}</p>}
            <ul>
              <li>
                <Link href="/orders" onClick={() => setOpen(false)} className={item}>
                  <Icon as={LuClipboardList} className="text-pewter" />My orders
                </Link>
              </li>
              <li>
                <Link href="/menu?f=fav" onClick={() => setOpen(false)} className={item}>
                  <Icon as={LuHeart} className="text-pewter" />Favourites
                </Link>
              </li>
            </ul>
            <form action={signOutAction} className="mt-1 border-t border-oven-dark/10 pt-1">
              <button type="submit" className={item}>
                <Icon as={LuLogOut} className="text-pewter" />Sign out
              </button>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
