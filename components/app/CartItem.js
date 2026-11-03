"use client";

import { LuChevronDown, LuTriangleAlert } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { useDispatch } from "react-redux";
import QuantityControls from "./QuantityControls";
import { toggleIngredient } from "@/lib/cartSlice";
import { formatCurrency, PIZZA_EXTRAS } from "@/lib/helpers";
import { cap, photoUrl } from "@/lib/pizza";

function Checklist({ legend, items, selected, onToggle }) {
  return (
    <fieldset className="min-w-0 rounded-card border-[1.5px] border-oven-dark/40 p-4">
      <legend className="px-2 text-caption font-medium">{legend}</legend>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {items.map((name) => {
          const id = `${legend}-${name}`.replace(/\s+/g, "-");
          return (
            <li key={name} className="flex items-center gap-2">
              <input id={id} type="checkbox" checked={selected.includes(name)} onChange={() => onToggle(name)} className="size-4" />
              <label htmlFor={id} className="py-1 text-caption capitalize">
                {name}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

// One line of the cart: picture, what it is, quantity, price, and (for pizzas) what was taken off or added.
export default function CartItem({ item, info }) {
  const { pizzaId, name, quantity, unitPrice, totalPrice, addIngredients = [], removeIngredients = [] } = item;
  const isDrink = item.category === "drink";
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const reduce = useReducedMotion();
  const toggle = (kind) => (ingredient) => dispatch(toggleIngredient({ pizzaId, kind, name: ingredient }));
  const changes = addIngredients.length + removeIngredients.length;
  const soldOut = !!info?.soldOut;
  const ingredients = info?.ingredients ?? [];

  return (
    <m.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
      transition={{ duration: reduce ? 0.1 : 0.3 }}
      className="rounded-card border-[1.5px] border-oven-dark/15 bg-cream p-2.5 sm:p-4"
    >
      <div className="flex gap-3 sm:gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl({ id: pizzaId, category: item.category ?? "pizza", soldOut })}
          alt=""
          width={144}
          height={90}
          className="aspect-[16/10] w-20 shrink-0 self-start rounded-input object-cover min-[400px]:w-24 sm:w-36"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <h3 className="text-body-sm font-medium">{name}</h3>
              {info?.sizeLabel && <p className="text-caption text-pewter">{info.sizeLabel}</p>}
              <p className="text-caption text-pewter">
                {formatCurrency(unitPrice)} × {quantity}
              </p>
            </div>
            <p className="text-body-sm font-medium">{formatCurrency(totalPrice)}</p>
          </div>

          {soldOut && (
            <p role="alert" className="flex items-start gap-2 rounded-input bg-flour px-3 py-2 text-caption">
              <Icon as={LuTriangleAlert} className="mt-0.5 size-3.5" />Sold out today. Remove it from your cart to place the order.
            </p>
          )}

          {!isDrink && changes > 0 && (
            <ul aria-label={`Changes to ${name}`} className="flex flex-wrap gap-1.5">
              {removeIngredients.map((i) => (
                <li key={`r-${i}`} className="rounded-pill bg-flour px-2.5 py-1 text-label capitalize line-through decoration-[1.5px]">
                  <span className="sr-only">Without </span>
                  {i}
                </li>
              ))}
              {addIngredients.map((i) => (
                <li key={`a-${i}`} className="rounded-pill bg-cheese px-2.5 py-1 text-label">
                  <span aria-hidden="true">+ </span>
                  <span className="sr-only">Extra </span>
                  {cap(i)}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <QuantityControls pizzaId={pizzaId} name={name} iconDelete />
            {!isDrink && (
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="hit inline-flex items-center gap-1 text-caption underline underline-offset-4 hover:opacity-70"
              >
                <Icon as={LuChevronDown} className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                {open ? "Hide ingredients" : changes ? `Edit ingredients (${changes})` : "Edit ingredients"}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isDrink && open && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Checklist legend="Remove" items={ingredients} selected={removeIngredients} onToggle={toggle("remove")} />
          <Checklist legend="Add extra" items={PIZZA_EXTRAS} selected={addIngredients} onToggle={toggle("add")} />
        </div>
      )}
    </m.li>
  );
}
