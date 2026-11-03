import { formatCurrency, pizzaCode } from "@/lib/helpers";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const sentence = (list) => (list.length < 2 ? list.join("") : `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`);

// Menu rows -> the items and price legend the conveyor belt wants.
// The belt colour-codes plates by price tier (1-5): tiers follow the order of the distinct prices.
export function toBelt(menu) {
  const prices = [...new Set(menu.map((p) => p.unitPrice))].sort((a, b) => a - b);
  const n = prices.length;
  const tierOf = (price) => {
    const rank = prices.indexOf(price);
    if (n <= 5) return n === 1 ? 1 : Math.round(1 + (rank * 4) / (n - 1));
    return 1 + Math.floor((rank * 5) / n);
  };

  const ranges = {};
  for (const price of prices) {
    const t = tierOf(price);
    (ranges[t] ??= []).push(price);
  }
  const legend = Object.fromEntries(
    Object.entries(ranges).map(([t, list]) => {
      const lo = formatCurrency(list[0]);
      const hi = formatCurrency(list.at(-1));
      return [t, lo === hi ? lo : `${lo} – ${hi}`];
    })
  );

  const items = menu.map((p) => {
    const toppings = p.ingredients ?? [];
    return {
      id: String(p.id),
      name: p.name,
      // The belt shows `price` on the chip, in the caption and in the dialog: for a sold-out pizza it says so.
      price: p.soldOut ? "Sold out" : formatCurrency(p.unitPrice),
      tier: tierOf(p.unitPrice),
      description: `${p.soldOut ? "Sold out for today. " : ""}${toppings.length ? `Made with ${sentence(toppings)}.` : ""}`.trim() || undefined,
      details: [pizzaCode(p.id), ...toppings.slice(0, 3).map(cap)],
      image: p.imageUrl || `/pizza-plate/${p.id}${p.soldOut ? "-sold" : ""}.svg`,
    };
  });
  return { items, legend };
}
