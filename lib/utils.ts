import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with rounding and k/m suffixes
 * Examples:
 * - 10 -> "10"
 * - 15 -> "15"
 * - 20 -> "20"
 * - 1000 -> "1k"
 * - 1500 -> "1.5k"
 * - 1000000 -> "1m"
 * - 1500000 -> "1.5m"
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) {
    return Math.round(num).toString();
  }

  if (num < 1000000) {
    const thousands = num / 1000;
    // Round to nearest 0.5 for cleaner display
    const rounded = Math.round(thousands * 2) / 2;
    // If it's a whole number, don't show decimal
    if (rounded % 1 === 0) {
      return `${rounded}k`;
    }
    return `${rounded}k`;
  }

  const millions = num / 1000000;
  // Round to nearest 0.5 for cleaner display
  const rounded = Math.round(millions * 2) / 2;
  // If it's a whole number, don't show decimal
  if (rounded % 1 === 0) {
    return `${rounded}m`;
  }
  return `${rounded}m`;
}
