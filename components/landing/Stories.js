import Button from "@/components/ui/Button";
import PizzaArt from "@/components/ui/PizzaArt";
import { Slice, PizzaBox, Leaf, IngredientRing } from "@/components/ui/Illustrations";
import Marquee from "@/components/motion/Marquee";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { KITCHEN } from "@/content/landing";
import Parallax from "@/components/motion/Parallax";

// Placeholder stories: swap the illustrations for photos when you have them.
function Tall({ bg, title, children, light = true }) {
  return (
    <article
      className={`relative flex h-[340px] w-[220px] shrink-0 flex-col justify-between overflow-hidden rounded-card p-5 md:h-[380px] md:w-[250px] ${bg} ${
        light ? "text-cream" : "text-oven-dark"
      }`}
    >
      <div aria-hidden className="grid flex-1 place-items-center">{children}</div>
      <h3 className="text-body font-whisper">{title}</h3>
    </article>
  );
}

const CARDS = [
  <Tall key="a" bg="bg-tomato" title="Dough, rested overnight"><PizzaArt crust="#fff8ec" sauce="#e8a24b" topping="#3b1510" className="w-4/5" /></Tall>,
  <article key="b" className="grid size-[240px] shrink-0 place-items-center self-center overflow-hidden rounded-full bg-flour p-8 md:size-[280px]"><PizzaBox className="w-full" /></article>,
  <Tall key="c" bg="bg-oven-dark" title="Meet the oven"><Slice className="w-3/5 -rotate-12" /></Tall>,
  <article key="d" className="flex h-[300px] w-[260px] shrink-0 flex-col justify-between self-center rounded-card bg-flour p-6 md:w-[300px]">
    <p className="text-subheading font-whisper">“{KITCHEN.cards[3].quote}”</p>
    <p className="text-label uppercase tracking-wide text-pewter">{KITCHEN.cards[3].label}</p>
  </article>,
  <Tall key="e" bg="bg-crust" light={false} title="Every topping, listed"><IngredientRing className="w-full" /></Tall>,
  <Tall key="f" bg="bg-basil" title="Fresh basil"><Leaf className="w-1/2 rotate-12" fill="#3b1510" vein="#ffd166" /></Tall>,
];

export default function Stories() {
  return (
    <section id="stories" aria-labelledby="kitchen-title" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-[1200px] px-6 pt-4 md:pt-10">
        <SplitText
          id="kitchen-title"
          text={KITCHEN.title}
          className="max-w-[14em] text-heading-lg font-whisper md:text-display"
        />
      </div>

      <Reveal y={30} className="mt-10" amount={0.1}>
        <Marquee duration={55}>{CARDS}</Marquee>
      </Reveal>

      <div className="mx-auto grid max-w-[1200px] gap-3 px-6 py-16 md:grid-cols-2 md:gap-4 md:py-24">
        <Reveal y={50} className="relative flex min-h-[420px] flex-col items-center justify-center gap-5 overflow-hidden rounded-panel bg-oven-dark p-8 text-center text-cream md:min-h-[520px]">
          <Parallax fill speed={0.08} className="absolute inset-0 opacity-25">
            <PizzaArt crust="#c23a25" sauce="#3b1510" topping="#e8a24b" className="absolute -bottom-[30%] -left-[20%] w-[90%] animate-[spin_120s_linear_infinite]" />
          </Parallax>
          <h3 className="relative max-w-[10em] text-heading-lg font-whisper md:text-display">
            {KITCHEN.panelA.title}
          </h3>
          <p className="relative max-w-xs text-body-sm text-cream/90">{KITCHEN.panelA.body}</p>
          <Button href="/#story" variant="light" className="relative">
            {KITCHEN.panelA.cta}
          </Button>
        </Reveal>

        <Reveal y={50} delay={0.12} className="relative flex min-h-[420px] flex-col items-center justify-center gap-5 overflow-hidden rounded-panel bg-tomato p-8 text-center text-cream md:min-h-[520px]">
          <Parallax fill speed={-0.08} className="absolute inset-0 opacity-30">
            <Leaf className="absolute -right-6 top-6 w-40 rotate-[25deg]" fill="#ffd166" vein="#3b1510" />
            <Leaf className="absolute -left-4 bottom-10 w-28 -rotate-[35deg]" fill="#657a38" vein="#3b1510" />
          </Parallax>
          <PizzaArt crust="#ffd166" sauce="#3b1510" topping="#fff8ec" className="relative w-16 animate-[spin_30s_linear_infinite]" />
          <h3 className="relative max-w-[10em] text-heading-sm font-whisper md:text-heading">
            {KITCHEN.panelB.title}
          </h3>
          <p className="relative text-body-sm">{KITCHEN.panelB.body}</p>
          <Button href="/menu" variant="light" className="relative">
            {KITCHEN.panelB.cta}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
