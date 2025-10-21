import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    stock: 10,
  };

  it('should render product information', () => {
    const { getByText } = render(<ProductCard {...mockProduct} />);

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
    expect(getByText('$99.99')).toBeTruthy();
    expect(getByText('Stock: 10')).toBeTruthy();
  });

  it('should render without optional fields', () => {
    const { getByText, queryByText } = render(
      <ProductCard id="1" name="Product" />
    );

    expect(getByText('Product')).toBeTruthy();
    expect(queryByText('$')).toBeNull();
    expect(queryByText('Stock:')).toBeNull();
  });

  it('should handle press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ProductCard {...mockProduct} onPress={onPress} />
    );

    fireEvent.press(getByText('Test Product'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when onPress is not provided', () => {
    const { getByText } = render(<ProductCard {...mockProduct} />);

    const card = getByText('Test Product').parent?.parent;
    expect(card?.props.disabled).toBe(true);
  });

  it('should format price correctly', () => {
    const { getByText } = render(
      <ProductCard id="1" name="Product" price={10} />
    );

    expect(getByText('$10.00')).toBeTruthy();
  });
});
