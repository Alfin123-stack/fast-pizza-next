import { wedge, toppingAt } from "@/components/ui/PizzaArt";

// Flat vector artwork that stands in for photography. Palette only: no gradients, no shadows.

export function Leaf({ className = "", fill = "#657a38", vein = "#3b1510" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 22C4 18 3 9 12 2c9 7 8 16 0 20z" fill={fill} />
      <path d="M12 21V7" stroke={vein} strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Slice({ className = "", crust = "#fff8ec", sauce = "#e8a24b", topping = "#3b1510" }) {
  const [tx, ty] = toppingAt(0);
  return (
    <svg viewBox="92 0 82 108" aria-hidden className={className}>
      <path d={wedge(0, 94)} fill={crust} />
      <path d={wedge(0, 78, 2.4)} fill={sauce} />
      <circle cx={tx} cy={ty} r="7" fill={topping} />
      <circle cx={tx + 12} cy={ty - 22} r="5" fill={topping} />
    </svg>
  );
}

export function PizzaBox({ className = "" }) {
  const [tx, ty] = toppingAt(1);
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className}>
      <rect x="14" y="34" width="172" height="140" rx="14" fill="#e8a24b" />
      <rect x="24" y="44" width="152" height="120" rx="8" fill="#c23a25" />
      <g transform="translate(40 50) scale(0.6)">
        <circle cx="100" cy="100" r="96" fill="#fff8ec" />
        <path d={wedge(0, 90, 0.6)} fill="#ffd166" />
        <circle cx={tx} cy={ty} r="8" fill="#3b1510" />
      </g>
      <rect x="68" y="150" width="64" height="8" rx="4" fill="#fff8ec" opacity="0.6" />
    </svg>
  );
}

// Ring of ingredients (tomato, basil, mozzarella, olive) used as a decorative orbit.
export function IngredientRing({ className = "" }) {
  const outer = Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * Math.PI * 2, r: 168, k: i % 4 }));
  const inner = Array.from({ length: 8 }, (_, i) => ({ a: (i / 8) * Math.PI * 2 + 0.2, r: 118, k: (i + 1) % 4 }));
  const draw = ({ a, r, k }, i, scale) => {
    const x = +(200 + r * Math.cos(a)).toFixed(2);
    const y = +(200 + r * Math.sin(a)).toFixed(2);
    const deg = +((a * 180) / Math.PI + 90).toFixed(2);
    if (k === 0) return <circle key={`${r}-${i}`} cx={x} cy={y} r={14 * scale} fill="#657a38" />;
    if (k === 1)
      return (
        <g key={`${r}-${i}`} transform={`translate(${x} ${y}) rotate(${deg}) scale(${scale})`}>
          <path d="M0 18C-14 10 -16 -8 0 -20c16 12 14 30 0 38z" fill="#3b1510" />
        </g>
      );
    if (k === 2) return <circle key={`${r}-${i}`} cx={x} cy={y} r={11 * scale} fill="#fff8ec" stroke="#c23a25" strokeWidth="2" />;
    return <circle key={`${r}-${i}`} cx={x} cy={y} r={9 * scale} fill="#e8a24b" />;
  };
  return (
    <svg viewBox="0 0 400 400" aria-hidden className={className}>
      <circle cx="200" cy="200" r="168" fill="none" stroke="#c23a25" strokeWidth="1" strokeDasharray="3 7" />
      <circle cx="200" cy="200" r="118" fill="none" stroke="#c23a25" strokeWidth="1" strokeDasharray="3 7" />
      {outer.map((d, i) => draw(d, i, 1.15))}
      {inner.map((d, i) => draw(d, i, 0.9))}
    </svg>
  );
}

// Scatter of capsules and leaves for backgrounds. Deterministic so server and client match.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function LeafField({ className = "", seed = 7, count = 54, palette }) {
  const colors = palette ?? ["#ffd166", "#e8a24b", "#657a38", "#3b1510", "#fff8ec", "#c23a25"];
  const rand = rng(seed);
  const items = Array.from({ length: count }, (_, i) => {
    const w = 40 + rand() * 90;
    return {
      x: rand() * 1200,
      y: rand() * 800,
      w,
      h: 16 + rand() * 26,
      rot: rand() * 180,
      c: colors[Math.floor(rand() * colors.length)],
      round: rand() > 0.35,
      key: i,
    };
  });
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      {items.map((it) => (
        <rect
          key={it.key}
          x={it.x}
          y={it.y}
          width={it.w}
          height={it.h}
          rx={it.round ? it.h / 2 : 6}
          fill={it.c}
          opacity="0.85"
          transform={`rotate(${it.rot} ${it.x + it.w / 2} ${it.y + it.h / 2})`}
        />
      ))}
    </svg>
  );
}
