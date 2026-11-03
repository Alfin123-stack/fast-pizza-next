import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LuClock, LuMapPin, LuStickyNote, LuStore } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import UpdateOrderPanel from "@/components/app/UpdateOrderPanel";
import ClearCartOnPlaced from "@/components/app/ClearCartOnPlaced";
import OrderTracker from "@/components/app/OrderTracker";
import PinCard from "@/components/app/PinCard";
import OrderActions from "@/components/app/OrderActions";
import OrderMap from "@/components/app/OrderMap";
import RateOrder from "@/components/app/RateOrder";
import { orderProgress } from "@/lib/orderStatus";
import { formatSlot } from "@/lib/checkout";
import { getMenu, getOrder } from "@/lib/data";
import { EDIT_WINDOW_MS, formatCurrency } from "@/lib/helpers";

export async function generateMetadata({ params }) {
  const { code } = await params;
  return { title: `Order #${code}`, robots: { index: false } };
}

export default async function OrderPage({ params, searchParams }) {
  const { code } = await params;
  const { placed } = await searchParams;

  const [order, menu] = await Promise.all([getOrder(code), getMenu().catch(() => [])]);
  if (!order) notFound();

  const pin = (await cookies()).get(`pin-${code}`)?.value;
  const ingredients = Object.fromEntries(menu.map((p) => [p.id, p.ingredients ?? []]));
  const now = Date.now();
  const progress = orderProgress(order, now);
  const pickup = order.fulfilment === "pickup";
  const eta = progress.doneAt;
  const minutesLeft = progress.minutesLeft;
  const deadline = new Date(new Date(order.created_at).getTime() + EDIT_WINDOW_MS).toISOString();

  return (
    <div className="space-y-8">
      <ClearCartOnPlaced placed={placed === "1"} code={code} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-heading-lg font-whisper md:text-display">Order #{order.orderCode}</h1>
        <div className="flex gap-2">
          {order.priority && <Badge>Priority</Badge>}
          {progress.cancelled && <Badge>Cancelled</Badge>}
        </div>
      </div>

      {pin && !progress.cancelled && <PinCard pin={pin} createdAt={order.created_at} />}

      <OrderTracker initialNow={now} code={order.orderCode} order={{ created_at: order.created_at, fulfilment: order.fulfilment, priority: order.priority, status: order.status, scheduledFor: order.scheduledFor ? new Date(order.scheduledFor).toISOString() : null }} />

      {!progress.cancelled && <OrderActions code={order.orderCode} pickup={pickup} address={order.address} doneAtISO={eta.toISOString()} position={order.position ?? ""} />}

      <section aria-labelledby="details-title" className="rounded-card border-[1.5px] border-oven-dark/15 p-6">
        <h2 id="details-title" className="text-subheading font-whisper">{pickup ? "Pickup" : "Delivery"} details</h2>
        <dl className="mt-4 grid gap-4 text-body-sm sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-label uppercase tracking-wide text-pewter"><Icon as={pickup ? LuStore : LuMapPin} className="size-3.5" />{pickup ? "Pick up at" : "Deliver to"}</dt>
            <dd className="mt-1">{order.address}</dd>
            {!pickup && /^-?\d/.test(order.position ?? "") && (
              <dd className="mt-1 space-y-3">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${order.position.split(",")[0]}&mlon=${order.position.split(",")[1]}#map=17/${order.position.split(",")[0]}/${order.position.split(",")[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hit text-caption underline underline-offset-4 hover:opacity-70"
                >
                  See the pin on the map<span className="sr-only"> (opens OpenStreetMap in a new tab)</span>
                </a>
                <OrderMap position={order.position} />
              </dd>
            )}
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-label uppercase tracking-wide text-pewter"><Icon as={LuClock} className="size-3.5" />When</dt>
            <dd className="mt-1">
              {order.scheduledFor ? `Scheduled, ${formatSlot(new Date(order.scheduledFor).toISOString())}` : "As soon as possible"}
              <span className="block text-caption text-pewter">
                {order.scheduledFor ? "Planned for" : "Estimated"} {eta.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                {minutesLeft > 0 && !order.scheduledFor ? ` (about ${minutesLeft} min)` : ""}
              </span>
            </dd>
          </div>
          {order.note ? (
            <div className="sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-label uppercase tracking-wide text-pewter"><Icon as={LuStickyNote} className="size-3.5" />Your note</dt>
              <dd className="mt-1">{order.note}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <ul aria-label="Items in this order" className="divide-y divide-oven-dark/25 border-y border-oven-dark/25">
        {order.cart?.map((item) => (
          <li key={item.pizzaId} className="py-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-body-sm">
                <span className="font-medium">{item.quantity}×</span> {item.name}
              </p>
              <p className="text-body-sm font-medium">{formatCurrency(item.totalPrice)}</p>
            </div>
            {item.category !== "drink" && (
              <p className="mt-1 text-caption capitalize text-pewter">
                {(ingredients[item.pizzaId] ?? [])
                  .filter((i) => !item.removeIngredients?.includes(i))
                  .concat(item.addIngredients ?? [])
                  .join(", ")}
              </p>
            )}
            {(item.addIngredients?.length > 0 || item.removeIngredients?.length > 0) && (
              <p className="mt-1 text-caption">
                {item.addIngredients?.length > 0 && <>Extra: {item.addIngredients.join(", ")}. </>}
                {item.removeIngredients?.length > 0 && <>Without: {item.removeIngredients.join(", ")}.</>}
              </p>
            )}
          </li>
        ))}
      </ul>

      <section aria-label="Order total" className="space-y-2 rounded-card bg-flour p-6 text-body-sm">
        <p>Items: {formatCurrency(order.orderPrice)}</p>
        {order.priority && <p>Priority: {formatCurrency(order.priorityPrice)}</p>}
        <p className="text-body font-medium">
          To pay {pickup ? "at pickup" : "on delivery"}: {formatCurrency(order.orderPrice + (order.priorityPrice ?? 0))}
        </p>
      </section>

      {progress.finished && !progress.cancelled && <RateOrder code={order.orderCode} rating={order.rating ? { stars: order.rating.stars } : null} />}

      {!progress.cancelled && (
      <UpdateOrderPanel
        key={`${order.customer}${order.address}${order.phone}${order.priority}`}
        code={order.orderCode}
        customer={order.customer}
        address={order.address}
        pickup={pickup}
        phone={order.phone}
        priority={!!order.priority}
        deadline={deadline}
      />
      )}
    </div>
  );
}
