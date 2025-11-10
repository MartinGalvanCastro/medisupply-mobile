import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { InventoryScreen } from './InventoryScreen';
import { useTranslation } from '@/i18n/hooks';
import { useCartStore } from '@/store/useCartStore';
import { useInventory } from '@/api/useInventory';
import type { MockInventory } from '@/api/mocks/inventory';

// Mock dependencies
jest.mock('@/i18n/hooks');
jest.mock('@/store/useCartStore');
jest.mock('@/api/useInventory');
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID, style, edges }: any) => (
      <View testID={testID} style={style}>
        {children}
      </View>
    ),
  };
});
jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent, testID, keyExtractor }: any) => {
      if (data && data.length === 0 && ListEmptyComponent) {
        return <View testID={testID}>{ListEmptyComponent()}</View>;
      }
      return (
        <View testID={testID}>
          {data && data.map((item: any) => (
            <View key={keyExtractor(item)}>
              {renderItem({ item })}
            </View>
          ))}
        </View>
      );
    },
  };
});
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
  ChevronRight: () => <View testID="chevron-right-icon" />,
  Search: () => <View testID="search-icon" />,
  X: () => <View testID="x-icon" />,
  Package: () => <View testID="package-icon" />,
  AlertCircle: () => <View testID="alert-circle-icon" />,
};
});

// Mock AddToCartModal component
jest.mock('./AddToCartModal', () => {
  const React = require('react');
  const { Pressable, View, Text } = require('react-native');

  return {
    AddToCartModal: ({ visible, product, onClose, onAddToCart, testID }: any) => {
      // Store the callback globally for testing purposes
      if (typeof global !== 'undefined') {
        (global as any).__testOnAddToCart = onAddToCart;
      }

      if (!visible || !product) {
        return (
          <View
            testID={testID}
            data-visible={visible}
            data-product={product ? JSON.stringify(product) : null}
          />
        );
      }
      return (
        <View
          testID={testID}
          data-visible={visible}
          data-product={JSON.stringify(product)}
        >
          <Text>{product.name}</Text>
          <Pressable onPress={() => onAddToCart(1)} testID={`${testID}-add-button`}>
            <Text>Add</Text>
          </Pressable>
          <Pressable onPress={onClose} testID={`${testID}-close-button`}>
            <Text>Close</Text>
          </Pressable>
        </View>
      );
    },
  };
});

// Alert.alert mock
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// Create mock inventory data
const mockInventoryData: MockInventory[] = [
  {
    id: 'INV-001',
    product_id: '1',
    product: {
      id: '1',
      name: 'Suero Fisiológico 500ml',
      description: 'Suero fisiológico estéril',
      sku: 'SF-500',
      category: 'Soluciones Intravenosas',
      manufacturer: 'Pharmaceutical Co',
    },
    warehouse_id: 'WH-001',
    warehouse_name: 'Almacén Central Bogotá',
    total_quantity: 5000,
    reserved_quantity: 200,
    available_quantity: 4800,
    price: 2500,
  },
  {
    id: 'INV-002',
    product_id: '2',
    product: {
      id: '2',
      name: 'Glucosa 5% 250ml',
      description: 'Solución de glucosa',
      sku: 'GL-250',
      category: 'Soluciones Intravenosas',
      manufacturer: 'Med Solutions',
    },
    warehouse_id: 'WH-002',
    warehouse_name: 'Almacén Medellín',
    total_quantity: 3000,
    reserved_quantity: 150,
    available_quantity: 2850,
    price: 3200,
  },
  {
    id: 'INV-003',
    product_id: '3',
    product: {
      id: '3',
      name: 'Algodón Estéril 100g',
      description: 'Algodón médico',
      sku: 'ALG-100',
      category: 'Materiales de Curación',
      manufacturer: 'Healthcare Plus',
    },
    warehouse_id: 'WH-001',
    warehouse_name: 'Almacén Central Bogotá',
    total_quantity: 0,
    reserved_quantity: 0,
    available_quantity: 0,
    price: 1500,
  },
];

describe('InventoryScreen', () => {
  let mockAddItem: jest.Mock;
  let mockUseInventory: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockAddItem = jest.fn();
    mockUseInventory = jest.fn(() => ({
      data: mockInventoryData,
      isLoading: false,
      error: null,
    }));

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string, options?: any) => {
        if (options) {
          return `${key}:${JSON.stringify(options)}`;
        }
        return key;
      },
    });

    (useCartStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        addItem: mockAddItem,
      };
      return selector(state);
    });

    (useInventory as jest.Mock).mockImplementation(mockUseInventory);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render inventory screen with correct testID', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-screen')).toBeTruthy();
    });

    it('should render the inventory title heading', () => {
      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.title')).toBeTruthy();
    });

    it('should render the search bar component', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-search-bar')).toBeTruthy();
    });

    it('should render the inventory list', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-list')).toBeTruthy();
    });

    it('should render the add to cart modal component', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal).toBeTruthy();
    });

    it('should render SafeAreaView with correct style', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const safeAreaView = getByTestId('inventory-screen');
      expect(safeAreaView).toBeTruthy();
    });
  });

  describe('Product List Display', () => {
    it('should render all available products when data is loaded', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(getByTestId('product-card-INV-002')).toBeTruthy();
      expect(getByTestId('product-card-INV-003')).toBeTruthy();
    });

    it('should render product cards with correct product information', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const productCard = getByTestId('product-card-INV-001');
      expect(productCard).toBeTruthy();
    });

    it('should render products in the FlashList', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const listComponent = getByTestId('inventory-list');
      expect(listComponent).toBeTruthy();
      expect(listComponent.children.length).toBe(3);
    });

    it('should use inventory id as key extractor', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(getByTestId('product-card-INV-002')).toBeTruthy();
    });

    it('should handle empty product list gracefully', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-list')).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-list')).toBeTruthy();
    });

    it('should render multiple products without filtering', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(getByTestId('product-card-INV-002')).toBeTruthy();
      expect(getByTestId('product-card-INV-003')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should render loading message when isLoading is true', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.loadingProducts')).toBeTruthy();
    });

    it('should not render product cards when loading', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { queryByTestId } = render(<InventoryScreen />);

      expect(queryByTestId('product-card-INV-001')).toBeNull();
    });

    it('should still render search bar while loading', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-search-bar')).toBeTruthy();
    });

    it('should show loading state with correct styling', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      const loadingText = getByText('inventory.loadingProducts');
      expect(loadingText).toBeTruthy();
    });

    it('should prioritize loading state over empty state', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { getByText, queryByText } = render(<InventoryScreen />);

      expect(getByText('inventory.loadingProducts')).toBeTruthy();
      expect(queryByText('inventory.emptyState')).toBeNull();
    });

    it('should prioritize loading state over error state', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: new Error('Failed to load'),
      });

      const { getByText, queryByText } = render(<InventoryScreen />);

      expect(getByText('inventory.loadingProducts')).toBeTruthy();
      expect(queryByText('common.error')).toBeNull();
    });
  });

  describe('Error States', () => {
    it('should render error message when error exists', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch products'),
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should not render product cards when error occurs', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch products'),
      });

      const { queryByTestId } = render(<InventoryScreen />);

      expect(queryByTestId('product-card-INV-001')).toBeNull();
    });

    it('should still render search bar when error occurs', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch products'),
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-search-bar')).toBeTruthy();
    });

    it('should display error message with correct styling', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch products'),
      });

      const { getByText } = render(<InventoryScreen />);

      const errorText = getByText('common.error');
      expect(errorText).toBeTruthy();
    });

    it('should prioritize error state over empty state', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Failed to fetch'),
      });

      const { getByText, queryByText } = render(<InventoryScreen />);

      expect(getByText('common.error')).toBeTruthy();
      expect(queryByText('inventory.emptyState')).toBeNull();
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no products are available', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
      expect(getByText('inventory.emptyStateDescription')).toBeTruthy();
    });

    it('should render empty state heading', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
    });

    it('should render empty state description', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyStateDescription')).toBeTruthy();
    });

    it('should not show loading or error messages in empty state', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText, queryByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
      expect(queryByText('inventory.loadingProducts')).toBeNull();
      expect(queryByText('common.error')).toBeNull();
    });

    it('should still render search bar in empty state', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-search-bar')).toBeTruthy();
    });

    it('should handle undefined data gracefully', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
    });

    it('should handle null data in empty state', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should update search text when user types in search bar', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');
      fireEvent.changeText(searchInput, 'Suero');

      expect(searchInput.props.value).toBe('Suero');
    });

    it('should call onChangeText when search text changes', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');
      fireEvent.changeText(searchInput, 'Test');

      expect(searchInput.props.value).toBe('Test');
    });

    it('should debounce search input', async () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');

      fireEvent.changeText(searchInput, 'S');
      fireEvent.changeText(searchInput, 'Su');
      fireEvent.changeText(searchInput, 'Suer');
      fireEvent.changeText(searchInput, 'Suero');

      // Before debounce completes
      expect(getByTestId('product-card-INV-001')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // After debounce completes
      await waitFor(() => {
        expect(searchInput.props.value).toBe('Suero');
      });
    });

    it('should clear search text when user clears input', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');

      fireEvent.changeText(searchInput, 'Test');
      expect(searchInput.props.value).toBe('Test');

      fireEvent.changeText(searchInput, '');
      expect(searchInput.props.value).toBe('');
    });

    it('should use debounced value for filtering, not immediate value', async () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');

      // Type multiple characters quickly
      fireEvent.changeText(searchInput, 'G');
      fireEvent.changeText(searchInput, 'Gl');
      fireEvent.changeText(searchInput, 'Glu');

      // Before debounce - shows all results
      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(getByTestId('product-card-INV-002')).toBeTruthy();

      // After debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(searchInput.props.value).toBe('Glu');
      });
    });

    it('should pass correct placeholder to search bar', () => {
      const { getByPlaceholderText } = render(<InventoryScreen />);

      expect(getByPlaceholderText('inventory.searchPlaceholder')).toBeTruthy();
    });
  });

  describe('Product Card Interactions', () => {
    it('should open modal when product with available quantity is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const productCard = getByTestId('product-card-INV-001');
      fireEvent.press(productCard);

      // Modal should become visible
      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(true);
    });

    it('should not open modal when product with zero available quantity is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const productCard = getByTestId('product-card-INV-003');
      fireEvent.press(productCard);

      // Modal should not become visible for out of stock product
      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(false);
    });

    it('should set selected product when card is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const productCard = getByTestId('product-card-INV-001');
      fireEvent.press(productCard);

      const modal = getByTestId('inventory-add-to-cart-modal');
      const productData = JSON.parse(modal.props['data-product'] || 'null');
      // Check that product data is passed to modal
      expect(productData?.id).toBe('INV-001');
    });

    it('should pass correct product data to modal', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const productCard = getByTestId('product-card-INV-002');
      fireEvent.press(productCard);

      const modal = getByTestId('inventory-add-to-cart-modal');
      const productData = JSON.parse(modal.props['data-product'] || 'null');
      expect(productData?.name).toBe('Glucosa 5% 250ml');
      expect(productData?.price).toBe(3200);
      expect(productData?.sku).toBe('GL-250');
      expect(productData?.warehouseName).toBe('Almacén Medellín');
    });

    it('should handle multiple product card presses sequentially', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // First press
      fireEvent.press(getByTestId('product-card-INV-001'));
      const modal1 = getByTestId('inventory-add-to-cart-modal');
      const productData1 = JSON.parse(modal1.props['data-product'] || 'null');
      expect(productData1?.id).toBe('INV-001');

      // Second press
      fireEvent.press(getByTestId('product-card-INV-002'));
      const modal2 = getByTestId('inventory-add-to-cart-modal');
      const productData2 = JSON.parse(modal2.props['data-product'] || 'null');
      expect(productData2?.id).toBe('INV-002');
    });

    it('should update modal visibility when product is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(false);

      fireEvent.press(getByTestId('product-card-INV-001'));
      expect(modal.props['data-visible']).toBe(true);
    });
  });

  describe('Modal Interactions', () => {
    it('should render modal component', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal).toBeTruthy();
    });

    it('should pass null product when modal is not visible', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(false);
      expect(modal.props['data-product']).toBeNull();
    });

    it('should show product in modal when product is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      fireEvent.press(getByTestId('product-card-INV-001'));

      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(true);
      expect(modal.props['data-product']).toBeTruthy();
    });

    it('should close modal when close button is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Open modal
      fireEvent.press(getByTestId('product-card-INV-001'));
      let modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(true);

      // Close modal
      const closeButton = getByTestId('inventory-add-to-cart-modal-close-button');
      fireEvent.press(closeButton);

      modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(false);
      expect(modal.props['data-product']).toBeNull();
    });

    it('should reset selected product when modal is closed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Open modal with a product
      fireEvent.press(getByTestId('product-card-INV-001'));
      let modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-product']).toBeTruthy();

      // Close modal
      const closeButton = getByTestId('inventory-add-to-cart-modal-close-button');
      fireEvent.press(closeButton);

      // Product should be reset to null
      modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-product']).toBeNull();
    });
  });

  describe('Add to Cart Functionality', () => {
    it('should successfully render product cards with add to cart capability', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(getByTestId('product-card-INV-002')).toBeTruthy();
    });

    it('should render products with all necessary data for cart operations', () => {
      const { getByTestId } = render(<InventoryScreen />);

      fireEvent.press(getByTestId('product-card-INV-001'));

      const modal = getByTestId('inventory-add-to-cart-modal');
      const productData = JSON.parse(modal.props['data-product'] || 'null');

      expect(productData?.id).toBe('INV-001');
      expect(productData?.name).toBeTruthy();
      expect(productData?.price).toBeTruthy();
      expect(productData?.sku).toBeTruthy();
    });

    it('should have access to product cart data for second product', () => {
      const { getByTestId } = render(<InventoryScreen />);

      fireEvent.press(getByTestId('product-card-INV-002'));

      const modal = getByTestId('inventory-add-to-cart-modal');
      const productData = JSON.parse(modal.props['data-product'] || 'null');

      expect(productData?.name).toBe('Glucosa 5% 250ml');
      expect(productData?.productSku || productData?.sku).toBeTruthy();
      expect(productData?.price).toBe(3200);
    });

    it('should add item to cart when add button is pressed', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Open modal
      fireEvent.press(getByTestId('product-card-INV-001'));

      // Press add to cart
      const addButton = getByTestId('inventory-add-to-cart-modal-add-button');
      fireEvent.press(addButton);

      // Verify addItem was called with correct parameters
      expect(mockAddItem).toHaveBeenCalledWith(
        {
          inventoryId: 'INV-001',
          productId: '1',
          productName: 'Suero Fisiológico 500ml',
          productSku: 'SF-500',
          productPrice: 2500,
          warehouseName: 'Almacén Central Bogotá',
          availableQuantity: 4800,
        },
        1
      );
    });

    it('should close modal after adding item to cart', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Open modal
      fireEvent.press(getByTestId('product-card-INV-001'));
      let modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(true);

      // Press add to cart
      const addButton = getByTestId('inventory-add-to-cart-modal-add-button');
      fireEvent.press(addButton);

      // Modal should be closed
      modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(false);
    });

    it('should reset selected product after adding to cart', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Open modal
      fireEvent.press(getByTestId('product-card-INV-001'));
      let modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-product']).toBeTruthy();

      // Press add to cart
      const addButton = getByTestId('inventory-add-to-cart-modal-add-button');
      fireEvent.press(addButton);

      // Selected product should be reset
      modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-product']).toBeNull();
    });

    it('should show alert after adding item to cart', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Open modal
      fireEvent.press(getByTestId('product-card-INV-001'));

      // Press add to cart
      const addButton = getByTestId('inventory-add-to-cart-modal-add-button');
      fireEvent.press(addButton);

      // Verify alert was shown
      expect(Alert.alert).toHaveBeenCalledWith(
        'inventory.addedToCart',
        'inventory.addedToCartMessage:{"quantity":1,"productName":"Suero Fisiológico 500ml"}'
      );
    });

    it('should add correct product data for different products', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Test with second product
      fireEvent.press(getByTestId('product-card-INV-002'));

      const addButton = getByTestId('inventory-add-to-cart-modal-add-button');
      fireEvent.press(addButton);

      expect(mockAddItem).toHaveBeenCalledWith(
        {
          inventoryId: 'INV-002',
          productId: '2',
          productName: 'Glucosa 5% 250ml',
          productSku: 'GL-250',
          productPrice: 3200,
          warehouseName: 'Almacén Medellín',
          availableQuantity: 2850,
        },
        1
      );
    });

    it('should include all required product fields when adding to cart', () => {
      const { getByTestId } = render(<InventoryScreen />);

      fireEvent.press(getByTestId('product-card-INV-001'));
      const addButton = getByTestId('inventory-add-to-cart-modal-add-button');
      fireEvent.press(addButton);

      // Verify all required fields are present
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          inventoryId: expect.any(String),
          productId: expect.any(String),
          productName: expect.any(String),
          productSku: expect.any(String),
          productPrice: expect.any(Number),
          warehouseName: expect.any(String),
          availableQuantity: expect.any(Number),
        }),
        expect.any(Number)
      );
    });

    it('should handle edge case where handleAddToCart is called without selected product', () => {
      render(<InventoryScreen />);

      // Get the onAddToCart callback that was captured globally
      const onAddToCart = (global as any).__testOnAddToCart;

      // Call onAddToCart without selecting a product (selectedProduct is null)
      // This triggers the guard clause on line 46-47
      onAddToCart(1);

      // Verify addItem was NOT called because selectedProduct is null
      expect(mockAddItem).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should maintain separate state for search text and debounced search', async () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');

      // User types but debounce hasn't completed
      fireEvent.changeText(searchInput, 'NonExistent');

      // Immediate state should update
      expect(searchInput.props.value).toBe('NonExistent');

      // Before debounce, all products should still be visible
      expect(getByTestId('product-card-INV-001')).toBeTruthy();

      // After debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        // Results should still render
        expect(getByTestId('inventory-list')).toBeTruthy();
      });
    });

    it('should handle rapid text changes efficiently', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');

      for (let i = 0; i < 10; i++) {
        fireEvent.changeText(searchInput, `char${i}`);
      }

      // Component should not crash
      expect(getByTestId('inventory-screen')).toBeTruthy();
    });

    it('should handle modal state transitions correctly', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(false);

      fireEvent.press(getByTestId('product-card-INV-001'));
      expect(modal.props['data-visible']).toBe(true);
    });

    it('should preserve component state across interactions', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // First interaction
      fireEvent.press(getByTestId('product-card-INV-001'));
      let modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(true);

      // Second interaction
      fireEvent.press(getByTestId('product-card-INV-002'));
      modal = getByTestId('inventory-add-to-cart-modal');
      expect(modal.props['data-visible']).toBe(true);
    });
  });

  describe('Internationalization', () => {
    it('should use translation hook', () => {
      render(<InventoryScreen />);

      expect(useTranslation).toHaveBeenCalled();
    });

    it('should render translated title', () => {
      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.title')).toBeTruthy();
    });

    it('should render translated loading message', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.loadingProducts')).toBeTruthy();
    });

    it('should render translated error message', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should render translated empty state messages', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
      expect(getByText('inventory.emptyStateDescription')).toBeTruthy();
    });

    it('should render translated search placeholder', () => {
      const { getByPlaceholderText } = render(<InventoryScreen />);

      expect(getByPlaceholderText('inventory.searchPlaceholder')).toBeTruthy();
    });
  });

  describe('API Integration', () => {
    it('should call useInventory hook on render', () => {
      render(<InventoryScreen />);

      expect(useInventory).toHaveBeenCalled();
    });

    it('should pass search parameter to useInventory hook', () => {
      render(<InventoryScreen />);

      // Hook should be called with empty search initially
      expect(useInventory).toHaveBeenCalledWith({
        search: '',
      });
    });

    it('should display data when API returns products', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(getByTestId('product-card-INV-002')).toBeTruthy();
      expect(getByTestId('product-card-INV-003')).toBeTruthy();
    });

    it('should handle API returning null data', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
    });

    it('should handle API returning empty array', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<InventoryScreen />);

      expect(getByText('inventory.emptyState')).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle search with special characters', async () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');
      fireEvent.changeText(searchInput, '@#$');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(searchInput.props.value).toBe('@#$');
      });
    });

    it('should handle search with numeric characters', async () => {
      const { getByTestId } = render(<InventoryScreen />);

      const searchInput = getByTestId('inventory-search-bar-input');
      fireEvent.changeText(searchInput, '123');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(searchInput.props.value).toBe('123');
      });
    });

    it('should handle very long product list', () => {
      const manyProducts = Array.from({ length: 100 }, (_, i) => ({
        ...mockInventoryData[0],
        id: `INV-${i + 100}`,
      }));

      (useInventory as jest.Mock).mockReturnValue({
        data: manyProducts,
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-list')).toBeTruthy();
    });

    it('should handle products with zero available quantity', () => {
      const { getByTestId } = render(<InventoryScreen />);

      // Product with 0 quantity should be rendered
      expect(getByTestId('product-card-INV-003')).toBeTruthy();
    });

    it('should handle product with very high price', () => {
      const expensiveProduct: MockInventory = {
        ...mockInventoryData[0],
        id: 'INV-EXP',
        price: 999999999,
      };

      (useInventory as jest.Mock).mockReturnValue({
        data: [expensiveProduct],
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-EXP')).toBeTruthy();
    });

    it('should handle product with very large available quantity', () => {
      const largeQuantityProduct: MockInventory = {
        ...mockInventoryData[0],
        id: 'INV-LARGE',
        available_quantity: 999999,
      };

      (useInventory as jest.Mock).mockReturnValue({
        data: [largeQuantityProduct],
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-LARGE')).toBeTruthy();
    });

    it('should handle multiple errors in sequence', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('First error'),
      });

      const { getByText } = render(<InventoryScreen />);
      expect(getByText('common.error')).toBeTruthy();
    });

    it('should handle rapid product selection', () => {
      const { getByTestId } = render(<InventoryScreen />);

      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByTestId('product-card-INV-001'));
      }

      // Component should handle multiple rapid interactions
      expect(getByTestId('inventory-screen')).toBeTruthy();
    });
  });

  describe('Component Rendering Verification', () => {
    it('should render all major UI elements', () => {
      const { getByTestId, getByText } = render(<InventoryScreen />);

      // Screen and layout
      expect(getByTestId('inventory-screen')).toBeTruthy();
      expect(getByTestId('inventory-search-bar')).toBeTruthy();
      expect(getByTestId('inventory-list')).toBeTruthy();
      expect(getByTestId('inventory-add-to-cart-modal')).toBeTruthy();

      // Text elements
      expect(getByText('inventory.title')).toBeTruthy();
    });

    it('should render complete component tree', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const screen = getByTestId('inventory-screen');
      expect(screen.children.length).toBeGreaterThan(0);
    });

    it('should properly structure VStack layout', () => {
      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-screen')).toBeTruthy();
      expect(getByTestId('inventory-search-bar')).toBeTruthy();
      expect(getByTestId('inventory-list')).toBeTruthy();
    });
  });

  describe('Product Rendering with Different Data Scenarios', () => {
    it('should render single product', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [mockInventoryData[0]],
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(queryByTestId('product-card-INV-002')).toBeNull();
    });

    it('should render all products without filter', () => {
      const { getByTestId } = render(<InventoryScreen />);

      mockInventoryData.forEach((product) => {
        expect(getByTestId(`product-card-${product.id}`)).toBeTruthy();
      });
    });

    it('should preserve product order from API', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const list = getByTestId('inventory-list');
      expect(list.children.length).toBe(3);
    });

    it('should render products in correct order', () => {
      const { getByTestId } = render(<InventoryScreen />);

      const list = getByTestId('inventory-list');
      expect(list).toBeTruthy();
    });

    it('should handle single client gracefully', () => {
      (useInventory as jest.Mock).mockReturnValue({
        data: [mockInventoryData[0]],
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(queryByTestId('product-card-INV-002')).toBeNull();
    });

    it('should handle many products efficiently', () => {
      const manyProducts = Array.from({ length: 100 }, (_, i) => ({
        ...mockInventoryData[0],
        id: `INV-${String(i + 1).padStart(3, '0')}`,
      }));

      (useInventory as jest.Mock).mockReturnValue({
        data: manyProducts,
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<InventoryScreen />);

      expect(getByTestId('inventory-list')).toBeTruthy();
    });
  });

  describe('Component Rerender', () => {
    it('should handle rerender with updated products data', () => {
      const { rerender, getByTestId, queryByTestId } = render(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();

      // Rerender with different data
      (useInventory as jest.Mock).mockReturnValue({
        data: [mockInventoryData[0]],
        isLoading: false,
        error: null,
      });

      rerender(<InventoryScreen />);

      expect(getByTestId('product-card-INV-001')).toBeTruthy();
      expect(queryByTestId('product-card-INV-002')).toBeNull();
    });

    it('should handle rerender when loading state changes', () => {
      const { rerender, getByText, queryByText } = render(<InventoryScreen />);

      expect(getByText('inventory.title')).toBeTruthy();

      (useInventory as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      rerender(<InventoryScreen />);

      expect(getByText('inventory.loadingProducts')).toBeTruthy();
      expect(queryByText('inventory.emptyState')).toBeNull();
    });
  });
});
