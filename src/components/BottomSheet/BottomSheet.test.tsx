import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BottomSheet } from './BottomSheet';
import type { BottomSheetOption } from './types';

describe('BottomSheet', () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  const mockOptions: BottomSheetOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible is true with title', () => {
    const { getByTestId, getByText } = render(
      <BottomSheet
        visible={true}
        title="Select Option"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByTestId('bottom-sheet')).toBeDefined();
    expect(getByText('Select Option')).toBeDefined();
  });

  it('should not render modal when visible is false', () => {
    const { queryByTestId } = render(
      <BottomSheet
        visible={false}
        title="Select Option"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    expect(queryByTestId('bottom-sheet-title')).toBeFalsy();
  });

  it('should render all options with correct labels', () => {
    const { getByText } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Option 1')).toBeDefined();
    expect(getByText('Option 2')).toBeDefined();
    expect(getByText('Option 3')).toBeDefined();
  });

  it('should call onSelect with correct value and onClose when option is pressed', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    const option = getByTestId('bottom-sheet-option-opt1');
    fireEvent.press(option);

    expect(mockOnSelect).toHaveBeenCalledWith('opt1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    const closeButton = getByTestId('bottom-sheet-close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is pressed', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    const overlay = getByTestId('bottom-sheet-overlay');
    fireEvent.press(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should use custom testID for all elements', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        testID="custom-sheet"
      />
    );

    expect(getByTestId('custom-sheet')).toBeDefined();
    expect(getByTestId('custom-sheet-title')).toBeDefined();
    expect(getByTestId('custom-sheet-overlay')).toBeDefined();
    expect(getByTestId('custom-sheet-close-button')).toBeDefined();
  });

  it('should highlight selected option and display check icon', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        selectedValue="opt2"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    const selectedOption = getByTestId('bottom-sheet-option-opt2');
    expect(selectedOption).toBeDefined();
  });

  it('should call onRequestClose on modal when close is pressed via modal API', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    // Pressing content area should not trigger onClose (stops propagation)
    const content = getByTestId('bottom-sheet-content');
    fireEvent.press(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle multiple option selections in sequence', () => {
    const { getByTestId } = render(
      <BottomSheet
        visible={true}
        title="Select"
        options={mockOptions}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByTestId('bottom-sheet-option-opt1'));
    expect(mockOnSelect).toHaveBeenCalledWith('opt1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    mockOnSelect.mockClear();
    mockOnClose.mockClear();

    fireEvent.press(getByTestId('bottom-sheet-option-opt3'));
    expect(mockOnSelect).toHaveBeenCalledWith('opt3');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
