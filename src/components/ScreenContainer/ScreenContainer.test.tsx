import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ScreenContainer } from './ScreenContainer';

describe('ScreenContainer', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      const { getByText, getByTestId } = render(
        <ScreenContainer>
          <Text>Screen Content</Text>
        </ScreenContainer>
      );

      expect(getByTestId('screen-container')).toBeTruthy();
      expect(getByText('Screen Content')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <ScreenContainer testID="custom-container">
          <Text>Content</Text>
        </ScreenContainer>
      );

      expect(getByTestId('custom-container')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </ScreenContainer>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });
  });

  describe('Children Types', () => {
    it('should render text children', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Text Content</Text>
        </ScreenContainer>
      );

      expect(getByText('Text Content')).toBeTruthy();
    });

    it('should render view children', () => {
      const { getByTestId } = render(
        <ScreenContainer>
          <View testID="child-view">
            <Text>Nested Content</Text>
          </View>
        </ScreenContainer>
      );

      expect(getByTestId('child-view')).toBeTruthy();
    });

    it('should render complex nested children', () => {
      const { getByText, getByTestId } = render(
        <ScreenContainer>
          <View testID="header">
            <Text>Header</Text>
          </View>
          <View testID="content">
            <Text>Main Content</Text>
          </View>
          <View testID="footer">
            <Text>Footer</Text>
          </View>
        </ScreenContainer>
      );

      expect(getByTestId('header')).toBeTruthy();
      expect(getByTestId('content')).toBeTruthy();
      expect(getByTestId('footer')).toBeTruthy();
      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Main Content')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle no children', () => {
      const { getByTestId } = render(
        <ScreenContainer>
          {null}
        </ScreenContainer>
      );

      expect(getByTestId('screen-container')).toBeTruthy();
    });

    it('should handle undefined children', () => {
      const { getByTestId } = render(
        <ScreenContainer>
          {undefined}
        </ScreenContainer>
      );

      expect(getByTestId('screen-container')).toBeTruthy();
    });

    it('should handle empty fragment', () => {
      const { getByTestId } = render(
        <ScreenContainer>
          <></>
        </ScreenContainer>
      );

      expect(getByTestId('screen-container')).toBeTruthy();
    });

    it('should handle conditional children', () => {
      const showContent = true;
      const { getByText, queryByText } = render(
        <ScreenContainer>
          {showContent && <Text>Conditional Content</Text>}
          {!showContent && <Text>Hidden Content</Text>}
        </ScreenContainer>
      );

      expect(getByText('Conditional Content')).toBeTruthy();
      expect(queryByText('Hidden Content')).toBeFalsy();
    });
  });

  describe('Content Variations', () => {
    it('should handle long content', () => {
      const longContent = Array.from({ length: 100 }, (_, i) => (
        <Text key={i}>Item {i + 1}</Text>
      ));

      const { getByText } = render(
        <ScreenContainer>{longContent}</ScreenContainer>
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 100')).toBeTruthy();
    });

    it('should handle special characters in content', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Content @ 50% off!</Text>
          <Text>Special "quoted" text</Text>
        </ScreenContainer>
      );

      expect(getByText('Content @ 50% off!')).toBeTruthy();
      expect(getByText('Special "quoted" text')).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Configuración</Text>
          <Text>日本語</Text>
          <Text>🚀 Emoji content</Text>
        </ScreenContainer>
      );

      expect(getByText('Configuración')).toBeTruthy();
      expect(getByText('日本語')).toBeTruthy();
      expect(getByText('🚀 Emoji content')).toBeTruthy();
    });
  });

  describe('Complete Examples', () => {
    it('should render simple screen', () => {
      const { getByText, getByTestId } = render(
        <ScreenContainer testID="home-screen">
          <Text>Welcome Home</Text>
        </ScreenContainer>
      );

      expect(getByTestId('home-screen')).toBeTruthy();
      expect(getByText('Welcome Home')).toBeTruthy();
    });

    it('should render complex screen layout', () => {
      const { getByText, getByTestId } = render(
        <ScreenContainer testID="product-screen">
          <View testID="header">
            <Text>Product Details</Text>
          </View>
          <View testID="image-section">
            <Text>Product Image</Text>
          </View>
          <View testID="info-section">
            <Text>Product Information</Text>
            <Text>Price: $99.99</Text>
            <Text>In Stock</Text>
          </View>
          <View testID="actions">
            <Text>Add to Cart</Text>
            <Text>Buy Now</Text>
          </View>
        </ScreenContainer>
      );

      expect(getByTestId('product-screen')).toBeTruthy();
      expect(getByText('Product Details')).toBeTruthy();
      expect(getByText('Product Image')).toBeTruthy();
      expect(getByText('Product Information')).toBeTruthy();
      expect(getByText('Price: $99.99')).toBeTruthy();
      expect(getByText('In Stock')).toBeTruthy();
      expect(getByText('Add to Cart')).toBeTruthy();
      expect(getByText('Buy Now')).toBeTruthy();
    });

    it('should render list screen', () => {
      const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
      const { getByText } = render(
        <ScreenContainer>
          <View>
            <Text>My List</Text>
            {items.map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          </View>
        </ScreenContainer>
      );

      expect(getByText('My List')).toBeTruthy();
      items.forEach((item) => {
        expect(getByText(item)).toBeTruthy();
      });
    });
  });

  describe('Layout', () => {
    it('should have flex: 1 container', () => {
      const { getByTestId } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );

      const container = getByTestId('screen-container');
      expect(container).toBeTruthy();
      expect(container.props.style).toEqual(
        expect.objectContaining({ flex: 1 })
      );
    });

    it('should maintain layout with custom testID', () => {
      const { getByTestId } = render(
        <ScreenContainer testID="custom">
          <Text>Content</Text>
        </ScreenContainer>
      );

      const container = getByTestId('custom');
      expect(container).toBeTruthy();
      expect(container.props.style).toEqual(
        expect.objectContaining({ flex: 1 })
      );
    });
  });

  describe('Integration', () => {
    it('should work as wrapper for other components', () => {
      const CustomComponent = () => (
        <View testID="custom-component">
          <Text>Custom Component Content</Text>
        </View>
      );

      const { getByTestId, getByText } = render(
        <ScreenContainer>
          <CustomComponent />
        </ScreenContainer>
      );

      expect(getByTestId('screen-container')).toBeTruthy();
      expect(getByTestId('custom-component')).toBeTruthy();
      expect(getByText('Custom Component Content')).toBeTruthy();
    });

    it('should work with multiple component types', () => {
      const Header = () => <Text>Header Component</Text>;
      const Content = () => <Text>Content Component</Text>;
      const Footer = () => <Text>Footer Component</Text>;

      const { getByText } = render(
        <ScreenContainer>
          <Header />
          <Content />
          <Footer />
        </ScreenContainer>
      );

      expect(getByText('Header Component')).toBeTruthy();
      expect(getByText('Content Component')).toBeTruthy();
      expect(getByText('Footer Component')).toBeTruthy();
    });
  });

  describe('Safe Area', () => {
    it('should use SafeAreaView', () => {
      const { getByTestId } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );

      // SafeAreaView is rendered as the root element
      expect(getByTestId('screen-container')).toBeTruthy();
    });
  });
});
