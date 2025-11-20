import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CartItemCard, getRemoveButtonStyle } from './CartItemCard';
import { useTranslation } from '@/i18n/hooks';
import type { CartItem } from '@/store/useCartStore';

jest.mock('@/i18n/hooks');

// Mock Alert.alert
Alert.alert = jest.fn((title, message, buttons) => {
  // Store the buttons for test inspection
  (Alert.alert as any).lastButtons = buttons;
});

const mockTranslation = {
  t: jest.fn((key, params) => {
    const translations: Record<string, string> = {
      'cart.removeItem': 'Remove Item',
      'cart.removeItemConfirmation': `Are you sure you want to remove ${params?.productName}?`,
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'cart.sku': 'SKU',
      'cart.warehouse': 'Warehouse',
      'cart.unitPrice': 'Unit Price',
      'cart.subtotal': 'Subtotal',
      'inventory.addToCartModal.quantity': 'Quantity',
    };
    return translations[key] || key;
  }),
};

jest.mocked(useTranslation).mockReturnValue(mockTranslation as any);

const createMockCartItem = (overrides?: Partial<CartItem>): CartItem => ({
  inventoryId: 'inv-001',
  productName: 'Paracetamol 500mg',
  productSku: 'PARA-500',
  productPrice: 5.99,
  quantity: 3,
  availableQuantity: 100,
  warehouseName: 'Central Warehouse',
  productId: 'prod-001',
  ...overrides,
});

describe('CartItemCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTranslation).mockReturnValue(mockTranslation as any);
    (Alert.alert as jest.Mock).mockClear();
  });

  it('should render cart item card with item data', () => {
    const mockItem = createMockCartItem();
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId, getByText } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    // Verify component renders with testID
    expect(getByTestId('cart-item')).toBeDefined();
    // Verify product name is visible
    expect(getByText('Paracetamol 500mg')).toBeDefined();
  });

  it('should display product name and SKU', () => {
    const mockItem = createMockCartItem({
      productName: 'Aspirin 500mg',
      productSku: 'ASP-500',
    });
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByText } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    expect(getByText('Aspirin 500mg')).toBeDefined();
    // SKU text includes the translation key, so match the full pattern
    expect(getByText(/SKU.*ASP-500/)).toBeDefined();
  });

  it('should show removal confirmation alert when remove button is pressed', () => {
    const mockItem = createMockCartItem({ productName: 'Ibuprofen' });
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    const removeButton = getByTestId('cart-item-remove-button');
    fireEvent.press(removeButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Remove Item',
      expect.stringContaining('Ibuprofen'),
      expect.any(Array)
    );
  });

  it('should call onRemove when delete is confirmed in alert', () => {
    const mockItem = createMockCartItem({ inventoryId: 'inv-special-123' });
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    const removeButton = getByTestId('cart-item-remove-button');
    fireEvent.press(removeButton);

    const buttons = (Alert.alert as any).lastButtons;
    const deleteButton = buttons.find((btn: any) => btn.text === 'Delete');
    deleteButton?.onPress?.();

    expect(onRemove).toHaveBeenCalledWith('inv-special-123');
  });

  it('should not call onRemove when cancel is selected', () => {
    const mockItem = createMockCartItem();
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    const removeButton = getByTestId('cart-item-remove-button');
    fireEvent.press(removeButton);

    const buttons = (Alert.alert as any).lastButtons;
    const cancelButton = buttons.find((btn: any) => btn.text === 'Cancel');
    cancelButton?.onPress?.();

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('should call onQuantityChange with inventory ID when quantity increases', () => {
    const mockItem = createMockCartItem({
      inventoryId: 'inv-qty-123',
      quantity: 3,
      availableQuantity: 100
    });
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    // Click the increase button in the QuantitySelector
    const increaseButton = getByTestId('cart-item-price-quantity-quantity-selector-increase');
    fireEvent.press(increaseButton);

    // Verify onQuantityChange was called with the new quantity and inventory ID
    expect(onQuantityChange).toHaveBeenCalledWith('inv-qty-123', 4);
  });

  it('should render ProductHeader with correct testID', () => {
    const mockItem = createMockCartItem({
      productName: 'Vitamin C',
      productSku: 'VIT-C',
      warehouseName: 'Main Warehouse',
    });
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    // Verify ProductHeader is rendered with correct testID
    expect(getByTestId('cart-item-product-header')).toBeDefined();
  });

  it('should render PriceQuantitySection with correct testID', () => {
    const mockItem = createMockCartItem({
      productPrice: 15.99,
      quantity: 5,
      availableQuantity: 100,
    });
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    // Verify PriceQuantitySection is rendered with correct testID
    expect(getByTestId('cart-item-price-quantity')).toBeDefined();
  });

  it('should render remove button with correct testID', () => {
    const mockItem = createMockCartItem();
    const onQuantityChange = jest.fn();
    const onRemove = jest.fn();

    const { getByTestId } = render(
      <CartItemCard
        item={mockItem}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        testID="cart-item"
      />
    );

    expect(getByTestId('cart-item-remove-button')).toBeDefined();
  });

});

describe('getRemoveButtonStyle', () => {
  it('should return only base style when not pressed', () => {
    const styles = getRemoveButtonStyle(false);
    expect(Array.isArray(styles)).toBe(true);
    expect(styles.length).toBe(1);
  });

  it('should return base style and pressed style when pressed', () => {
    const styles = getRemoveButtonStyle(true);
    expect(Array.isArray(styles)).toBe(true);
    expect(styles.length).toBe(2);
  });
});
