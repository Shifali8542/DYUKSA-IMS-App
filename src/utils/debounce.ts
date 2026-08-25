import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns a debounced version of the callback.
 * The callback is only invoked after `delay` ms of inactivity.
 */
export function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return useCallback((...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}
