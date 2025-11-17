import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BottomSheet } from './BottomSheet';
import type { BottomSheetOption } from './types';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  X: () => <></>,
  Check: () => <></>,
}));

describe('BottomSheet', () => {
  const mockOptions: BottomSheetOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select Option"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet')).toBeTruthy();
    });

    it('should render with custom testID', () => {
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

      expect(getByTestId('custom-sheet')).toBeTruthy();
      expect(getByTestId('custom-sheet-title')).toBeTruthy();
    });

    it('should render title', () => {
      const { getByText } = render(
        <BottomSheet
          visible={true}
          title="Choose an option"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Choose an option')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet-close-button')).toBeTruthy();
    });

    it('should render all options', () => {
      const { getByText } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
      expect(getByText('Option 3')).toBeTruthy();
    });

    it('should render scroll view', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet-scroll-view')).toBeTruthy();
    });
  });

  describe('Selection', () => {
    it('should call onSelect when option is pressed', () => {
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

      fireEvent.press(getByTestId('bottom-sheet-option-opt2'));
      expect(mockOnSelect).toHaveBeenCalledWith('opt2');
    });

    it('should call onClose after selecting an option', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByTestId('bottom-sheet-option-opt2'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should select different options', () => {
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

      fireEvent.press(getByTestId('bottom-sheet-option-opt3'));
      expect(mockOnSelect).toHaveBeenCalledWith('opt3');
    });
  });

  describe('Closing', () => {
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

      fireEvent.press(getByTestId('bottom-sheet-close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
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

      fireEvent.press(getByTestId('bottom-sheet-overlay'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when content is pressed', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByTestId('bottom-sheet-content'));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Options Rendering', () => {
    it('should render single option', () => {
      const singleOption = [{ label: 'Only One', value: 'one' }];
      const { getByText } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={singleOption}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Only One')).toBeTruthy();
    });

    it('should render many options', () => {
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`,
      }));

      const { getByText } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={manyOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 10')).toBeTruthy();
    });

    it('should render options with special characters', () => {
      const specialOptions = [
        { label: 'Option @ 50%', value: 'special1' },
        { label: 'Option "quoted"', value: 'special2' },
      ];

      const { getByText } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={specialOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Option @ 50%')).toBeTruthy();
      expect(getByText('Option "quoted"')).toBeTruthy();
    });

    it('should render options with unicode characters', () => {
      const unicodeOptions = [
        { label: 'Opción 1', value: 'unicode1' },
        { label: 'Configuración', value: 'unicode2' },
      ];

      const { getByText } = render(
        <BottomSheet
          visible={true}
          title="Seleccionar"
          options={unicodeOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Opción 1')).toBeTruthy();
      expect(getByText('Configuración')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title=""
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet-title')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines';
      const { getByText } = render(
        <BottomSheet
          visible={true}
          title={longTitle}
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle empty options array', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={[]}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet')).toBeTruthy();
    });

    it('should render options when no value is selected', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet-option-opt1')).toBeTruthy();
      expect(getByTestId('bottom-sheet-option-opt2')).toBeTruthy();
      expect(getByTestId('bottom-sheet-option-opt3')).toBeTruthy();
    });

    it('should render options with nonexistent selected value', () => {
      const { getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select"
          options={mockOptions}
          selectedValue="nonexistent"
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId('bottom-sheet-option-opt1')).toBeTruthy();
      expect(getByTestId('bottom-sheet-option-opt2')).toBeTruthy();
      expect(getByTestId('bottom-sheet-option-opt3')).toBeTruthy();
    });
  });

  describe('Complete Examples', () => {
    it('should work with all props', () => {
      const { getByText, getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Choose a category"
          options={mockOptions}
          selectedValue="opt2"
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          testID="category-picker"
        />
      );

      expect(getByTestId('category-picker')).toBeTruthy();
      expect(getByText('Choose a category')).toBeTruthy();
      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
      expect(getByText('Option 3')).toBeTruthy();

      fireEvent.press(getByTestId('category-picker-option-opt1'));
      expect(mockOnSelect).toHaveBeenCalledWith('opt1');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should work without selected value', () => {
      const { getByText, getByTestId } = render(
        <BottomSheet
          visible={true}
          title="Select an option"
          options={mockOptions}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Select an option')).toBeTruthy();
      expect(getByText('Option 1')).toBeTruthy();

      fireEvent.press(getByTestId('bottom-sheet-option-opt3'));
      expect(mockOnSelect).toHaveBeenCalledWith('opt3');
    });
  });
});
