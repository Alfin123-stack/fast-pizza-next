export function formatCurrency(value) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(value);
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const EDIT_WINDOW_MS = 5 * 60 * 1000;

export function deliveryEstimate(createdAt, priority) {
  const minutes = priority ? 20 : 30;
  return new Date(new Date(createdAt).getTime() + minutes * 60 * 1000);
}

export function pizzaCode(id) {
  return `PZ-${String(id).padStart(2, "0")}`;
}

export const PIZZA_EXTRAS = [
  "Pizza Dough", "Marinara Sauce", "BBQ Sauce", "Pesto Sauce", "White Sauce",
  "Mozzarella", "Cheddar", "Parmesan", "Gorgonzola", "Ricotta", "Feta",
];
