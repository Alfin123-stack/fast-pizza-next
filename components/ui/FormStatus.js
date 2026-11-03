"use client";

import { useEffect, useRef } from "react";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import Icon from "./Icon";

// Live region for form results. When a submit comes back with a problem, keyboard and
// screen-reader users are moved to the first invalid field (or to the summary message).
// Pass the action `state` so every new result triggers it, even if the text is identical.
export default function FormStatus({ state, className = "" }) {
  const ref = useRef(null);
  const hasFieldErrors = state?.errors && Object.keys(state.errors).length > 0;
  const error = state?.error || (hasFieldErrors ? "Check the highlighted fields and try again." : null);

  useEffect(() => {
    if (!error) return;
    const bad = ref.current?.closest("form")?.querySelector('[aria-invalid="true"]');
    (bad ?? ref.current)?.focus();
  }, [state, error]);

  return (
    <div ref={ref} tabIndex={-1} aria-live="polite" className={`outline-none ${className}`}>
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-input bg-flour px-4 py-3 text-caption font-medium">
          <Icon as={LuCircleAlert} className="mt-0.5 size-4" />
          <span>{error}</span>
        </p>
      )}
      {state?.message && (
        <p className="flex items-start gap-2 rounded-input bg-cheese px-4 py-3 text-caption">
          <Icon as={LuCircleCheck} className="mt-0.5 size-4" />
          <span>{state.message}</span>
        </p>
      )}
    </div>
  );
}
