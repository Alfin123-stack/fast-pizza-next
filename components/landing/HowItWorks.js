import { LuFlame, LuListChecks, LuTimer } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { HOW } from "@/content/landing";

// Replaces the placeholder testimonials with something we can actually stand behind.
const STEP_ICONS = [LuListChecks, LuFlame, LuTimer];

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 bg-cream pb-16 md:pb-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="font-mono text-label uppercase tracking-wide text-pewter">
          <p>{HOW.eyebrow}</p>
        </Reveal>
        <SplitText id="how-title" text={HOW.title} className="mt-4 max-w-[14em] text-heading-lg font-whisper md:text-display" />

        <ol className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-4">
          {HOW.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.1} y={36} className="flex flex-col gap-4 rounded-panel bg-flour p-6 md:p-8">
              <span aria-hidden className="grid size-10 place-items-center rounded-full bg-oven-dark text-cream">
                <Icon as={STEP_ICONS[i]} className="size-5" />
              </span>
              <h3 className="text-subheading font-whisper">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="text-body-sm">{s.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <Button href="/menu">{HOW.cta}</Button>
        </Reveal>
      </div>
    </section>
  );
}
