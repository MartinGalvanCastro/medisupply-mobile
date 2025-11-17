import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorStateCard } from './ErrorStateCard';
import { AlertCircle, XCircle } from 'lucide-react-native';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  AlertCircle: () => <></>,
  XCircle: () => <></>,
  ArrowLeft: () => <></>,
  RefreshCw: () => <></>,
}));

describe('ErrorStateCard', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText, getByTestId } = render(
        <ErrorStateCard title="Error occurred" />
      );

      expect(getByTestId('error-state-card')).toBeTruthy();
      expect(getByText('Error occurred')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <ErrorStateCard title="Error" testID="custom-error" />
      );

      expect(getByTestId('custom-error')).toBeTruthy();
      expect(getByTestId('custom-error-title')).toBeTruthy();
    });

    it('should render message when provided', () => {
      const { getByText } = render(
        <ErrorStateCard
          title="Error"
          message="Something went wrong. Please try again."
        />
      );

      expect(getByText('Something went wrong. Please try again.')).toBeTruthy();
    });

    it('should not render message when not provided', () => {
      const { queryByTestId } = render(<ErrorStateCard title="Error" />);

      expect(queryByTestId('error-state-card-message')).toBeFalsy();
    });

    it('should render with default configuration', () => {
      const { getByTestId } = render(<ErrorStateCard title="Error" />);

      expect(getByTestId('error-state-card')).toBeTruthy();
      expect(getByTestId('error-state-card-title')).toBeTruthy();
    });

    it('should render with custom icon', () => {
      const { getByTestId } = render(
        <ErrorStateCard title="Error" icon={XCircle} />
      );

      expect(getByTestId('error-state-card')).toBeTruthy();
    });
  });

  describe('Retry Button', () => {
    it('should not render retry button by default', () => {
      const { queryByTestId } = render(<ErrorStateCard title="Error" />);

      expect(queryByTestId('error-state-card-retry-button')).toBeFalsy();
    });

    it('should render retry button when onRetry is provided', () => {
      const mockRetry = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard title="Error" onRetry={mockRetry} />
      );

      expect(getByTestId('error-state-card-retry-button')).toBeTruthy();
    });

    it('should call onRetry when retry button is pressed', () => {
      const mockRetry = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard title="Error" onRetry={mockRetry} />
      );

      fireEvent.press(getByTestId('error-state-card-retry-button'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry multiple times', () => {
      const mockRetry = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard title="Error" onRetry={mockRetry} />
      );

      const button = getByTestId('error-state-card-retry-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockRetry).toHaveBeenCalledTimes(3);
    });

    it('should render default retry label', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(
        <ErrorStateCard title="Error" onRetry={mockRetry} />
      );

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should render custom retry label', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(
        <ErrorStateCard
          title="Error"
          onRetry={mockRetry}
          retryLabel="Try Again"
        />
      );

      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  describe('Back Button', () => {
    it('should not render back button by default', () => {
      const { queryByTestId } = render(<ErrorStateCard title="Error" />);

      expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
    });

    it('should not render back button when showBackButton is false', () => {
      const mockBack = jest.fn();
      const { queryByTestId } = render(
        <ErrorStateCard title="Error" showBackButton={false} onBack={mockBack} />
      );

      expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
    });

    it('should not render back button when onBack is not provided', () => {
      const { queryByTestId } = render(
        <ErrorStateCard title="Error" showBackButton={true} />
      );

      expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
    });

    it('should render back button when showBackButton and onBack are provided', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard title="Error" showBackButton={true} onBack={mockBack} />
      );

      expect(getByTestId('error-state-card-back-button')).toBeTruthy();
    });

    it('should call onBack when back button is pressed', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard title="Error" showBackButton={true} onBack={mockBack} />
      );

      fireEvent.press(getByTestId('error-state-card-back-button'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should call onBack multiple times', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard title="Error" showBackButton={true} onBack={mockBack} />
      );

      const button = getByTestId('error-state-card-back-button');
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockBack).toHaveBeenCalledTimes(2);
    });

    it('should render default back label', () => {
      const mockBack = jest.fn();
      const { getByText } = render(
        <ErrorStateCard title="Error" showBackButton={true} onBack={mockBack} />
      );

      expect(getByText('Back')).toBeTruthy();
    });

    it('should render custom back label', () => {
      const mockBack = jest.fn();
      const { getByText } = render(
        <ErrorStateCard
          title="Error"
          showBackButton={true}
          onBack={mockBack}
          backLabel="Go Back"
        />
      );

      expect(getByText('Go Back')).toBeTruthy();
    });
  });

  describe('Complete Examples', () => {
    it('should render error card with all props', () => {
      const mockRetry = jest.fn();
      const mockBack = jest.fn();
      const { getByText, getByTestId } = render(
        <ErrorStateCard
          title="Failed to load data"
          message="Unable to connect to the server. Please check your connection and try again."
          icon={XCircle}
          onRetry={mockRetry}
          retryLabel="Try Again"
          showBackButton={true}
          onBack={mockBack}
          backLabel="Go Back"
          testID="network-error"
        />
      );

      expect(getByTestId('network-error')).toBeTruthy();
      expect(getByText('Failed to load data')).toBeTruthy();
      expect(
        getByText(
          'Unable to connect to the server. Please check your connection and try again.'
        )
      ).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
      expect(getByText('Go Back')).toBeTruthy();

      fireEvent.press(getByTestId('network-error-retry-button'));
      expect(mockRetry).toHaveBeenCalledTimes(1);

      fireEvent.press(getByTestId('network-error-back-button'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should render minimal error card', () => {
      const { getByText, getByTestId } = render(
        <ErrorStateCard title="Error" />
      );

      expect(getByTestId('error-state-card')).toBeTruthy();
      expect(getByText('Error')).toBeTruthy();
    });

    it('should render error card with retry only', () => {
      const mockRetry = jest.fn();
      const { getByText, getByTestId, queryByTestId } = render(
        <ErrorStateCard
          title="Network Error"
          message="Failed to load"
          onRetry={mockRetry}
        />
      );

      expect(getByText('Network Error')).toBeTruthy();
      expect(getByText('Failed to load')).toBeTruthy();
      expect(getByTestId('error-state-card-retry-button')).toBeTruthy();
      expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByTestId } = render(<ErrorStateCard title="" />);

      expect(getByTestId('error-state-card')).toBeTruthy();
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long error title that might wrap to multiple lines';
      const { getByText } = render(<ErrorStateCard title={longTitle} />);

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle very long messages', () => {
      const longMessage =
        'This is a very long error message that provides detailed information about what went wrong and what the user should do to resolve the issue';
      const { getByText } = render(
        <ErrorStateCard title="Error" message={longMessage} />
      );

      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in text', () => {
      const { getByText } = render(
        <ErrorStateCard
          title="Error @ Line 42"
          message='Failed to parse "special" characters'
        />
      );

      expect(getByText('Error @ Line 42')).toBeTruthy();
      expect(getByText('Failed to parse "special" characters')).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      const { getByText } = render(
        <ErrorStateCard title="Error" message="No se pudo cargar los datos" />
      );

      expect(getByText('No se pudo cargar los datos')).toBeTruthy();
    });
  });

  describe('Button Combinations', () => {
    it('should render both retry and back buttons', () => {
      const mockRetry = jest.fn();
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ErrorStateCard
          title="Error"
          onRetry={mockRetry}
          showBackButton={true}
          onBack={mockBack}
        />
      );

      expect(getByTestId('error-state-card-retry-button')).toBeTruthy();
      expect(getByTestId('error-state-card-back-button')).toBeTruthy();
    });

    it('should work with only retry button', () => {
      const mockRetry = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <ErrorStateCard title="Error" onRetry={mockRetry} />
      );

      expect(getByTestId('error-state-card-retry-button')).toBeTruthy();
      expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
    });

    it('should work with only back button', () => {
      const mockBack = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <ErrorStateCard title="Error" showBackButton={true} onBack={mockBack} />
      );

      expect(queryByTestId('error-state-card-retry-button')).toBeFalsy();
      expect(getByTestId('error-state-card-back-button')).toBeTruthy();
    });

    it('should work with no buttons', () => {
      const { queryByTestId } = render(<ErrorStateCard title="Error" />);

      expect(queryByTestId('error-state-card-retry-button')).toBeFalsy();
      expect(queryByTestId('error-state-card-back-button')).toBeFalsy();
    });
  });
});
