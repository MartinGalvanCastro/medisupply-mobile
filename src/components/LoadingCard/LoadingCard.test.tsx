import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoadingCard } from './LoadingCard';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => <></>,
}));

describe('LoadingCard', () => {
  describe('Rendering', () => {
    it('should render with default message', () => {
      const { getByText, getByTestId } = render(<LoadingCard />);

      expect(getByTestId('loading-card')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(<LoadingCard testID="custom-loading" />);

      expect(getByTestId('custom-loading')).toBeTruthy();
      expect(getByTestId('custom-loading-message')).toBeTruthy();
      expect(getByTestId('custom-loading-spinner')).toBeTruthy();
    });

    it('should render with custom message', () => {
      const { getByText } = render(<LoadingCard message="Please wait..." />);

      expect(getByText('Please wait...')).toBeTruthy();
    });

    it('should render spinner', () => {
      const { getByTestId } = render(<LoadingCard />);

      expect(getByTestId('loading-card-spinner')).toBeTruthy();
    });
  });

  describe('Back Button', () => {
    it('should not render back button by default', () => {
      const { queryByTestId } = render(<LoadingCard />);

      expect(queryByTestId('loading-card-back-button')).toBeFalsy();
    });

    it('should not render back button when showBackButton is false', () => {
      const mockBack = jest.fn();
      const { queryByTestId } = render(
        <LoadingCard showBackButton={false} onBack={mockBack} />
      );

      expect(queryByTestId('loading-card-back-button')).toBeFalsy();
    });

    it('should not render back button when onBack is not provided', () => {
      const { queryByTestId } = render(<LoadingCard showBackButton={true} />);

      expect(queryByTestId('loading-card-back-button')).toBeFalsy();
    });

    it('should render back button when showBackButton and onBack are provided', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <LoadingCard showBackButton={true} onBack={mockBack} />
      );

      expect(getByTestId('loading-card-back-button')).toBeTruthy();
    });

    it('should call onBack when back button is pressed', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <LoadingCard showBackButton={true} onBack={mockBack} />
      );

      fireEvent.press(getByTestId('loading-card-back-button'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should call onBack multiple times', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <LoadingCard showBackButton={true} onBack={mockBack} />
      );

      const button = getByTestId('loading-card-back-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockBack).toHaveBeenCalledTimes(3);
    });

    it('should render back button text', () => {
      const mockBack = jest.fn();
      const { getByText } = render(
        <LoadingCard showBackButton={true} onBack={mockBack} />
      );

      expect(getByText('Back')).toBeTruthy();
    });
  });

  describe('Complete Examples', () => {
    it('should render loading card with all props', () => {
      const mockBack = jest.fn();
      const { getByText, getByTestId } = render(
        <LoadingCard
          message="Loading your data..."
          showBackButton={true}
          onBack={mockBack}
          testID="data-loading"
        />
      );

      expect(getByTestId('data-loading')).toBeTruthy();
      expect(getByText('Loading your data...')).toBeTruthy();
      expect(getByTestId('data-loading-spinner')).toBeTruthy();
      expect(getByTestId('data-loading-back-button')).toBeTruthy();

      fireEvent.press(getByTestId('data-loading-back-button'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should render minimal loading card', () => {
      const { getByText, getByTestId } = render(<LoadingCard />);

      expect(getByTestId('loading-card')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
      expect(getByTestId('loading-card-spinner')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { getByTestId } = render(<LoadingCard message="" />);

      expect(getByTestId('loading-card')).toBeTruthy();
      expect(getByTestId('loading-card-message')).toBeTruthy();
    });

    it('should handle very long messages', () => {
      const longMessage =
        'This is a very long loading message that provides detailed information about what is being loaded';
      const { getByText } = render(<LoadingCard message={longMessage} />);

      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in message', () => {
      const { getByText } = render(
        <LoadingCard message="Loading items @ 50% off!" />
      );

      expect(getByText('Loading items @ 50% off!')).toBeTruthy();
    });

    it('should handle unicode characters in message', () => {
      const { getByText } = render(<LoadingCard message="Cargando datos..." />);

      expect(getByText('Cargando datos...')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('should have proper structure', () => {
      const { getByTestId } = render(<LoadingCard />);

      const card = getByTestId('loading-card');
      const spinner = getByTestId('loading-card-spinner');
      const message = getByTestId('loading-card-message');

      expect(card).toBeTruthy();
      expect(spinner).toBeTruthy();
      expect(message).toBeTruthy();
    });

    it('should maintain structure with back button', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <LoadingCard showBackButton={true} onBack={mockBack} />
      );

      expect(getByTestId('loading-card')).toBeTruthy();
      expect(getByTestId('loading-card-spinner')).toBeTruthy();
      expect(getByTestId('loading-card-message')).toBeTruthy();
      expect(getByTestId('loading-card-back-button')).toBeTruthy();
    });
  });
});
