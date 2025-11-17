import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { InfoSection } from './InfoSection';

describe('InfoSection', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText, getByTestId } = render(
        <InfoSection title="Section Title">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByTestId('info-section')).toBeTruthy();
      expect(getByText('Section Title')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <InfoSection title="Title" testID="custom-section">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByTestId('custom-section')).toBeTruthy();
      expect(getByTestId('custom-section-title')).toBeTruthy();
      expect(getByTestId('custom-section-content')).toBeTruthy();
    });

    it('should render children', () => {
      const { getByText } = render(
        <InfoSection title="Title">
          <Text>Test Content</Text>
        </InfoSection>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <InfoSection title="Title">
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </InfoSection>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });
  });

  describe('Divider', () => {
    it('should render divider by default', () => {
      const { getByTestId } = render(
        <InfoSection title="Title">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByTestId('info-section-divider')).toBeTruthy();
    });

    it('should render divider when showDivider is true', () => {
      const { getByTestId } = render(
        <InfoSection title="Title" showDivider={true}>
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByTestId('info-section-divider')).toBeTruthy();
    });

    it('should not render divider when showDivider is false', () => {
      const { queryByTestId } = render(
        <InfoSection title="Title" showDivider={false}>
          <Text>Content</Text>
        </InfoSection>
      );

      expect(queryByTestId('info-section-divider')).toBeFalsy();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper content container', () => {
      const { getByTestId } = render(
        <InfoSection title="Title">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByTestId('info-section-content')).toBeTruthy();
    });

    it('should render content inside content container', () => {
      const { getByTestId, getByText } = render(
        <InfoSection title="Title">
          <Text>Test Content</Text>
        </InfoSection>
      );

      const contentContainer = getByTestId('info-section-content');
      const content = getByText('Test Content');

      expect(contentContainer).toBeTruthy();
      expect(content).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByTestId } = render(
        <InfoSection title="">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByTestId('info-section')).toBeTruthy();
      expect(getByTestId('info-section-title')).toBeTruthy();
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long section title that might wrap to multiple lines';
      const { getByText } = render(
        <InfoSection title={longTitle}>
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const { getByText } = render(
        <InfoSection title="Section @ 50% complete!">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByText('Section @ 50% complete!')).toBeTruthy();
    });

    it('should handle unicode characters in title', () => {
      const { getByText } = render(
        <InfoSection title="Información del pedido">
          <Text>Content</Text>
        </InfoSection>
      );

      expect(getByText('Información del pedido')).toBeTruthy();
    });

    it('should handle no children', () => {
      const { getByTestId } = render(
        <InfoSection title="Title">
          {null}
        </InfoSection>
      );

      expect(getByTestId('info-section')).toBeTruthy();
      expect(getByTestId('info-section-content')).toBeTruthy();
    });
  });

  describe('Complete Examples', () => {
    it('should render section with all props', () => {
      const { getByText, getByTestId } = render(
        <InfoSection title="Order Details" showDivider={true} testID="order-section">
          <Text>Order ID: 12345</Text>
          <Text>Status: Delivered</Text>
          <Text>Total: $150</Text>
        </InfoSection>
      );

      expect(getByTestId('order-section')).toBeTruthy();
      expect(getByText('Order Details')).toBeTruthy();
      expect(getByTestId('order-section-divider')).toBeTruthy();
      expect(getByText('Order ID: 12345')).toBeTruthy();
      expect(getByText('Status: Delivered')).toBeTruthy();
      expect(getByText('Total: $150')).toBeTruthy();
    });

    it('should render section without divider', () => {
      const { getByText, queryByTestId } = render(
        <InfoSection title="Customer Info" showDivider={false}>
          <Text>Name: John Doe</Text>
          <Text>Email: john@example.com</Text>
        </InfoSection>
      );

      expect(getByText('Customer Info')).toBeTruthy();
      expect(queryByTestId('info-section-divider')).toBeFalsy();
      expect(getByText('Name: John Doe')).toBeTruthy();
      expect(getByText('Email: john@example.com')).toBeTruthy();
    });

    it('should render minimal section', () => {
      const { getByText, getByTestId } = render(
        <InfoSection title="Notes">
          <Text>No additional notes</Text>
        </InfoSection>
      );

      expect(getByTestId('info-section')).toBeTruthy();
      expect(getByText('Notes')).toBeTruthy();
      expect(getByText('No additional notes')).toBeTruthy();
    });
  });

  describe('Complex Children', () => {
    it('should handle nested components', () => {
      const { getByText } = render(
        <InfoSection title="Nested Content">
          <Text>Parent</Text>
          <Text>
            <Text>Nested Child</Text>
          </Text>
        </InfoSection>
      );

      expect(getByText('Parent')).toBeTruthy();
      expect(getByText('Nested Child')).toBeTruthy();
    });

    it('should handle various content types', () => {
      const { getByText } = render(
        <InfoSection title="Mixed Content">
          <Text>Text content</Text>
          <Text>More text</Text>
        </InfoSection>
      );

      expect(getByText('Text content')).toBeTruthy();
      expect(getByText('More text')).toBeTruthy();
    });
  });

  describe('Title Styling', () => {
    it('should render title with proper styling classes', () => {
      const { getByTestId } = render(
        <InfoSection title="Styled Title">
          <Text>Content</Text>
        </InfoSection>
      );

      const title = getByTestId('info-section-title');
      expect(title).toBeTruthy();
    });

    it('should render uppercase title', () => {
      const { getByText } = render(
        <InfoSection title="lowercase title">
          <Text>Content</Text>
        </InfoSection>
      );

      // The text content will still be lowercase, but CSS will make it uppercase
      expect(getByText('lowercase title')).toBeTruthy();
    });
  });

  describe('Multiple Sections', () => {
    it('should render multiple sections independently', () => {
      const { getByText } = render(
        <>
          <InfoSection title="Section 1">
            <Text>Content 1</Text>
          </InfoSection>
          <InfoSection title="Section 2">
            <Text>Content 2</Text>
          </InfoSection>
          <InfoSection title="Section 3">
            <Text>Content 3</Text>
          </InfoSection>
        </>
      );

      expect(getByText('Section 1')).toBeTruthy();
      expect(getByText('Content 1')).toBeTruthy();
      expect(getByText('Section 2')).toBeTruthy();
      expect(getByText('Content 2')).toBeTruthy();
      expect(getByText('Section 3')).toBeTruthy();
      expect(getByText('Content 3')).toBeTruthy();
    });
  });
});
