"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SushiConveyorMenu from "@/components/ui/sushi-conveyor-menu";
import Button from "@/components/ui/Button";
import { useOrderGate } from "@/components/app/OrderGate";
import { toBelt } from "@/lib/belt";
import { BELT } from "@/content/landing";

// Today's menu on the conveyor belt. The belt component is used exactly as delivered; everything
// specific to this app (pizzas, prices, cart, login) lives here and in the OrderGate.
export default function PizzaBelt({ pizzas }) {
  // The belt reads prefers-reduced-motion and its own size on the client, so it is mounted after hydration
  // (a reduced-motion visitor would otherwise get a hydration mismatch). Until then the server sends the
  // same heading, text and link, and holds the space, so the page is complete without JavaScript too.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Belt pizzas={pizzas} /> : <BeltFallback />;
}

function BeltFallback() {
  return (
    <section id="pizza-belt" aria-label={BELT.label} className="flex min-h-[36rem] w-full flex-col items-center gap-3 px-4 py-14 text-center lg:min-h-[32.5rem]">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-pewter">{BELT.eyebrow}</p>
      <h2 className="max-w-xl text-balance text-2xl font-medium tracking-tight md:text-3xl">{BELT.title}</h2>
      <p className="max-w-md text-sm text-pewter">{BELT.caption}</p>
      <Button href="/menu" className="mt-3">{BELT.action}</Button>
    </section>
  );
}

function Belt({ pizzas }) {
  const gate = useOrderGate();
  const { items, legend } = useMemo(() => toBelt(pizzas), [pizzas]);
  const pending = useRef(null);

  // The belt's dialog shows a tick and flies back to the belt after "Add to cart". The prompt or toast
  // waits for that to finish (onOpenChange(null)) so the two never overlap.
  const onAdd = useCallback(
    (item) => {
      const pizza = pizzas.find((p) => String(p.id) === item.id);
      if (pizza) pending.current = { pizza, outcome: gate.add(pizza) };
    },
    [pizzas, gate]
  );

  const onOpenChange = useCallback(
    (index) => {
      if (index !== null || !pending.current) return;
      const { pizza, outcome } = pending.current;
      pending.current = null;
      gate.announce(outcome, pizza, { returnTo: "/#pizza-belt" });
    },
    [gate]
  );

  return (
    <SushiConveyorMenu
      id="pizza-belt"
      aria-label={BELT.label}
      items={items}
      legend={legend}
      labels={BELT.labels}
      eyebrow={BELT.eyebrow}
      heading={BELT.title}
      caption={BELT.caption}
      autoplay
      onAdd={onAdd}
      onOpenChange={onOpenChange}
      action={<Button href="/menu">{BELT.action}</Button>}
    />
  );
}
