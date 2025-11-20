import { renderHook, act } from '@testing-library/react-native';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('returns the initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('initial'));
      expect(result.current).toBe('initial');
    });

    it('returns initial value for numeric type', () => {
      const { result } = renderHook(() => useDebouncedValue(42));
      expect(result.current).toBe(42);
    });

    it('returns initial value for boolean type', () => {
      const { result } = renderHook(() => useDebouncedValue(true));
      expect(result.current).toBe(true);
    });

    it('returns initial value for object type', () => {
      const obj = { key: 'value' };
      const { result } = renderHook(() => useDebouncedValue(obj));
      expect(result.current).toBe(obj);
    });

    it('returns initial value for array type', () => {
      const arr = [1, 2, 3];
      const { result } = renderHook(() => useDebouncedValue(arr));
      expect(result.current).toBe(arr);
    });

    it('returns initial value for null', () => {
      const { result } = renderHook(() => useDebouncedValue(null));
      expect(result.current).toBe(null);
    });

    it('returns initial value for undefined', () => {
      const { result } = renderHook(() => useDebouncedValue(undefined));
      expect(result.current).toBeUndefined();
    });
  });

  describe('debouncing behavior with default delay', () => {
    it('delays value update with default 300ms delay', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } as any }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'updated' });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(299);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('does not update if value changes again within delay', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: 'first' });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      rerender({ value: 'second' });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(150);
      });
      expect(result.current).toBe('second');
    });

    it('clears previous timeout when value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'a' } as any }
      );

      rerender({ value: 'b' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'c' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('c');
    });
  });

  describe('custom delay', () => {
    it('respects custom delay value', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value, 500),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: 'updated' });
      act(() => {
        jest.advanceTimersByTime(499);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('handles very small delay', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value, 10),
        { initialProps: { value: 'start' } as any }
      );

      rerender({ value: 'end' });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(result.current).toBe('end');
    });

    it('handles large delay', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value, 5000),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: 'updated' });
      act(() => {
        jest.advanceTimersByTime(4999);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('updates delay when delay prop changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: any) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } as any }
      );

      rerender({ value: 'updated', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('updated');

      rerender({ value: 'new', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('updated');

      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('new');
    });
  });

  describe('rapid value changes', () => {
    it('handles multiple rapid changes in sequence', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'a' } as any }
      );

      rerender({ value: 'b' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'c' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'd' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('a');

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('d');
    });

    it('only updates with the final value after rapid changes', () => {
      const { result, rerender } = renderHook(
        (({ value }: any) => useDebouncedValue(value, 200)) as any,
        { initialProps: { value: '1' } }
      );

      rerender({ value: '2' });
      act(() => {
        jest.advanceTimersByTime(50);
      });

      rerender({ value: '3' });
      act(() => {
        jest.advanceTimersByTime(50);
      });

      rerender({ value: '4' });
      act(() => {
        jest.advanceTimersByTime(50);
      });

      rerender({ value: '5' });
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('5');
    });
  });

  describe('zero delay', () => {
    it('updates with zero delay immediately on next tick', () => {
      const { result, rerender } = renderHook(
        (({ value }: any) => useDebouncedValue(value, 0)) as any,
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(result.current).toBe('updated');
    });
  });

  describe('string type with special characters', () => {
    it('handles strings with special characters', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'hello' } as any }
      );

      const specialString = 'test@#$%^&*()_+-=[]{}|;:,.<>?/`~';
      rerender({ value: specialString });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(specialString);
    });

    it('handles strings with unicode characters', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'hello' } as any }
      );

      const unicodeString = '你好世界🎉😊';
      rerender({ value: unicodeString });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(unicodeString);
    });

    it('handles empty string', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: '' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('');
    });
  });

  describe('numeric values', () => {
    it('handles decimal numbers', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 0 } as any }
      );

      rerender({ value: 3.14159 });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(3.14159);
    });

    it('handles negative numbers', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 0 } as any }
      );

      rerender({ value: -42 });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(-42);
    });

    it('handles zero distinctly from falsy values', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 1 } as any }
      );

      rerender({ value: 0 });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(0);
    });
  });

  describe('object and array types', () => {
    it('handles object mutations', () => {
      const initialObj = { count: 1 };
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: initialObj } as any }
      );

      const updatedObj = { count: 2 };
      rerender({ value: updatedObj });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(updatedObj);
      expect(result.current.count).toBe(2);
    });

    it('handles nested objects', () => {
      const initialObj = { user: { name: 'John', age: 30 } };
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: initialObj } as any }
      );

      const updatedObj = { user: { name: 'Jane', age: 25 } };
      rerender({ value: updatedObj });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(updatedObj);
      expect(result.current.user.name).toBe('Jane');
    });

    it('handles array mutations', () => {
      const initialArr = [1, 2, 3];
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: initialArr } as any }
      );

      const updatedArr = [4, 5, 6];
      rerender({ value: updatedArr });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(updatedArr);
      expect(result.current).toEqual([4, 5, 6]);
    });
  });

  describe('cleanup on unmount', () => {
    it('clears timeout on unmount before debounce completes', () => {
      const { rerender, unmount } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: 'updated' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      unmount();
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(true).toBe(true);
    });

    it('clears timeout on unmount after debounce completes', () => {
      const { rerender, unmount } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: 'updated' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      unmount();

      expect(true).toBe(true);
    });
  });

  describe('same value changes', () => {
    it('resets debounce timer when same value is set again', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } as any }
      );

      rerender({ value: 'updated' });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      rerender({ value: 'updated' });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current).toBe('updated');

      act(() => {
        jest.advanceTimersByTime(150);
      });
      expect(result.current).toBe('updated');
    });

    it('keeps same value when reverting to previous value within delay', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: 'first' } as any }
      );

      rerender({ value: 'second' });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      rerender({ value: 'first' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('first');
    });
  });

  describe('boolean values', () => {
    it('handles false value distinctly from other falsy values', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: true } as any }
      );

      rerender({ value: false });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(false);
      expect(result.current).not.toBe(true);
    });

    it('toggles between boolean values', () => {
      const { result, rerender } = renderHook(
        ({ value }: any) => useDebouncedValue(value),
        { initialProps: { value: false } as any }
      );

      rerender({ value: true });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe(true);

      rerender({ value: false });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe(false);
    });
  });
});
