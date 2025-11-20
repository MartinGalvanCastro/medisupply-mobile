import { useCallback } from 'react';
import { useCreateOrderBffClientAppOrdersPost } from '@/api/generated/client-app/client-app';
import { useCreateOrderBffSellersAppOrdersPost } from '@/api/generated/sellers-app/sellers-app';
import { useAuthStore } from '@/store/useAuthStore';
import type { HTTPValidationError } from '@/api/generated/models';
import type { OrderItemInput } from '@/api/generated/models/orderItemInput';
import type { OrderCreateResponse } from '@/api/generated/models/orderCreateResponse';

/**
 * Unified order creation input that works for both client and seller apps.
 *
 * For client role:
 * - Only `items` is required
 * - `customer_id` is auto-fetched from JWT (ignored if provided)
 *
 * For seller role:
 * - `items` and `customer_id` are required
 * - `visit_id` is optional
 */
export interface CreateOrderInput {
  items: OrderItemInput[];
  customer_id?: string;  // Required for seller, ignored for client
  visit_id?: string;     // Optional for seller, ignored for client
}

export interface CreateOrderMutationOptions {
  onSuccess?: (data: OrderCreateResponse) => void;
  onError?: (error: HTTPValidationError | void) => void;
  onSettled?: (data: OrderCreateResponse | undefined, error: HTTPValidationError | void | null) => void;
}

/**
 * Hook to create orders based on user role.
 *
 * Automatically selects the correct API endpoint based on the authenticated user's role:
 * - 'client' role → uses client app endpoint (customer_id auto-fetched from JWT)
 * - 'seller' role → uses seller app endpoint (customer_id required in input)
 *
 * This hook respects React's Rules of Hooks by calling both API hooks unconditionally
 * and selecting the appropriate mutation at runtime.
 *
 * @example
 * ```tsx
 * // Client usage (customer_id not needed)
 * const { mutate, isPending } = useCreateOrder();
 * mutate(
 *   { items: [{ inventario_id: '123', cantidad: 2 }] },
 *   {
 *     onSuccess: (order) => console.log('Order created:', order.id),
 *     onError: (error) => console.error('Failed:', error)
 *   }
 * );
 *
 * // Seller usage (customer_id required)
 * const { mutate, isPending } = useCreateOrder();
 * mutate(
 *   {
 *     items: [{ inventario_id: '123', cantidad: 2 }],
 *     customer_id: 'customer-456',
 *     visit_id: 'visit-789' // optional
 *   },
 *   {
 *     onSuccess: (order) => console.log('Order created:', order.id),
 *     onError: (error) => console.error('Failed:', error)
 *   }
 * );
 * ```
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If seller role but customer_id is missing
 */
export const useCreateOrder = () => {
  const userRole = useAuthStore((state) => state.user?.role);

  // Call both hooks unconditionally (Rules of Hooks requirement)
  const clientMutation = useCreateOrderBffClientAppOrdersPost();
  const sellerMutation = useCreateOrderBffSellersAppOrdersPost();

  // Create a wrapper that validates and transforms input based on role
  const mutate = useCallback(
    (input: CreateOrderInput, options?: CreateOrderMutationOptions) => {
      // Validate authentication
      if (!userRole) {
        throw new Error('[useCreateOrder] User not authenticated. Please login to create orders.');
      }

      console.log(`[useCreateOrder] Creating order as ${userRole}`);

      if (userRole === 'seller') {
        // Seller role: customer_id is required
        if (!input.customer_id) {
          throw new Error('[useCreateOrder] customer_id is required for seller role');
        }

        // Use seller endpoint with customer_id and optional visit_id
        sellerMutation.mutate(
          {
            data: {
              customer_id: input.customer_id,
              items: input.items,
              visit_id: input.visit_id,
            },
          },
          options as any
        );
      } else {
        // Client role: customer_id auto-fetched from JWT
        clientMutation.mutate(
          {
            data: {
              items: input.items,
            },
          },
          options as any
        );
      }
    },
    [userRole, clientMutation, sellerMutation]
  );

  // Async version
  const mutateAsync = useCallback(
    async (input: CreateOrderInput): Promise<OrderCreateResponse> => {
      // Validate authentication
      if (!userRole) {
        throw new Error('[useCreateOrder] User not authenticated. Please login to create orders.');
      }

      console.log(`[useCreateOrder] Creating order as ${userRole}`);

      if (userRole === 'seller') {
        // Seller role: customer_id is required
        if (!input.customer_id) {
          throw new Error('[useCreateOrder] customer_id is required for seller role');
        }

        return sellerMutation.mutateAsync({
          data: {
            customer_id: input.customer_id,
            items: input.items,
            visit_id: input.visit_id,
          },
        });
      } else {
        // Client role
        return clientMutation.mutateAsync({
          data: {
            items: input.items,
          },
        });
      }
    },
    [userRole, clientMutation, sellerMutation]
  );

  // Return the selected mutation state with our wrapped mutate functions
  const selectedMutation = userRole === 'seller' ? sellerMutation : clientMutation;

  const reset = useCallback(() => {
    selectedMutation.reset();
  }, [selectedMutation]);

  return {
    mutate,
    mutateAsync,
    isPending: selectedMutation.isPending,
    isError: selectedMutation.isError,
    isSuccess: selectedMutation.isSuccess,
    error: selectedMutation.error,
    data: selectedMutation.data,
    reset,
  };
};
