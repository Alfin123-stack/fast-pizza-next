"use client";

import Link from "next/link";
import { LuShoppingCart, LuArrowRight } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { usePathname } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useSelector } from "react-redux";
import { getLastAdded, getTotalCartPrice, getTotalCartQuantity } from "@/lib/cartSlice";
import { formatCurrency } from "@/lib/helpers";

export default function CartBar() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const quantity = useSelector(getTotalCartQuantity);
  const price = useSelector(getTotalCartPrice);
  const last = useSelector(getLastAdded);

  if (!quantity || pathname === "/cart" || (pathname === "/order" || pathname.startsWith("/order/"))) return null;

  return (
    <div role="region" aria-label="Cart summary" className="compact fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-xl sm:inset-x-4">
      <div className="flex items-center justify-between gap-3 rounded-pill bg-oven-dark px-5 py-2 text-cream sm:px-6 sm:py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-3 text-body-sm">
            <Icon as={LuShoppingCart} className="size-4" />
            <span>
              {quantity} {quantity === 1 ? "item" : "items"}
            </span>
            <span className="text-cream/90">{formatCurrency(price)}</span>
          </p>
          <p aria-live="polite" className="h-4 truncate text-label text-cream/80">
            <AnimatePresence mode="wait" initial={false}>
              {last && (
                <m.span
                  key={last.seq}
                  className="block truncate"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.1 : 0.25 }}
                >
                  Added: {last.name}
                </m.span>
              )}
            </AnimatePresence>
          </p>
        </div>
        <Link href="/cart" className="hit shrink-0 text-body-sm underline decoration-[1.5px] underline-offset-4">
          Open cart<Icon as={LuArrowRight} className="ml-1 inline size-4 align-[-0.15em]" />
        </Link>
      </div>
    </div>
  );
}
