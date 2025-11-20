import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CartFooter } from './CartFooter';
import * as translationHook from '@/i18n/hooks';
import type { CartItem } from '@/store/useCartStore';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

jest.mock('@/utils/formatCurrency', () => ({
  formatCurrency: jest.fn((value: number) => `$${value}`),
}));

jest.mock('@/i18n/hooks');

const mockUseTranslation = translationHook.useTranslation as jest.MockedFunction<
  typeof translationHook.useTranslation
>;

describe('CartFooter', () => {
  let alertSpy: jest.SpyInstance;

  const mockT = (key: string, options?: any) => {
    const translations: Record<string, string> = {
      'cart.clearCart': 'Clear Cart',
      'cart.clearCartConfirmation': 'Are you sure?',
      'cart.selectClient': 'Select Client',
      'cart.chooseClient': 'Choose Client',
      'cart.totalItems': 'Items: {{count}}',
      'cart.totalUnits': 'Units: {{count}}',
      'cart.total': 'Total',
      'cart.placeOrder': 'Place Order',
      'cart.placingOrder': 'Placing order...',
      'common.cancel': 'Cancel',
      'common.change': 'Change',
    };
    const template = translations[key] || key;
    if (options?.count !== undefined) {
      return template.replace('{{count}}', options.count.toString());
    }
    return template;
  };

  const mockItems: CartItem[] = [
    { inventoryId: '1', productId: 'prod-1', productName: 'Product 1', quantity: 2, productPrice: 100, productSku: 'SKU1', warehouseName: 'Warehouse 1', availableQuantity: 10 },
    { inventoryId: '2', productId: 'prod-2', productName: 'Product 2', quantity: 1, productPrice: 50, productSku: 'SKU2', warehouseName: 'Warehouse 2', availableQuantity: 5 },
  ];

  const mockClient: ClientResponse = {
    cliente_id: 'client-1',
    representante: 'John Doe',
    nombre_institucion: 'Hospital 1',
    ciudad: 'NYC',
    cognito_user_id: 'cog-1',
    email: 'test@test.com',
    telefono: '1234567890',
    tipo_institucion: 'hospital',
    estado: 'active',
    fecha_registro: new Date().toISOString(),
    ultima_actualizacion: new Date().toISOString(),
  } as unknown as ClientResponse;

  const defaultProps = {
    items: mockItems,
    total: 250,
    isSeller: false,
    selectedClient: null,
    isPending: false,
    onSelectClient: jest.fn(),
    onCheckout: jest.fn(),
    onClearCart: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    alertSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('should render cart footer with all sections', () => {
      const { getByTestId } = render(<CartFooter {...defaultProps} />);

      expect(getByTestId('cart-footer')).toBeTruthy();
      expect(getByTestId('cart-checkout-button')).toBeTruthy();
      expect(getByTestId('cart-clear-button')).toBeTruthy();
    });

    it('should display correct total items and units count', () => {
      const { getByText } = render(<CartFooter {...defaultProps} />);

      expect(getByText('Items: 2')).toBeTruthy();
      expect(getByText('Units: 3')).toBeTruthy();
    });

    it('should display formatted total price', () => {
      const { getByText } = render(<CartFooter {...defaultProps} />);

      expect(getByText('$250')).toBeTruthy();
    });

    it('should show client selector only for sellers', () => {
      const { queryByTestId } = render(<CartFooter {...defaultProps} isSeller={false} />);

      expect(queryByTestId('select-client-button')).toBeNull();
    });

    it('should show select client button for sellers without client', () => {
      const { getByTestId } = render(
        <CartFooter {...defaultProps} isSeller={true} selectedClient={null} />
      );

      expect(getByTestId('select-client-button')).toBeTruthy();
    });

    it('should show selected client info and change button for sellers with client', () => {
      const { getByTestId, getByText } = render(
        <CartFooter {...defaultProps} isSeller={true} selectedClient={mockClient} />
      );

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Hospital 1')).toBeTruthy();
      expect(getByTestId('change-client-button')).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should show placing order text when pending', () => {
      const { getByText } = render(
        <CartFooter {...defaultProps} isPending={true} />
      );

      expect(getByText('Placing order...')).toBeTruthy();
    });

    it('should show place order text when not pending', () => {
      const { getByText } = render(
        <CartFooter {...defaultProps} isPending={false} />
      );

      expect(getByText('Place Order')).toBeTruthy();
    });

    it('should render checkout button for client role', () => {
      const { getByTestId } = render(
        <CartFooter {...defaultProps} isSeller={false} />
      );

      expect(getByTestId('cart-checkout-button')).toBeTruthy();
    });

    it('should render checkout button for seller with client', () => {
      const { getByTestId } = render(
        <CartFooter {...defaultProps} isSeller={true} selectedClient={mockClient} />
      );

      expect(getByTestId('cart-checkout-button')).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should call onSelectClient when select client button is pressed', () => {
      const onSelectClient = jest.fn();
      const { getByTestId } = render(
        <CartFooter {...defaultProps} isSeller={true} selectedClient={null} onSelectClient={onSelectClient} />
      );

      fireEvent.press(getByTestId('select-client-button'));

      expect(onSelectClient).toHaveBeenCalled();
    });

    it('should call onSelectClient when change client button is pressed', () => {
      const onSelectClient = jest.fn();
      const { getByTestId } = render(
        <CartFooter {...defaultProps} isSeller={true} selectedClient={mockClient} onSelectClient={onSelectClient} />
      );

      fireEvent.press(getByTestId('change-client-button'));

      expect(onSelectClient).toHaveBeenCalled();
    });

    it('should call onCheckout when checkout button is pressed', () => {
      const onCheckout = jest.fn();
      const { getByTestId } = render(
        <CartFooter {...defaultProps} onCheckout={onCheckout} />
      );

      fireEvent.press(getByTestId('cart-checkout-button'));

      expect(onCheckout).toHaveBeenCalled();
    });

    it('should show clear cart alert when clear button is pressed', () => {
      const { getByTestId } = render(<CartFooter {...defaultProps} />);

      fireEvent.press(getByTestId('cart-clear-button'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Clear Cart',
        'Are you sure?',
        expect.any(Array)
      );
    });

    it('should call onClearCart when clear alert is confirmed', () => {
      const onClearCart = jest.fn();
      alertSpy.mockImplementation((_, __, buttons) => {
        buttons?.[1]?.onPress?.();
      });

      const { getByTestId } = render(
        <CartFooter {...defaultProps} onClearCart={onClearCart} />
      );

      fireEvent.press(getByTestId('cart-clear-button'));

      expect(onClearCart).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item correctly', () => {
      const { getByText } = render(
        <CartFooter {...defaultProps} items={[mockItems[0]]} total={100} />
      );

      expect(getByText('Items: 1')).toBeTruthy();
      expect(getByText('Units: 2')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <CartFooter {...defaultProps} testID="custom-footer" />
      );

      expect(getByTestId('custom-footer')).toBeTruthy();
    });
  });
});
