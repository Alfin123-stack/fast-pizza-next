"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { SHOP } from "@/lib/checkout";
import { reverseGeocode } from "@/lib/userSlice";

// "Pick on map": the pin stays in the middle and the visitor moves the map under it (drag, arrow keys, +/- keys,
// or click), then presses "Use this spot". Works with keyboard and touch. The address field stays the main input.
// Leaflet loads only when the map is opened. Map tiles come from OpenStreetMap.
export default function AddressMap({ position, onPick }) {
  const box = useRef(null);
  const map = useRef(null);
  const [state, setState] = useState("loading"); // loading | ready | busy | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    let instance;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !box.current) return;
        const [lat, lng] = (position || "").split(",").map(Number);
        const start = Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : [SHOP.lat, SHOP.lng];
        instance = L.map(box.current, { center: start, zoom: 16, zoomControl: true, attributionControl: true });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        }).addTo(instance);
        instance.on("click", (e) => instance.panTo(e.latlng));
        map.current = instance;
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
    };
    // The map is created once; later position changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const [lat, lng] = (position || "").split(",").map(Number);
    if (map.current && Number.isFinite(lat) && Number.isFinite(lng)) map.current.setView([lat, lng], Math.max(map.current.getZoom(), 16));
  }, [position]);

  async function useSpot() {
    if (!map.current) return;
    const c = map.current.getCenter();
    setState("busy");
    setMessage("");
    try {
      const res = await reverseGeocode(c.lat.toFixed(6), c.lng.toFixed(6));
      onPick(res.position, res.address);
      setMessage("Address filled in from the map. Check it and edit if needed.");
    } catch {
      onPick(`${c.lat.toFixed(6)},${c.lng.toFixed(6)}`, "");
      setMessage("Spot saved, but we couldn't look up the address. Type it in above.");
    }
    setState("ready");
  }

  return (
    <div className="mt-3">
      <p id="map-help" className="mb-2 text-caption text-pewter">
        Move the map until the pin is on your door. Drag it, or use the arrow keys, then press “Use this spot”.
      </p>
      <div className="relative overflow-hidden rounded-card border-[1.5px] border-oven-dark/40">
        <div
          ref={box}
          role="application"
          aria-label="Map for choosing your delivery spot"
          aria-describedby="map-help"
          data-lenis-prevent
          className="h-64 w-full bg-flour"
        />
        {state === "ready" || state === "busy" ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 32"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[500] h-9 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
          >
            <path d="M12 1C6 1 1.5 5.500 1.500 11.200c0 7.300 10.500 19.300 10.500 19.300S22.500 18.500 22.500 11.200C22.500 5.500 18 1 12 1z" fill="#3b1510" stroke="#fff7ea" strokeWidth="1.500" />
            <circle cx="12" cy="11" r="4" fill="#fff7ea" />
          </svg>
        ) : null}
        {state === "loading" && <p role="status" className="absolute inset-0 grid place-items-center text-caption text-pewter">Loading the map…</p>}
        {state === "error" && <p role="alert" className="absolute inset-0 grid place-items-center px-6 text-center text-caption">The map couldn't load. Type your address instead.</p>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="inverted" className="!px-4 !py-2 !text-caption" disabled={state !== "ready"} onClick={useSpot}>
          {state === "busy" ? "Looking up…" : "Use this spot"}
        </Button>
        <p role="status" className="text-caption text-pewter">{message}</p>
      </div>
    </div>
  );
}
