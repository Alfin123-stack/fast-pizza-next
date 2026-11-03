"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LuHeart, LuLogOut, LuClipboardList } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

// The toggle lives inside the (blurred) pill, but the panel is rendered into `portalRef` (the header bar).
// A pill with backdrop-filter becomes the containing block for absolutely positioned children,
// which used to squash the panel to the width of the button after scrolling.
export default function MobileMenu({ links, loggedIn, name, signOutAction, dark = false, portalRef }) {
  const line = dark ? "bg-cream" : "bg-oven-dark";
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const panel = useRef(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (refocus) => {
      setOpen(false);
      if (refocus) btn.current?.focus();
    };
    const onKey = (e) => e.key === "Escape" && close(true);
    const onDown = (e) => {
      if (!panel.current?.contains(e.target) && !btn.current?.contains(e.target)) close(false);
    };
    const onResize = () => window.innerWidth >= 768 && close(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const menu = (
    <nav
      ref={panel}
      id="mobile-menu"
      aria-label="Mobile"
      data-lenis-prevent
      className="absolute inset-x-4 top-full z-50 mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-card border border-oven-dark/10 bg-cream px-6 py-6 text-oven-dark sm:inset-x-6 md:hidden"
    >
      <ul className="flex flex-col gap-4 text-subheading font-whisper">
        {[...links, ...(loggedIn ? [{ href: "/orders", label: "My orders", icon: LuClipboardList }, { href: "/menu?f=fav", label: "Favourites", icon: LuHeart }] : [])].map((l) => (
          <li key={l.href}>
            <Link href={l.href} onClick={() => setOpen(false)} className={l.icon ? "hit inline-flex items-center gap-3" : "hit"}>
              {l.icon && <Icon as={l.icon} className="size-5 text-pewter" />}
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3">
        {loggedIn ? (
          <form action={signOutAction}>
            <Button type="submit" variant="inverted" className="w-full">
              <Icon as={LuLogOut} className="size-4" />Sign out{name ? `, ${name}` : ""}
            </Button>
          </form>
        ) : (
          <>
            <Button href="/register" className="w-full" onClick={() => setOpen(false)}>
              Get started
            </Button>
            <Button href="/login" variant="inverted" className="w-full" onClick={() => setOpen(false)}>
              Sign in
            </Button>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <div className="md:hidden">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className={`hit flex size-10 items-center justify-center rounded-pill border-[1.5px] ${dark ? "border-cream" : "border-oven-dark"}`}
      >
        <span className="relative block h-3 w-5" aria-hidden>
          <span className={`absolute left-0 h-[1.5px] w-5 ${line} transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-[1.5px] w-5 ${line} transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-[1.5px] w-5 ${line} transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>
      {open && portalRef?.current && createPortal(menu, portalRef.current)}
    </div>
  );
}
