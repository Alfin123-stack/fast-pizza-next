import Link from "next/link";
import { PROMO } from "@/content/landing";

export default function PromoBanner() {
  return (
    <aside aria-label="Promotion" className="bg-cheese text-oven-dark">
      <p className="mx-auto flex min-h-10 max-w-[1200px] flex-wrap items-center justify-center gap-x-2 px-6 py-1.5 text-center text-label font-medium uppercase">
        {PROMO.text}
        <Link href="/menu" className="hit underline underline-offset-4">
          {PROMO.cta}
        </Link>
      </p>
    </aside>
  );
}
