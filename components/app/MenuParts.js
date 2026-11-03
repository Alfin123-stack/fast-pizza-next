"use client";

import { LuArrowLeftRight, LuChefHat, LuHeart, LuSparkles, LuStar } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const BADGE_TEXT = { popular: "Popular", new: "New", chef: "Chef's pick" };
const BADGE_ICON = { popular: LuStar, new: LuSparkles, chef: LuChefHat };

// Sold out / Popular / New / Chef's pick. Sold out always wins; at most two others are shown so the photo stays visible.
export function Badges({ item, badges = [], className }) {
  const shown = badges.slice(0, 2);
  // On phones only the first label shows (the photo stays visible); sm and up shows both.
  if (!item.soldOut && !shown.length) return null;
  return (
    <ul aria-label="Labels" className={cn("flex flex-col items-start gap-1", className)}>
      {item.soldOut && (
        <li className="rounded-pill bg-oven-dark px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-cream sm:px-3 sm:py-1.5 sm:text-label">Sold out</li>
      )}
      {shown.map((b, i) => (
        <li key={b} className={cn(i > 0 && "max-sm:hidden", "rounded-pill bg-cheese px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-oven-dark sm:px-3 sm:py-1.5 sm:text-label")}>
          <span className="inline-flex items-center gap-1">
            <Icon as={BADGE_ICON[b]} className="size-3" />
            {BADGE_TEXT[b]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function badgesFor(item, popular) {
  const out = [];
  if (popular.has(item.id)) out.push("popular");
  if (item.isNew && item.addedAt && Date.now() - new Date(item.addedAt).getTime() < 30 * 864e5) out.push("new");
  if (item.badges?.includes("chef")) out.push("chef");
  return out;
}

export function HeartButton({ item, on, onToggle, className }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`Favourite: ${item.name}`}
      onClick={() => onToggle(item)}
      className={cn("hit inline-flex size-8 items-center justify-center rounded-pill border-[1.5px] border-oven-dark bg-cream text-oven-dark transition-colors hover:bg-flour sm:size-9", className)}
    >
      <Icon as={LuHeart} className="size-3.5 sm:size-4" fill={on ? "currentColor" : "none"} />
    </button>
  );
}

// Icon-only compare toggle (phones). Same state as the checkbox used from the sm breakpoint up.
export function CompareButton({ item, on, disabled, onToggle, className }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`Compare: ${item.name}`}
      disabled={disabled && !on}
      onClick={() => onToggle(item)}
      className={cn(
        "hit inline-flex size-8 items-center justify-center rounded-pill border-[1.5px] border-oven-dark transition-colors disabled:opacity-40",
        on ? "bg-oven-dark text-cream" : "bg-cream text-oven-dark hover:bg-flour",
        className
      )}
    >
      <Icon as={LuArrowLeftRight} className="size-3.5" />
    </button>
  );
}

export function CompareCheck({ item, on, disabled, onToggle }) {
  return (
    <label className={cn("hit inline-flex cursor-pointer items-center gap-2 text-caption", disabled && !on && "cursor-not-allowed text-pewter")}>
      <input type="checkbox" checked={on} disabled={disabled && !on} onChange={() => onToggle(item)} className="size-4 accent-[#3b1510]" />
      Compare<span className="sr-only">: {item.name}</span>
    </label>
  );
}
