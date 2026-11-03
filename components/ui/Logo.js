// The Fast React Pizza mark: a round pizza on a rounded square. Same drawing as app/icon.svg (the favicon).
// `light` swaps the square to cream, for use on the dark hero and footer.
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const DOTS = [22.5, 112.5, 202.5, 292.5];
const pt = (a, r) => [32 + r * Math.cos((a * Math.PI) / 180), 32 + r * Math.sin((a * Math.PI) / 180)];

export default function Logo({ light = false, className = "size-8" }) {
  const bg = light ? "#fff8ec" : "#3b1510";
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={className}>
      <rect width="64" height="64" rx="15" fill={bg} />
      <circle cx="32" cy="32" r="23" fill="#e8a24a" />
      <circle cx="32" cy="32" r="19" fill="#c23a25" />
      <g stroke={bg} strokeWidth="1.7" strokeLinecap="round" opacity=".9">
        {ANGLES.map((a) => {
          const [x, y] = pt(a, 19);
          return <path key={a} d={`M32 32L${x.toFixed(2)} ${y.toFixed(2)}`} />;
        })}
      </g>
      {DOTS.map((a) => {
        const [x, y] = pt(a, 10.5);
        return <circle key={a} cx={x.toFixed(2)} cy={y.toFixed(2)} r="2.3" fill="#ffd166" />;
      })}
      <circle cx="32" cy="32" r="3" fill="#55773a" />
    </svg>
  );
}
