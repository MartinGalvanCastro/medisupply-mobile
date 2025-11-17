import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScreenHeader } from './ScreenHeader';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => <></>,
}));

describe('ScreenHeader', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText, getByTestId } = render(
        <ScreenHeader title="Screen Title" />
      );

      expect(getByTestId('screen-header')).toBeTruthy();
      expect(getByText('Screen Title')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <ScreenHeader title="Title" testID="custom-header" />
      );

      expect(getByTestId('custom-header')).toBeTruthy();
      expect(getByTestId('custom-header-title')).toBeTruthy();
    });

    it('should not render back button by default', () => {
      const { queryByTestId } = render(<ScreenHeader title="Title" />);

      expect(queryByTestId('screen-header-back-button')).toBeFalsy();
    });
  });

  describe('Back Button', () => {
    it('should not render back button when showBackButton is false', () => {
      const mockBack = jest.fn();
      const { queryByTestId } = render(
        <ScreenHeader title="Title" showBackButton={false} onBack={mockBack} />
      );

      expect(queryByTestId('screen-header-back-button')).toBeFalsy();
    });

    it('should not render back button when onBack is not provided', () => {
      const { queryByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} />
      );

      expect(queryByTestId('screen-header-back-button')).toBeFalsy();
    });

    it('should render back button when showBackButton and onBack are provided', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} onBack={mockBack} />
      );

      expect(getByTestId('screen-header-back-button')).toBeTruthy();
    });

    it('should render back button when back button is shown', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} onBack={mockBack} />
      );

      expect(getByTestId('screen-header-back-button')).toBeTruthy();
    });

    it('should call onBack when back button is pressed', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} onBack={mockBack} />
      );

      fireEvent.press(getByTestId('screen-header-back-button'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should call onBack multiple times', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} onBack={mockBack} />
      );

      const button = getByTestId('screen-header-back-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockBack).toHaveBeenCalledTimes(3);
    });
  });

  describe('Complete Examples', () => {
    it('should render header with all props', () => {
      const mockBack = jest.fn();
      const { getByText, getByTestId } = render(
        <ScreenHeader
          title="Product Details"
          showBackButton={true}
          onBack={mockBack}
          testID="product-header"
        />
      );

      expect(getByTestId('product-header')).toBeTruthy();
      expect(getByText('Product Details')).toBeTruthy();
      expect(getByTestId('product-header-back-button')).toBeTruthy();

      fireEvent.press(getByTestId('product-header-back-button'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should render minimal header', () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <ScreenHeader title="Simple Screen" />
      );

      expect(getByTestId('screen-header')).toBeTruthy();
      expect(getByText('Simple Screen')).toBeTruthy();
      expect(queryByTestId('screen-header-back-button')).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByTestId } = render(<ScreenHeader title="" />);

      expect(getByTestId('screen-header')).toBeTruthy();
      expect(getByTestId('screen-header-title')).toBeTruthy();
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long screen title that might need to wrap or truncate';
      const { getByText } = render(<ScreenHeader title={longTitle} />);

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const { getByText } = render(
        <ScreenHeader title="Products @ 50% off!" />
      );

      expect(getByText('Products @ 50% off!')).toBeTruthy();
    });

    it('should handle unicode characters in title', () => {
      const { getByText } = render(<ScreenHeader title="Configuración" />);

      expect(getByText('Configuración')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('should have proper structure without back button', () => {
      const { getByTestId } = render(<ScreenHeader title="Title" />);

      expect(getByTestId('screen-header')).toBeTruthy();
      expect(getByTestId('screen-header-title')).toBeTruthy();
    });

    it('should have proper structure with back button', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} onBack={mockBack} />
      );

      expect(getByTestId('screen-header')).toBeTruthy();
      expect(getByTestId('screen-header-back-button')).toBeTruthy();
      expect(getByTestId('screen-header-title')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be pressable when back button is shown', () => {
      const mockBack = jest.fn();
      const { getByTestId } = render(
        <ScreenHeader title="Title" showBackButton={true} onBack={mockBack} />
      );

      const backButton = getByTestId('screen-header-back-button');
      expect(backButton).toBeTruthy();

      fireEvent.press(backButton);
      expect(mockBack).toHaveBeenCalled();
    });

    it('should not be pressable when back button is not shown', () => {
      const { queryByTestId } = render(<ScreenHeader title="Title" />);

      expect(queryByTestId('screen-header-back-button')).toBeFalsy();
    });
  });

  describe('Title Variations', () => {
    it('should render single word title', () => {
      const { getByText } = render(<ScreenHeader title="Home" />);

      expect(getByText('Home')).toBeTruthy();
    });

    it('should render multi-word title', () => {
      const { getByText } = render(<ScreenHeader title="Product Details" />);

      expect(getByText('Product Details')).toBeTruthy();
    });

    it('should render title with numbers', () => {
      const { getByText } = render(<ScreenHeader title="Order #12345" />);

      expect(getByText('Order #12345')).toBeTruthy();
    });

    it('should render title with symbols', () => {
      const { getByText } = render(<ScreenHeader title="Settings & Preferences" />);

      expect(getByText('Settings & Preferences')).toBeTruthy();
    });
  });
});
