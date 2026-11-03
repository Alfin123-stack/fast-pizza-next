"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { LuArrowLeft, LuClock, LuCupSoda, LuTrash2 } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import { useOrderGate } from "./OrderGate";
import { clearCart, getCartHydrated, getCartItems, getTotalCartPrice, getTotalCartQuantity } from "@/lib/cartSlice";
import { formatCurrency } from "@/lib/helpers";
import { photoUrl } from "@/lib/pizza";

function Total({ value, className }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={value}
          className="inline-block"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.1 : 0.2 }}
        >
          {formatCurrency(value)}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

export default function CartView({ menu, name, popular = [], favourites = [] }) {
  const dispatch = useDispatch();
  const gate = useOrderGate();
  const hydrated = useSelector(getCartHydrated);
  const items = useSelector(getCartItems);
  const total = useSelector(getTotalCartPrice);
  const count = useSelector(getTotalCartQuantity);
  const byId = useMemo(() => new Map(menu.map((i) => [i.id, i])), [menu]);

  if (!hydrated) return <p role="status" className="py-16 text-body-sm text-pewter">Loading your cart…</p>;
  if (!items.length) return <EmptyCart as="h1" />;

  const pizzas = items.filter((i) => i.category !== "drink");
  const drinks = items.filter((i) => i.category === "drink");
  const both = pizzas.length > 0 && drinks.length > 0;
  const blocked = items.some((i) => byId.get(i.pizzaId)?.soldOut || !byId.get(i.pizzaId));
  const prep = Math.max(...items.map((i) => byId.get(i.pizzaId)?.prepMinutes ?? 15));
  const pizzaTotal = pizzas.reduce((n, i) => n + i.totalPrice, 0);
  const drinkTotal = drinks.reduce((n, i) => n + i.totalPrice, 0);

  // "Add a drink?": only when the cart has pizza but no drink. Favourites first, then best sellers, then chef's picks.
  const inCart = new Set(items.map((i) => i.pizzaId));
  const rank = (d) => (favourites.includes(d.id) ? 0 : popular.includes(d.id) ? 1 : d.chef ? 2 : 3);
  const suggestions =
    pizzas.length && !drinks.length
      ? menu.filter((i) => i.category === "drink" && !i.soldOut && !inCart.has(i.id)).sort((a, b) => rank(a) - rank(b) || a.id - b.id).slice(0, 3)
      : [];

  const addDrink = (d) => {
    const outcome = gate.add({ ...d, ingredients: [] });
    if (outcome !== "added") gate.announce(outcome, d);
  };

  const orderButton = (className) =>
    blocked ? (
      <Button disabled className={className}>Order now</Button>
    ) : (
      <Button href="/order/new" className={className}>Order now</Button>
    );

  return (
    <div className="compact pb-20 lg:pb-0">
      <Button href="/menu" variant="link">
        <Icon as={LuArrowLeft} className="size-4" />Back to the menu
      </Button>
      <h1 className="mt-2 text-heading-lg font-whisper sm:mt-4 md:text-display">Your cart{name ? <span className="max-sm:hidden">, {name}</span> : ""}</h1>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] sm:mt-8 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          {[
            ["Pizzas", pizzas],
            ["Drinks", drinks],
          ]
            .filter(([, list]) => list.length > 0)
            .map(([title, list]) => (
              <section key={title} aria-label={title}>
                <h2 className={both ? "mb-3 text-subheading font-whisper" : "sr-only"}>{title}</h2>
                <ul aria-label={`${title} in your cart`} className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {list.map((item) => (
                      <CartItem key={item.pizzaId} item={item} info={byId.get(item.pizzaId)} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}

          {suggestions.length > 0 && (
            <section aria-labelledby="add-drink" className="rounded-card bg-flour p-4 sm:p-5">
              <h2 id="add-drink" className="flex items-center gap-1.5 text-body-sm font-medium"><Icon as={LuCupSoda} className="size-4" />Add a drink?</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                {suggestions.map((d, i) => (
                  <li key={d.id} className={`${i === 2 ? "max-sm:hidden " : ""}flex min-w-0 items-center gap-3 rounded-input bg-cream p-3 max-[319px]:gap-2 max-[319px]:p-2 sm:flex-col sm:items-stretch sm:gap-2`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl(d)} alt="" width={160} height={100} loading="lazy" className="aspect-[16/10] w-20 shrink-0 rounded-input object-cover max-[319px]:w-14 sm:w-full" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2">
                      <p className="text-caption font-medium">{d.name}</p>
                      <span className="text-caption text-pewter sm:hidden">{formatCurrency(d.unitPrice)}</span>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-2 sm:mt-auto">
                      <span className="hidden text-caption text-pewter sm:inline">{formatCurrency(d.unitPrice)}</span>
                      <Button variant="small" onClick={() => addDrink(d)}>
                        Add<span className="sr-only"> {d.name}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="summary-title" className="rounded-card bg-flour p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 id="summary-title" className="text-subheading font-whisper">Order summary</h2>
          <dl className="mt-4 space-y-2 text-body-sm">
            {pizzas.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt>Pizzas</dt>
                <dd>{formatCurrency(pizzaTotal)}</dd>
              </div>
            )}
            {drinks.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt>Drinks</dt>
                <dd>{formatCurrency(drinkTotal)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 border-t border-oven-dark/25 pt-3 text-body font-medium">
              <dt>
                Subtotal <span className="text-caption font-normal text-pewter">({count} {count === 1 ? "item" : "items"})</span>
              </dt>
              <dd>
                <Total value={total} />
              </dd>
            </div>
          </dl>
          <p className="mt-4 flex gap-2 text-caption text-pewter">
            <Icon as={LuClock} className="mt-0.5 size-3.5" />
            <span>Ready in about {prep} min, then delivery (about 30 min, 20 with priority). You pay when it arrives.</span>
          </p>
          {blocked && <p role="alert" className="mt-3 text-caption font-medium">Remove the sold-out item to continue.</p>}
          <div className="mt-5 flex flex-col gap-3">
            {orderButton("hidden w-full lg:inline-flex")}
            <Button variant="inverted" className="w-full" onClick={() => dispatch(clearCart())}>
              <Icon as={LuTrash2} className="size-4" />Clear cart
            </Button>
          </div>
        </aside>
      </div>

      {/* Phones: the total and the order button stay in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-oven-dark/15 bg-cream px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <p className="text-body-sm">
            <span className="text-caption text-pewter">Subtotal</span>
            <br />
            <span className="font-medium">{formatCurrency(total)}</span>
          </p>
          {orderButton("")}
        </div>
      </div>
    </div>
  );
}
