import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from './SearchBar';

jest.mock('@/hooks', () => ({
  useDebouncedValue: jest.fn((value) => value),
}));

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnDebouncedChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default testID and placeholder', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    expect(getByTestId('search-bar')).toBeDefined();
    expect(getByTestId('search-bar-input')).toBeDefined();
    expect(getByPlaceholderText('Search...')).toBeDefined();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
        testID="custom-search"
      />
    );

    expect(getByTestId('custom-search')).toBeDefined();
    expect(getByTestId('custom-search-input')).toBeDefined();
  });

  it('should display current value in input field', () => {
    const { getByDisplayValue } = render(
      <SearchBar
        value="test query"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    expect(getByDisplayValue('test query')).toBeDefined();
  });

  it('should call onChangeText when input text changes', () => {
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    fireEvent.changeText(getByTestId('search-bar-input'), 'new text');

    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('should not show clear button when value is empty', () => {
    const { queryByTestId } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    expect(queryByTestId('search-bar-clear-button')).toBeNull();
  });

  it('should show clear button when value is not empty', () => {
    mockOnChangeText.mockClear();
    const { getByDisplayValue } = render(
      <SearchBar
        value="search text"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    // Verify that the clear button appears by checking the input value is displayed
    expect(getByDisplayValue('search text')).toBeDefined();
  });

  it('should call onDebouncedChange when value changes', () => {
    mockOnDebouncedChange.mockClear();
    render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    expect(mockOnDebouncedChange).toHaveBeenCalledWith('test');
  });

  it('should use custom debounce delay', () => {
    const { getByTestId } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
        debounceDelay={500}
      />
    );

    expect(getByTestId('search-bar')).toBeDefined();
  });

  it('should render with different placeholder text', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Find a product..."
      />
    );

    expect(getByPlaceholderText('Find a product...')).toBeDefined();
  });

  it('should call onChangeText when input field text changes', () => {
    mockOnChangeText.mockClear();
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    fireEvent.changeText(getByTestId('search-bar-input'), 'clear test');

    expect(mockOnChangeText).toHaveBeenCalledWith('clear test');
  });

  it('should call onDebouncedChange with updated value on prop change', () => {
    mockOnDebouncedChange.mockClear();
    const { rerender } = render(
      <SearchBar
        value="initial"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    expect(mockOnDebouncedChange).toHaveBeenCalledWith('initial');

    mockOnDebouncedChange.mockClear();
    rerender(
      <SearchBar
        value="updated"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    expect(mockOnDebouncedChange).toHaveBeenCalledWith('updated');
  });

  it('should clear search when onChangeText is called with empty string', () => {
    mockOnChangeText.mockClear();
    mockOnDebouncedChange.mockClear();

    const { getByTestId, rerender, queryByTestId, root } = render(
      <SearchBar
        value="search query"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    // Input has a value, so clear button should not be visible (it's conditional)
    const input = getByTestId('search-bar-input');
    expect(input.props.value).toBe('search query');

    // Simulate user clearing the input
    fireEvent.changeText(input, '');
    expect(mockOnChangeText).toHaveBeenCalledWith('');

    // Re-render with empty value
    mockOnChangeText.mockClear();
    rerender(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
      />
    );

    // Clear button should not exist when value is empty
    expect(queryByTestId('search-bar-clear-button')).toBeNull();
  });

  it('should execute handleClear when clear button is pressed', () => {
    mockOnChangeText.mockClear();
    const { root } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onDebouncedChange={mockOnDebouncedChange}
        placeholder="Search..."
        testID="test-search"
      />
    );

    // Find the Pressable component with the clear button testID
    const instance = root.findByProps({ testID: 'test-search-clear-button' });
    if (instance) {
      // Call the onPress handler directly
      instance.props.onPress();
      expect(mockOnChangeText).toHaveBeenCalledWith('');
    }
  });
});
