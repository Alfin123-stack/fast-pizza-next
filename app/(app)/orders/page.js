import { LuCircleCheck, LuCircleX, LuClock, LuClipboardList } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import Button from "@/components/ui/Button";
import OrderAgainButton from "@/components/app/OrderAgainButton";
import { getMenu, getOrders } from "@/lib/data";
import { formatCurrency } from "@/lib/helpers";
import { orderProgress } from "@/lib/orderStatus";

export const metadata = { title: "My orders", robots: { index: false } };

const date = (iso) =>
  new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

export default async function OrdersPage() {
  const [orders, menu] = await Promise.all([getOrders(), getMenu()]);
  const byId = new Map(menu.map((i) => [i.id, i]));
  const now = Date.now();

  return (
    <>
      <h1 className="text-heading-lg font-whisper md:text-display">My orders</h1>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-panel bg-flour px-6 py-16 text-center">
          <Icon as={LuClipboardList} className="mx-auto mb-4 size-10 text-oven-dark/70" />
          <h2 className="text-heading-sm font-whisper">No orders yet.</h2>
          <p className="mx-auto mt-3 max-w-sm text-body-sm">When you place an order it will show up here, ready to order again.</p>
          <Button href="/menu" className="mt-8">
            Browse the menu
          </Button>
        </div>
      ) : (
        <ul aria-label="Your orders" className="mt-8 flex flex-col gap-4">
          {orders.map((o) => {
            const p = orderProgress(o, now);
            const lines = o.cart ?? [];
            const items = [];
            const skipped = [];
            for (const l of lines) {
              const item = byId.get(l.pizzaId);
              if (item && !item.soldOut) items.push({ item, quantity: l.quantity });
              else skipped.push(l.name);
            }
            return (
              <li key={o.orderCode} className="rounded-card border-[1.5px] border-oven-dark/15 bg-cream p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-body-sm font-medium">
                      <Link href={`/order/${o.orderCode}`} className="hit underline underline-offset-4 hover:opacity-70">
                        Order #{o.orderCode}
                      </Link>
                    </h2>
                    <p className="text-caption text-pewter">
                      {date(o.created_at)} · {o.fulfilment === "pickup" ? "Pickup" : "Delivery"}
                      {o.scheduledFor ? ` · scheduled ${date(o.scheduledFor)}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-oven-dark px-3 py-1.5 text-label font-medium text-cream"><Icon as={p.cancelled ? LuCircleX : p.finished ? LuCircleCheck : LuClock} className="size-3.5" />{p.label}</span>
                </div>
                <p className="mt-3 text-body-sm">{lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <p className="text-body-sm font-medium">{formatCurrency(o.orderPrice + (o.priorityPrice ?? 0))}</p>
                  <OrderAgainButton items={items} skipped={skipped} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
