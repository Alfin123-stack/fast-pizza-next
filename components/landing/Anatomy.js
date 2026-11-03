"use client";

import { useRef, useState } from "react";
import {
  m,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { CodePill } from "@/components/ui/Badge";
import { LeafField } from "@/components/ui/Illustrations";
import { ANATOMY } from "@/content/landing";

const GAP = 74;

const STEPS = ANATOMY.steps;

// Flat layers. Each is drawn as a circle and squashed in perspective by the wrapper.
const LAYERS = [
  (
    <>
      <circle cx="100" cy="108" r="94" fill="#c23a25" />
      <circle cx="100" cy="100" r="94" fill="#e8a24b" />
      <circle cx="100" cy="100" r="80" fill="#f0b966" />
    </>
  ),
  (
    <>
      <circle cx="100" cy="106" r="78" fill="#3b1510" />
      <circle cx="100" cy="100" r="78" fill="#657a38" />
      <path d="M40 100a60 60 0 0 1 120 0" fill="none" stroke="#fff8ec" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      <path d="M62 112a40 40 0 0 1 76 0" fill="none" stroke="#fff8ec" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
    </>
  ),
  (
    <>
      <circle cx="100" cy="106" r="72" fill="#e8a24b" />
      <circle cx="100" cy="100" r="72" fill="#ffd166" />
      {[[54, 80, 20], [96, 56, 24], [146, 84, 20], [60, 130, 22], [120, 140, 24], [100, 100, 26]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff8ec" opacity="0.85" />
      ))}
    </>
  ),
  (
    <>
      {[[62, 78], [112, 60], [140, 106], [96, 124], [58, 124], [104, 92]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y + 5} r="13" fill="#260c09" />
          <circle cx={x} cy={y} r="13" fill="#3b1510" />
          <circle cx={x - 3} cy={y - 3} r="3.5" fill="#c23a25" />
        </g>
      ))}
      {[[84, 66, -30], [132, 136, 40], [48, 100, 80]].map(([x, y, d], i) => (
        <path key={i} transform={`translate(${x} ${y}) rotate(${d})`} d="M0 14C-10 8 -12 -6 0 -16c12 10 10 24 0 30z" fill="#657a38" />
      ))}
    </>
  ),
];

function Layer({ index, explode, focus }) {
  const y = useTransform(explode, (v) => v * (1.5 - index) * GAP);
  return (
    <m.div
      aria-hidden
      className="absolute inset-x-0 top-1/2"
      style={{ y, zIndex: index }}
      animate={{ opacity: focus === -1 || focus === index ? 1 : 0.4 }}
      transition={{ duration: 0.4 }}
    >
      <svg
        viewBox="0 0 200 200"
        aria-hidden
        className="absolute left-0 w-full -translate-y-1/2"
        style={{ transform: "scaleY(0.46)" }}
      >
        {LAYERS[index]}
      </svg>
      <div className="absolute left-full top-0 hidden -translate-y-1/2 items-center gap-2 pl-3 md:flex">
        <span className="h-px w-8 bg-cream/50" aria-hidden />
        <CodePill onDark>{STEPS[index].code}</CodePill>
      </div>
    </m.div>
  );
}

function stepFor(v) {
  if (v < 0.28) return -1;
  return Math.min(3, Math.floor((v - 0.28) / 0.16));
}

export default function Anatomy() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(0.5);
  const p = reduce ? still : scrollYProgress;

  const [step, setStep] = useState(() => stepFor(p.get()));
  const [focus, setFocus] = useState(() => (p.get() < 0.9 ? stepFor(p.get()) : -1));
  useMotionValueEvent(p, "change", (v) => {
    const s = stepFor(v);
    setStep((cur) => (cur === s ? cur : s));
    const f = v >= 0.9 ? -1 : s;
    setFocus((cur) => (cur === f ? cur : f));
  });

  const explode = useTransform(p, [0, 0.26, 0.88, 1], [0, 1, 1, 0]);
  // Function forms keep these off the native scroll-timeline path (it snaps back at 100%).
  const stackScale = useTransform(p, (v) =>
    v < 0.26 ? 0.92 + 0.08 * (v / 0.26) : v < 0.88 ? 1 : 1 + 0.04 * ((v - 0.88) / 0.12)
  );
  const fieldX = useTransform(p, (v) => `${-8 * v}%`);

  return (
    <section id="story" aria-labelledby="story-title" ref={ref} className={`relative bg-tomato text-cream ${reduce ? "" : "h-[420vh]"}`}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        <m.div style={{ x: fieldX }} className="absolute inset-y-0 left-0 w-[116%]">
          <LeafField className="size-full" seed={11} />
        </m.div>

        <div className="absolute inset-3 grid grid-rows-[auto_1fr] overflow-hidden rounded-panel bg-oven-dark/65 p-6 backdrop-blur-2xl md:inset-8 md:grid-cols-[1.05fr_1fr] md:grid-rows-1 md:p-12">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <CodePill onDark>● {ANATOMY.eyebrow}</CodePill>
              <h2 id="story-title" className="mt-4 max-w-[14em] text-heading-sm font-whisper leading-[1.05] md:mt-6 md:text-[length:clamp(2rem,1.2rem+2.4vw,2.75rem)]">
                {ANATOMY.title}
              </h2>
            </div>

            <div>
              <div className="max-md:min-h-[8.5rem]">
              <ol className="max-w-md">
                {STEPS.map((s, i) => {
                  const active = i === step || reduce;
                  return (
                    <li
                      key={s.code}
                      className={`border-t border-cream/20 py-2.5 transition-opacity duration-500 md:py-3 ${
                        active ? "opacity-100" : "max-md:sr-only opacity-60 md:block"
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-label">0{i + 1}</span>
                        <h3 className="text-body font-whisper md:text-subheading">{s.title}</h3>
                      </div>
                      <m.p
                        initial={false}
                        animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden pl-8 text-caption text-cream/80"
                      >
                        {s.body}
                      </m.p>
                    </li>
                  );
                })}
              </ol>
              {step === -1 && (
                <p className="border-t border-cream/20 py-3 text-caption text-cream/80 md:hidden">
                  {ANATOMY.hint} <span aria-hidden>↓</span>
                </p>
              )}
              </div>
              <div className="mt-4 hidden items-center gap-4 rounded-card border border-cream/25 px-4 py-3 md:inline-flex">
                <span className="text-heading-sm font-whisper leading-none">{ANATOMY.stat.value}</span>
                <span className="text-caption text-cream/80">
                  {ANATOMY.stat.text}</span>
              </div>
            </div>
          </div>

          <div role="img" aria-label={ANATOMY.figureLabel} className="relative flex items-center justify-center">
            <m.div
              style={{ scale: stackScale }}
              className="relative aspect-square w-[min(66vw,300px)] md:w-[min(34vw,380px)]"
            >
              {LAYERS.map((_, i) => (
                <Layer key={i} index={i} explode={explode} focus={focus} />
              ))}
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
