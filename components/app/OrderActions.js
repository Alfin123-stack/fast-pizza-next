"use client";

import { useState } from "react";
import { LuCalendarPlus, LuCopy, LuNavigation, LuPhone, LuPrinter, LuShare2 } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { SHOP } from "@/lib/checkout";

const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const esc = (s) => String(s).replace(/[\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

const btn = "hit inline-flex items-center justify-center gap-1.5 rounded-pill border-[1.5px] border-oven-dark px-3 py-1.5 text-caption transition-colors hover:bg-oven-dark hover:text-cream";

// Small helpers around an order: share the ETA as text, add it to a calendar, call or find the shop, print.
// Nothing here sends the order page link, because only the account that placed the order can open it.
export default function OrderActions({ code, pickup, address, doneAtISO, position }) {
  const [note, setNote] = useState("");
  const done = new Date(doneAtISO);
  const where = pickup ? SHOP.address : address;
  const eta = done.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });

  const flash = (m) => {
    setNote(m);
    setTimeout(() => setNote(""), 2500);
  };

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      flash(message);
    } catch {
      flash("Couldn't copy");
    }
  }

  async function share() {
    const text = `${SHOP.name}: order #${code}, ${pickup ? "ready for pickup" : "arriving"} around ${eta}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Order #${code}`, text });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    copy(text, "Copied to share");
  }

  function calendar() {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fast React Pizza//Order//EN", "BEGIN:VEVENT",
      `UID:${code}@fast-react-pizza`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(done)}`, `DTEND:${stamp(new Date(done.getTime() + 15 * 60_000))}`,
      `SUMMARY:${esc(pickup ? "Pick up pizza" : "Pizza delivery")} (order ${code})`, `LOCATION:${esc(where)}`,
      "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Your pizza is almost ready", "END:VALARM", "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `order-${code}.ics` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const shop = `${SHOP.lat},${SHOP.lng}`;
  const [lat, lng] = shop.split(",");

  return (
    <section aria-labelledby="actions-title" data-noprint className="rounded-card border-[1.5px] border-oven-dark/15 p-5 sm:p-6 print:hidden">
      <h2 id="actions-title" className="text-subheading font-whisper">Quick actions</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={share}><Icon as={LuShare2} className="size-3.5" />Share ETA</button>
        <button type="button" className={btn} onClick={calendar}><Icon as={LuCalendarPlus} className="size-3.5" />Add to calendar</button>
        <a className={btn} href={`tel:${SHOP.phone.replace(/[^+\d]/g, "")}`}><Icon as={LuPhone} className="size-3.5" />Call the shop</a>
        {pickup ? (
          <a className={btn} href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`} target="_blank" rel="noopener noreferrer">
            <Icon as={LuNavigation} className="size-3.5" />Directions<span className="sr-only"> (opens OpenStreetMap in a new tab)</span>
          </a>
        ) : (
          <button type="button" className={btn} onClick={() => copy(address, "Address copied")}><Icon as={LuCopy} className="size-3.5" />Copy address</button>
        )}
        <button type="button" className={btn} onClick={() => window.print()}><Icon as={LuPrinter} className="size-3.5" />Print receipt</button>
      </div>
      <p role="status" className="mt-3 min-h-5 text-caption text-pewter">{note}</p>
    </section>
  );
}
