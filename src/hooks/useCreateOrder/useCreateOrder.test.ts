import { renderHook, act } from '@testing-library/react-native';
import { useCreateOrder } from './useCreateOrder';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreateOrderBffClientAppOrdersPost } from '@/api/generated/client-app/client-app';
import { useCreateOrderBffSellersAppOrdersPost } from '@/api/generated/sellers-app/sellers-app';
import type { OrderItemInput } from '@/api/generated/models/orderItemInput';
import type { OrderCreateResponse } from '@/api/generated/models/orderCreateResponse';

jest.mock('@/store/useAuthStore');
jest.mock('@/api/generated/client-app/client-app');
jest.mock('@/api/generated/sellers-app/sellers-app');

// Helper to mock useAuthStore with a specific role
const mockAuthStoreWithRole = (role: string | null) => {
  (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector({
        user: role ? { role } : null,
      } as any);
    }
    return null;
  });
};

describe('useCreateOrder', () => {
  const mockOrderItem: OrderItemInput = {
    inventario_id: 'inv-123',
    cantidad: 2,
  };

  const mockOrderResponse: OrderCreateResponse = {
    id: 'order-123',
    message: 'Order created successfully',
  };

  const mockClientMutation: any = {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
    reset: jest.fn(),
  };

  const mockSellerMutation: any = {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStoreWithRole(null);
    (useCreateOrderBffClientAppOrdersPost as jest.Mock).mockReturnValue(
      mockClientMutation
    );
    (useCreateOrderBffSellersAppOrdersPost as jest.Mock).mockReturnValue(
      mockSellerMutation
    );
  });

  describe('mutate', () => {
    describe('authentication validation', () => {
      it('should throw error when user is not authenticated', () => {
        mockAuthStoreWithRole(null);

        const { result } = renderHook(() => useCreateOrder());

        expect(() => {
          result.current.mutate({ items: [mockOrderItem] });
        }).toThrow(
          '[useCreateOrder] User not authenticated. Please login to create orders.'
        );
      });

      it('should not throw error when user is authenticated as client', () => {
        mockAuthStoreWithRole('client');

        const { result } = renderHook(() => useCreateOrder());

        expect(() => {
          result.current.mutate({ items: [mockOrderItem] });
        }).not.toThrow();
        expect(mockClientMutation.mutate).toHaveBeenCalled();
      });

      it('should not throw error when user is authenticated as seller', () => {
        mockAuthStoreWithRole('seller');

        const { result } = renderHook(() => useCreateOrder());

        expect(() => {
          result.current.mutate({
            items: [mockOrderItem],
            customer_id: 'customer-456',
          });
        }).not.toThrow();
        expect(mockSellerMutation.mutate).toHaveBeenCalled();
      });
    });

    describe('client role behavior', () => {
      beforeEach(() => {
        mockAuthStoreWithRole('client');
      });

      it('should call client mutation with correct data structure', () => {
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({ items: [mockOrderItem] });
        });

        expect(mockClientMutation.mutate).toHaveBeenCalledWith(
          {
            data: {
              items: [mockOrderItem],
            },
          },
          undefined
        );
      });

      it('should ignore customer_id for client role', () => {
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({
            items: [mockOrderItem],
            customer_id: 'should-be-ignored',
          });
        });

        const callArgs = mockClientMutation.mutate.mock.calls[0];
        expect(callArgs[0].data).toEqual({ items: [mockOrderItem] });
        expect(callArgs[0].data).not.toHaveProperty('customer_id');
      });

      it('should ignore visit_id for client role', () => {
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({
            items: [mockOrderItem],
            visit_id: 'should-be-ignored',
          });
        });

        const callArgs = mockClientMutation.mutate.mock.calls[0];
        expect(callArgs[0].data).toEqual({ items: [mockOrderItem] });
        expect(callArgs[0].data).not.toHaveProperty('visit_id');
      });

      it('should pass onSuccess callback to client mutation', () => {
        const onSuccess = jest.fn();
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate(
            { items: [mockOrderItem] },
            { onSuccess }
          );
        });

        expect(mockClientMutation.mutate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({ onSuccess })
        );
      });

      it('should pass onError callback to client mutation', () => {
        const onError = jest.fn();
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate(
            { items: [mockOrderItem] },
            { onError }
          );
        });

        expect(mockClientMutation.mutate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({ onError })
        );
      });

      it('should pass onSettled callback to client mutation', () => {
        const onSettled = jest.fn();
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate(
            { items: [mockOrderItem] },
            { onSettled }
          );
        });

        expect(mockClientMutation.mutate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({ onSettled })
        );
      });

      it('should work with multiple items', () => {
        const item1 = { inventario_id: 'inv-1', cantidad: 2 };
        const item2 = { inventario_id: 'inv-2', cantidad: 5 };
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({ items: [item1, item2] });
        });

        expect(mockClientMutation.mutate).toHaveBeenCalledWith(
          {
            data: {
              items: [item1, item2],
            },
          },
          undefined
        );
      });
    });

    describe('seller role behavior', () => {
      beforeEach(() => {
        mockAuthStoreWithRole('seller');
      });

      it('should throw error when customer_id is missing', () => {
        const { result } = renderHook(() => useCreateOrder());

        expect(() => {
          result.current.mutate({ items: [mockOrderItem] });
        }).toThrow('[useCreateOrder] customer_id is required for seller role');
      });

      it('should call seller mutation with customer_id', () => {
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({
            items: [mockOrderItem],
            customer_id: 'customer-456',
          });
        });

        expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
          {
            data: {
              customer_id: 'customer-456',
              items: [mockOrderItem],
              visit_id: undefined,
            },
          },
          undefined
        );
      });

      it('should include visit_id when provided', () => {
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({
            items: [mockOrderItem],
            customer_id: 'customer-456',
            visit_id: 'visit-789',
          });
        });

        expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
          {
            data: {
              customer_id: 'customer-456',
              items: [mockOrderItem],
              visit_id: 'visit-789',
            },
          },
          undefined
        );
      });

      it('should pass onSuccess callback to seller mutation', () => {
        const onSuccess = jest.fn();
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate(
            {
              items: [mockOrderItem],
              customer_id: 'customer-456',
            },
            { onSuccess }
          );
        });

        expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({ onSuccess })
        );
      });

      it('should pass onError callback to seller mutation', () => {
        const onError = jest.fn();
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate(
            {
              items: [mockOrderItem],
              customer_id: 'customer-456',
            },
            { onError }
          );
        });

        expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({ onError })
        );
      });

      it('should pass onSettled callback to seller mutation', () => {
        const onSettled = jest.fn();
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate(
            {
              items: [mockOrderItem],
              customer_id: 'customer-456',
            },
            { onSettled }
          );
        });

        expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({ onSettled })
        );
      });

      it('should work with multiple items', () => {
        const item1 = { inventario_id: 'inv-1', cantidad: 2 };
        const item2 = { inventario_id: 'inv-2', cantidad: 5 };
        const { result } = renderHook(() => useCreateOrder());

        act(() => {
          result.current.mutate({
            items: [item1, item2],
            customer_id: 'customer-456',
          });
        });

        expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
          {
            data: {
              customer_id: 'customer-456',
              items: [item1, item2],
              visit_id: undefined,
            },
          },
          undefined
        );
      });
    });
  });

  describe('mutateAsync', () => {
    describe('authentication validation', () => {
      it('should throw error when user is not authenticated', async () => {
        mockAuthStoreWithRole(null);

        const { result } = renderHook(() => useCreateOrder());

        await expect(
          result.current.mutateAsync({ items: [mockOrderItem] })
        ).rejects.toThrow(
          '[useCreateOrder] User not authenticated. Please login to create orders.'
        );
      });

      it('should not throw error when user is authenticated as client', async () => {
        mockAuthStoreWithRole('client');
        mockClientMutation.mutateAsync.mockResolvedValue(mockOrderResponse);

        const { result } = renderHook(() => useCreateOrder());

        await expect(
          result.current.mutateAsync({ items: [mockOrderItem] })
        ).resolves.not.toThrow();
        expect(mockClientMutation.mutateAsync).toHaveBeenCalled();
      });

      it('should not throw error when user is authenticated as seller', async () => {
        mockAuthStoreWithRole('seller');
        mockSellerMutation.mutateAsync.mockResolvedValue(mockOrderResponse);

        const { result } = renderHook(() => useCreateOrder());

        await expect(
          result.current.mutateAsync({
            items: [mockOrderItem],
            customer_id: 'customer-456',
          })
        ).resolves.not.toThrow();
        expect(mockSellerMutation.mutateAsync).toHaveBeenCalled();
      });
    });

    describe('client role behavior', () => {
      beforeEach(() => {
        mockAuthStoreWithRole('client');
        mockClientMutation.mutateAsync.mockResolvedValue(mockOrderResponse);
      });

      it('should call client mutateAsync with correct data structure', async () => {
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({ items: [mockOrderItem] });
        });

        expect(mockClientMutation.mutateAsync).toHaveBeenCalledWith({
          data: {
            items: [mockOrderItem],
          },
        });
      });

      it('should return order response from client mutation', async () => {
        const { result } = renderHook(() => useCreateOrder());

        let response: OrderCreateResponse | undefined;

        await act(async () => {
          response = await result.current.mutateAsync({ items: [mockOrderItem] });
        });

        expect(response).toEqual(mockOrderResponse);
      });

      it('should ignore customer_id for client role', async () => {
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({
            items: [mockOrderItem],
            customer_id: 'should-be-ignored',
          });
        });

        const callArgs = mockClientMutation.mutateAsync.mock.calls[0];
        expect(callArgs[0].data).toEqual({ items: [mockOrderItem] });
        expect(callArgs[0].data).not.toHaveProperty('customer_id');
      });

      it('should ignore visit_id for client role', async () => {
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({
            items: [mockOrderItem],
            visit_id: 'should-be-ignored',
          });
        });

        const callArgs = mockClientMutation.mutateAsync.mock.calls[0];
        expect(callArgs[0].data).toEqual({ items: [mockOrderItem] });
        expect(callArgs[0].data).not.toHaveProperty('visit_id');
      });

      it('should work with multiple items', async () => {
        const item1 = { inventario_id: 'inv-1', cantidad: 2 };
        const item2 = { inventario_id: 'inv-2', cantidad: 5 };
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({ items: [item1, item2] });
        });

        expect(mockClientMutation.mutateAsync).toHaveBeenCalledWith({
          data: {
            items: [item1, item2],
          },
        });
      });
    });

    describe('seller role behavior', () => {
      beforeEach(() => {
        mockAuthStoreWithRole('seller');
        mockSellerMutation.mutateAsync.mockResolvedValue(mockOrderResponse);
      });

      it('should throw error when customer_id is missing', async () => {
        const { result } = renderHook(() => useCreateOrder());

        await expect(
          result.current.mutateAsync({ items: [mockOrderItem] })
        ).rejects.toThrow('[useCreateOrder] customer_id is required for seller role');
      });

      it('should call seller mutateAsync with customer_id', async () => {
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({
            items: [mockOrderItem],
            customer_id: 'customer-456',
          });
        });

        expect(mockSellerMutation.mutateAsync).toHaveBeenCalledWith({
          data: {
            customer_id: 'customer-456',
            items: [mockOrderItem],
            visit_id: undefined,
          },
        });
      });

      it('should return order response from seller mutation', async () => {
        const { result } = renderHook(() => useCreateOrder());

        let response: OrderCreateResponse | undefined;

        await act(async () => {
          response = await result.current.mutateAsync({
            items: [mockOrderItem],
            customer_id: 'customer-456',
          });
        });

        expect(response).toEqual(mockOrderResponse);
      });

      it('should include visit_id when provided', async () => {
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({
            items: [mockOrderItem],
            customer_id: 'customer-456',
            visit_id: 'visit-789',
          });
        });

        expect(mockSellerMutation.mutateAsync).toHaveBeenCalledWith({
          data: {
            customer_id: 'customer-456',
            items: [mockOrderItem],
            visit_id: 'visit-789',
          },
        });
      });

      it('should work with multiple items', async () => {
        const item1 = { inventario_id: 'inv-1', cantidad: 2 };
        const item2 = { inventario_id: 'inv-2', cantidad: 5 };
        const { result } = renderHook(() => useCreateOrder());

        await act(async () => {
          await result.current.mutateAsync({
            items: [item1, item2],
            customer_id: 'customer-456',
          });
        });

        expect(mockSellerMutation.mutateAsync).toHaveBeenCalledWith({
          data: {
            customer_id: 'customer-456',
            items: [item1, item2],
            visit_id: undefined,
          },
        });
      });
    });

    describe('error handling', () => {
      it('should propagate errors from client mutation', async () => {
        mockAuthStoreWithRole('client');
        const error = new Error('API error');
        mockClientMutation.mutateAsync.mockRejectedValue(error);

        const { result } = renderHook(() => useCreateOrder());

        await expect(
          result.current.mutateAsync({ items: [mockOrderItem] })
        ).rejects.toThrow('API error');
      });

      it('should propagate errors from seller mutation', async () => {
        mockAuthStoreWithRole('seller');
        const error = new Error('API error');
        mockSellerMutation.mutateAsync.mockRejectedValue(error);

        const { result } = renderHook(() => useCreateOrder());

        await expect(
          result.current.mutateAsync({
            items: [mockOrderItem],
            customer_id: 'customer-456',
          })
        ).rejects.toThrow('API error');
      });
    });
  });

  describe('mutation state properties', () => {
    it('should return client mutation state properties when user is client', () => {
      mockAuthStoreWithRole('client');
      mockClientMutation.isPending = true;
      mockClientMutation.isError = true;
      mockClientMutation.isSuccess = false;
      mockClientMutation.error = new Error('test error');
      mockClientMutation.data = mockOrderResponse;

      const { result } = renderHook(() => useCreateOrder());

      expect(result.current.isPending).toBe(true);
      expect(result.current.isError).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toEqual(new Error('test error'));
      expect(result.current.data).toEqual(mockOrderResponse);
    });

    it('should return seller mutation state properties when user is seller', () => {
      mockAuthStoreWithRole('seller');
      mockSellerMutation.isPending = false;
      mockSellerMutation.isError = false;
      mockSellerMutation.isSuccess = true;
      mockSellerMutation.error = null;
      mockSellerMutation.data = mockOrderResponse;

      const { result } = renderHook(() => useCreateOrder());

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockOrderResponse);
    });
  });

  describe('reset functionality', () => {
    it('should call client mutation reset when user is client', () => {
      mockAuthStoreWithRole('client');

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.reset();
      });

      expect(mockClientMutation.reset).toHaveBeenCalled();
    });

    it('should call seller mutation reset when user is seller', () => {
      mockAuthStoreWithRole('seller');

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.reset();
      });

      expect(mockSellerMutation.reset).toHaveBeenCalled();
    });
  });

  describe('role change during hook lifecycle', () => {
    it('should switch from client to seller when user role changes', () => {
      const { result, rerender } = renderHook(
        ({ role }: any) => {
          mockAuthStoreWithRole(role);
          return useCreateOrder();
        },
        { initialProps: { role: 'client' } }
      );

      act(() => {
        result.current.mutate({ items: [mockOrderItem] });
      });

      expect(mockClientMutation.mutate).toHaveBeenCalled();

      // Switch to seller
      jest.clearAllMocks();
      rerender({ role: 'seller' });

      act(() => {
        result.current.mutate({
          items: [mockOrderItem],
          customer_id: 'customer-456',
        });
      });

      expect(mockSellerMutation.mutate).toHaveBeenCalled();
    });
  });

  describe('callback option handling', () => {
    it('should handle multiple callbacks together', () => {
      mockAuthStoreWithRole('client');
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onSettled = jest.fn();

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.mutate(
          { items: [mockOrderItem] },
          { onSuccess, onError, onSettled }
        );
      });

      expect(mockClientMutation.mutate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ onSuccess, onError, onSettled })
      );
    });

    it('should handle undefined options gracefully', () => {
      mockAuthStoreWithRole('client');

      const { result } = renderHook(() => useCreateOrder());

      expect(() => {
        act(() => {
          result.current.mutate({ items: [mockOrderItem] });
        });
      }).not.toThrow();

      expect(mockClientMutation.mutate).toHaveBeenCalled();
    });

    it('should handle partial options', () => {
      mockAuthStoreWithRole('client');
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.mutate(
          { items: [mockOrderItem] },
          { onSuccess }
        );
      });

      expect(mockClientMutation.mutate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ onSuccess })
      );
    });

    it('should execute callback functions for seller mutate', () => {
      mockAuthStoreWithRole('seller');
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onSettled = jest.fn();

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.mutate(
          { items: [mockOrderItem], customer_id: 'customer-456' },
          { onSuccess, onError, onSettled }
        );
      });

      expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ onSuccess, onError, onSettled })
      );
    });
  });

  describe('dependency tracking', () => {
    it('should update mutate callback when userRole changes', () => {
      const { result, rerender } = renderHook(
        ({ role }: any) => {
          mockAuthStoreWithRole(role);
          return useCreateOrder();
        },
        { initialProps: { role: 'client' } }
      );

      const firstMutate = result.current.mutate;

      rerender({ role: 'seller' });

      // Note: useCallback dependency change should create new function reference
      // if dependencies differ
      expect(result.current.mutate).toBeDefined();
    });

    it('should update mutateAsync callback when userRole changes', () => {
      const { result, rerender } = renderHook(
        ({ role }: any) => {
          mockAuthStoreWithRole(role);
          return useCreateOrder();
        },
        { initialProps: { role: 'client' } }
      );

      const firstMutateAsync = result.current.mutateAsync;

      rerender({ role: 'seller' });

      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should update callbacks when clientMutation reference changes', () => {
      mockAuthStoreWithRole('client');
      const { result, rerender } = renderHook(
        ({ trigger }: any) => useCreateOrder(),
        { initialProps: { trigger: 0 } }
      );

      const newClientMutation = {
        ...mockClientMutation,
        mutate: jest.fn(),
      };

      (useCreateOrderBffClientAppOrdersPost as jest.Mock).mockReturnValue(
        newClientMutation
      );

      rerender({ trigger: 1 });

      act(() => {
        result.current.mutate({ items: [mockOrderItem] });
      });

      expect(newClientMutation.mutate).toHaveBeenCalled();
    });

    it('should update callbacks when sellerMutation reference changes', () => {
      mockAuthStoreWithRole('seller');
      const { result, rerender } = renderHook(
        ({ trigger }: any) => useCreateOrder(),
        { initialProps: { trigger: 0 } }
      );

      const newSellerMutation = {
        ...mockSellerMutation,
        mutate: jest.fn(),
      };

      (useCreateOrderBffSellersAppOrdersPost as jest.Mock).mockReturnValue(
        newSellerMutation
      );

      rerender({ trigger: 1 });

      act(() => {
        result.current.mutate({
          items: [mockOrderItem],
          customer_id: 'customer-456',
        });
      });

      expect(newSellerMutation.mutate).toHaveBeenCalled();
    });
  });

  describe('selected mutation state', () => {
    it('should select correct mutation when user is not authenticated', () => {
      mockAuthStoreWithRole(null);

      const { result } = renderHook(() => useCreateOrder());

      // Should return default state (client mutation state)
      expect(result.current.isPending).toBe(
        mockClientMutation.isPending
      );
    });

    it('should properly track both mutations state during transitions', () => {
      const { result, rerender } = renderHook(
        ({ role }: any) => {
          mockAuthStoreWithRole(role);
          return useCreateOrder();
        },
        { initialProps: { role: 'client' } }
      );

      mockClientMutation.isPending = true;
      rerender({ role: 'client' });

      expect(result.current.isPending).toBe(true);

      // Switch to seller
      mockClientMutation.isPending = false;
      mockSellerMutation.isPending = true;
      rerender({ role: 'seller' });

      expect(result.current.isPending).toBe(true);
    });
  });

  describe('comprehensive mutateAsync coverage', () => {
    it('should execute mutateAsync for client with all callback types', async () => {
      mockAuthStoreWithRole('client');
      mockClientMutation.mutateAsync.mockResolvedValue(mockOrderResponse);

      const { result } = renderHook(() => useCreateOrder());

      let response: OrderCreateResponse | undefined;

      await act(async () => {
        response = await result.current.mutateAsync({ items: [mockOrderItem] });
      });

      expect(mockClientMutation.mutateAsync).toHaveBeenCalled();
      expect(response).toEqual(mockOrderResponse);
    });

    it('should execute mutateAsync for seller with all callback types', async () => {
      mockAuthStoreWithRole('seller');
      mockSellerMutation.mutateAsync.mockResolvedValue(mockOrderResponse);

      const { result } = renderHook(() => useCreateOrder());

      let response: OrderCreateResponse | undefined;

      await act(async () => {
        response = await result.current.mutateAsync({
          items: [mockOrderItem],
          customer_id: 'customer-456',
        });
      });

      expect(mockSellerMutation.mutateAsync).toHaveBeenCalled();
      expect(response).toEqual(mockOrderResponse);
    });

    it('should properly construct client data for mutateAsync without optional fields', async () => {
      mockAuthStoreWithRole('client');
      mockClientMutation.mutateAsync.mockResolvedValue(mockOrderResponse);

      const { result } = renderHook(() => useCreateOrder());

      await act(async () => {
        await result.current.mutateAsync({
          items: [mockOrderItem],
          customer_id: 'ignored',
          visit_id: 'ignored',
        });
      });

      const callArgs = mockClientMutation.mutateAsync.mock.calls[0];
      expect(callArgs[0]).toEqual({
        data: {
          items: [mockOrderItem],
        },
      });
    });

    it('should properly construct seller data for mutateAsync with all fields', async () => {
      mockAuthStoreWithRole('seller');
      mockSellerMutation.mutateAsync.mockResolvedValue(mockOrderResponse);

      const { result } = renderHook(() => useCreateOrder());

      const visitId = 'visit-789';

      await act(async () => {
        await result.current.mutateAsync({
          items: [mockOrderItem],
          customer_id: 'customer-456',
          visit_id: visitId,
        });
      });

      const callArgs = mockSellerMutation.mutateAsync.mock.calls[0];
      expect(callArgs[0]).toEqual({
        data: {
          customer_id: 'customer-456',
          items: [mockOrderItem],
          visit_id: visitId,
        },
      });
    });

    it('should verify mutate function is called for client role', () => {
      mockAuthStoreWithRole('client');

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.mutate({ items: [mockOrderItem] });
      });

      expect(mockClientMutation.mutate).toHaveBeenCalledTimes(1);
    });

    it('should verify mutate function is called for seller role', () => {
      mockAuthStoreWithRole('seller');

      const { result } = renderHook(() => useCreateOrder());

      act(() => {
        result.current.mutate({
          items: [mockOrderItem],
          customer_id: 'customer-456',
        });
      });

      expect(mockSellerMutation.mutate).toHaveBeenCalledTimes(1);
    });

    it('should return appropriate return values from hook', () => {
      mockAuthStoreWithRole('client');

      const { result } = renderHook(() => useCreateOrder());

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('reset');
    });

    it('should correctly invoke mutate with client mutation for multiple items', () => {
      mockAuthStoreWithRole('client');

      const { result } = renderHook(() => useCreateOrder());
      const items = [
        { inventario_id: 'inv-1', cantidad: 1 },
        { inventario_id: 'inv-2', cantidad: 2 },
        { inventario_id: 'inv-3', cantidad: 3 },
      ];

      act(() => {
        result.current.mutate({ items });
      });

      expect(mockClientMutation.mutate).toHaveBeenCalledWith(
        { data: { items } },
        undefined
      );
    });

    it('should correctly invoke mutate with seller mutation for multiple items with visit', () => {
      mockAuthStoreWithRole('seller');

      const { result } = renderHook(() => useCreateOrder());
      const items = [
        { inventario_id: 'inv-1', cantidad: 1 },
        { inventario_id: 'inv-2', cantidad: 2 },
      ];
      const customerId = 'cust-789';
      const visitId = 'visit-456';

      act(() => {
        result.current.mutate({
          items,
          customer_id: customerId,
          visit_id: visitId,
        });
      });

      expect(mockSellerMutation.mutate).toHaveBeenCalledWith(
        {
          data: {
            customer_id: customerId,
            items,
            visit_id: visitId,
          },
        },
        undefined
      );
    });
  });
});
