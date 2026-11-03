"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import Button from "@/components/ui/Button";
import PizzaArt, { PIZZA_PALETTES } from "@/components/ui/PizzaArt";
import { Leaf, PizzaBox, IngredientRing } from "@/components/ui/Illustrations";
import { SEED_MENU } from "@/lib/seed";
import { pizzaCode } from "@/lib/helpers";
import Wordmark from "./Wordmark";
import MobileMenu from "./MobileMenu";
import AccountMenu from "./AccountMenu";

const LINKS = [
  { href: "/menu", label: "Menu", panel: "menu" },
  { href: "/#story", label: "How we bake", panel: "oven" },
  { href: "/#stories", label: "Kitchen" },
];

const OVEN = [
  { href: "/#story", title: "How we bake", hint: "Dough, sauce, cheese and toppings, layer by layer.", icon: <PizzaBox className="size-full" /> },
  { href: "/#ingredients", title: "Ingredients", hint: "Everything on your pizza, and what you can swap.", icon: <IngredientRing className="size-full" /> },
  { href: "/#stories", title: "Kitchen", hint: "A look inside how every pizza is made.", icon: <Leaf className="size-full p-2" /> },
];

const EASE = [0.22, 1, 0.36, 1];

function Panel({ kind, onNavigate, onEnter }) {
  const items =
    kind === "menu"
      ? SEED_MENU.filter((p) => !p.soldOut)
          .slice(0, 6)
          .map((p, i) => ({
            href: "/menu",
            title: p.name,
            hint: `${pizzaCode(p.id)} · ${p.ingredients.slice(0, 3).join(", ")}`,
            icon: <PizzaArt {...PIZZA_PALETTES[i % PIZZA_PALETTES.length]} className="size-full" />,
          }))
      : OVEN;
  return (
    <m.div
      onMouseEnter={onEnter}
      initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
      transition={{ duration: 0.28, ease: EASE }}
      className="absolute left-0 top-full z-50 mt-3 w-[min(360px,90vw)] rounded-[24px] border border-oven-dark/10 bg-cream p-2"
    >
      <ul className="max-h-[70dvh] overflow-auto">
        {items.map((it) => (
          <li key={it.title}>
            <Link
              href={it.href}
              onClick={onNavigate}
              className="flex items-center gap-4 rounded-[18px] p-3 transition-colors hover:bg-oven-dark/[0.06]"
            >
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-flour p-1.5">
                {it.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-body-sm font-medium">{it.title}</span>
                <span className="block truncate text-caption capitalize text-pewter">{it.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </m.div>
  );
}

export default function NavbarShell({ overlay, user, signOutAction, search }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(null);
  const closeTimer = useRef(null);
  const barRef = useRef(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  useEffect(() => setScrolled(scrollY.get() > 24), [scrollY]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pills = overlay && scrolled;
  const dark = overlay && !scrolled; // light text over the dark hero
  const text = dark ? "text-cream" : "text-oven-dark";
  const pill = pills
    ? "rounded-pill bg-cream/85 px-3 py-1.5 backdrop-blur-md md:px-5 md:py-2.5"
    : "rounded-pill px-0 py-0";

  const enter = (panel) => {
    clearTimeout(closeTimer.current);
    setOpen(panel ?? null);
  };
  const leave = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  return (
    <header className={`sticky top-0 z-50 ${overlay ? "h-0" : "bg-cream"}`}>
      <div
        ref={barRef}
        className={`${overlay ? "absolute inset-x-0 top-0" : "relative"} mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 transition-[height] md:h-20 ${text}`}
      >
        <div className={`relative flex items-center gap-8 transition-all duration-500 ${pill}`} onMouseLeave={leave}>
          <Wordmark light={dark} />
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex gap-6 text-body-sm">
              {LINKS.map((l) => (
                <li key={l.href} onMouseEnter={() => enter(l.panel)} onFocus={() => enter(l.panel)}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(null)}
                    aria-current={l.href === pathname ? "page" : undefined}
                    className={`transition-opacity hover:opacity-60 ${open === l.panel && l.panel ? "opacity-60" : ""}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AnimatePresence>
            {open && <Panel key={open} kind={open} onEnter={() => enter(open)} onNavigate={() => setOpen(null)} />}
          </AnimatePresence>
        </div>

        <div className={`flex items-center gap-3 transition-all duration-500 ${pill}`}>
          {search}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <AccountMenu name={user.name} signOutAction={signOutAction} dark={dark} />
            ) : (
              <>
                <Link href="/login" className="hit px-2 text-body-sm transition-opacity hover:opacity-60">
                  Sign in
                </Link>
                <Button href="/register" variant={dark ? "light" : "filled"} className="!py-2.5">
                  Get started
                </Button>
              </>
            )}
          </div>
          {!user && (
            <Button href="/register" variant={dark ? "light" : "filled"} className={`!px-3 !py-2 !text-caption md:hidden ${pills ? "max-[359px]:hidden" : ""}`}>
              Get started
            </Button>
          )}
          <MobileMenu
            links={LINKS}
            loggedIn={!!user}
            name={user?.name}
            signOutAction={signOutAction}
            dark={dark}
            portalRef={barRef}
          />
        </div>
      </div>
    </header>
  );
}
