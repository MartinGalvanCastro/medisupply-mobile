import { render, fireEvent } from '@testing-library/react-native';
import { PriceQuantitySection } from './PriceQuantitySection';

jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'cart.unitPrice': 'Unit Price',
        'cart.subtotal': 'Subtotal',
        'inventory.addToCartModal.available': 'Available',
        'inventory.addToCartModal.units': 'units',
        'inventory.addToCartModal.quantity': 'Quantity',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/utils/formatCurrency', () => ({
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
}));

jest.mock('@/components/QuantitySelector', () => ({
  QuantitySelector: ({ onQuantityChange, initialQuantity, testID }: any) => {
    const { Pressable, View, TextInput } = require('react-native');
    return (
      <View testID={testID}>
        <Pressable testID={`${testID}-decrease`} onPress={() => onQuantityChange(initialQuantity - 1)} />
        <TextInput testID={`${testID}-input`} value={String(initialQuantity)} />
        <Pressable testID={`${testID}-increase`} onPress={() => onQuantityChange(initialQuantity + 1)} />
      </View>
    );
  },
}));

describe('PriceQuantitySection', () => {
  const defaultProps = {
    unitPrice: 100,
    quantity: 2,
    maxQuantity: 10,
    onQuantityChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with required props', () => {
    const { getByText, getByTestId } = render(<PriceQuantitySection {...defaultProps} />);

    expect(getByText('Unit Price')).toBeDefined();
    expect(getByTestId('price-quantity-section')).toBeDefined();
  });

  it('should display unit price and subtotal when showAvailable is false', () => {
    const { getByText } = render(
      <PriceQuantitySection {...defaultProps} unitPrice={100} quantity={3} />
    );

    expect(getByText('Unit Price')).toBeDefined();
    expect(getByText('Subtotal')).toBeDefined();
  });

  it('should display available quantity when showAvailable is true', () => {
    const { getByText } = render(
      <PriceQuantitySection
        {...defaultProps}
        showAvailable={true}
        availableQuantity={50}
      />
    );

    expect(getByText('Available')).toBeDefined();
    expect(getByText('50 units')).toBeDefined();
  });

  it('should display quantity selector with custom testID', () => {
    const { getByTestId } = render(
      <PriceQuantitySection {...defaultProps} testID="custom-test-id" />
    );

    expect(getByTestId('custom-test-id-quantity-selector')).toBeDefined();
  });

  it('should call onQuantityChange when quantity changes', () => {
    const onQuantityChange = jest.fn();
    const { getByTestId } = render(
      <PriceQuantitySection
        {...defaultProps}
        onQuantityChange={onQuantityChange}
      />
    );

    const increaseButton = getByTestId('price-quantity-section-quantity-selector-increase');
    fireEvent.press(increaseButton);

    expect(onQuantityChange).toHaveBeenCalled();
  });

  it('should use default testID when not provided', () => {
    const { getByTestId } = render(<PriceQuantitySection {...defaultProps} />);

    expect(getByTestId('price-quantity-section')).toBeDefined();
  });

  it('should handle zero unit price and large quantities', () => {
    const { getByTestId } = render(
      <PriceQuantitySection
        {...defaultProps}
        unitPrice={0}
        quantity={1000}
        maxQuantity={10000}
      />
    );

    expect(getByTestId('price-quantity-section')).toBeDefined();
  });

  it('should render both available quantity and quantity selector sections', () => {
    const { getByText, getByTestId } = render(
      <PriceQuantitySection
        {...defaultProps}
        showAvailable={true}
        availableQuantity={75}
      />
    );

    expect(getByText('Available')).toBeDefined();
    expect(getByText('Quantity')).toBeDefined();
    expect(getByTestId('price-quantity-section-quantity-selector')).toBeDefined();
  });
});
