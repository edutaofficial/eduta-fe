/**
 * Normalize data for consistent comparison (handles property ordering)
 * This ensures that objects with the same data but different property order
 * are considered equal when stringified
 */
export const normalizeForComparison = (data: unknown): string => {
  if (data === null || data === undefined) return JSON.stringify(data);
  
  const sortKeys = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(sortKeys);
    if (typeof obj === "object") {
      return Object.keys(obj as Record<string, unknown>)
        .sort()
        .reduce((acc, key) => {
          acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
          return acc;
        }, {} as Record<string, unknown>);
    }
    return obj;
  };
  
  return JSON.stringify(sortKeys(data));
};
