"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import PizzaArt, { PIZZA_PALETTES } from "@/components/ui/PizzaArt";
import { EASE } from "@/components/motion/Reveal";
import { addItem, getCartHydrated, increaseItemQuantity } from "@/lib/cartSlice";
import { ORDER_GATE } from "@/content/landing";

// Ordering needs an account. Anywhere a pizza can be added, ask the gate first:
//   const outcome = gate.add(pizza)        -> "added" | "login" | "soldout" (adds to the cart only when "added")
//   gate.announce(outcome, pizza)          -> shows the login prompt or a toast for the outcome
// Real enforcement stays on the server (proxy.js protects /order, the order action checks the session).

const PENDING_KEY = "fast-react-pizza:pending-add";
const PENDING_TTL = 30 * 60 * 1000;

const Ctx = createContext(null);

export function useOrderGate() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrderGate must be used inside <OrderGateProvider>.");
  return ctx;
}

const cartLine = (pizza) => ({
  pizzaId: pizza.id,
  category: pizza.category ?? "pizza",
  name: pizza.name,
  quantity: 1,
  unitPrice: pizza.unitPrice,
  totalPrice: pizza.unitPrice,
  addIngredients: [],
  removeIngredients: [],
});

export default function OrderGateProvider({ loggedIn, children }) {
  const dispatch = useDispatch();
  const hydrated = useSelector(getCartHydrated);
  const [prompt, setPrompt] = useState(null); // { pizza, returnTo }
  const [toast, setToast] = useState(null); // { id, text, cart }
  const toastId = useRef(0);

  const showToast = useCallback((text, cart = false) => setToast({ id: ++toastId.current, text, cart }), []);

  const add = useCallback(
    (pizza) => {
      if (pizza.soldOut) return "soldout";
      if (!loggedIn) return "login";
      dispatch(addItem(cartLine(pizza)));
      return "added";
    },
    [dispatch, loggedIn]
  );

  // Like add(), for several of the same item at once (used by "Order again").
  const addMany = useCallback(
    (pizza, quantity) => {
      const outcome = add(pizza);
      if (outcome !== "added") return outcome;
      for (let i = 1; i < Math.min(20, Math.max(1, quantity | 0)); i++) dispatch(increaseItemQuantity(pizza.id));
      return outcome;
    },
    [add, dispatch]
  );

  const announce = useCallback(
    (outcome, pizza, { returnTo } = {}) => {
      if (outcome === "login") setPrompt({ pizza, returnTo, opener: document.activeElement });
      else if (outcome === "soldout") showToast(ORDER_GATE.soldOut(pizza.name));
      else if (outcome === "added") showToast(ORDER_GATE.added(pizza.name), true);
    },
    [showToast]
  );

  // The visitor logged in from the prompt: put the pizza they picked into the cart once the cart has loaded.
  useEffect(() => {
    if (!loggedIn || !hydrated) return;
    let raw = null;
    try {
      raw = sessionStorage.getItem(PENDING_KEY);
      sessionStorage.removeItem(PENDING_KEY);
    } catch {}
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (!p || typeof p.id !== "number" || Date.now() - p.t > PENDING_TTL) return;
      dispatch(addItem(cartLine(p)));
      showToast(ORDER_GATE.welcomeBack(p.name), true);
    } catch {}
  }, [loggedIn, hydrated, dispatch, showToast]);

  const value = useMemo(() => ({ loggedIn, add, addMany, announce }), [loggedIn, add, addMany, announce]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <LoginPrompt state={prompt} onClose={() => setPrompt(null)} />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </Ctx.Provider>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled])';

function LoginPrompt({ state, onClose }) {
  const reduce = useReducedMotion();
  const open = !!state;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const stateRef = useRef(state);
  if (state) stateRef.current = state;

  // Lock page scroll and give focus back to whatever opened the prompt.
  useEffect(() => {
    if (!open) return;
    let opener = stateRef.current?.opener ?? null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus must not leave the dialog. The conveyor belt hands focus back to its plate right after its own dialog
    // closes, which can land after this prompt opened: remember that plate as the opener and pull focus back in.
    const onFocusIn = (event) => {
      const dialog = document.querySelector("[data-login-prompt]");
      if (!dialog || dialog.contains(event.target)) return;
      if (!opener || opener === document.body || !document.contains(opener)) opener = event.target;
      dialog.querySelector("a[href], button")?.focus({ preventScroll: true });
    };
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (opener && opener !== document.body && document.contains(opener)) opener.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>{open && <PromptDialog key="login-prompt" state={state} reduce={reduce} onClose={onClose} />}</AnimatePresence>,
    document.body
  );
}

function PromptDialog({ state, reduce, onClose }) {
  const { pizza, returnTo } = state;
  const ref = useRef(null);
  const primary = useRef(null);
  const next = returnTo ?? `${window.location.pathname}${window.location.search}`;
  const query = `?next=${encodeURIComponent(next)}&reason=order`;
  const palette = PIZZA_PALETTES[pizza.id % PIZZA_PALETTES.length];

  useEffect(() => {
    primary.current?.focus({ preventScroll: true });
  }, []);

  const remember = () => {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ id: pizza.id, name: pizza.name, unitPrice: pizza.unitPrice, t: Date.now() }));
    } catch {}
  };

  const onKeyDown = (event) => {
    if (event.key !== "Tab") return;
    const nodes = [...(ref.current?.querySelectorAll(FOCUSABLE) ?? [])];
    const first = nodes[0];
    const last = nodes.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const t = (delay = 0, duration = 0.7) => ({ duration: reduce ? 0.15 : duration, delay: reduce ? 0 : delay, ease: EASE });
  const rise = (delay) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: t(delay),
  });

  return (
    <m.div
      data-login-prompt
      data-lenis-prevent
      className="compact fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={t(0, 0.35)}
      onKeyDown={onKeyDown}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-oven-dark/60 backdrop-blur-sm" onClick={onClose} />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        aria-describedby="gate-body"
        className="relative my-auto w-full max-w-md rounded-panel bg-cream p-6 text-center text-oven-dark shadow-[0_30px_80px_-20px_rgba(59,21,16,0.55)] sm:p-8"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
        transition={t(0, 0.55)}
      >
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={ORDER_GATE.close}
            className="hit inline-flex size-9 items-center justify-center rounded-pill border-[1.5px] border-oven-dark text-oven-dark transition-colors duration-200 hover:bg-oven-dark hover:text-cream"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>

        <m.div
          aria-hidden="true"
          className="mx-auto w-28 sm:w-32"
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -50, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={t(0.1, 1)}
        >
          <PizzaArt {...palette} className="w-full" />
        </m.div>

        <m.h2 id="gate-title" className="mt-5 text-heading-sm font-whisper" {...rise(0.18)}>
          {ORDER_GATE.title}
        </m.h2>
        <m.p id="gate-body" className="mx-auto mt-3 max-w-xs text-body-sm text-pewter" {...rise(0.26)}>
          {ORDER_GATE.body(pizza.name)}
        </m.p>

        <m.div className="mt-7 flex flex-col gap-3" {...rise(0.34)}>
          <Button ref={primary} href={`/login${query}`} onClick={remember} className="w-full">
            {ORDER_GATE.login}
          </Button>
          <Button href={`/register${query}`} onClick={remember} variant="inverted" className="w-full">
            {ORDER_GATE.register}
          </Button>
          <button type="button" onClick={onClose} className="hit mx-auto text-caption text-pewter underline underline-offset-4 hover:opacity-70">
            {ORDER_GATE.later}
          </button>
        </m.div>
      </m.div>
    </m.div>
  );
}

function Toast({ toast, onDone }) {
  const reduce = useReducedMotion();
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (!toast || hold) return;
    const timer = setTimeout(onDone, 7000);
    return () => clearTimeout(timer);
  }, [toast, hold, onDone]);

  return (
    <>
      {/* Announced to screen readers; the visible toast below is not a live region. */}
      <div role="status" aria-live="polite" className="sr-only">
        {toast?.text}
      </div>
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.id}
            role="group"
            aria-label="Notification"
            className="compact fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4rem)] z-[60] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-pill bg-cream py-2 pl-5 pr-2 sm:inset-x-4 sm:gap-4 sm:py-3 sm:pl-6 sm:pr-3 text-oven-dark shadow-[0_12px_40px_-12px_rgba(59,21,16,0.45)] ring-1 ring-frosted-glass"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE }}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
          >
            <p aria-hidden="true" className="text-body-sm">
              {toast.text}
            </p>
            <span className="flex shrink-0 items-center gap-1">
              {toast.cart && (
                <Link href="/cart" className="hit text-body-sm underline decoration-[1.5px] underline-offset-4 hover:opacity-70">
                  {ORDER_GATE.viewCart}
                </Link>
              )}
              <button
                type="button"
                onClick={onDone}
                aria-label={ORDER_GATE.close}
                className="hit inline-flex size-9 items-center justify-center rounded-pill text-oven-dark transition-colors duration-200 hover:bg-flour"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                </svg>
              </button>
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
