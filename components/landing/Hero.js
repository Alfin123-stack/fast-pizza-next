import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import HeroScene from "./HeroScene";
import { HERO } from "@/content/landing";

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-oven-dark text-cream">
      <HeroScene />
      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-[1200px] flex-col justify-start px-6 pb-16 pt-28 md:justify-end md:pb-24 md:pt-32">
        <SplitText
          as="h1"
          id="hero-title"
          text={HERO.title}
          delay={0.25}
          amount={0.1}
          className="max-w-[10em] text-[clamp(2.25rem,1.4rem+4.2vw,2.75rem)] font-whisper leading-[1.02] tracking-[-0.03em] md:text-[72px]"
        />
        <Reveal delay={0.7} blur className="mt-6 max-w-md text-body-sm text-cream/80">
          <p>{HERO.body}</p>
        </Reveal>
        <Reveal delay={0.9} className="mt-8 flex flex-wrap items-center gap-6">
          <Button href="/menu" variant="light">
            {HERO.primary}
          </Button>
          <Button href="/#story" variant="linkLight">
            {HERO.secondary} <span aria-hidden>→</span>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
