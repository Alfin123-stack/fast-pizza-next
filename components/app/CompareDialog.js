"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { LuX } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import useModal from "./useModal";
import { cap, itemCode } from "@/lib/pizza";
import { formatCurrency } from "@/lib/helpers";

const FOCUSABLE = "a[href], button:not([disabled])";

const rows = (drink) =>
  drink
    ? [
        ["Price", (i) => formatCurrency(i.unitPrice)],
        ["Volume", (i) => `${i.volumeMl} ml`],
        ["Served", (i) => i.serving],
        ["Caffeine", (i) => (i.caffeine ? "Contains caffeine" : "Caffeine-free")],
        ["Fizz", (i) => (i.sparkling ? "Sparkling" : "Still")],
        ["Preparation", (i) => `About ${i.prepMinutes} min`],
        ["Allergens", (i) => (i.allergens.length ? i.allergens.join(", ") : "None listed")],
        ["Ingredients", (i) => (i.ingredients ?? []).map(cap).join(", ")],
        ["Availability", (i) => (i.soldOut ? "Sold out" : "Available")],
      ]
    : [
        ["Price", (i) => formatCurrency(i.unitPrice)],
        ["Size", (i) => `${i.sizeCm} cm · ${i.portion}`],
        ["Diet", (i) => (i.vegetarian ? "Vegetarian" : "Contains meat or fish")],
        ["Heat", (i) => (i.spicy ? "Spicy" : "Not spicy")],
        ["Preparation", (i) => `About ${i.prepMinutes} min`],
        ["Allergens", (i) => i.allergens.join(", ")],
        ["Ingredients", (i) => (i.ingredients ?? []).map(cap).join(", ")],
        ["Availability", (i) => (i.soldOut ? "Sold out" : "Available")],
      ];

export default function CompareDialog({ open, items, opener, onClose }) {
  const last = useRef(items);
  if (open) last.current = items;
  useModal(open, { onClose, opener, selector: "[data-compare]" });
  if (typeof document === "undefined") return null;
  return createPortal(<AnimatePresence>{open && <Dialog key="compare" items={last.current} onClose={onClose} />}</AnimatePresence>, document.body);
}

function Dialog({ items, onClose }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector("button")?.focus({ preventScroll: true });
  }, []);
  const drink = items[0]?.category === "drink";

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
      data-compare
      data-lenis-prevent
      className="compact fixed inset-0 z-[65] flex items-end justify-center overflow-y-auto sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.35 }}
      onKeyDown={onKeyDown}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-oven-dark/60 backdrop-blur-sm" onClick={onClose} />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        className="relative my-auto w-full max-w-4xl rounded-t-panel bg-cream p-4 text-oven-dark shadow-[0_30px_80px_-20px_rgba(59,21,16,0.55)] sm:rounded-panel sm:p-8"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
        transition={{ duration: reduce ? 0.15 : 0.55 }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="compare-title" className="text-heading-sm font-whisper">
            Compare {drink ? "drinks" : "pizzas"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hit inline-flex size-9 shrink-0 items-center justify-center rounded-pill border-[1.5px] border-oven-dark bg-cream hover:bg-oven-dark hover:text-cream"
          >
            <Icon as={LuX} className="size-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Comparison table, scrolls sideways on small screens">
          <table className="w-full min-w-[21rem] border-collapse text-left text-caption sm:min-w-[34rem] sm:text-body-sm">
            <caption className="sr-only">Side by side comparison of {items.map((i) => i.name).join(", ")}</caption>
            <thead>
              <tr>
                <td className="w-20 sm:w-28" />
                {items.map((i) => (
                  <th key={i.id} scope="col" className="px-2 pb-3 align-bottom font-medium sm:px-3">
                    <span className="block font-mono text-label font-normal text-pewter">{itemCode(i)}</span>
                    {i.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows(drink).map(([label, get]) => (
                <tr key={label} className="border-t border-oven-dark/15">
                  <th scope="row" className="py-2.5 pr-2 align-top text-[0.65rem] font-medium uppercase tracking-wide text-pewter sm:pr-3 sm:text-label">
                    {label}
                  </th>
                  {items.map((i) => (
                    <td key={i.id} className="px-2 py-2.5 align-top sm:px-3">
                      {get(i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </m.div>
    </m.div>
  );
}
