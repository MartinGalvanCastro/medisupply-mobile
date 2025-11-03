import { renderHook, act } from '@testing-library/react-native';
import { useCartStore } from './useCartStore';
import type { CartItem } from './types';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useCartStore.getState().clearCart();
    });
  });

  describe('initial state', () => {
    it('should start with empty items array', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.items).toEqual([]);
    });

    it('should start with no client selected', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.selectedClientId).toBeUndefined();
    });

    it('should start with no visit selected', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.selectedVisitId).toBeUndefined();
    });

    it('should have all initial state properties', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current).toHaveProperty('items');
      expect(result.current).toHaveProperty('selectedClientId');
      expect(result.current).toHaveProperty('selectedVisitId');
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({
        ...item,
        quantity: 5,
      });
    });

    it('should increment quantity if item already exists', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.addItem(item, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(8);
    });

    it('should reject quantity <= 0', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should reject negative quantity', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, -5);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should add multiple different items', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity for existing item', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.updateQuantity('inv-1', 10);
      });

      expect(result.current.items[0].quantity).toBe(10);
    });

    it('should remove item if quantity <= 0', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.updateQuantity('inv-1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove item if quantity is negative', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.updateQuantity('inv-1', -3);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should do nothing if item does not exist', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.updateQuantity('non-existent', 5);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should preserve other items when updating one', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
        result.current.updateQuantity('inv-1', 10);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].quantity).toBe(10);
      expect(result.current.items[1].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.removeItem('inv-1');
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should do nothing if item does not exist', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.removeItem('non-existent');
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should preserve other items when removing one', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
        result.current.removeItem('inv-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].inventoryId).toBe('inv-2');
    });
  });

  describe('clearCart', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.setClient('client-1');
        result.current.setVisit('visit-1');
        result.current.clearCart();
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.selectedClientId).toBeUndefined();
      expect(result.current.selectedVisitId).toBeUndefined();
    });

    it('should clear all items', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should clear client and visit selection', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setClient('client-1');
        result.current.setVisit('visit-1');
        result.current.clearCart();
      });

      expect(result.current.selectedClientId).toBeUndefined();
      expect(result.current.selectedVisitId).toBeUndefined();
    });
  });

  describe('setClient', () => {
    it('should set selected client ID', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setClient('client-1');
      });

      expect(result.current.selectedClientId).toBe('client-1');
    });

    it('should update client ID when called again', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setClient('client-1');
        result.current.setClient('client-2');
      });

      expect(result.current.selectedClientId).toBe('client-2');
    });

    it('should not affect cart items when setting client', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.setClient('client-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
    });
  });

  describe('setVisit', () => {
    it('should set selected visit ID', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setVisit('visit-1');
      });

      expect(result.current.selectedVisitId).toBe('visit-1');
    });

    it('should allow undefined to clear visit', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setVisit('visit-1');
        result.current.setVisit(undefined);
      });

      expect(result.current.selectedVisitId).toBeUndefined();
    });

    it('should update visit ID when called again', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setVisit('visit-1');
        result.current.setVisit('visit-2');
      });

      expect(result.current.selectedVisitId).toBe('visit-2');
    });

    it('should not affect cart items when setting visit', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.setVisit('visit-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
    });
  });

  describe('getSubtotal', () => {
    it('should calculate price × quantity', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
      });

      const subtotal = result.current.getSubtotal('inv-1');
      expect(subtotal).toBe(500); // 100 * 5
    });

    it('should return 0 for non-existent items', () => {
      const { result } = renderHook(() => useCartStore());

      const subtotal = result.current.getSubtotal('non-existent');
      expect(subtotal).toBe(0);
    });

    it('should calculate correct subtotal for multiple items', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
      });

      const subtotal1 = result.current.getSubtotal('inv-1');
      const subtotal2 = result.current.getSubtotal('inv-2');

      expect(subtotal1).toBe(500); // 100 * 5
      expect(subtotal2).toBe(150); // 50 * 3
    });

    it('should reflect updated quantity in subtotal', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
      });

      let subtotal = result.current.getSubtotal('inv-1');
      expect(subtotal).toBe(500);

      act(() => {
        result.current.updateQuantity('inv-1', 10);
      });

      subtotal = result.current.getSubtotal('inv-1');
      expect(subtotal).toBe(1000); // 100 * 10
    });
  });

  describe('getTotal', () => {
    it('should sum all item subtotals', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
      });

      const total = result.current.getTotal();
      expect(total).toBe(650); // (100 * 5) + (50 * 3)
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCartStore());

      const total = result.current.getTotal();
      expect(total).toBe(0);
    });

    it('should update when items are added', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      let total = result.current.getTotal();
      expect(total).toBe(0);

      act(() => {
        result.current.addItem(item, 5);
      });

      total = result.current.getTotal();
      expect(total).toBe(500);
    });

    it('should update when items are removed', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
      });

      let total = result.current.getTotal();
      expect(total).toBe(650);

      act(() => {
        result.current.removeItem('inv-2');
      });

      total = result.current.getTotal();
      expect(total).toBe(500);
    });

    it('should update when quantity is changed', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
      });

      let total = result.current.getTotal();
      expect(total).toBe(500);

      act(() => {
        result.current.updateQuantity('inv-1', 10);
      });

      total = result.current.getTotal();
      expect(total).toBe(1000);
    });

    it('should return 0 after clearing cart', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.clearCart();
      });

      const total = result.current.getTotal();
      expect(total).toBe(0);
    });
  });

  describe('complex scenarios', () => {
    it('should handle complete workflow', () => {
      const { result } = renderHook(() => useCartStore());
      const item1: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };
      const item2: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-2',
        productId: 'prod-2',
        productName: 'Product 2',
        productSku: 'SKU-002',
        productPrice: 50,
        warehouseName: 'Warehouse B',
        availableQuantity: 30,
      };

      act(() => {
        result.current.addItem(item1, 5);
        result.current.addItem(item2, 3);
        result.current.setClient('client-1');
        result.current.setVisit('visit-1');
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.selectedClientId).toBe('client-1');
      expect(result.current.selectedVisitId).toBe('visit-1');
      expect(result.current.getTotal()).toBe(650);

      act(() => {
        result.current.updateQuantity('inv-1', 10);
      });

      expect(result.current.getTotal()).toBe(1150); // (100 * 10) + (50 * 3)

      act(() => {
        result.current.removeItem('inv-2');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.getTotal()).toBe(1000);
    });

    it('should handle multiple quantity increments', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 1);
        result.current.addItem(item, 2);
        result.current.addItem(item, 3);
      });

      expect(result.current.items[0].quantity).toBe(6);
      expect(result.current.getTotal()).toBe(600);
    });

    it('should handle item removal and re-addition', () => {
      const { result } = renderHook(() => useCartStore());
      const item: Omit<CartItem, 'quantity'> = {
        inventoryId: 'inv-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productSku: 'SKU-001',
        productPrice: 100,
        warehouseName: 'Warehouse A',
        availableQuantity: 50,
      };

      act(() => {
        result.current.addItem(item, 5);
        result.current.removeItem('inv-1');
        result.current.addItem(item, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.getTotal()).toBe(300);
    });
  });
});
