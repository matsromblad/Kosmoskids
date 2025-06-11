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

  if (count > arr.length) {
    // If requesting more elements than available, return a shuffled copy of the original array.
    // Or, one might choose to throw an error or return only arr.length elements.
    // For this game, returning all available (shuffled) seems reasonable.
    console.warn(
      `getRandomUniqueElements: Requested ${count} elements, but array only has ${arr.length}. Returning all elements shuffled.`
    );
    return [...arr].sort(() => 0.5 - Math.random());
  }

  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
