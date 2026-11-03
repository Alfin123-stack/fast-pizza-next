"use client";

import { useEffect, useRef, useState } from "react";
import { LuMap } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { SHOP } from "@/lib/checkout";

// Mini map: the shop and the delivery pin. It is the saved spot, not a live courier position.
// Loads Leaflet and OpenStreetMap tiles only after the visitor asks, so nothing goes to a third party by default.
export default function OrderMap({ position }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return;
    let instance;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !box.current) return;
      const [lat, lng] = position.split(",").map(Number);
      instance = L.map(box.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(instance);
      const dot = (bg, label) => L.divIcon({ className: "", html: `<span style="display:grid;place-items:center;width:28px;height:28px;border-radius:9999px;background:${bg};color:#fff;font:600 12px system-ui;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${label}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] });
      const you = L.marker([lat, lng], { icon: dot("#3b1510", "You"), alt: "Delivery spot" }).addTo(instance);
      const shop = L.marker([SHOP.lat, SHOP.lng], { icon: dot("#c0392b", "Shop"), alt: "Shop" }).addTo(instance);
      instance.fitBounds(L.featureGroup([you, shop]).getBounds().pad(0.3), { maxZoom: 16 });
    })().catch(() => {});
    return () => {
      cancelled = true;
      instance?.remove();
    };
  }, [open, position]);

  return (
    <div data-noprint className="print:hidden">
      <Button variant="inverted" className="!px-4 !py-2 !text-caption btn-sm" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Icon as={LuMap} className="size-4" />{open ? "Hide map" : "Show map"}
      </Button>
      {open && (
        <>
          <div ref={box} role="img" aria-label="Map with the shop and your delivery spot" className="mt-3 h-56 overflow-hidden rounded-card bg-flour sm:h-72" />
          <p className="mt-2 text-caption text-pewter">Your saved delivery spot and the shop. This is not a live courier position. Map by OpenStreetMap.</p>
        </>
      )}
    </div>
  );
}
