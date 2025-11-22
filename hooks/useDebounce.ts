import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value
 * 
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedQuery = useDebounce(searchQuery, 500);
 * 
 * // Use debouncedQuery in API calls instead of searchQuery
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     fetchData(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

