// Order progress is an ESTIMATE worked out from the clock (there is no kitchen or courier app yet).
// Steps move on at fixed points of the delivery estimate, and the page says so.

export const LEAD_MINUTES = { delivery: 30, deliveryPriority: 20, pickup: 18 };

export const STEPS = {
  delivery: [
    { id: "received", label: "Order received" },
    { id: "baking", label: "In the oven" },
    { id: "onway", label: "On the way" },
    { id: "arrived", label: "Delivered" },
  ],
  pickup: [
    { id: "received", label: "Order received" },
    { id: "baking", label: "In the oven" },
    { id: "ready", label: "Ready for pickup" },
  ],
};

export function orderTiming(order) {
  const pickup = order.fulfilment === "pickup";
  const minutes = pickup ? LEAD_MINUTES.pickup : order.priority ? LEAD_MINUTES.deliveryPriority : LEAD_MINUTES.delivery;
  const created = new Date(order.created_at ?? order.createdAt).getTime();
  const scheduled = order.scheduledFor ? new Date(order.scheduledFor).getTime() : null;
  // Scheduled orders aim to arrive/be ready at the chosen time; baking starts `minutes` earlier.
  const done = scheduled ?? created + minutes * 60_000;
  const start = scheduled ? Math.max(created, scheduled - minutes * 60_000) : created;
  return { pickup, minutes, start, done, scheduled: scheduled !== null };
}

// -> { steps, current (index), label, done (bool), scheduledWait (bool), minutesLeft }
// Estimated clock time of each step, aligned with `steps`: the same split that orderProgress uses.
export function stageTimes(order) {
  const t = orderTiming(order);
  const created = new Date(order.created_at ?? order.createdAt).getTime();
  const span = Math.max(1, t.done - t.start);
  const at = (f) => new Date(t.start + span * f);
  return t.pickup ? [new Date(created), at(0.1), new Date(t.done)] : [new Date(created), at(0.1), at(0.6), new Date(t.done)];
}

// 0..1 share of the estimate that has passed.
export function elapsedShare(order, now = Date.now()) {
  const t = orderTiming(order);
  return Math.min(1, Math.max(0, (now - t.start) / Math.max(1, t.done - t.start)));
}

export function orderProgress(order, now = Date.now()) {
  if (order.status === "cancelled") {
    const steps = orderTiming(order).pickup ? STEPS.pickup : STEPS.delivery;
    return { steps, current: 0, finished: true, waiting: false, cancelled: true, label: "Cancelled", minutesLeft: 0, doneAt: new Date(orderTiming(order).done) };
  }
  const t = orderTiming(order);
  const steps = t.pickup ? STEPS.pickup : STEPS.delivery;
  const span = Math.max(1, t.done - t.start);
  const f = (now - t.start) / span;
  let current;
  if (f < 0) current = 0;
  else if (f < 0.1) current = 0;
  else if (f < (t.pickup ? 1 : 0.6)) current = 1;
  else if (f < 1) current = t.pickup ? 1 : 2;
  else current = steps.length - 1;
  const finished = now >= t.done;
  return {
    steps,
    current,
    finished,
    waiting: f < 0,
    label: f < 0 ? "Scheduled" : steps[current].label,
    minutesLeft: Math.max(0, Math.ceil((t.done - now) / 60_000)),
    doneAt: new Date(t.done),
  };
}
