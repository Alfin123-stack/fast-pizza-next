"use client";

import { useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import { CodePill } from "@/components/ui/Badge";
import PizzaArt, { PIZZA_PALETTES } from "@/components/ui/PizzaArt";
import QuantityControls from "./QuantityControls";
import { useOrderGate } from "./OrderGate";
import { getItemQuantityById } from "@/lib/cartSlice";
import { formatCurrency, pizzaCode } from "@/lib/helpers";

export default function MenuItem({ pizza }) {
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const gate = useOrderGate();
  const inCart = useSelector(getItemQuantityById(id)) > 0;

  function add() {
    const outcome = gate.add(pizza);
    if (outcome !== "added") gate.announce(outcome, pizza);
  }

  return (
    <li className="flex flex-col gap-4 rounded-card bg-flour p-4">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-input bg-cream">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className={`size-full object-cover ${soldOut ? "opacity-60 grayscale" : ""}`}
          />
        ) : (
          <PizzaArt {...PIZZA_PALETTES[id % PIZZA_PALETTES.length]} className="h-4/5" />
        )}
      </div>
      <div>
        <CodePill>{pizzaCode(id)}</CodePill>
        <h2 className="mt-3 text-subheading font-whisper">{name}</h2>
        <p className="mt-1 text-caption capitalize text-pewter">{ingredients?.join(", ")}</p>
      </div>
      <div className="mt-auto flex min-h-11 items-center justify-between gap-3">
        {soldOut ? (
          <p className="text-label font-medium uppercase text-pewter">Sold out<span className="sr-only">: {name} is unavailable</span></p>
        ) : (
          <p className="text-body-sm font-medium">{formatCurrency(unitPrice)}</p>
        )}
        {inCart && <QuantityControls pizzaId={id} name={name} />}
        {!soldOut && !inCart && (
          <Button variant="small" onClick={add} aria-label={`Add to cart: ${name}`}>
            Add to cart
          </Button>
        )}
      </div>
    </li>
  );
}
