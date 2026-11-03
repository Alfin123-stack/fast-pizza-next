"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuCopy, LuEye, LuEyeOff, LuKeyRound } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { EDIT_WINDOW_MS } from "@/lib/helpers";

// The one-time PIN: big, copyable, hideable, with the 5-minute window shown as a shrinking bar.
export default function PinCard({ pin, createdAt }) {
  const [shown, setShown] = useState(true);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(null);
  const end = new Date(createdAt).getTime() + EDIT_WINDOW_MS;

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const open = left === null || left > 0;
  const share = left === null ? 1 : left / EDIT_WINDOW_MS;
  const mins = left === null ? 5 : Math.ceil(left / 60_000);

  return (
    <section aria-labelledby="pin-title" className="rounded-card bg-cheese p-5 sm:p-6">
      <h2 id="pin-title" className="flex items-center gap-2 text-subheading font-whisper"><Icon as={LuKeyRound} className="size-5" />Your PIN</h2>
      <p className="mt-1 text-body-sm">Save it. You need it to change or cancel this order, and we can't show it again later.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <output aria-label={shown ? `PIN ${pin.split("").join(" ")}` : "PIN hidden"} className="rounded-input bg-cream px-4 py-2 font-mono text-heading-sm tracking-[0.3em]">
          {shown ? pin : "••••••"}
        </output>
        <button type="button" onClick={copy} className="hit inline-flex items-center rounded-pill border-[1.5px] border-oven-dark px-3 py-1 text-caption hover:bg-oven-dark hover:text-cream">
          <Icon as={copied ? LuCheck : LuCopy} className="mr-1.5 size-3.5" />{copied ? "Copied" : "Copy"}
        </button>
        <button type="button" onClick={() => setShown((v) => !v)} aria-pressed={!shown} className="hit inline-flex items-center rounded-pill border-[1.5px] border-oven-dark px-3 py-1 text-caption hover:bg-oven-dark hover:text-cream">
          <Icon as={shown ? LuEyeOff : LuEye} className="mr-1.5 size-3.5" />{shown ? "Hide" : "Show"}
        </button>
      </div>
      <div className="mt-4">
        <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-pill bg-oven-dark/15">
          <div className="h-full rounded-pill bg-oven-dark transition-[width] duration-1000 ease-linear" style={{ width: `${share * 100}%` }} />
        </div>
        <p className="mt-2 text-caption">
          {open ? `You can change or cancel this order for about ${mins} more minute${mins === 1 ? "" : "s"}.` : "The kitchen has started, so this order can't be changed or cancelled any more."}
        </p>
      </div>
    </section>
  );
}
