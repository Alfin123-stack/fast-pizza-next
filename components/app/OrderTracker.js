"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { elapsedShare, orderProgress, stageTimes } from "@/lib/orderStatus";
import { LuBell, LuBellRing, LuBike, LuCheck, LuFlame, LuClipboardList, LuShoppingBag } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const clock = (d) => d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });

const STEP_ICON = { received: LuClipboardList, baking: LuFlame, onway: LuBike, ready: LuShoppingBag, arrived: LuCheck };

function Ring({ share, children }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-32 shrink-0 place-items-center sm:size-36">
      <svg aria-hidden="true" viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - share)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

// The live status card: headline, countdown ring, steps with their estimated times, change alerts.
// Progress is an ESTIMATE from the clock (nobody updates it by hand yet) and the card says so.
export default function OrderTracker({ order, initialNow, code }) {
  const router = useRouter();
  const [now, setNow] = useState(initialNow);
  const [alerts, setAlerts] = useState("off"); // off | on | blocked | unsupported
  const [announce, setAnnounce] = useState("");
  const last = useRef(null);

  const p = orderProgress(order, now);
  const times = stageTimes(order);
  const pickup = order.fulfilment === "pickup";
  const share = p.cancelled ? 0 : p.finished ? 1 : elapsedShare(order, now);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  // Re-read the order from the server now and then (cancelled or edited elsewhere), only while the tab is visible.
  useEffect(() => {
    if (p.finished) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [p.finished, router]);

  useEffect(() => {
    if (typeof Notification === "undefined") setAlerts("unsupported");
    else if (Notification.permission === "denied") setAlerts("blocked");
    else if (Notification.permission === "granted" && localStorage.getItem(`alerts-${code}`) === "1") setAlerts("on");
  }, [code]);

  // Say it out loud (screen readers) and, if allowed, as a browser notification when the step changes.
  useEffect(() => {
    const key = `${p.current}:${p.finished}:${p.cancelled}`;
    if (last.current === null) {
      last.current = key;
      return;
    }
    if (last.current === key) return;
    last.current = key;
    const text = p.cancelled ? "Your order was cancelled." : p.finished ? (pickup ? "Your order is ready for pickup." : "Your order has been delivered.") : `${p.steps[p.current].label}.`;
    setAnnounce(text);
    if (alerts === "on") {
      try {
        new Notification(`Order #${code}`, { body: text });
        navigator.vibrate?.(200);
      } catch {}
    }
  }, [p.current, p.finished, p.cancelled, p.steps, pickup, alerts, code]);

  async function toggleAlerts() {
    if (alerts === "on") {
      localStorage.removeItem(`alerts-${code}`);
      setAlerts("off");
      return;
    }
    const result = await Notification.requestPermission();
    if (result === "granted") {
      try {
        localStorage.setItem(`alerts-${code}`, "1");
      } catch {}
      setAlerts("on");
    } else if (result === "denied") setAlerts("blocked");
  }

  const headline = p.cancelled ? "Order cancelled" : p.finished ? (pickup ? "Ready for pickup" : "Delivered, enjoy!") : p.waiting ? "Scheduled" : p.current === 0 ? "We've got your order" : p.steps[p.current].label === "In the oven" ? "In the oven" : "On its way to you";
  const sub = p.cancelled
    ? "No payment is due."
    : p.finished
      ? `Estimated ${clock(p.doneAt)}`
      : `${p.waiting ? "Planned for" : pickup ? "Ready around" : "Arriving around"} ${clock(p.doneAt)}`;

  return (
    <section aria-labelledby="track-title" className="overflow-hidden rounded-card bg-oven-dark text-cream">
      <div className="flex flex-col items-center gap-5 p-5 text-center sm:flex-row sm:gap-8 sm:p-8 sm:text-left">
        <Ring share={share}>
          {p.cancelled ? (
            <span className="text-heading-sm">×</span>
          ) : p.finished ? (
            <span className="text-heading-sm">✓</span>
          ) : p.waiting ? (
            <span className="text-caption">Later</span>
          ) : (
            <>
              <span className="block text-heading-lg font-whisper leading-none">{p.minutesLeft}</span>
              <span className="text-caption opacity-80">min</span>
            </>
          )}
        </Ring>
        <div className="min-w-0">
          <h2 id="track-title" className="text-heading-sm font-whisper sm:text-heading-lg">{headline}</h2>
          <p className="mt-1 text-body-sm opacity-90">{sub}</p>
          {alerts !== "unsupported" && !p.finished && (
            <button type="button" onClick={toggleAlerts} disabled={alerts === "blocked"} aria-pressed={alerts === "on"} className="hit mt-3 inline-flex items-center rounded-pill border-[1.5px] border-cream/60 px-3 py-1 text-caption hover:bg-cream/10 disabled:opacity-60">
              <Icon as={alerts === "on" ? LuBellRing : LuBell} className="mr-1.5 size-3.5" />{alerts === "on" ? "Alerts on" : alerts === "blocked" ? "Alerts blocked in browser" : "Alert me when it changes"}
            </button>
          )}
        </div>
      </div>

      {!p.cancelled && <ol className="grid gap-px border-t border-cream/15 bg-cream/15 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        {p.steps.map((s, i) => {
          const done = !p.cancelled && (i < p.current || (p.finished && i === p.current));
          const current = !p.cancelled && i === p.current && !p.finished;
          return (
            <li key={s.id} aria-current={current ? "step" : undefined} className={cn("flex items-center gap-3 bg-oven-dark px-5 py-3 sm:flex-col sm:items-start sm:py-4", !done && !current && "opacity-60")}>
              <span aria-hidden="true" className={cn("relative grid size-9 shrink-0 place-items-center rounded-pill border-[1.5px] border-cream/70", done && "bg-cream text-oven-dark", current && "bg-cheese text-oven-dark")}>
                {current && <span className="absolute inset-0 animate-ping rounded-pill bg-cheese/50 motion-reduce:hidden" />}
                <span className="relative"><Icon as={STEP_ICON[done ? "arrived" : s.id]} className="size-5" /></span>
              </span>
              <span className="min-w-0 text-body-sm">
                <span className={cn("block", current && "font-medium")}>{s.label}</span>
                <span className="block text-caption opacity-80">{done || current ? clock(times[i]) : `~${clock(times[i])}`}</span>
                <span className="sr-only">{done ? ", done" : current ? ", current step" : ", coming up"}</span>
              </span>
            </li>
          );
        })}
      </ol>}

      {!p.cancelled && <p className="border-t border-cream/15 px-5 py-3 text-caption opacity-80 sm:px-8">
        Times are estimates from the moment you ordered, not live kitchen or courier data. We'll call you if anything changes.
      </p>}
      <p role="status" aria-live="polite" className="sr-only">{announce}</p>
    </section>
  );
}
