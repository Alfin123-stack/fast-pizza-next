// Flat vector pizza used wherever a product photo would go.
const SLICES = 8;
const rad = (deg) => (deg * Math.PI) / 180;
const pt = (r, deg) => [+(100 + r * Math.cos(rad(deg - 90))).toFixed(2), +(100 + r * Math.sin(rad(deg - 90))).toFixed(2)];

export function wedge(i, r, gap = 1.6) {
  const a0 = (360 / SLICES) * i + gap;
  const a1 = (360 / SLICES) * (i + 1) - gap;
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  return `M100 100 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

export function toppingAt(i) {
  return pt(52, (360 / SLICES) * i + 360 / SLICES / 2);
}

export const PIZZA_PALETTES = [
  { crust: "#e8a24b", sauce: "#c23a25", topping: "#ffd166" },
  { crust: "#657a38", sauce: "#3b1510", topping: "#ffd166" },
  { crust: "#3b1510", sauce: "#c23a25", topping: "#ffd166" },
  { crust: "#c23a25", sauce: "#657a38", topping: "#fff8ec" },
];

export default function PizzaArt({
  crust = "#e8a24b",
  sauce = "#c23a25",
  topping = "#ffd166",
  className = "",
  label,
}) {
  // Decorative by default: nearby text already names the pizza. Pass `label` to expose it.
  return (
    <svg
      viewBox="0 0 200 200"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={className}
    >
      {Array.from({ length: SLICES }, (_, i) => (
        <g key={i}>
          <path d={wedge(i, 94)} fill={crust} />
          <path d={wedge(i, 78, 2.4)} fill={sauce} />
          <circle cx={toppingAt(i)[0]} cy={toppingAt(i)[1]} r="7" fill={topping} />
        </g>
      ))}
    </svg>
  );
}
