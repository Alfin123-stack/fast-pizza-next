// "Popular" comes from real orders: the best sellers of the last 30 days, per category, and only once an item has sold
// enough to mean something. Until then nothing is marked popular (no invented popularity).
export const POPULAR_MIN_UNITS = 5;
export const POPULAR_PER_CATEGORY = 3;

export function popularIds(orders, menu) {
  const units = new Map();
  for (const order of orders) {
    for (const line of order.cart ?? []) {
      const n = Math.floor(Number(line.quantity)) || 0;
      units.set(line.pizzaId, (units.get(line.pizzaId) ?? 0) + n);
    }
  }
  const out = [];
  for (const category of ["pizza", "drink"]) {
    menu
      .filter((i) => (i.category ?? "pizza") === category && (units.get(i.id) ?? 0) >= POPULAR_MIN_UNITS)
      .sort((a, b) => units.get(b.id) - units.get(a.id) || a.id - b.id)
      .slice(0, POPULAR_PER_CATEGORY)
      .forEach((i) => out.push(i.id));
  }
  return out;
}
