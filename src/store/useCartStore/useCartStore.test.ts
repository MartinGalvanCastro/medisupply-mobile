import { useCartStore } from './useCartStore';
import type { CartItem } from './types';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({
      items: [],
      selectedClientId: undefined,
      selectedVisitId: undefined,
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty cart and no client or visit', () => {
      const state = useCartStore.getState();

      expect(state.items).toEqual([]);
      expect(state.selectedClientId).toBeUndefined();
      expect(state.selectedVisitId).toBeUndefined();
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 2);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        ...item,
        quantity: 2,
      });
    });

    it('should increment quantity if item already exists', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 2);
      useCartStore.getState().addItem(item, 3);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5);
    });

    it('should add multiple different items to the cart', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1');
      const item2 = createMockCartItem('inv-2', 'prod-2');

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 1);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
    });

    it('should not add item if quantity is zero', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 0);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should not add item if quantity is negative', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, -5);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should preserve item properties when adding', () => {
      const item = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Test Product',
        productSku: 'SKU-123',
        productPrice: 99.99,
        warehouseName: 'Main Warehouse',
        availableQuantity: 100,
      };

      useCartStore.getState().addItem(item, 3);

      const state = useCartStore.getState();
      expect(state.items[0].productName).toBe('Test Product');
      expect(state.items[0].productPrice).toBe(99.99);
      expect(state.items[0].productSku).toBe('SKU-123');
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 2);
      expect(useCartStore.getState().items).toHaveLength(1);

      useCartStore.getState().removeItem('inv-1');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should remove only the specified item when multiple items exist', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1');
      const item2 = createMockCartItem('inv-2', 'prod-2');

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 1);

      useCartStore.getState().removeItem('inv-1');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].inventoryId).toBe('inv-2');
    });

    it('should not fail if removing non-existent item', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 2);

      useCartStore.getState().removeItem('non-existent');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity of existing item', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 5);

      useCartStore.getState().updateQuantity('inv-1', 10);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(10);
    });

    it('should remove item if quantity is set to zero', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 5);

      useCartStore.getState().updateQuantity('inv-1', 0);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should remove item if quantity is set to negative', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 5);

      useCartStore.getState().updateQuantity('inv-1', -3);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should not affect other items when updating quantity', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1');
      const item2 = createMockCartItem('inv-2', 'prod-2');

      useCartStore.getState().addItem(item1, 5);
      useCartStore.getState().addItem(item2, 3);

      useCartStore.getState().updateQuantity('inv-1', 10);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.items[0].quantity).toBe(10);
      expect(state.items[1].quantity).toBe(3);
    });

    it('should handle updating quantity for non-existent item gracefully', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 5);

      useCartStore.getState().updateQuantity('non-existent', 10);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].inventoryId).toBe('inv-1');
      expect(state.items[0].quantity).toBe(5);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1');
      const item2 = createMockCartItem('inv-2', 'prod-2');

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 3);

      expect(useCartStore.getState().items).toHaveLength(2);

      useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should reset selectedClientId and selectedVisitId when clearing cart', () => {
      useCartStore.getState().setClient('client-1');
      useCartStore.getState().setVisit('visit-1');

      expect(useCartStore.getState().selectedClientId).toBe('client-1');
      expect(useCartStore.getState().selectedVisitId).toBe('visit-1');

      useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.selectedClientId).toBeUndefined();
      expect(state.selectedVisitId).toBeUndefined();
    });
  });

  describe('setClient', () => {
    it('should set selectedClientId', () => {
      useCartStore.getState().setClient('client-1');

      const state = useCartStore.getState();
      expect(state.selectedClientId).toBe('client-1');
    });

    it('should update selectedClientId when called multiple times', () => {
      useCartStore.getState().setClient('client-1');
      expect(useCartStore.getState().selectedClientId).toBe('client-1');

      useCartStore.getState().setClient('client-2');

      const state = useCartStore.getState();
      expect(state.selectedClientId).toBe('client-2');
    });

    it('should not affect cart items when setting client', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 2);

      useCartStore.getState().setClient('client-1');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.selectedClientId).toBe('client-1');
    });
  });

  describe('setVisit', () => {
    it('should set selectedVisitId', () => {
      useCartStore.getState().setVisit('visit-1');

      const state = useCartStore.getState();
      expect(state.selectedVisitId).toBe('visit-1');
    });

    it('should update selectedVisitId when called multiple times', () => {
      useCartStore.getState().setVisit('visit-1');
      expect(useCartStore.getState().selectedVisitId).toBe('visit-1');

      useCartStore.getState().setVisit('visit-2');

      const state = useCartStore.getState();
      expect(state.selectedVisitId).toBe('visit-2');
    });

    it('should set selectedVisitId to undefined', () => {
      useCartStore.getState().setVisit('visit-1');
      expect(useCartStore.getState().selectedVisitId).toBe('visit-1');

      useCartStore.getState().setVisit(undefined);

      const state = useCartStore.getState();
      expect(state.selectedVisitId).toBeUndefined();
    });

    it('should not affect cart items when setting visit', () => {
      const item = createMockCartItem('inv-1', 'prod-1');

      useCartStore.getState().addItem(item, 2);

      useCartStore.getState().setVisit('visit-1');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.selectedVisitId).toBe('visit-1');
    });
  });

  describe('getSubtotal', () => {
    it('should return subtotal for an item', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 50);

      useCartStore.getState().addItem(item, 2);

      const subtotal = useCartStore.getState().getSubtotal('inv-1');

      expect(subtotal).toBe(100);
    });

    it('should return 0 for non-existent item', () => {
      const subtotal = useCartStore.getState().getSubtotal('non-existent');

      expect(subtotal).toBe(0);
    });

    it('should calculate correct subtotal with decimal prices', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 19.99);

      useCartStore.getState().addItem(item, 3);

      const subtotal = useCartStore.getState().getSubtotal('inv-1');

      expect(subtotal).toBeCloseTo(59.97, 2);
    });

    it('should update subtotal when quantity changes', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 50);

      useCartStore.getState().addItem(item, 2);

      let subtotal = useCartStore.getState().getSubtotal('inv-1');
      expect(subtotal).toBe(100);

      useCartStore.getState().updateQuantity('inv-1', 5);

      subtotal = useCartStore.getState().getSubtotal('inv-1');
      expect(subtotal).toBe(250);
    });

    it('should return 0 after item is removed', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 50);

      useCartStore.getState().addItem(item, 2);

      useCartStore.getState().removeItem('inv-1');

      const subtotal = useCartStore.getState().getSubtotal('inv-1');

      expect(subtotal).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      const total = useCartStore.getState().getTotal();

      expect(total).toBe(0);
    });

    it('should return total for single item', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 50);

      useCartStore.getState().addItem(item, 3);

      const total = useCartStore.getState().getTotal();

      expect(total).toBe(150);
    });

    it('should return total for multiple items', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 50);
      const item2 = createMockCartItem('inv-2', 'prod-2', 30);

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 3);

      const total = useCartStore.getState().getTotal();

      expect(total).toBe(190);
    });

    it('should calculate correct total with decimal prices', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 19.99);
      const item2 = createMockCartItem('inv-2', 'prod-2', 29.99);

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 1);

      const total = useCartStore.getState().getTotal();

      expect(total).toBeCloseTo(69.97, 2);
    });

    it('should update total when item is added', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 50);
      const item2 = createMockCartItem('inv-2', 'prod-2', 30);

      useCartStore.getState().addItem(item1, 2);

      let total = useCartStore.getState().getTotal();
      expect(total).toBe(100);

      useCartStore.getState().addItem(item2, 3);

      total = useCartStore.getState().getTotal();
      expect(total).toBe(190);
    });

    it('should update total when quantity is updated', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 50);

      useCartStore.getState().addItem(item, 2);

      let total = useCartStore.getState().getTotal();
      expect(total).toBe(100);

      useCartStore.getState().updateQuantity('inv-1', 5);

      total = useCartStore.getState().getTotal();
      expect(total).toBe(250);
    });

    it('should update total when item is removed', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 50);
      const item2 = createMockCartItem('inv-2', 'prod-2', 30);

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 3);

      let total = useCartStore.getState().getTotal();
      expect(total).toBe(190);

      useCartStore.getState().removeItem('inv-1');

      total = useCartStore.getState().getTotal();
      expect(total).toBe(90);
    });

    it('should return 0 after clearing cart', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 50);

      useCartStore.getState().addItem(item, 2);

      useCartStore.getState().clearCart();

      const total = useCartStore.getState().getTotal();

      expect(total).toBe(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle adding, updating, and removing items in sequence', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 50);
      const item2 = createMockCartItem('inv-2', 'prod-2', 30);

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 3);

      expect(useCartStore.getState().getTotal()).toBe(190);

      useCartStore.getState().updateQuantity('inv-1', 5);

      expect(useCartStore.getState().getTotal()).toBe(340);

      useCartStore.getState().removeItem('inv-2');

      expect(useCartStore.getState().getTotal()).toBe(250);
    });

    it('should handle complete workflow with client and visit selection', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 100);

      useCartStore.getState().setClient('client-1');
      useCartStore.getState().setVisit('visit-1');
      useCartStore.getState().addItem(item, 2);

      let state = useCartStore.getState();
      expect(state.selectedClientId).toBe('client-1');
      expect(state.selectedVisitId).toBe('visit-1');
      expect(state.items).toHaveLength(1);
      expect(state.getTotal()).toBe(200);

      useCartStore.getState().clearCart();

      state = useCartStore.getState();
      expect(state.selectedClientId).toBeUndefined();
      expect(state.selectedVisitId).toBeUndefined();
      expect(state.items).toHaveLength(0);
      expect(state.getTotal()).toBe(0);
    });

    it('should maintain state consistency across multiple operations', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 25);
      const item2 = createMockCartItem('inv-2', 'prod-2', 75);

      useCartStore.getState().addItem(item1, 1);

      let state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.getTotal()).toBe(25);

      useCartStore.getState().addItem(item1, 2);

      state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
      expect(state.getTotal()).toBe(75);

      useCartStore.getState().addItem(item2, 2);

      state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.getTotal()).toBe(225);

      useCartStore.getState().updateQuantity('inv-2', 1);

      state = useCartStore.getState();
      expect(state.getTotal()).toBe(150);
    });

    it('should handle price precision with multiple decimal places', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 10.99);
      const item2 = createMockCartItem('inv-2', 'prod-2', 20.49);
      const item3 = createMockCartItem('inv-3', 'prod-3', 5.50);

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 3);
      useCartStore.getState().addItem(item3, 4);

      const total = useCartStore.getState().getTotal();
      // 10.99*2 + 20.49*3 + 5.50*4 = 21.98 + 61.47 + 22 = 105.45
      expect(total).toBeCloseTo(105.45, 2);
    });

    it('should correctly handle quantity increments on same item', () => {
      const item = createMockCartItem('inv-1', 'prod-1', 25);

      useCartStore.getState().addItem(item, 1);
      expect(useCartStore.getState().getTotal()).toBe(25);

      useCartStore.getState().addItem(item, 1);
      expect(useCartStore.getState().getTotal()).toBe(50);

      useCartStore.getState().addItem(item, 2);
      expect(useCartStore.getState().getTotal()).toBe(100);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(4);
    });

    it('should handle updating quantity to zero removes item from cart', () => {
      const item1 = createMockCartItem('inv-1', 'prod-1', 50);
      const item2 = createMockCartItem('inv-2', 'prod-2', 30);

      useCartStore.getState().addItem(item1, 2);
      useCartStore.getState().addItem(item2, 3);

      expect(useCartStore.getState().items).toHaveLength(2);
      expect(useCartStore.getState().getTotal()).toBe(190);

      useCartStore.getState().updateQuantity('inv-1', 0);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].inventoryId).toBe('inv-2');
      expect(state.getTotal()).toBe(90);
    });
  });
});

// Helper function to create mock cart items
function createMockCartItem(
  inventoryId: string,
  productId: string,
  productPrice: number = 100
): Omit<CartItem, 'quantity'> {
  return {
    inventoryId,
    productId,
    productName: `Product ${productId}`,
    productSku: `SKU-${productId}`,
    productPrice,
    warehouseName: 'Test Warehouse',
    availableQuantity: 100,
  };
}
