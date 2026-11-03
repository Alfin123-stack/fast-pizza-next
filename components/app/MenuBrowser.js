"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { LuSearchX, LuShoppingCart, LuRotateCcw, LuX } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import MenuCard from "./MenuCard";
import MenuRow from "./MenuRow";
import MenuSkeleton from "./MenuSkeleton";
import PizzaDetails from "./PizzaDetails";
import CompareDialog from "./CompareDialog";
import { Pagination, Tabs, Toolbar } from "./MenuControls";
import { badgesFor } from "./MenuParts";
import { NavContext } from "./menuUi";
import { useOrderGate } from "./OrderGate";
import { toggleFavourite } from "@/app/(app)/menu/actions";
import { groupRuns, hrefFor } from "@/lib/menuQuery";
import { MAX_COMPARE } from "@/lib/compare";

const urlItem = () => {
  const sp = new URLSearchParams(window.location.search);
  const id = Number(sp.get("item") ?? sp.get("pizza"));
  return Number.isInteger(id) && id > 0 ? id : null;
};

// The menu page: tabs, search/filters/sort, grid or list, pagination, details dialog, favourites, compare and "order again".
// Everything about *what* is shown comes from the URL (lib/menuQuery.js) and is computed on the server;
// this component only handles interaction.
export default function MenuBrowser({ menu, state, result, popular, favouriteIds, lastLines, loggedIn }) {
  const router = useRouter();
  const gate = useOrderGate();
  const [navPending, startNav] = useTransition();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [favs, setFavs] = useState(() => new Set(favouriteIds));
  const [favMessage, setFavMessage] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [addedMsg, setAddedMsg] = useState("");
  const opener = useRef(null);
  const compareOpener = useRef(null);
  const pushed = useRef(false);
  const pending = useRef(null);
  const heading = useRef(null);
  const firstRender = useRef(true);

  const popularSet = useMemo(() => new Set(popular), [popular]);
  const byId = useMemo(() => new Map(menu.map((i) => [i.id, i])), [menu]);

  useEffect(() => setFavs(new Set(favouriteIds)), [favouriteIds]);

  // Navigation inside a transition: the current list stays until the new one is ready; after a short delay show the skeleton.
  const go = useCallback(
    (href, { replace } = {}) => startNav(() => (replace ? router.replace(href, { scroll: false }) : router.push(href, { scroll: false }))),
    [router]
  );
  useEffect(() => {
    if (!navPending) return setShowSkeleton(false);
    const t = setTimeout(() => setShowSkeleton(true), 150);
    return () => clearTimeout(t);
  }, [navPending]);

  // After changing page, move focus to the results heading so keyboard and screen-reader users land at the top of the list.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (document.activeElement?.closest?.("[data-page]") || document.activeElement === document.body) heading.current?.focus({ preventScroll: false });
  }, [result.page]);

  // Compare only ever holds items from the visible tab.
  useEffect(() => setCompareIds([]), [state.category]);

  // Details dialog: the open item lives in the URL (?item=3) next to the other params; back closes it.
  useEffect(() => {
    setOpenId(urlItem());
    const onPop = () => setOpenId(urlItem());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = useCallback((id, button) => {
    opener.current = button;
    const sp = new URLSearchParams(window.location.search);
    sp.delete("pizza");
    sp.set("item", String(id));
    window.history.pushState(null, "", `?${sp}`);
    pushed.current = true;
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      const sp = new URLSearchParams(window.location.search);
      sp.delete("item");
      sp.delete("pizza");
      const q = sp.toString();
      window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
      setOpenId(null);
    }
  }, []);

  const current = byId.get(openId) ?? null;

  // "Add to cart" inside the dialog: close first, then tell the visitor (login prompt or toast) so two dialogs never overlap.
  const onAdd = useCallback(
    (item) => {
      pending.current = { item, outcome: gate.add(item) };
      close();
    },
    [gate, close]
  );
  const onExited = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    if (p) gate.announce(p.outcome, p.item);
  }, [gate]);

  const onFavourite = useCallback(
    async (item) => {
      if (!loggedIn) {
        setFavMessage(`Log in to save ${item.name} to your favourites.`);
        return;
      }
      setFavMessage("");
      const was = favs.has(item.id);
      setFavs((s) => {
        const n = new Set(s);
        was ? n.delete(item.id) : n.add(item.id);
        return n;
      });
      const res = await toggleFavourite(item.id);
      if (res?.error) {
        setFavs((s) => {
          const n = new Set(s);
          was ? n.add(item.id) : n.delete(item.id);
          return n;
        });
        setFavMessage("Couldn't update your favourites. Please try again.");
      } else {
        setFavMessage(res.favourite ? `${item.name} saved to your favourites.` : `${item.name} removed from your favourites.`);
        if (state.f.includes("fav")) startNav(() => router.refresh());
      }
    },
    [loggedIn, favs, router, state.f]
  );

  const onCompare = useCallback((item) => {
    setCompareIds((ids) => {
      if (ids.includes(item.id)) return ids.filter((x) => x !== item.id);
      return ids.length >= MAX_COMPARE ? ids : [...ids, item.id];
    });
  }, []);

  const compareItems = compareIds.map((id) => byId.get(id)).filter(Boolean);

  // "Order again": the lines of the last order that are still on the menu and in stock.
  const again = useMemo(
    () =>
      lastLines
        .map((l) => ({ item: byId.get(l.id), quantity: Math.min(20, Math.max(1, l.quantity | 0)) }))
        .filter((l) => l.item && !l.item.soldOut),
    [lastLines, byId]
  );
  const showAgain = again.length > 0 && state.page === 1 && state.q === "" && state.f.length === 0;

  function addAll() {
    let count = 0;
    for (const { item, quantity } of again) if (gate.addMany(item, quantity) === "added") count += quantity;
    setAddedMsg(count ? `Added ${count} ${count === 1 ? "item" : "items"} from your last order to the cart.` : "");
  }

  const Item = state.view === "list" ? MenuRow : MenuCard;
  const listClass = state.view === "list" ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3";
  const renderItems = (items) =>
    items.map((item) => (
      <Item
        key={item.id}
        item={item}
        badges={badgesFor(item, popularSet)}
        favourite={favs.has(item.id)}
        onFavourite={onFavourite}
        compare={{ on: compareIds.includes(item.id), disabled: compareIds.length >= MAX_COMPARE }}
        onCompare={onCompare}
        onOpen={open}
      />
    ));

  const noun = state.category === "pizza" ? "pizzas" : "drinks";
  const label = `${noun[0].toUpperCase()}${noun.slice(1)} on the menu`;
  const grouped = state.sort === "default" && result.items.length > 0;

  return (
    <MotionConfig reducedMotion="user">
      <NavContext.Provider value={{ go, pending: navPending }}>
        <Tabs state={state} counts={result.counts} />

        {showAgain && (
          <section aria-labelledby="again-title" className="mb-4 flex items-center gap-3 rounded-card border-[1.5px] border-oven-dark/15 bg-flour px-3 py-2 sm:mb-8 sm:p-4">
            <div className="min-w-0 flex-1">
              <h2 id="again-title" className="flex items-center gap-1.5 text-body-sm font-medium"><Icon as={LuRotateCcw} className="size-3.5" />Order again</h2>
              <p className="truncate text-caption text-pewter">{again.map((l) => `${l.quantity}× ${l.item.name}`).join(", ")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Button variant="small" onClick={addAll}>Add all</Button>
              <Link href="/cart" className="hit inline-flex items-center gap-1 text-caption underline underline-offset-4 hover:opacity-70"><Icon as={LuShoppingCart} className="size-3.5" />Cart</Link>
            </div>
          </section>
        )}

        <Toolbar state={state} loggedIn={loggedIn} />

        <p role="status" className="mb-2 min-h-4 text-caption text-pewter sm:mb-4 sm:min-h-5">
          {favMessage || addedMsg}
          {!loggedIn && favMessage && (
            <>
              {" "}
              <Link href="/login?next=/menu" className="underline underline-offset-4">Log in</Link>
            </>
          )}
        </p>

        {compareItems.length > 0 && (
          <div role="region" aria-label="Compare" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-pill bg-oven-dark px-4 py-2 text-cream shadow-lg sm:inset-x-4">
            <p className="min-w-0 truncate text-caption">
              Compare {compareItems.length}/{MAX_COMPARE}: {compareItems.map((i) => i.name).join(", ")}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                disabled={compareItems.length < 2}
                onClick={(event) => {
                  compareOpener.current = event.currentTarget;
                  setCompareOpen(true);
                }}
                className="hit rounded-pill bg-cream px-3 py-1.5 text-caption text-oven-dark disabled:opacity-60"
              >
                {compareItems.length < 2 ? "Pick one more" : "Compare"}
              </button>
              <button type="button" onClick={() => setCompareIds([])} aria-label="Clear comparison" className="hit text-body-sm"><Icon as={LuX} className="size-4" /></button>
            </div>
          </div>
        )}

        <h2 ref={heading} tabIndex={-1} className="mb-3 text-caption text-pewter outline-none sm:mb-4 sm:text-body-sm" aria-live="polite">
          {result.total === 0 ? "No results" : `Showing ${result.from}–${result.to} of ${result.total} ${noun}`}
        </h2>

        {navPending && showSkeleton ? (
          <MenuSkeleton view={state.view} />
        ) : result.total === 0 ? (
          <div className="rounded-card bg-flour p-8 text-center">
            <Icon as={LuSearchX} className="mx-auto mb-3 size-8 text-pewter" />
            <p className="text-body-sm">Nothing matches that. Try fewer filters or a different word.</p>
            <Link href={hrefFor(state, { q: "", f: [], sort: "default" })} scroll={false} className="hit mt-3 inline-block text-body-sm underline underline-offset-4">
              Reset search and filters
            </Link>
          </div>
        ) : grouped ? (
          <div className="flex flex-col gap-6 sm:gap-10">
            {groupRuns(result.items).map((run) => (
              <section key={run.group} aria-label={run.group}>
                <h3 className="mb-3 text-subheading font-whisper sm:mb-4">{run.group}</h3>
                <ul aria-label={`${run.group}, ${label}`} className={listClass}>{renderItems(run.items)}</ul>
              </section>
            ))}
          </div>
        ) : (
          <ul aria-label={label} className={listClass}>{renderItems(result.items)}</ul>
        )}

        <Pagination state={state} result={result} />
      </NavContext.Provider>

      <PizzaDetails pizza={current} opener={opener.current} onClose={close} onAdd={onAdd} onExited={onExited} />
      <CompareDialog open={compareOpen} items={compareItems} opener={compareOpener.current} onClose={() => setCompareOpen(false)} />
    </MotionConfig>
  );
}
