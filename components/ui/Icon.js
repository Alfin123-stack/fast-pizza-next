// One place for icon defaults: decorative (hidden from screen readers), sized with the text, coloured by the text.
// Usage: import { LuClock } from "react-icons/lu"; <Icon as={LuClock} />
// Icons that are a button's only content need an aria-label on the BUTTON, never here.
export default function Icon({ as: Glyph, className = "size-4 sm:size-[1.125rem]", ...props }) {
  return <Glyph aria-hidden="true" focusable="false" className={`shrink-0 ${className}`} {...props} />;
}
