import { wedge, toppingAt, PIZZA_PALETTES } from "@/components/ui/PizzaArt";

// Top-down pizza on a plate, on a transparent square canvas: the artwork the conveyor belt expects.
// Same palettes as the cards on /menu, so a pizza looks the same everywhere. Sold-out pizzas are
// drawn in greys with a SOLD OUT band.
const SOLD = { crust: "#c9c2bb", sauce: "#a39b94", topping: "#dcd6d0" };

// Pizzas 1-8 keep their original look. Later pizzas cycle through more palettes and three topping layouts so a long menu
// does not look repetitive.
const EXTRA = [
  { crust: "#ffd166", sauce: "#c23a25", topping: "#3b1510" },
  { crust: "#e8a24b", sauce: "#fff8ec", topping: "#657a38" },
  { crust: "#657a38", sauce: "#e8a24b", topping: "#3b1510" },
  { crust: "#3b1510", sauce: "#ffd166", topping: "#c23a25" },
  { crust: "#c23a25", sauce: "#fff8ec", topping: "#657a38" },
  { crust: "#e8a24b", sauce: "#657a38", topping: "#fff8ec" },
  { crust: "#fff8ec", sauce: "#c23a25", topping: "#657a38" },
  { crust: "#657a38", sauce: "#fff8ec", topping: "#c23a25" },
];

function look(id) {
  return id <= 8 ? { p: PIZZA_PALETTES[id % PIZZA_PALETTES.length], style: 0 } : { p: EXTRA[(id - 9) % EXTRA.length], style: id % 3 };
}

function toppings(style, i, fill) {
  const a = (360 / 8) * i + 360 / 8 / 2;
  const at = (r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [(100 + r * Math.cos(rad)).toFixed(1), (100 + r * Math.sin(rad)).toFixed(1)];
  };
  if (style === 1) {
    const [x1, y1] = at(40, a);
    const [x2, y2] = at(62, a);
    return `<circle cx="${x1}" cy="${y1}" r="4.5" fill="${fill}"/><circle cx="${x2}" cy="${y2}" r="4.5" fill="${fill}"/>`;
  }
  if (style === 2) {
    return [-7, 0, 7].map((d, k) => { const [x, y] = at(k === 1 ? 48 : 58, a + d); return `<circle cx="${x}" cy="${y}" r="3.6" fill="${fill}"/>`; }).join("");
  }
  const [x, y] = toppingAt(i);
  return `<circle cx="${x}" cy="${y}" r="7" fill="${fill}"/>`;
}

function plateGroup(id, soldOut) {
  const { p: palette, style } = look(id);
  const p = soldOut ? SOLD : palette;
  const rim = soldOut ? "#ebe7e3" : "#fffcf5";
  const edge = soldOut ? "#cfc9c3" : "#dccbb4";
  const slices = Array.from({ length: 8 }, (_, i) => `<path d="${wedge(i, 94)}" fill="${p.crust}"/><path d="${wedge(i, 78, 2.4)}" fill="${p.sauce}"/>${toppings(style, i, p.topping)}`).join("");
  const band = soldOut
    ? `<g transform="rotate(-14 100 100)"><rect x="8" y="82" width="184" height="36" rx="4" fill="#3b1510" fill-opacity=".92"/><text x="100" y="106.5" text-anchor="middle" font-family="Inter,Helvetica,Arial,sans-serif" font-weight="700" font-size="19" letter-spacing="3" fill="#fff8ec">SOLD OUT</text></g>`
    : "";
  return `<circle cx="100" cy="100" r="99" fill="${rim}" stroke="${edge}" stroke-width="1.5"/><circle cx="100" cy="100" r="91" fill="none" stroke="${edge}" stroke-opacity=".6"/><g transform="translate(100 100) scale(.88) translate(-100 -100)">${slices}</g>${band}`;
}

export function plateSvg(id, soldOut = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">${plateGroup(id, soldOut)}</svg>`;
}

// 16:10 "photo" for the menu cards: the plate on a flour-coloured table, with a soft shadow.
export function photoSvg(id, soldOut = false) {
  const table = soldOut ? "#8a817b" : "#7a3b2a";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="640" height="400"><rect width="320" height="200" fill="${table}"/><ellipse cx="160" cy="112" rx="84" ry="78" fill="#000" fill-opacity=".22"/><g transform="translate(160 100) scale(.84) translate(-100 -100)">${plateGroup(id, soldOut)}</g></svg>`;
}
