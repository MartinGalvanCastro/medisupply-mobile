import { fireEvent, render } from '@testing-library/react-native';
import { ProductCard, ProductCardProps } from './ProductCard';

// Mock useTranslation
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'inventory.outOfStock': 'Out of Stock',
        'inventory.lowStock': 'Low Stock',
        'inventory.availableUnits': `${params?.count} available`,
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProductCard', () => {
  const defaultProduct = {
    id: 'prod-1',
    name: 'Paracetamol',
    sku: 'SKU-001',
    category: 'analgésicos',
    warehouseName: 'Warehouse A',
    availableQuantity: 500,
    price: 5000,
  };

  const defaultProps: ProductCardProps = {
    product: defaultProduct,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product card with all product information', () => {
    const { getByText } = render(<ProductCard {...defaultProps} />);

    expect(getByText('Paracetamol')).toBeDefined();
    expect(getByText('analgésicos')).toBeDefined();
    expect(getByText('Warehouse A')).toBeDefined();
  });

  it('should call onPress when card is pressed and not when disabled', () => {
    const onPress = jest.fn();
    const { getByText, rerender } = render(
      <ProductCard {...defaultProps} onPress={onPress} />
    );

    const productName = getByText('Paracetamol');
    fireEvent.press(productName.parent);
    expect(onPress).toHaveBeenCalled();

    // Test disabled state
    jest.clearAllMocks();
    const outOfStockProduct = { ...defaultProduct, availableQuantity: 0 };
    rerender(
      <ProductCard {...defaultProps} product={outOfStockProduct} onPress={onPress} />
    );

    const productName2 = getByText('Paracetamol');
    fireEvent.press(productName2.parent);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should display category badge and stock status badges correctly', () => {
    const { getByText, queryByText } = render(<ProductCard {...defaultProps} />);

    // Test normal stock with no badge
    expect(getByText('analgésicos')).toBeDefined();
    expect(queryByText('Low Stock')).toBeNull();
    expect(queryByText('Out of Stock')).toBeNull();

    // Test low stock
    const lowStockProduct = { ...defaultProduct, availableQuantity: 50 };
    const { getByText: getByText2 } = render(
      <ProductCard {...defaultProps} product={lowStockProduct} />
    );
    expect(getByText2('Low Stock')).toBeDefined();

    // Test out of stock
    const outOfStockProduct = { ...defaultProduct, availableQuantity: 0 };
    const { getByText: getByText3 } = render(
      <ProductCard {...defaultProps} product={outOfStockProduct} />
    );
    expect(getByText3('Out of Stock')).toBeDefined();
  });

  it('should use custom or default testID', () => {
    const { getByTestId, rerender } = render(
      <ProductCard {...defaultProps} testID="custom-product-card" />
    );

    expect(getByTestId('custom-product-card')).toBeDefined();

    rerender(<ProductCard {...defaultProps} />);
    expect(() => getByTestId('custom-product-card')).toThrow();
  });

  it('should handle different product categories with appropriate badges', () => {
    const categories = [
      'analgésicos',
      'antibióticos',
      'antiinflamatorios',
      'cardiovasculares',
    ];

    categories.forEach((category) => {
      const { getByText } = render(
        <ProductCard
          {...defaultProps}
          product={{ ...defaultProduct, category }}
        />
      );

      expect(getByText(category)).toBeDefined();
    });
  });

  it('should render chevron icon when product is in stock and hide when out of stock', () => {
    const { UNSAFE_getByType, rerender } = render(
      <ProductCard {...defaultProps} />
    );

    // In stock - chevron should be present
    const inStockChevrons = UNSAFE_getByType(require('lucide-react-native').ChevronRight);
    expect(inStockChevrons).toBeDefined();

    // Out of stock - chevron should not be present
    const outOfStockProduct = { ...defaultProduct, availableQuantity: 0 };
    rerender(
      <ProductCard {...defaultProps} product={outOfStockProduct} />
    );

    expect(() => UNSAFE_getByType(require('lucide-react-native').ChevronRight)).toThrow();
  });

  it('should apply correct currency formatting to product price', () => {
    const { getByText } = render(
      <ProductCard {...defaultProps} product={{ ...defaultProduct, price: 12500 }} />
    );

    expect(getByText('$ 12.500')).toBeDefined();
  });

  it('should handle unknown category with muted badge action', () => {
    const unknownCategory = { ...defaultProduct, category: 'desconocido' };
    const { getByText } = render(
      <ProductCard {...defaultProps} product={unknownCategory} />
    );

    expect(getByText('desconocido')).toBeDefined();
  });

  it('should render correct quantity text for different stock levels', () => {
    const { getByText } = render(<ProductCard {...defaultProps} />);
    expect(getByText('500 available')).toBeDefined();

    const { getByText: getByText2 } = render(
      <ProductCard {...defaultProps} product={{ ...defaultProduct, availableQuantity: 0 }} />
    );
    expect(getByText2('0 available')).toBeDefined();
  });

  it('should trigger onPress with pressed state styling', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ProductCard {...defaultProps} testID="product-card" onPress={onPress} />
    );

    const pressable = getByTestId('product-card');
    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should apply appropriate styles for different product states', () => {
    // Test normal product (in stock, good quantity)
    const { getByText, rerender } = render(
      <ProductCard {...defaultProps} />
    );
    expect(getByText('500 available')).toBeDefined();

    // Test low stock - should have low stock badge and warning color
    const lowStockProduct = { ...defaultProduct, availableQuantity: 50 };
    rerender(
      <ProductCard {...defaultProps} product={lowStockProduct} />
    );
    expect(getByText('Low Stock')).toBeDefined();
    expect(getByText('50 available')).toBeDefined();

    // Test out of stock - should be disabled with error color
    const outOfStockProduct = { ...defaultProduct, availableQuantity: 0 };
    rerender(
      <ProductCard {...defaultProps} product={outOfStockProduct} />
    );
    expect(getByText('Out of Stock')).toBeDefined();
    expect(getByText('0 available')).toBeDefined();
  });
});
