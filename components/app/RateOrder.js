"use client";

import { useActionState, useState } from "react";
import { LuStar } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import FormStatus from "@/components/ui/FormStatus";
import { rateOrder } from "@/app/(app)/order/actions";

export default function RateOrder({ code, rating }) {
  const [state, action, pending] = useActionState(rateOrder, {});
  const [stars, setStars] = useState(0);

  if (rating || state?.message) {
    return (
      <section aria-labelledby="rate-title" data-noprint className="rounded-card bg-flour p-5 sm:p-6 print:hidden">
        <h2 id="rate-title" className="text-subheading font-whisper">Thanks for rating</h2>
        <p className="mt-1 text-body-sm" aria-label={`${rating?.stars ?? stars} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Icon key={n} as={LuStar} className="mr-0.5 inline size-5" fill={n <= (rating?.stars ?? stars) ? "currentColor" : "none"} />)}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="rate-title" data-noprint className="rounded-card bg-flour p-5 sm:p-6 print:hidden">
      <h2 id="rate-title" className="text-subheading font-whisper">How was it?</h2>
      <form action={action} className="mt-3 grid gap-4">
        <input type="hidden" name="code" value={code} />
        <fieldset>
          <legend className="sr-only">Rating</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="hit relative cursor-pointer text-heading-sm leading-none">
                <input type="radio" name="rating" value={n} checked={stars === n} onChange={() => setStars(n)} className="peer sr-only" />
                <span className="rounded-input peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2" aria-hidden="true"><Icon as={LuStar} className="size-7" fill={n <= stars ? "currentColor" : "none"} /></span>
                <span className="sr-only">{n} star{n === 1 ? "" : "s"}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="text-body-sm">
          <span className="sr-only">Comment (optional)</span>
          <textarea name="comment" maxLength={200} rows={2} placeholder="Anything we should know? (optional)" className="w-full rounded-input border-[1.5px] border-oven-dark/60 bg-transparent px-3 py-2 text-body-sm" />
        </label>
        <FormStatus state={state} />
        <div>
          <Button type="submit" disabled={pending || stars === 0}>{pending ? "Sending..." : "Send rating"}</Button>
        </div>
      </form>
    </section>
  );
}
