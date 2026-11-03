"use client";

import { useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import QuantityControls from "./QuantityControls";
import { Badges, CompareButton, CompareCheck, HeartButton } from "./MenuParts";
import { photoUrl } from "./MenuCard";
import { useOrderGate } from "./OrderGate";
import { getItemQuantityById } from "@/lib/cartSlice";
import { formatCurrency } from "@/lib/helpers";
import { cap } from "@/lib/pizza";

// One item in the list view: a compact row with the same actions as the card.
export default function MenuRow({ item, badges, favourite, onFavourite, compare, onCompare, onOpen }) {
  const { id, name, unitPrice, soldOut, imageUrl, ingredients = [], prepMinutes, sizeLabel } = item;
  const gate = useOrderGate();
  const quantity = useSelector(getItemQuantityById(id));

  function add() {
    const outcome = gate.add(item);
    if (outcome !== "added") gate.announce(outcome, item);
  }

  return (
    <li className="flex flex-col gap-2 rounded-card border-[1.5px] border-oven-dark/15 bg-cream p-2.5 sm:flex-row sm:items-center sm:gap-4 sm:p-3">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl || photoUrl(item)}
          alt=""
          width={112}
          height={70}
          loading="lazy"
          className={`aspect-[16/10] w-20 shrink-0 rounded-input object-cover sm:w-28 ${soldOut && imageUrl ? "grayscale" : ""}`}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body-sm font-medium">{name}</h3>
            <Badges item={item} badges={badges} className="!flex-row flex-wrap" />
          </div>
          <p className="mt-0.5 truncate text-caption text-pewter">{ingredients.map(cap).join(", ")}</p>
          <p className="text-caption text-pewter">
            {sizeLabel} · about {prepMinutes} min
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end sm:gap-x-4">
        <p className="min-w-12 text-body-sm font-medium">{formatCurrency(unitPrice)}</p>
        <HeartButton item={item} on={favourite} onToggle={onFavourite} />
        <button
          type="button"
          data-details
          aria-haspopup="dialog"
          onClick={(event) => onOpen(id, event.currentTarget)}
          className="hit text-caption underline underline-offset-4 hover:opacity-70"
        >
          Details<span className="sr-only">: {name}</span>
        </button>
        <CompareButton item={item} on={compare.on} disabled={compare.disabled} onToggle={onCompare} className="sm:hidden" />
        <span className="max-sm:hidden">
          <CompareCheck item={item} on={compare.on} disabled={compare.disabled} onToggle={onCompare} />
        </span>
        {soldOut ? (
          <Button variant="small" disabled>Sold out</Button>
        ) : quantity > 0 ? (
          <QuantityControls pizzaId={id} name={name} />
        ) : (
          <Button variant="small" onClick={add}>
            Add<span className="sr-only"> {name} to cart</span>
          </Button>
        )}
      </div>
    </li>
  );
}
