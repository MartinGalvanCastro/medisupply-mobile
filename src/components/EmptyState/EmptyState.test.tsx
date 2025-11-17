import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from './EmptyState';
import { Search, PackageOpen } from 'lucide-react-native';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  PackageOpen: () => <></>,
  Search: () => <></>,
}));

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText, getByTestId } = render(
        <EmptyState title="No items found" />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No items found')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <EmptyState title="Empty" testID="custom-empty-state" />
      );

      expect(getByTestId('custom-empty-state')).toBeTruthy();
    });

    it('should render description when provided', () => {
      const { getByText } = render(
        <EmptyState
          title="No items"
          description="Try adjusting your filters"
        />
      );

      expect(getByText('Try adjusting your filters')).toBeTruthy();
    });

    it('should not render description when not provided', () => {
      const { queryByTestId } = render(<EmptyState title="Empty" />);

      expect(queryByTestId('empty-state-description')).toBeFalsy();
    });

    it('should render with default props', () => {
      const { getByTestId } = render(<EmptyState title="Empty" />);

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByTestId('empty-state-title')).toBeTruthy();
    });

    it('should render with custom icon', () => {
      const { getByTestId } = render(
        <EmptyState title="No results" icon={Search} />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
    });
  });

  describe('Action Button', () => {
    it('should render action button when provided', () => {
      const mockAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          title="Empty"
          action={{ label: 'Retry', onPress: mockAction }}
        />
      );

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should not render action button when not provided', () => {
      const { queryByTestId } = render(<EmptyState title="Empty" />);

      expect(queryByTestId('empty-state-action')).toBeFalsy();
    });

    it('should call onPress when action button is pressed', () => {
      const mockAction = jest.fn();
      const { getByTestId } = render(
        <EmptyState
          title="Empty"
          action={{ label: 'Retry', onPress: mockAction }}
        />
      );

      fireEvent.press(getByTestId('empty-state-action'));
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times', () => {
      const mockAction = jest.fn();
      const { getByTestId } = render(
        <EmptyState
          title="Empty"
          action={{ label: 'Retry', onPress: mockAction }}
        />
      );

      const button = getByTestId('empty-state-action');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockAction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Complete Examples', () => {
    it('should render complete empty state with all props', () => {
      const mockAction = jest.fn();
      const { getByText, getByTestId } = render(
        <EmptyState
          icon={Search}
          title="No results found"
          description="Try searching with different keywords"
          action={{ label: 'Clear filters', onPress: mockAction }}
          testID="search-empty-state"
        />
      );

      expect(getByTestId('search-empty-state')).toBeTruthy();
      expect(getByText('No results found')).toBeTruthy();
      expect(getByText('Try searching with different keywords')).toBeTruthy();
      expect(getByText('Clear filters')).toBeTruthy();

      fireEvent.press(getByTestId('search-empty-state-action'));
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should render minimal empty state', () => {
      const { getByText, getByTestId } = render(
        <EmptyState title="No data available" />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No data available')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings gracefully', () => {
      const { getByTestId } = render(<EmptyState title="" />);

      expect(getByTestId('empty-state')).toBeTruthy();
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines';
      const { getByText } = render(<EmptyState title={longTitle} />);

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle very long descriptions', () => {
      const longDescription =
        'This is a very long description that provides detailed information about the empty state and why it occurred and what the user might do about it';
      const { getByText } = render(
        <EmptyState title="Empty" description={longDescription} />
      );

      expect(getByText(longDescription)).toBeTruthy();
    });

    it('should handle special characters in text', () => {
      const { getByText } = render(
        <EmptyState
          title="No items @ 50% off!"
          description='Try searching for "special" items'
        />
      );

      expect(getByText('No items @ 50% off!')).toBeTruthy();
      expect(getByText('Try searching for "special" items')).toBeTruthy();
    });
  });
});
