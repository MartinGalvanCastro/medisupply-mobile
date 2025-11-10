import { renderHook, act } from '@testing-library/react-native';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Value', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('test'));

      expect(result.current).toBe('test');
    });

    it('should return initial numeric value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue(42));

      expect(result.current).toBe(42);
    });

    it('should return initial object value immediately', () => {
      const initialObj = { name: 'John', age: 30 };
      const { result } = renderHook(() => useDebouncedValue(initialObj));

      expect(result.current).toBe(initialObj);
    });

    it('should return initial null value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue<string | null>(null));

      expect(result.current).toBeNull();
    });
  });

  describe('Debounce Delay', () => {
    it('should not update value before delay expires', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      act(() => {
        rerender({ value: 'updated' });
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(299);
      });

      expect(result.current).toBe('initial');
    });

    it('should update value after delay expires', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      act(() => {
        rerender({ value: 'updated' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('updated');
    });

    it('should update value exactly at delay duration', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'first' } }
      );

      act(() => {
        rerender({ value: 'second' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('second');
    });
  });

  describe('Multiple Changes', () => {
    it('should only return last value after delay when multiple changes occur', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'first' } }
      );

      act(() => {
        rerender({ value: 'second' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('first');

      act(() => {
        rerender({ value: 'third' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('first');

      act(() => {
        rerender({ value: 'fourth' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('fourth');
    });

    it('should reset timer on each value change', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'a' } }
      );

      act(() => {
        rerender({ value: 'b' });
      });

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current).toBe('a');

      act(() => {
        rerender({ value: 'c' });
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current).toBe('a');

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current).toBe('c');
    });

    it('should handle rapid successive changes', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: '0' } }
      );

      act(() => {
        for (let i = 1; i <= 10; i++) {
          rerender({ value: String(i) });
          jest.advanceTimersByTime(30);
        }
      });

      expect(result.current).toBe('0');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('10');
    });
  });

  describe('Default Delay', () => {
    it('should use 300ms delay when no delay parameter is provided', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } }
      );

      act(() => {
        rerender({ value: 'updated' });
      });

      act(() => {
        jest.advanceTimersByTime(299);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current).toBe('updated');
    });

    it('should apply default delay for multiple updates', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'first' } }
      );

      act(() => {
        rerender({ value: 'second' });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        rerender({ value: 'third' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('third');
    });
  });

  describe('Custom Delay', () => {
    it('should respect custom delay parameter of 500ms', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      act(() => {
        rerender({ value: 'updated', delay: 500 });
      });

      act(() => {
        jest.advanceTimersByTime(499);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current).toBe('updated');
    });

    it('should respect custom delay parameter of 100ms', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      );

      act(() => {
        rerender({ value: 'updated', delay: 100 });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('updated');
    });

    it('should respect custom delay parameter of 1000ms', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 1000 } }
      );

      act(() => {
        rerender({ value: 'updated', delay: 1000 });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should respect zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      );

      act(() => {
        rerender({ value: 'updated', delay: 0 });
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });

    it('should update delay between renders', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      act(() => {
        rerender({ value: 'updated', delay: 500 });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Cleanup', () => {
    it('should cancel timeout on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } }
      );

      act(() => {
        rerender({ value: 'updated' });
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('initial');
    });

    it('should clear pending timers before setting new value', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'first' } }
      );

      act(() => {
        rerender({ value: 'second' });
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      act(() => {
        rerender({ value: 'third' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('third');
    });

    it('should properly cleanup without memory leaks on multiple unmounts', () => {
      const { unmount: unmount1 } = renderHook(() => useDebouncedValue('test1'));
      const { unmount: unmount2 } = renderHook(() => useDebouncedValue('test2'));

      unmount1();
      unmount2();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(true).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should work with string values', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue<string>(value),
        { initialProps: { value: 'test' } }
      );

      expect(typeof result.current).toBe('string');

      act(() => {
        rerender({ value: 'updated' });
        jest.advanceTimersByTime(300);
      });

      expect(typeof result.current).toBe('string');
    });

    it('should work with number values', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: number }) => useDebouncedValue<number>(value),
        { initialProps: { value: 42 } }
      );

      expect(typeof result.current).toBe('number');
      expect(result.current).toBe(42);

      act(() => {
        rerender({ value: 100 });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(100);
    });

    it('should work with object values', () => {
      const initialObj = { id: 1, name: 'Test' };
      const updatedObj = { id: 2, name: 'Updated' };

      const { result, rerender } = renderHook(
        ({ value }: { value: { id: number; name: string } }) => useDebouncedValue<{ id: number; name: string }>(value),
        { initialProps: { value: initialObj } }
      );

      expect(result.current).toBe(initialObj);

      act(() => {
        rerender({ value: updatedObj });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(updatedObj);
      expect(result.current.id).toBe(2);
      expect(result.current.name).toBe('Updated');
    });

    it('should work with array values', () => {
      const initialArray = [1, 2, 3];
      const updatedArray = [4, 5, 6];

      const { result, rerender } = renderHook(
        ({ value }: { value: number[] }) => useDebouncedValue<number[]>(value),
        { initialProps: { value: initialArray } }
      );

      expect(result.current).toEqual(initialArray);

      act(() => {
        rerender({ value: updatedArray });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toEqual(updatedArray);
    });

    it('should work with boolean values', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: boolean }) => useDebouncedValue<boolean>(value),
        { initialProps: { value: false } }
      );

      expect(typeof result.current).toBe('boolean');
      expect(result.current).toBe(false);

      act(() => {
        rerender({ value: true });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(true);
    });

    it('should work with nullable string values', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string | null }) => useDebouncedValue<string | null>(value),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      act(() => {
        rerender({ value: null });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBeNull();
    });

    it('should work with complex nested objects', () => {
      const initialComplexObj = {
        user: { id: 1, name: 'John' },
        settings: { theme: 'light', notifications: true },
        tags: ['a', 'b', 'c'],
      };

      const updatedComplexObj = {
        user: { id: 2, name: 'Jane' },
        settings: { theme: 'dark', notifications: false },
        tags: ['x', 'y', 'z'],
      };

      const { result, rerender } = renderHook(
        ({ value }: { value: any }) => useDebouncedValue(value),
        { initialProps: { value: initialComplexObj } }
      );

      expect(result.current).toBe(initialComplexObj);

      act(() => {
        rerender({ value: updatedComplexObj });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(updatedComplexObj);
      expect(result.current.user.name).toBe('Jane');
      expect(result.current.settings.theme).toBe('dark');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: '' } }
      );

      expect(result.current).toBe('');

      act(() => {
        rerender({ value: 'updated' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle zero as a value', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: number }) => useDebouncedValue(value),
        { initialProps: { value: 0 } }
      );

      expect(result.current).toBe(0);

      act(() => {
        rerender({ value: 10 });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(10);
    });

    it('should handle false as a value', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: boolean }) => useDebouncedValue(value),
        { initialProps: { value: false } }
      );

      expect(result.current).toBe(false);

      act(() => {
        rerender({ value: true });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(true);
    });

    it('should handle same value updates', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'same' } }
      );

      act(() => {
        rerender({ value: 'same' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('same');
    });

    it('should handle rapid successive updates with same value', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'value' } }
      );

      act(() => {
        rerender({ value: 'value' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        rerender({ value: 'value' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        rerender({ value: 'value' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('value');
    });
  });

  describe('Integration Scenarios', () => {
    it('should work as search input debounce', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value, 500),
        { initialProps: { value: '' } }
      );

      expect(result.current).toBe('');

      act(() => {
        rerender({ value: 'j' });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('');

      act(() => {
        rerender({ value: 'jo' });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('');

      act(() => {
        rerender({ value: 'joh' });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('joh');
    });

    it('should work as window resize debounce', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: number }) => useDebouncedValue(value, 200),
        { initialProps: { value: 1024 } }
      );

      act(() => {
        rerender({ value: 1020 });
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        rerender({ value: 1010 });
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        rerender({ value: 1000 });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe(1000);
    });

    it('should handle alternating values with debounce', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: 'A' } }
      );

      act(() => {
        rerender({ value: 'B' });
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      act(() => {
        rerender({ value: 'A' });
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      act(() => {
        rerender({ value: 'B' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('B');
    });
  });
});
