import { useCallback, useState } from 'react';
import { UseToggleReturn } from './types';

/**
 * Hook to toggle a boolean value
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle function, setValue function]
 */
export const useToggle = (initialValue = false): UseToggleReturn => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
};
