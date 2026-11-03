import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Wordmark({ light = false }) {
  return (
    <Link
      href="/"
      aria-label="Fast React Pizza, home"
      className={`flex items-center gap-2 whitespace-nowrap text-[15px] font-whisper tracking-[-0.02em] min-[420px]:text-body sm:gap-2.5 sm:text-subheading ${
        light ? "text-cream" : "text-oven-dark"
      }`}
    >
      <Logo light={light} className="size-7 shrink-0 sm:size-8" />
      <span className="max-[339px]:sr-only">Fast React Pizza</span>
    </Link>
  );
}
