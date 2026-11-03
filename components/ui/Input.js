import { useId } from "react";
import Icon from "./Icon";

// Accessible text field: persistent visible label, optional hint, error linked with aria-describedby.
// `placeholder` should only show an example format (never replace the label).
export default function Input({ label, hint, onDark = false, error, id, className = "", required, adornment, icon, ...props }) {
  const autoId = useId();
  const inputId = id ?? `${props.name ?? "field"}-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const tone = onDark
    ? "border-cream text-cream placeholder:text-cream/70"
    : error
      ? "border-tomato text-oven-dark placeholder:text-pewter focus:border-oven-dark"
      : "border-oven-dark/60 text-oven-dark placeholder:text-pewter focus:border-oven-dark";
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-caption font-medium">
          {label}
          {required && <span aria-hidden> *</span>}
        </label>
      )}
      {hint && (
        <p id={hintId} className="-mt-1 mb-2 text-caption text-pewter">
          {hint}
        </p>
      )}
      <div className={adornment || icon ? "relative" : undefined}>
      {icon && <Icon as={icon} className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-pewter" />}
      <input
        id={inputId}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`field-input w-full rounded-input border-[1.5px] bg-transparent px-5 py-3.5 text-body-sm outline-none disabled:opacity-60 ${adornment ? "pr-20" : ""} ${icon ? "!pl-11" : ""} ${tone}`}
        {...props}
      />
      {adornment && <div className="absolute inset-y-0 right-2 flex items-center">{adornment}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-caption font-medium text-tomato">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
}
