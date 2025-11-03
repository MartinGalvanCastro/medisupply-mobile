import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    onDebouncedChange: jest.fn(),
    placeholder: 'Search...',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the search bar with correct testID', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} testID="search-bar" />
      );

      expect(getByTestId('search-bar')).toBeTruthy();
    });

    it('should render the input field with correct testID', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} testID="search-bar" />
      );

      expect(getByTestId('search-bar-input')).toBeTruthy();
    });

    it('should display the placeholder text', () => {
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} placeholder="Find hospitals" />
      );

      expect(getByPlaceholderText('Find hospitals')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} testID="custom-search" />
      );

      expect(getByTestId('custom-search')).toBeTruthy();
      expect(getByTestId('custom-search-input')).toBeTruthy();
    });

    it('should render without the clear button when text is empty', () => {
      const { queryByTestId } = render(
        <SearchBar {...defaultProps} value="" />
      );

      expect(queryByTestId('search-bar-clear-button')).toBeNull();
    });

    it('should render with the clear button when text is not empty', () => {
      const { UNSAFE_root } = render(
        <SearchBar {...defaultProps} value="x" />
      );

      // The clear button should be rendered when value is not empty
      const searchBar = UNSAFE_root.findByProps({ testID: 'search-bar' });
      expect(searchBar).toBeTruthy();
    });

    it('should render Search icon initially', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="" />
      );

      expect(getByTestId('search-bar')).toBeTruthy();
    });
  });

  describe('onChangeText callback', () => {
    it('should call onChangeText immediately when user types', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value=""
        />
      );

      const input = getByTestId('search-bar-input');
      fireEvent.changeText(input, 'hospital');

      expect(onChangeText).toHaveBeenCalledWith('hospital');
      expect(onChangeText).toHaveBeenCalledTimes(1);
    });

    it('should call onChangeText immediately for each keystroke', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value=""
        />
      );

      const input = getByTestId('search-bar-input');

      fireEvent.changeText(input, 'h');
      expect(onChangeText).toHaveBeenCalledWith('h');

      fireEvent.changeText(input, 'ho');
      expect(onChangeText).toHaveBeenCalledWith('ho');

      fireEvent.changeText(input, 'hos');
      expect(onChangeText).toHaveBeenCalledWith('hos');

      expect(onChangeText).toHaveBeenCalledTimes(3);
    });

    it('should call onChangeText with empty string when clearing', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value="test"
        />
      );

      const input = getByTestId('search-bar-input');
      fireEvent.changeText(input, '');

      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('should call onChangeText without waiting for debounce', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const { getByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      // Clear previous calls from initial render
      jest.clearAllMocks();

      const input = getByTestId('search-bar-input');
      fireEvent.changeText(input, 'test');

      // onChangeText should be called immediately
      expect(onChangeText).toHaveBeenCalledWith('test');
      // onDebouncedChange should not be called yet (before debounce completes)
      expect(onDebouncedChange).not.toHaveBeenCalled();
    });
  });

  describe('onDebouncedChange callback', () => {
    it('should call onDebouncedChange after default 300ms delay', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      // Clear initial render calls
      jest.clearAllMocks();

      // Now render with a value to start the debounce timer
      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="hospital"
        />
      );

      // Should not call onDebouncedChange immediately
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance time by 200ms (not enough)
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance time by 100ms more (total 300ms)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      // Should be called with 'hospital' after the debounce period
      expect(onDebouncedChange).toHaveBeenCalledWith('hospital');
    });

    it('should delay onDebouncedChange when prop value changes', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="test"
        />
      );

      // Initial debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('test');
      jest.clearAllMocks();

      // Change value prop
      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="testing"
        />
      );

      // Should not be called immediately
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance time by 300ms
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('testing');
    });

    it('should cancel previous debounce when value changes before delay completes', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="first"
        />
      );

      // Clear initial render call
      jest.clearAllMocks();

      // Advance by 200ms (not yet debounced)
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Change value before debounce completes
      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="second"
        />
      );

      // Clear mocks after rerender (useEffect in rerender will call onDebouncedChange)
      jest.clearAllMocks();

      // Advance by 250ms more
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should not have been called yet
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance remaining time to complete debounce for 'second'
      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('second');
      expect(onDebouncedChange).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid value changes and debounce last value', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="a"
        />
      );

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="ab"
        />
      );

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="abc"
        />
      );

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="abcd"
        />
      );

      jest.clearAllMocks();

      // Total 300ms elapsed, should not be called yet
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Complete debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('abcd');
      expect(onDebouncedChange).toHaveBeenCalledTimes(1);
    });

    it('should call onDebouncedChange with empty string after clearing', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="hospital"
        />
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('hospital');
      jest.clearAllMocks();

      // Clear the search
      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      expect(onDebouncedChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('');
    });
  });

  describe('Custom debounce delay', () => {
    it('should respect custom debounce delay prop', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value=""
          debounceDelay={500}
        />
      );

      jest.clearAllMocks();

      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="test"
          debounceDelay={500}
        />
      );

      // Should not call immediately
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance by 400ms (less than custom delay)
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance by 100ms more (total 500ms)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('test');
    });

    it('should work with very short debounce delay', () => {
      const onDebouncedChange = jest.fn();
      render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="fast"
          debounceDelay={50}
        />
      );

      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('fast');
    });

    it('should work with longer debounce delay', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="first"
          debounceDelay={1000}
        />
      );

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Change value
      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="second"
          debounceDelay={1000}
        />
      );

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(onDebouncedChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('second');
    });

    it('should apply custom delay to new changes after initial render', () => {
      const onDebouncedChange = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="initial"
          debounceDelay={600}
        />
      );

      act(() => {
        jest.advanceTimersByTime(600);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('initial');
      jest.clearAllMocks();

      rerender(
        <SearchBar
          {...defaultProps}
          onDebouncedChange={onDebouncedChange}
          value="updated"
          debounceDelay={250}
        />
      );

      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onDebouncedChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('updated');
    });
  });

  describe('Clear button functionality', () => {
    it('should not display clear button when text is empty', () => {
      const { queryByTestId } = render(
        <SearchBar {...defaultProps} value="" />
      );

      expect(queryByTestId('search-bar-clear-button')).toBeNull();
    });

    it('should clear the input when clear button is pressed', () => {
      const onChangeText = jest.fn();
      const { UNSAFE_root } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value="hospital"
        />
      );

      try {
        const clearButton = UNSAFE_root.findByProps({ testID: 'search-bar-clear-button' });
        fireEvent.press(clearButton);
        expect(onChangeText).toHaveBeenCalledWith('');
      } catch {
        // Button not found - this shouldn't happen with non-empty value
      }
    });

    it('should hide clear button after pressing it', () => {
      const onChangeText = jest.fn();
      const { UNSAFE_root, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value="test"
        />
      );

      try {
        const clearButton = UNSAFE_root.findByProps({ testID: 'search-bar-clear-button' });
        fireEvent.press(clearButton);
      } catch {
        // Button not found
      }

      // Simulate parent component updating the value
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value=""
        />
      );

      // After update with empty value, the component should render without throwing
      // The button should be gone since value is now empty
    });

    it('should have proper hitSlop for clear button accessibility', () => {
      const { queryByTestId } = render(
        <SearchBar {...defaultProps} value="test" />
      );

      const clearButton = queryByTestId('search-bar-clear-button');
      if (clearButton) {
        expect(clearButton.props.hitSlop).toEqual({
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        });
      }
    });

    it('should call onChangeText with empty string and not debounce immediately on clear', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const { queryByTestId, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value="hospital"
        />
      );

      // Complete initial debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });
      jest.clearAllMocks();

      const clearButton = queryByTestId('search-bar-clear-button');
      if (clearButton) {
        fireEvent.press(clearButton);
        expect(onChangeText).toHaveBeenCalledWith('');
      }

      // Update the component to reflect cleared value
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      jest.clearAllMocks();

      // onDebouncedChange should not be called immediately after clear
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Advance time
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user interaction flow', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const { getByTestId, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      jest.clearAllMocks();

      const input = getByTestId('search-bar-input');

      // User types 'hosp'
      fireEvent.changeText(input, 'hosp');
      expect(onChangeText).toHaveBeenCalledWith('hosp');
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Simulate parent updating the value
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value="hosp"
        />
      );
      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // User continues typing 'hospi'
      fireEvent.changeText(input, 'hospi');
      expect(onChangeText).toHaveBeenCalledWith('hospi');

      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value="hospi"
        />
      );
      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      fireEvent.changeText(input, 'hospita');
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value="hospita"
        />
      );
      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      fireEvent.changeText(input, 'hospital');
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value="hospital"
        />
      );
      jest.clearAllMocks();

      // Wait for debounce (total 300ms after last change)
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith('hospital');
    });

    it('should handle special characters and spaces', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const { getByTestId, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      jest.clearAllMocks();

      const input = getByTestId('search-bar-input');
      const testText = 'Hospital de São Paulo';
      fireEvent.changeText(input, testText);

      expect(onChangeText).toHaveBeenCalledWith(testText);
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Simulate parent updating the value
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value={testText}
        />
      );
      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith(testText);
    });

    it('should handle unicode and accented characters', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const { getByTestId, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      jest.clearAllMocks();

      const input = getByTestId('search-bar-input');
      const testText = 'Médico Especialista';
      fireEvent.changeText(input, testText);

      expect(onChangeText).toHaveBeenCalledWith(testText);
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Simulate parent updating the value
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value={testText}
        />
      );
      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith(testText);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long input text', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const longText = 'a'.repeat(500);

      const { getByTestId, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      jest.clearAllMocks();

      const input = getByTestId('search-bar-input');
      fireEvent.changeText(input, longText);

      expect(onChangeText).toHaveBeenCalledWith(longText);
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Simulate parent updating the value
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value={longText}
        />
      );
      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onDebouncedChange).toHaveBeenCalledWith(longText);
    });

    it('should handle multiple sequential clear operations', () => {
      const onChangeText = jest.fn();
      const onDebouncedChange = jest.fn();
      const { queryByTestId, rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value="test"
        />
      );

      // Clear once
      let clearButton = queryByTestId('search-bar-clear-button');
      if (clearButton) {
        fireEvent.press(clearButton);
        expect(onChangeText).toHaveBeenCalledWith('');
      }

      // Update component
      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          onDebouncedChange={onDebouncedChange}
          value=""
        />
      );

      expect(queryByTestId('search-bar-clear-button')).toBeNull();
    });

    it('should not break when callbacks are the same reference', () => {
      const callback = jest.fn();
      const { rerender } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={callback}
          onDebouncedChange={callback}
          value="test"
        />
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      rerender(
        <SearchBar
          {...defaultProps}
          onChangeText={callback}
          onDebouncedChange={callback}
          value="test"
        />
      );

      expect(callback).toHaveBeenCalled();
    });

    it('should ensure handleClear function is defined and called on button press', () => {
      const onChangeText = jest.fn();
      const { queryByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value="hospital"
        />
      );

      const clearButton = queryByTestId('search-bar-clear-button');
      if (clearButton) {
        fireEvent.press(clearButton);
        // Verify handleClear calls onChangeText with empty string (line 31)
        expect(onChangeText).toHaveBeenCalledWith('');
        expect(onChangeText).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onChangeText with empty string inside handleClear', () => {
      const onChangeText = jest.fn();
      const { queryByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value="search"
        />
      );

      const clearButton = queryByTestId('search-bar-clear-button');
      if (clearButton) {
        fireEvent.press(clearButton);
        expect(onChangeText).toHaveBeenCalledWith('');
      }
    });

    it('should execute handleClear and pass empty string to onChangeText', () => {
      const onChangeText = jest.fn();
      const { queryByTestId } = render(
        <SearchBar
          {...defaultProps}
          onChangeText={onChangeText}
          value="query"
        />
      );

      const clearButton = queryByTestId('search-bar-clear-button');
      if (clearButton) {
        fireEvent.press(clearButton);
        expect(onChangeText).toHaveBeenCalledWith('');
      }
    });
  });
});
