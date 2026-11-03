"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuArrowLeft, LuArrowRight, LuBeanOff, LuCircleCheck, LuCoffee, LuCupSoda, LuFishOff, LuFlame, LuGlassWater, LuHeart, LuLayoutGrid, LuLeaf, LuList, LuMilkOff, LuPizza, LuSearch, LuSlidersHorizontal, LuSnowflake } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { useMenuNav } from "./menuUi";
import { FAVOURITES, SORTS, TABS, filtersFor, hasActiveFilters, hrefFor } from "@/lib/menuQuery";
import { cn } from "@/lib/utils";

const chip = (on) =>
  cn(
    "hit inline-flex items-center rounded-pill border-[1.5px] border-oven-dark px-3 py-1 text-caption transition-colors duration-200 sm:px-4 sm:py-2",
    on ? "bg-oven-dark text-cream" : "bg-cream text-oven-dark hover:bg-flour"
  );

// Pizzas / Drinks. Plain links, so it works without JavaScript too.
const TAB_ICON = { pizzas: LuPizza, drinks: LuCupSoda };
const FILTER_ICON = { vegetarian: LuLeaf, spicy: LuFlame, nodairy: LuMilkOff, nofish: LuFishOff, caffeinefree: LuBeanOff, hot: LuCoffee, cold: LuSnowflake, sparkling: LuGlassWater, available: LuCircleCheck, fav: LuHeart };

export function Tabs({ state, counts }) {
  return (
    <nav aria-label="Menu sections" className="mb-4 sm:mb-6">
      <ul className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const current = t.id === state.tab;
          return (
            <li key={t.id}>
              <Link
                href={hrefFor(state, { tab: t.id, q: "", sort: "default" })}
                aria-current={current ? "page" : undefined}
                scroll={false}
                className={cn(
                  "hit inline-flex items-center gap-2 rounded-pill border-[1.5px] border-oven-dark px-3.5 py-1 text-body-sm transition-colors duration-200 sm:px-5 sm:py-2.5",
                  current ? "bg-oven-dark text-cream" : "hover:bg-flour"
                )}
              >
                <Icon as={TAB_ICON[t.id]} className="size-4 max-sm:hidden" />
                {t.label}
                <span className={cn("rounded-pill px-2 text-label", current ? "bg-cream/20" : "bg-flour")}>{counts[t.category]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Toolbar({ state, loggedIn }) {
  const { go } = useMenuNav();
  const [q, setQ] = useState(state.q);
  const [panel, setPanel] = useState(false);
  const timer = useRef(null);
  const typed = useRef(false);

  // Keep the box in step with the URL (back button, reset), unless the visitor is typing.
  useEffect(() => {
    if (!typed.current) setQ(state.q);
    typed.current = false;
  }, [state.q]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const filters = [...filtersFor(state.category), ...(loggedIn ? [FAVOURITES] : [])];
  const activeCount = state.f.length;

  function onSearch(value) {
    typed.current = true;
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(hrefFor(state, { q: value.replace(/\s+/g, " ").trim() }), { replace: true }), 350);
  }

  const toggle = (id) => go(hrefFor(state, { f: state.f.includes(id) ? state.f.filter((x) => x !== id) : [...state.f, id] }));

  return (
    <div className="mb-2 flex flex-col gap-3 sm:mb-6 sm:gap-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <form
          role="search"
          aria-label={`Search ${state.tab}`}
          action="/menu"
          method="get"
          className="flex min-w-0 basis-full items-center gap-2 sm:flex-1 sm:basis-60"
          onSubmit={(event) => {
            event.preventDefault();
            clearTimeout(timer.current);
            go(hrefFor(state, { q: q.replace(/\s+/g, " ").trim() }));
          }}
        >
          {state.tab !== "pizzas" && <input type="hidden" name="tab" value={state.tab} />}
          {state.f.length > 0 && <input type="hidden" name="f" value={state.f.join(",")} />}
          {state.sort !== "default" && <input type="hidden" name="sort" value={state.sort} />}
          {state.view !== "grid" && <input type="hidden" name="view" value={state.view} />}
          <label htmlFor="menu-search" className="sr-only">
            Search by name or ingredient
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              id="menu-search"
              name="q"
              type="search"
              value={q}
              maxLength={60}
              autoComplete="off"
              enterKeyHint="search"
              placeholder={state.category === "pizza" ? "Name or ingredient" : "Search drinks"}
              onChange={(event) => onSearch(event.target.value)}
              className="min-h-9 w-full min-w-0 rounded-pill border-[1.5px] border-oven-dark bg-cream pl-9 pr-4 text-body-sm placeholder:text-pewter sm:min-h-11 sm:pl-5"
            />
            <Icon as={LuSearch} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pewter sm:hidden" />
          </div>
          <button type="submit" className="hit hidden rounded-pill bg-oven-dark px-5 py-2.5 text-caption text-cream hover:bg-oven-dark/85 sm:inline-flex sm:items-center sm:gap-2">
            <Icon as={LuSearch} className="size-4" />
            Search
          </button>
          <button type="submit" className="sr-only sm:hidden">Search</button>
        </form>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
          <label htmlFor="menu-sort" className="sr-only text-caption text-pewter sm:not-sr-only">
            Sort
          </label>
          <select
            id="menu-sort"
            value={state.sort}
            onChange={(event) => go(hrefFor(state, { sort: event.target.value }))}
            className="min-h-9 w-full min-w-0 rounded-pill border-[1.5px] border-oven-dark bg-cream px-3 text-caption sm:min-h-11 sm:w-auto sm:px-4"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div role="group" aria-label="Layout" className="flex shrink-0 gap-1">
          {["grid", "list"].map((v) => (
            <button key={v} type="button" aria-pressed={state.view === v} onClick={() => go(hrefFor(state, { view: v }))} className={cn(chip(state.view === v), "max-sm:size-9 max-sm:justify-center max-sm:!p-0")}>
              <Icon as={v === "grid" ? LuLayoutGrid : LuList} className="size-4" />
              <span className="max-sm:sr-only sm:ml-2">{v === "grid" ? "Grid" : "List"}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-expanded={panel}
          aria-controls="menu-filters"
          onClick={() => setPanel((v) => !v)}
          className={cn(chip(panel || activeCount > 0), "shrink-0 gap-1.5 sm:hidden")}
        >
          <Icon as={LuSlidersHorizontal} className="size-4" />
          Filters{activeCount ? ` (${activeCount})` : ""}
        </button>
      </div>

      <div className={panel ? undefined : "max-sm:hidden"}>
        <div id="menu-filters" role="group" aria-label="Filters" className={cn("mt-3 flex-wrap gap-2 sm:mt-0 sm:flex", panel ? "flex" : "hidden")}>
          {filters.map((f) => {
            const on = state.f.includes(f.id);
            return (
              <button key={f.id} type="button" aria-pressed={on} onClick={() => toggle(f.id)} className={cn(chip(on), "gap-1.5")}>
                {FILTER_ICON[f.id] && <Icon as={FILTER_ICON[f.id]} className="size-3.5" />}
                {f.label}
              </button>
            );
          })}
          {hasActiveFilters(state) && (
            <Link href={hrefFor(state, { q: "", f: [], sort: "default" })} scroll={false} className="hit px-2 text-caption underline underline-offset-4 hover:opacity-70">
              Clear all
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Numbered pages. Links, so they work without JavaScript; the heading above the list takes focus after a change.
export function Pagination({ state, result }) {
  if (result.pages <= 1) return null;
  const { page, pages } = result;
  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  const items = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) items.push("gap" + n);
    items.push(n);
  });
  const href = (p) => hrefFor(state, { page: p });
  const base = "hit inline-flex min-w-11 items-center justify-center rounded-pill border-[1.5px] border-oven-dark px-3 py-2 text-caption";
  return (
    <nav aria-label="Pagination" className="mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" data-page scroll={false} className={cn(base, "hover:bg-flour")}>
              <Icon as={LuArrowLeft} className="size-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(base, "border-ash text-ash")}>
              <Icon as={LuArrowLeft} className="size-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
            </span>
          )}
        </li>
        {items.map((n) =>
          typeof n === "string" ? (
            <li key={n} aria-hidden="true" className="px-1 text-pewter">…</li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                data-page
                scroll={false}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={cn(base, n === page ? "bg-oven-dark text-cream" : "hover:bg-flour")}
              >
                {n}
              </Link>
            </li>
          )
        )}
        <li>
          {page < pages ? (
            <Link href={href(page + 1)} rel="next" data-page scroll={false} className={cn(base, "hover:bg-flour")}>
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
              <Icon as={LuArrowRight} className="size-4" />
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(base, "border-ash text-ash")}>
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
              <Icon as={LuArrowRight} className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
