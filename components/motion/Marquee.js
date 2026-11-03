// Endless horizontal strip. Pauses on hover; static for reduced motion (see globals.css).
export default function Marquee({ children, duration = 60, className = "", label = "Kitchen highlights" }) {
  return (
    <div role="group" aria-label={label} tabIndex={0} className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max" style={{ "--marquee-duration": `${duration}s` }}>
        <div className="flex shrink-0 gap-4 pr-4">{children}</div>
        <div className="flex shrink-0 gap-4 pr-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
