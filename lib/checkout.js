// Rules shared by the checkout form (browser) and the order action (server).

// PLACEHOLDER shop details: replace with the real restaurant.
export const SHOP = {
  name: "Fast React Pizza",
  address: "Jl. Contoh No. 1, Jakarta (placeholder)",
  phone: "+62 21 5550 0000", // placeholder
  timeZone: "Asia/Jakarta",
  open: 10, // 10:00
  close: 22, // last slot starts before 22:00
  lat: -6.2088,
  lng: 106.8456,
};

export const NOTE_MAX = 200;
export const MAX_ADDRESSES = 5;
export const SLOT_MINUTES = 30;
export const MIN_LEAD_MINUTES = 30;
export const MAX_AHEAD_HOURS = 24;
export const PRIORITY_RATE = 0.2;

const hourIn = (date, timeZone) =>
  Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone }).format(date)) % 24;

export const inOpeningHours = (date) => {
  const h = hourIn(date, SHOP.timeZone);
  return h >= SHOP.open && h < SHOP.close;
};

// Half-hour slots from 30 minutes from now to 24 hours ahead, inside opening hours: ISO strings.
export function slotsFrom(now = new Date()) {
  const step = SLOT_MINUTES * 60_000;
  const first = Math.ceil((now.getTime() + MIN_LEAD_MINUTES * 60_000) / step) * step;
  const last = now.getTime() + MAX_AHEAD_HOURS * 3_600_000;
  const out = [];
  for (let t = first; t <= last; t += step) if (inOpeningHours(new Date(t))) out.push(new Date(t).toISOString());
  return out;
}

export function isValidSlot(iso, now = new Date()) {
  const d = new Date(iso);
  const t = d.getTime();
  if (!Number.isFinite(t) || t % (SLOT_MINUTES * 60_000) !== 0) return false;
  return t >= now.getTime() + (MIN_LEAD_MINUTES - 1) * 60_000 && t <= now.getTime() + MAX_AHEAD_HOURS * 3_600_000 + 60_000 && inOpeningHours(d);
}

export const formatSlot = (iso) =>
  new Intl.DateTimeFormat("en", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: SHOP.timeZone }).format(new Date(iso));

export function priceFor({ subtotal, priority }) {
  const fee = priority ? subtotal * PRIORITY_RATE : 0;
  return { fee, total: subtotal + fee };
}

// "lat,lng" -> clean string or "" (never trusts the browser).
export function cleanPosition(value) {
  const m = /^(-?\d{1,2}(?:\.\d{1,8})?),\s*(-?\d{1,3}(?:\.\d{1,8})?)$/.exec(String(value ?? "").trim());
  if (!m) return "";
  const [lat, lng] = [Number(m[1]), Number(m[2])];
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? `${lat},${lng}` : "";
}
