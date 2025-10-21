import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce } from './useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({ value: 'second', delay: 500 });
    expect(result.current).toBe('first'); // Still old value

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('second'); // Now updated
  });

  it('should handle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'fourth' });

    // Only the last value should be set after delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('fourth');
  });

  it('should work with different data types', () => {
    const { result: numberResult } = renderHook(() => useDebounce(42, 500));
    expect(numberResult.current).toBe(42);

    const { result: objectResult } = renderHook(() =>
      useDebounce({ key: 'value' }, 500)
    );
    expect(objectResult.current).toEqual({ key: 'value' });

    const { result: arrayResult } = renderHook(() => useDebounce([1, 2, 3], 500));
    expect(arrayResult.current).toEqual([1, 2, 3]);
  });
});
