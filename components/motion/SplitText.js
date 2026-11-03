"use client";

import { Fragment } from "react";
import { m, useReducedMotion } from "motion/react";
import { EASE } from "./Reveal";

// Headline that rises word by word out of a mask.
export default function SplitText({
  text,
  as = "h2",
  className = "",
  delay = 0,
  stagger = 0.06,
  amount = 0.5,
  id,
}) {
  const reduce = useReducedMotion();
  const Tag = m[as] ?? m.h2;
  const words = text.split(" ");
  return (
    <Tag
      id={id}
      className={className}
      aria-label={text}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <Fragment key={i}>
          <span aria-hidden className="inline-block overflow-hidden align-top py-[0.1em] -my-[0.1em]">
            <m.span
              className="inline-block"
              variants={{
                hidden: { y: "115%" },
                show: { y: "0%", transition: { duration: 0.95, ease: EASE } },
              }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
