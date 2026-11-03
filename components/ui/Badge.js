export function Badge({ tone = "lime", children, className = "" }) {
  const tones = {
    lime: "bg-cheese text-oven-dark",
    glass: "bg-cream/20 text-cream",
  };
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2 py-1.5 text-label font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// "Specimen label": outlined pill with a mono product code.
export function CodePill({ onDark = false, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border-[1.5px] px-2 py-1 font-mono text-label font-normal tracking-[0.015em] ${
        onDark ? "border-cream text-cream" : "border-oven-dark text-oven-dark"
      } ${className}`}
    >
      {children}
    </span>
  );
}
