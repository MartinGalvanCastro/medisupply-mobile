import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ListScreenLayout } from './ListScreenLayout';

describe('ListScreenLayout', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText, getByTestId } = render(
        <ListScreenLayout title="Test Screen">
          <Text>Content</Text>
        </ListScreenLayout>
      );

      expect(getByTestId('list-screen-layout')).toBeTruthy();
      expect(getByText('Test Screen')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <ListScreenLayout title="Screen" testID="custom-layout">
          <Text>Content</Text>
        </ListScreenLayout>
      );

      expect(getByTestId('custom-layout')).toBeTruthy();
      expect(getByTestId('custom-layout-title')).toBeTruthy();
    });

    it('should render children', () => {
      const { getByText } = render(
        <ListScreenLayout title="Screen">
          <Text>Test Content</Text>
        </ListScreenLayout>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ListScreenLayout title="Screen">
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </ListScreenLayout>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper content container', () => {
      const { getByTestId } = render(
        <ListScreenLayout title="Screen">
          <Text>Content</Text>
        </ListScreenLayout>
      );

      expect(getByTestId('list-screen-layout-content')).toBeTruthy();
    });

    it('should render content inside content container', () => {
      const { getByTestId, getByText } = render(
        <ListScreenLayout title="Screen">
          <Text>Test Content</Text>
        </ListScreenLayout>
      );

      const contentContainer = getByTestId('list-screen-layout-content');
      const content = getByText('Test Content');

      expect(contentContainer).toBeTruthy();
      expect(content).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByTestId } = render(
        <ListScreenLayout title="">
          <Text>Content</Text>
        </ListScreenLayout>
      );

      expect(getByTestId('list-screen-layout')).toBeTruthy();
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines';
      const { getByText } = render(
        <ListScreenLayout title={longTitle}>
          <Text>Content</Text>
        </ListScreenLayout>
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const { getByText } = render(
        <ListScreenLayout title="Products @ 50% off!">
          <Text>Content</Text>
        </ListScreenLayout>
      );

      expect(getByText('Products @ 50% off!')).toBeTruthy();
    });

    it('should handle no children', () => {
      const { getByTestId } = render(
        <ListScreenLayout title="Screen">
          {null}
        </ListScreenLayout>
      );

      expect(getByTestId('list-screen-layout')).toBeTruthy();
    });

    it('should handle complex children', () => {
      const { getByText } = render(
        <ListScreenLayout title="Screen">
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </ListScreenLayout>
      );

      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should work with testID', () => {
      const { getByText, getByTestId } = render(
        <ListScreenLayout title="Products" testID="products-layout">
          <Text>Product List</Text>
        </ListScreenLayout>
      );

      expect(getByTestId('products-layout')).toBeTruthy();
      expect(getByText('Products')).toBeTruthy();
      expect(getByText('Product List')).toBeTruthy();
    });

    it('should work with minimal props', () => {
      const { getByText } = render(
        <ListScreenLayout title="Static List">
          <Text>Items</Text>
        </ListScreenLayout>
      );

      expect(getByText('Static List')).toBeTruthy();
      expect(getByText('Items')).toBeTruthy();
    });
  });
});
