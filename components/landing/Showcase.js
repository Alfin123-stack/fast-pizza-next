import Link from "next/link";
import { Badge, CodePill } from "@/components/ui/Badge";
import PizzaArt from "@/components/ui/PizzaArt";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { formatCurrency, pizzaCode } from "@/lib/helpers";
import { SHOWCASE } from "@/content/landing";

const PALETTES = [
  { crust: "#fff8ec", sauce: "#e8a24b", topping: "#3b1510" },
  { crust: "#ffd166", sauce: "#657a38", topping: "#fff8ec" },
  { crust: "#e8a24b", sauce: "#3b1510", topping: "#ffd166" },
  { crust: "#f3e6d2", sauce: "#c23a25", topping: "#657a38" },
];

export default function Showcase({ pizzas }) {
  return (
    <section aria-labelledby="showcase-title" className="bg-oven-dark text-cream">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SplitText
            id="showcase-title"
            text={SHOWCASE.title}
            className="max-w-[12em] text-heading-lg font-whisper md:text-display"
          />
          <Reveal delay={0.2} className="flex max-w-md flex-col gap-4 md:items-end md:text-right">
            <p className="text-body-sm text-cream/80">
              {SHOWCASE.body}
            </p>
            <Link href="/menu" className="text-caption underline underline-offset-4 transition-opacity hover:opacity-70">
              {SHOWCASE.all} <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:gap-4 lg:grid-cols-4">
          {pizzas.map((pizza, i) => (
            <Reveal as="li" key={pizza.id} delay={i * 0.09} y={40} className="flex">
              <Link
                href="/menu"
                aria-label={`${pizza.name}, ${formatCurrency(pizza.unitPrice)}. View on the menu`}
                className="group relative flex w-full flex-col items-center gap-3 rounded-card bg-cream/10 p-4 text-center transition-all duration-500 ease-out hover:-translate-y-2 hover:bg-cream/[0.16] md:gap-4 md:p-6"
              >
                {i === 0 && <Badge className="absolute left-3 top-3">{SHOWCASE.badge}</Badge>}
                <CodePill onDark className={i === 0 ? "mt-8" : ""}>
                  {pizzaCode(pizza.id)}
                </CodePill>
                <h3 className="text-body font-whisper md:text-subheading">{pizza.name}</h3>
                <div className="w-full max-w-[200px] overflow-hidden">
                  <PizzaArt
                    {...PALETTES[i % PALETTES.length]}
                    className="w-full transition-transform duration-700 ease-out group-hover:rotate-[14deg] group-hover:scale-110"
                  />
                </div>
                <p className="line-clamp-1 hidden text-caption capitalize text-cream/80 md:block">
                  {pizza.ingredients?.join(", ")}
                </p>
                <span className="mt-auto inline-flex items-center gap-0 rounded-pill border-[1.5px] border-cream/40 px-5 py-2.5 text-caption transition-all duration-300 group-hover:gap-2 group-hover:border-cream group-hover:bg-cream group-hover:text-oven-dark">
                  Order
                  <span className="w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:w-4">→</span>
                </span>
                <span className="text-micro uppercase tracking-wide text-cream/80">
                  From {formatCurrency(pizza.unitPrice)}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
