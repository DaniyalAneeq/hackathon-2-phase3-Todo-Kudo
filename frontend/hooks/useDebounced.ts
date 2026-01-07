/**
 * Hook to debounce a value
 * Delays updating the value until the specified delay has passed without changes
 */

import { useEffect, useState } from 'react';

export function useDebounced<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
