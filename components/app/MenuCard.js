"use client";

import { useSelector } from "react-redux";
import { MenuItemCard } from "@/components/ui/menu-item-card";
import QuantityControls from "./QuantityControls";
import { Badges, CompareButton, CompareCheck, HeartButton } from "./MenuParts";
import { useOrderGate } from "./OrderGate";
import { cn } from "@/lib/utils";
import { photoUrl } from "@/lib/pizza";
import { getItemQuantityById } from "@/lib/cartSlice";

export { photoUrl };

// One item on /menu (grid view): the menu-item card, plus what the card itself has no room for
// (labels, favourite, sold-out state, quantity once it is in the cart, details, compare).
export default function MenuCard({ item, badges, favourite, onFavourite, compare, onCompare, onOpen }) {
  const { id, name, unitPrice, soldOut, imageUrl, vegetarian, prepMinutes, sizeLabel } = item;
  const gate = useOrderGate();
  const quantity = useSelector(getItemQuantityById(id));
  const inCart = quantity > 0;

  function add() {
    const outcome = gate.add(item);
    if (outcome !== "added") gate.announce(outcome, item);
  }

  return (
    <li className="relative flex flex-col gap-2">
      <Badges item={item} badges={badges} className="absolute left-2 top-2 z-10 sm:left-3 sm:top-3" />
      <div className="absolute right-2 top-9 z-10 flex flex-col gap-1.5 sm:right-3 sm:top-11">
        <HeartButton item={item} on={favourite} onToggle={onFavourite} />
        <CompareButton item={item} on={compare.on} disabled={compare.disabled} onToggle={onCompare} className="sm:hidden" />
      </div>
      <div
        // Mouse shortcut for "View details". Keyboard and screen-reader users use the button below.
        onClick={(event) => {
          if (event.target.closest("button")) return;
          onOpen(id, event.currentTarget.parentElement.querySelector("[data-details]"));
        }}
        className={cn("cursor-pointer max-sm:flex-1 max-sm:[&>*]:h-full", (soldOut || inCart) && "[&_button]:hidden", soldOut && imageUrl && "[&_img]:grayscale")}
      >
        <MenuItemCard
          imageUrl={imageUrl || photoUrl(item)}
          isVegetarian={vegetarian}
          name={name}
          price={unitPrice}
          quantity={sizeLabel}
          prepTimeInMinutes={prepMinutes}
          onAdd={add}
        />
      </div>
      <div className="flex max-w-sm flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 sm:min-h-11 sm:gap-y-2">
        {/* On phones the whole card opens the details; this button stays for keyboard and screen-reader users. */}
        <button
          type="button"
          data-details
          aria-haspopup="dialog"
          onClick={(event) => onOpen(id, event.currentTarget)}
          className="hit text-caption underline underline-offset-4 transition-opacity hover:opacity-70 max-sm:sr-only max-sm:focus-visible:not-sr-only"
        >
          View details<span className="sr-only">: {name}</span>
        </button>
        <span className="max-sm:hidden">
          <CompareCheck item={item} on={compare.on} disabled={compare.disabled} onToggle={onCompare} />
        </span>
        {inCart && (
          <div className="basis-full">
            <QuantityControls pizzaId={id} name={name} />
          </div>
        )}
      </div>
    </li>
  );
}
