import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from './EmptyState';
import type { EmptyStateProps } from './types';
import { PackageOpen } from 'lucide-react-native';

describe('EmptyState', () => {
  const baseProps: Omit<EmptyStateProps, 'title'> & { title: string } = {
    title: 'No Items Found',
  };

  it('should render with title only', () => {
    const { getByTestId, getByText } = render(
      <EmptyState {...baseProps} />
    );

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No Items Found')).toBeTruthy();
  });

  it('should render with title and description', () => {
    const { getByTestId, getByText } = render(
      <EmptyState
        {...baseProps}
        description="There are no items to display"
      />
    );

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No Items Found')).toBeTruthy();
    expect(getByText('There are no items to display')).toBeTruthy();
  });

  it('should render without description when not provided', () => {
    const { queryByTestId } = render(<EmptyState {...baseProps} />);

    expect(queryByTestId('empty-state-description')).toBeFalsy();
  });

  it('should render with action button when provided', () => {
    const mockOnPress = jest.fn();
    const { getByTestId, getByText } = render(
      <EmptyState
        {...baseProps}
        action={{
          label: 'Add Item',
          onPress: mockOnPress,
        }}
      />
    );

    expect(getByTestId('empty-state-action')).toBeTruthy();
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('should call action onPress when button is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <EmptyState
        {...baseProps}
        action={{
          label: 'Retry',
          onPress: mockOnPress,
        }}
      />
    );

    const button = getByTestId('empty-state-action');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when action is not provided', () => {
    const { queryByTestId } = render(<EmptyState {...baseProps} />);

    expect(queryByTestId('empty-state-action')).toBeFalsy();
  });

  it('should use custom icon when provided', () => {
    const { getByTestId } = render(
      <EmptyState {...baseProps} icon={PackageOpen} />
    );

    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('should use default PackageOpen icon when not provided', () => {
    const { getByTestId } = render(<EmptyState {...baseProps} />);

    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('should use custom testID when provided', () => {
    const { getByTestId, queryByTestId } = render(
      <EmptyState {...baseProps} testID="custom-empty-state" />
    );

    expect(getByTestId('custom-empty-state')).toBeTruthy();
    expect(getByTestId('custom-empty-state-title')).toBeTruthy();
  });

  it('should render with all props provided together', () => {
    const mockOnPress = jest.fn();
    const { getByTestId, getByText } = render(
      <EmptyState
        title="Cart is Empty"
        description="Add items to your cart to proceed"
        icon={PackageOpen}
        action={{
          label: 'Start Shopping',
          onPress: mockOnPress,
        }}
        testID="cart-empty-state"
      />
    );

    expect(getByTestId('cart-empty-state')).toBeTruthy();
    expect(getByText('Cart is Empty')).toBeTruthy();
    expect(getByText('Add items to your cart to proceed')).toBeTruthy();
    expect(getByText('Start Shopping')).toBeTruthy();

    const button = getByTestId('cart-empty-state-action');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
