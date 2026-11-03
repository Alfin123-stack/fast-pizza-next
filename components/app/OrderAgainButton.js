"use client";

import { useState } from "react";
import Link from "next/link";
import { LuRotateCcw } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useOrderGate } from "./OrderGate";

// "Order again": puts the items of an old order that are still on the menu and in stock into the cart.
// (Pizzas come back as on the menu; ingredient changes from the old order are not copied.)
export default function OrderAgainButton({ items, skipped = [] }) {
  const gate = useOrderGate();
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  function run() {
    let n = 0;
    for (const { item, quantity } of items) if (gate.addMany(item, quantity) === "added") n += quantity;
    setAdded(n > 0);
    setMessage(
      n > 0
        ? `Added ${n} ${n === 1 ? "item" : "items"} to your cart.${skipped.length ? ` Not available now: ${skipped.join(", ")}.` : ""}`
        : "Nothing from this order is available right now."
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="small" onClick={run} disabled={items.length === 0}>
        <Icon as={LuRotateCcw} className="size-3.5" />Order again
      </Button>
      <p role="status" className="text-caption text-pewter">
        {message}{" "}
        {added && (
          <Link href="/cart" className="underline underline-offset-4">
            Open cart →
          </Link>
        )}
      </p>
    </div>
  );
}
