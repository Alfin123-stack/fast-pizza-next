"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useSelector } from "react-redux";
import { LuBeef, LuCoffee, LuFlame, LuGlassWater, LuLeaf, LuRuler, LuSparkles, LuThermometer, LuTimer, LuTriangleAlert, LuUsers, LuX, LuZap } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { CodePill } from "@/components/ui/Badge";
import QuantityControls from "./QuantityControls";
import useModal from "./useModal";
import { EASE } from "@/components/motion/Reveal";
import { getItemQuantityById } from "@/lib/cartSlice";
import { formatCurrency } from "@/lib/helpers";
import { itemCode } from "@/lib/pizza";

const FOCUSABLE = "a[href], button:not([disabled])";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const folder = (item) => (item.category === "drink" ? "drink-photo" : "pizza-plate");

export default function PizzaDetails({ pizza, opener, onClose, onAdd, onExited }) {
  const open = !!pizza;
  const last = useRef(pizza);
  if (pizza) last.current = pizza;
  useModal(open, { onClose, opener, selector: "[data-pizza-details]" });

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence onExitComplete={onExited}>
      {open && <Dialog key="details" pizza={last.current} onClose={onClose} onAdd={onAdd} />}
    </AnimatePresence>,
    document.body
  );
}

function Fact({ label, icon, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-0.5 rounded-input bg-flour px-2.5 py-1.5 sm:px-3 sm:py-2.5 ${className}`}>
      <dt className="flex items-center gap-1.5 text-label uppercase tracking-wide text-pewter">{icon && <Icon as={icon} className="size-3.5" />}{label}</dt>
      <dd className="text-body-sm">{children}</dd>
    </div>
  );
}

function Dialog({ pizza, onClose, onAdd }) {
  const [more, setMore] = useState(false);
  const x = more ? "" : "max-sm:hidden";
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const quantity = useSelector(getItemQuantityById(pizza.id));
  useEffect(() => {
    ref.current?.querySelector("button")?.focus({ preventScroll: true });
  }, []);
  const drink = pizza.category === "drink";
  const { id, name, unitPrice, soldOut, imageUrl, ingredients = [], vegetarian, spicy, allergens, calories } = pizza;

  const t = (delay = 0, duration = 0.6) => ({ duration: reduce ? 0.15 : duration, delay: reduce ? 0 : delay, ease: EASE });
  const rise = (delay) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: t(delay),
  });

  const onKeyDown = (event) => {
    if (event.key !== "Tab") return;
    const nodes = [...(ref.current?.querySelectorAll(FOCUSABLE) ?? [])];
    const first = nodes[0];
    const end = nodes.at(-1);
    if (!first || !end) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      end.focus();
    } else if (!event.shiftKey && document.activeElement === end) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <m.div
      data-pizza-details
      data-lenis-prevent
      className="compact fixed inset-0 z-[65] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6"
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
        aria-labelledby="pizza-title"
        className="relative my-auto max-sm:my-0 w-full max-w-3xl rounded-t-panel bg-cream p-4 text-oven-dark max-sm:max-h-[82dvh] max-sm:overflow-y-auto max-sm:overscroll-contain shadow-[0_30px_80px_-20px_rgba(59,21,16,0.55)] sm:rounded-panel sm:p-8"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
        transition={t(0, 0.55)}
      >
        <div aria-hidden="true" className="mx-auto -mt-1 mb-2 h-1 w-10 rounded-pill bg-oven-dark/20 sm:hidden" />
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hit inline-flex size-8 items-center justify-center rounded-pill border-[1.5px] border-oven-dark bg-cream text-oven-dark transition-colors duration-200 hover:bg-oven-dark hover:text-cream sm:size-9"
          >
            <Icon as={LuX} className="size-3.5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-8">
          <m.div
            className="relative self-start overflow-hidden rounded-card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={t(0.08, 0.8)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || `/${folder(pizza)}/${id}${soldOut ? "-sold" : ""}.svg`}
              alt={name}
              className={`aspect-[16/10] max-h-20 w-full sm:aspect-square sm:max-h-none ${imageUrl ? `object-cover ${soldOut ? "grayscale" : ""}` : "bg-flour object-contain p-3 sm:p-8"}`}
            />
            {soldOut && (
              <span className="absolute left-3 top-3 rounded-pill bg-oven-dark px-3 py-1.5 text-label font-medium uppercase tracking-wide text-cream">
                Sold out
              </span>
            )}
          </m.div>

          <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
            <m.div className="flex flex-col items-start gap-2 pr-10 sm:gap-3" {...rise(0.14)}>
              <CodePill>{itemCode(pizza)}</CodePill>
              <h2 id="pizza-title" className="text-heading-sm font-whisper">{name}</h2>
              <p className="text-subheading font-whisper">{formatCurrency(unitPrice)}</p>
            </m.div>

            <m.p className="text-body-sm text-pewter" {...rise(0.2)}>{pizza.description}</m.p>

            <m.div {...rise(0.26)}>
              <h3 className="text-label font-medium uppercase tracking-wide text-pewter">Ingredients</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {ingredients.map((i) => (
                  <li key={i} className="rounded-pill border-[1.5px] border-oven-dark px-2.5 py-0.5 text-caption sm:px-3 sm:py-1">{cap(i)}</li>
                ))}
              </ul>
            </m.div>

            <m.dl className="grid grid-cols-2 gap-1.5 sm:gap-2" {...rise(0.32)}>
              {drink ? (
                <>
                  <Fact label="Volume" icon={LuGlassWater}>{pizza.volumeMl} ml</Fact>
                  <Fact label="Served" icon={LuThermometer}>{pizza.serving}</Fact>
                  <Fact label="Preparation" icon={LuTimer} className={x}>About {pizza.prepMinutes} min</Fact>
                  <Fact label="Caffeine" icon={LuCoffee} className={x}>{pizza.caffeine ? "Contains caffeine" : "Caffeine-free"}</Fact>
                  <Fact label="Fizz" icon={LuSparkles} className={x}>{pizza.sparkling ? "Sparkling" : "Still"}</Fact>
                </>
              ) : (
                <>
                  <Fact label="Size" icon={LuRuler}>{pizza.sizeCm} cm</Fact>
                  <Fact label="Portion" icon={LuUsers}>{pizza.portion}</Fact>
                  <Fact label="Preparation" icon={LuTimer} className={x}>About {pizza.prepMinutes} min</Fact>
                  <Fact label="Diet" icon={vegetarian ? LuLeaf : LuBeef} className={x}>{vegetarian ? "Vegetarian" : "Contains meat or fish"}</Fact>
                  <Fact label="Heat" icon={LuFlame} className={x}>{spicy ? "Spicy" : "Not spicy"}</Fact>
                </>
              )}
              {calories ? <Fact label="Calories" icon={LuZap} className={x}>{calories} kcal</Fact> : null}
              <div className="col-span-2 flex flex-col gap-0.5 rounded-input bg-flour px-2.5 py-1.5 sm:px-3 sm:py-2.5">
                <dt className="flex items-center gap-1.5 text-label uppercase tracking-wide text-pewter"><Icon as={LuTriangleAlert} className="size-3.5" />Allergens</dt>
                <dd className="text-body-sm">{allergens.length ? allergens.join(", ") : "None of the 14 main allergens listed"}</dd>
              </div>
            </m.dl>

            <button type="button" aria-expanded={more} onClick={() => setMore((v) => !v)} className="hit -mt-1 self-start text-caption underline underline-offset-4 sm:hidden">
              {more ? "Fewer details" : "More details"}
            </button>

            <m.p className="text-caption text-pewter" {...rise(0.36)}>
              {drink ? "Worked out from the recipe." : "Worked out from the ingredient list."} Tell us about any allergy when you order.
            </m.p>

            <m.div className="mt-1 flex flex-wrap items-center gap-4 max-sm:sticky max-sm:-bottom-4 max-sm:z-10 max-sm:-mx-4 max-sm:-mb-4 max-sm:border-t max-sm:border-oven-dark/10 max-sm:bg-cream max-sm:px-4 max-sm:py-3" {...rise(0.4)}>
              {soldOut ? (
                <Button disabled>Sold out</Button>
              ) : quantity > 0 ? (
                <>
                  <QuantityControls pizzaId={id} name={name} />
                  <Link href="/cart" className="hit text-body-sm underline decoration-[1.5px] underline-offset-4 hover:opacity-70">Open cart →</Link>
                </>
              ) : (
                <Button onClick={() => onAdd(pizza)}>Add to cart · {formatCurrency(unitPrice)}</Button>
              )}
            </m.div>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
