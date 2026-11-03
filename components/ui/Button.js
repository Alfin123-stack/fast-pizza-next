import Link from "next/link";

const base =
  "hit inline-flex items-center justify-center gap-2 rounded-pill text-body-sm font-normal whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-ash disabled:text-cream disabled:border-transparent";

const variants = {
  filled: "bg-oven-dark text-cream px-6 py-4 hover:bg-oven-dark/85",
  light: "bg-cream text-oven-dark px-6 py-4 hover:bg-flour",
  ghost: "border-[1.5px] border-cream text-cream px-6 py-4 hover:bg-cream/10",
  inverted:
    "bg-cream border-[1.5px] border-oven-dark text-oven-dark px-6 py-4 hover:bg-flour",
  small: "btn-sm bg-oven-dark text-cream px-4 py-2 text-caption hover:bg-oven-dark/85",
  round:
    "size-9 border-[1.5px] border-oven-dark text-oven-dark hover:bg-oven-dark hover:text-cream",
  link: "rounded-none px-0 py-2 text-oven-dark underline decoration-[1.5px] underline-offset-[6px] hover:opacity-70",
  linkLight:
    "rounded-none px-0 py-2 text-cream underline decoration-[1.5px] underline-offset-[6px] hover:opacity-70",
};

export default function Button({ variant = "filled", href, className = "", children, ...props }) {
  const large = ["filled", "light", "ghost", "inverted"].includes(variant) ? "btn-lg" : "";
  const cls = `${base} ${variants[variant]} ${large} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
