import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for conditional classNames + Tailwind merge
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
