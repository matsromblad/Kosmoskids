import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Selects a specified number of unique random elements from an array.
 * @param arr The array to select from.
 * @param count The number of unique random elements to select.
 * @returns An array containing the selected unique random elements.
 */
export function getRandomUniqueElements<T>(arr: T[], count: number): T[] {
  if (!Array.isArray(arr)) {
    console.error("getRandomUniqueElements: input is not an array", arr);
    return [];
  }
  if (typeof count !== 'number' || count < 0) {
    console.error("getRandomUniqueElements: count must be a non-negative number", count);
    return [];
  }
  const pool = [...arr];

  // Shuffle using Fisher-Yates for unbiased random order.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  if (count > pool.length) {
    // If requesting more elements than available, return the full shuffled array.
    console.warn(
      `getRandomUniqueElements: Requested ${count} elements, but array only has ${pool.length}. Returning all elements shuffled.`
    );
    return pool;
  }

  return pool.slice(0, count);
}
