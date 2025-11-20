import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorStateCard } from './ErrorStateCard';
import type { ErrorStateCardProps } from './types';

describe('ErrorStateCard', () => {
  const baseProps: Pick<ErrorStateCardProps, 'title'> = {
    title: 'Something went wrong',
  };

  it('should render title', () => {
    const { getByTestId, getByText } = render(
      <ErrorStateCard {...baseProps} />
    );

    expect(getByTestId('error-state-card')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should render message when provided and not render when omitted', () => {
    const { queryByTestId: queryByTestIdWithMessage } = render(
      <ErrorStateCard {...baseProps} message="Failed to load data" />
    );
    expect(queryByTestIdWithMessage('error-state-card-message')).toBeTruthy();

    const { queryByTestId: queryByTestIdWithoutMessage } = render(
      <ErrorStateCard {...baseProps} />
    );
    expect(queryByTestIdWithoutMessage('error-state-card-message')).toBeFalsy();
  });

  it('should render retry button and call onRetry when provided', () => {
    const mockOnRetry = jest.fn();
    const { getByTestId, getByText } = render(
      <ErrorStateCard
        {...baseProps}
        onRetry={mockOnRetry}
        retryLabel="Retry"
      />
    );

    expect(getByTestId('error-state-card-retry-button')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();

    fireEvent.press(getByTestId('error-state-card-retry-button'));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    const { queryByTestId } = render(<ErrorStateCard {...baseProps} />);
    expect(queryByTestId('error-state-card-retry-button')).toBeFalsy();
  });

  it('should render back button and call onBack when both showBackButton and onBack are provided', () => {
    const mockOnBack = jest.fn();
    const { getByTestId, getByText } = render(
      <ErrorStateCard
        {...baseProps}
        showBackButton={true}
        onBack={mockOnBack}
        backLabel="Go Back"
      />
    );

    expect(getByTestId('error-state-card-back-button')).toBeTruthy();
    expect(getByText('Go Back')).toBeTruthy();

    fireEvent.press(getByTestId('error-state-card-back-button'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should not render back button when showBackButton is false even with onBack provided', () => {
    const mockOnBack = jest.fn();
    const { queryByTestId } = render(
      <ErrorStateCard
        {...baseProps}
        showBackButton={false}
        onBack={mockOnBack}
      />
    );

    expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
  });

  it('should not render back button when onBack is not provided even with showBackButton true', () => {
    const { queryByTestId } = render(
      <ErrorStateCard {...baseProps} showBackButton={true} />
    );

    expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
  });

  it('should use custom testID for card and derived element IDs', () => {
    const mockOnRetry = jest.fn();
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <ErrorStateCard
        {...baseProps}
        testID="custom-error"
        message="Test message"
        onRetry={mockOnRetry}
        showBackButton={true}
        onBack={mockOnBack}
      />
    );

    expect(getByTestId('custom-error')).toBeTruthy();
    expect(getByTestId('custom-error-title')).toBeTruthy();
    expect(getByTestId('custom-error-message')).toBeTruthy();
    expect(getByTestId('custom-error-retry-button')).toBeTruthy();
    expect(getByTestId('custom-error-back-button')).toBeTruthy();
  });
});
