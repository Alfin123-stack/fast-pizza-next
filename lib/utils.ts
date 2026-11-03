import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Class-name merging used by the shadcn-style components in components/ui.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
