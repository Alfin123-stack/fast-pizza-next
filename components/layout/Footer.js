import Link from "next/link";
import { LuClock, LuMapPin, LuPhone } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { SHOP } from "@/lib/checkout";
import Wordmark from "./Wordmark";
import Button from "@/components/ui/Button";
import { LeafField } from "@/components/ui/Illustrations";
import GiantWord from "./GiantWord";
import { FOOTER } from "@/content/landing";

export default function Footer() {
  return (
    <footer className="bg-oven-dark text-cream">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:py-14">
        <div>
          <Wordmark light />
          <p className="mt-4 max-w-sm text-heading-sm font-whisper leading-[1.1] md:text-subheading">
            {FOOTER.tagline}
          </p>
          <Button href="/menu" variant="light" className="mt-6 !py-3">
            {FOOTER.cta}
          </Button>
          <ul aria-label="Shop details" className="mt-6 space-y-2 text-caption text-cream/80">
            <li className="flex items-start gap-2"><Icon as={LuMapPin} className="mt-0.5 size-4" />{SHOP.address}</li>
            <li className="flex items-center gap-2"><Icon as={LuClock} className="size-4" />Open daily {SHOP.open}:00 to {SHOP.close}:00</li>
            <li className="flex items-center gap-2"><Icon as={LuPhone} className="size-4" /><a href={`tel:${SHOP.phone.replace(/[^+\d]/g, "")}`} className="hit underline underline-offset-4">{SHOP.phone}</a></li>
          </ul>
        </div>
        {FOOTER.columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-4 text-label font-normal uppercase tracking-wide text-cream/80">{c.title}</h2>
            <ul className="space-y-3 text-body-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hit transition-opacity hover:opacity-60">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="relative isolate overflow-hidden border-t border-cream/15 bg-oven-dark">
        <LeafField className="absolute inset-0 -z-10 size-full opacity-40" seed={29} count={34} palette={["#5a241b", "#657a38", "#c23a25", "#e8a24b"]} />
        <GiantWord text={FOOTER.giant} />
      </div>
      <p className="mx-auto max-w-[1200px] px-6 py-4 text-label text-cream/80">
        © {new Date().getFullYear()} Fast React Pizza Co.
      </p>
    </footer>
  );
}
