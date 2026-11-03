import Button from "@/components/ui/Button";
import { Badge, CodePill } from "@/components/ui/Badge";
import PizzaArt from "@/components/ui/PizzaArt";
import { Slice, PizzaBox, Leaf } from "@/components/ui/Illustrations";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import Parallax from "@/components/motion/Parallax";
import { BUNDLE } from "@/content/landing";

function Label({ children }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <CodePill>{children}</CodePill>
      <span className="h-6 w-px bg-oven-dark/60" aria-hidden />
      <span className="size-1.5 rounded-full bg-oven-dark" aria-hidden />
    </div>
  );
}

export default function Bundle() {
  return (
    <section aria-labelledby="bundle-title" className="bg-cream">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10 md:py-28">
        <div className="flex flex-col justify-center">
          <Reveal>
            <Badge>{BUNDLE.badge}</Badge>
          </Reveal>
          <SplitText
            id="bundle-title"
            text={BUNDLE.title}
            delay={0.1}
            className="mt-4 text-heading-lg font-whisper md:text-display"
          />
          <Reveal delay={0.3} blur className="mt-4 max-w-md">
            <p className="text-body-sm">
              {BUNDLE.body}
            </p>
          </Reveal>
          <Reveal delay={0.45} className="mt-8">
            <Button href="/menu">{BUNDLE.cta}</Button>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          <Reveal y={50} scale={0.97} aria-hidden className="overflow-hidden rounded-panel bg-flour">
            <div className="flex items-end justify-around gap-6 p-8 pt-12 md:p-14 md:pt-16">
              <Parallax speed={0.06}>
                <figure className="flex min-w-0 flex-col items-center gap-3">
                  <Label>PZ-01</Label>
                  <PizzaArt crust="#e8a24b" sauce="#c23a25" topping="#ffd166" className="w-28 max-w-full sm:w-44 md:w-52" />
                </figure>
              </Parallax>
              <Parallax speed={-0.06}>
                <figure className="flex min-w-0 flex-col items-center gap-3">
                  <Label>PZ-02</Label>
                  <PizzaArt crust="#657a38" sauce="#3b1510" topping="#ffd166" className="w-28 max-w-full sm:w-44 md:w-52" />
                </figure>
              </Parallax>
            </div>
          </Reveal>

          <div aria-hidden className="grid grid-cols-3 gap-3 md:gap-4">
            <Reveal delay={0.05} y={40} className="relative aspect-[4/5] overflow-hidden rounded-card bg-tomato">
              <Parallax fill speed={0.05} className="absolute inset-0">
                <div className="grid size-full place-items-center p-4">
                  <Slice className="w-3/4 rotate-[-12deg]" />
                </div>
              </Parallax>
            </Reveal>
            <Reveal delay={0.15} y={40} className="relative aspect-[4/5] overflow-hidden rounded-card bg-oven-dark">
              <Parallax fill speed={-0.05} className="absolute inset-0">
                <div className="grid size-full place-items-center p-3">
                  <PizzaBox className="w-full" />
                </div>
              </Parallax>
            </Reveal>
            <Reveal delay={0.25} y={40} className="relative aspect-[4/5] overflow-hidden rounded-card bg-crust">
              <Parallax fill speed={0.05} className="absolute inset-0">
                <div className="relative grid size-full place-items-center">
                  <Leaf className="w-1/2 rotate-12" fill="#3b1510" vein="#ffd166" />
                  <Leaf className="absolute bottom-[14%] right-[12%] w-1/4 -rotate-45" fill="#ffd166" vein="#3b1510" />
                </div>
              </Parallax>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
