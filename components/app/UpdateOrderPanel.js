"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormStatus from "@/components/ui/FormStatus";
import { updateOrder, cancelOrder } from "@/app/(app)/order/actions";
import { formatTime } from "@/lib/helpers";

export default function UpdateOrderPanel({ code, customer, address, phone, priority, deadline, pickup = false }) {
  const [state, formAction, pending] = useActionState(updateOrder, {});
  const [cancelState, cancelAction, cancelling] = useActionState(cancelOrder, {});
  const [confirm, setConfirm] = useState(false);
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.round((new Date(deadline) - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const v = state?.values ?? {};

  if (left === 0) {
    return (
      <section aria-labelledby="update-title" className="rounded-card bg-flour p-6">
        <h2 id="update-title" className="text-subheading font-whisper">Update order</h2>
        <p className="mt-2 text-body-sm">The 5-minute window to change this order has closed.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="update-title" className="rounded-card bg-flour p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="update-title" className="text-subheading font-whisper">Update order</h2>
        {left !== null && (
          <span className="rounded-pill border-[1.5px] border-oven-dark px-3 py-1 font-mono text-label">
            {formatTime(left)} left
          </span>
        )}
      </div>
      <p className="mt-2 text-body-sm">Change your details with the PIN shown when you ordered.</p>

      <form action={formAction} aria-labelledby="update-title" className="mt-6 grid gap-5 md:grid-cols-2">
        <input type="hidden" name="code" value={code} />
        <Input label="Name" name="customer" autoComplete="name" defaultValue={v.customer ?? customer} required />
        <Input label="Phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={v.phone ?? phone} required />
        {!pickup && <Input label="Address" name="address" autoComplete="street-address" defaultValue={v.address ?? address} className="md:col-span-2" required />}
        {!pickup && (
        <div className="flex items-center gap-3 md:col-span-2">
          <input id="upd-priority" name="priority" type="checkbox" defaultChecked={priority} disabled={priority} className="size-5" />
          <label htmlFor="upd-priority" className="text-body-sm">
            {priority ? "Priority delivery is on" : "Add priority delivery (20% extra)"}
          </label>
        </div>
        )}
        <Input label="PIN" name="pin" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="off" hint="The 6-digit PIN shown when you ordered." placeholder="000000" required className="md:max-w-60" />
        <FormStatus state={state} className="md:col-span-2" />
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-oven-dark/15 pt-5">
        {!confirm ? (
          <button type="button" onClick={() => setConfirm(true)} className="hit text-body-sm underline underline-offset-4 hover:opacity-70">Cancel this order</button>
        ) : (
          <form action={cancelAction} aria-label="Cancel order" className="grid gap-3 md:max-w-sm">
            <input type="hidden" name="code" value={code} />
            <p className="text-body-sm">Cancel this order? Enter your PIN to confirm. Nothing is charged.</p>
            <Input label="PIN" name="pin" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="off" placeholder="000000" required />
            <FormStatus state={cancelState} />
            <div className="flex gap-3">
              <Button type="submit" variant="inverted" disabled={cancelling}>{cancelling ? "Cancelling..." : "Yes, cancel order"}</Button>
              <Button variant="link" onClick={() => setConfirm(false)}>Keep it</Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
