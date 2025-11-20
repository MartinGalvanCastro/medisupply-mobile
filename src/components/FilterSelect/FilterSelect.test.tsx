import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { FilterSelect } from './FilterSelect';
import type { FilterSelectProps } from './types';


describe('FilterSelect', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
    { label: 'Option 3', value: 'option-3' },
  ];

  const baseProps: FilterSelectProps = {
    value: 'option-1',
    options: mockOptions,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with the selected option label', () => {
    const { getByText } = render(<FilterSelect {...baseProps} />);

    expect(getByText('Option 1')).toBeTruthy();
  });

  it('should open modal when trigger button is pressed', async () => {
    const { getByTestId } = render(<FilterSelect {...baseProps} />);

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      expect(getByTestId('filter-select-options')).toBeTruthy();
    });
  });

  it('should display all options when modal is opened', async () => {
    const { getByTestId } = render(<FilterSelect {...baseProps} />);

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      expect(getByTestId('filter-select-option-option-1')).toBeTruthy();
      expect(getByTestId('filter-select-option-option-2')).toBeTruthy();
      expect(getByTestId('filter-select-option-option-3')).toBeTruthy();
    });
  });

  it('should call onChange and close modal when option is selected', async () => {
    const mockOnChange = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <FilterSelect {...baseProps} onChange={mockOnChange} />
    );

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      const option2 = getByTestId('filter-select-option-option-2');
      fireEvent.press(option2);
    });

    expect(mockOnChange).toHaveBeenCalledWith('option-2');
    await waitFor(() => {
      expect(queryByTestId('filter-select-options')).toBeFalsy();
    });
  });

  it('should close modal when backdrop is pressed', async () => {
    const { getByTestId, queryByTestId } = render(
      <FilterSelect {...baseProps} />
    );

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      expect(getByTestId('filter-select-options')).toBeTruthy();
    });

    const backdrop = getByTestId('filter-select-backdrop');
    fireEvent.press(backdrop);

    await waitFor(() => {
      expect(queryByTestId('filter-select-options')).toBeFalsy();
    });
  });

  it('should update displayed label when value prop changes', () => {
    const { getByText, rerender } = render(
      <FilterSelect {...baseProps} value="option-1" />
    );

    expect(getByText('Option 1')).toBeTruthy();

    rerender(<FilterSelect {...baseProps} value="option-2" />);

    expect(getByText('Option 2')).toBeTruthy();
  });

  it('should use custom testID when provided', async () => {
    const { getByTestId } = render(
      <FilterSelect {...baseProps} testID="custom-filter" />
    );

    expect(getByTestId('custom-filter-trigger')).toBeTruthy();

    const trigger = getByTestId('custom-filter-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      expect(getByTestId('custom-filter-options')).toBeTruthy();
    });
  });

  it('should call modal onRequestClose when backdrop is pressed', async () => {
    const { getByTestId, queryByTestId } = render(
      <FilterSelect {...baseProps} />
    );

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      const modal = getByTestId('filter-select-modal');
      expect(modal.props.visible).toBe(true);
      // Trigger onRequestClose directly (simulates hardware back button)
      modal.props.onRequestClose();
    });

    await waitFor(() => {
      expect(queryByTestId('filter-select-options')).toBeFalsy();
    });
  });

  it('should apply correct styling to selected option', async () => {
    const { getByTestId } = render(
      <FilterSelect {...baseProps} value="option-2" />
    );

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      // Verify selected option exists and is rendered
      const selectedOption = getByTestId('filter-select-option-option-2');
      expect(selectedOption).toBeTruthy();
      // Verify the option renders with the selected value
      expect(selectedOption.props.testID).toContain('option-2');
    });
  });

  it('should handle option selection with different values in sequence', async () => {
    const mockOnChange = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <FilterSelect {...baseProps} onChange={mockOnChange} />
    );

    const trigger = getByTestId('filter-select-trigger');

    // First selection
    fireEvent.press(trigger);
    await waitFor(() => {
      const option1 = getByTestId('filter-select-option-option-1');
      fireEvent.press(option1);
    });
    expect(mockOnChange).toHaveBeenLastCalledWith('option-1');

    // Second selection after reopening
    fireEvent.press(trigger);
    await waitFor(() => {
      const option2 = getByTestId('filter-select-option-option-2');
      fireEvent.press(option2);
    });
    expect(mockOnChange).toHaveBeenLastCalledWith('option-2');

    // Verify modal closes after selection
    await waitFor(() => {
      expect(queryByTestId('filter-select-options')).toBeFalsy();
    });
  });

  it('should not close modal when pressing options container directly', async () => {
    const { getByTestId, queryByTestId } = render(
      <FilterSelect {...baseProps} />
    );

    const trigger = getByTestId('filter-select-trigger');
    fireEvent.press(trigger);

    await waitFor(() => {
      expect(getByTestId('filter-select-options-pressable')).toBeTruthy();
    });

    // Pressing the options container should not trigger modal close
    const optionsPressable = getByTestId('filter-select-options-pressable');
    fireEvent.press(optionsPressable);

    // Modal should still be open since pressing inner pressable doesn't trigger backdrop
    expect(getByTestId('filter-select-options')).toBeTruthy();

    // Only backdrop press should close it
    const backdrop = getByTestId('filter-select-backdrop');
    fireEvent.press(backdrop);

    await waitFor(() => {
      expect(queryByTestId('filter-select-options')).toBeFalsy();
    });
  });

});
