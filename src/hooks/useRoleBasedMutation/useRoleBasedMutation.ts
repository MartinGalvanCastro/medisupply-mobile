import { useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UseMutationResult } from '@tanstack/react-query';

/**
 * Generic utility hook for role-based mutation selection.
 *
 * This pattern can be used to create role-based hooks that respect React's Rules of Hooks
 * by calling all mutation hooks unconditionally and selecting the appropriate one at runtime.
 *
 * @example
 * ```tsx
 * // Create a role-based hook for any API operation
 * export const useDeleteProduct = (options, queryClient) => {
 *   const clientMutation = useDeleteProductBffClientAppProductsDelete(options, queryClient);
 *   const sellerMutation = useDeleteProductBffSellersAppProductsDelete(options, queryClient);
 *
 *   return useRoleBasedMutation({
 *     clientMutation,
 *     sellerMutation,
 *     operationName: 'deleteProduct'
 *   });
 * };
 * ```
 *
 * @param config - Configuration object
 * @param config.clientMutation - Mutation hook result for client role
 * @param config.sellerMutation - Mutation hook result for seller role
 * @param config.operationName - Name of the operation (for logging/debugging)
 * @param config.defaultRole - Default role to use when role is invalid (default: 'client')
 * @param config.requireAuth - Whether to require authentication (default: true)
 * @returns The selected mutation result with validation wrapper
 */
export const useRoleBasedMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
>({
  clientMutation,
  sellerMutation,
  operationName = 'operation',
  defaultRole = 'client',
  requireAuth = true,
}: {
  clientMutation: UseMutationResult<TData, TError, TVariables, TContext>;
  sellerMutation: UseMutationResult<TData, TError, TVariables, TContext>;
  operationName?: string;
  defaultRole?: 'client' | 'seller';
  requireAuth?: boolean;
}): UseMutationResult<TData, TError, TVariables, TContext> => {
  // Get user role from auth store
  const userRole = useAuthStore((state) => state.user?.role);

  // Select the appropriate mutation based on role
  const selectedMutation = userRole === 'seller' ? sellerMutation : clientMutation;

  // Validate that user is authenticated and has a valid role
  const validateRole = useCallback(() => {
    if (requireAuth && !userRole) {
      throw new Error(
        `[${operationName}] User not authenticated. Please login to perform this operation.`,
      );
    }

    if (userRole && userRole !== 'client' && userRole !== 'seller') {
      console.warn(
        `[${operationName}] Unexpected user role: "${userRole}". Falling back to ${defaultRole} endpoint.`,
      );
    }

    console.log(`[${operationName}] Using ${userRole || defaultRole} endpoint`);
  }, [userRole, operationName, defaultRole, requireAuth]);

  // Wrap mutate to add validation
  const mutate = useCallback(
    (...args: Parameters<typeof selectedMutation.mutate>) => {
      validateRole();
      return selectedMutation.mutate(...args);
    },
    [selectedMutation.mutate, validateRole],
  );

  // Wrap mutateAsync to add validation
  const mutateAsync = useCallback(
    async (...args: Parameters<typeof selectedMutation.mutateAsync>) => {
      validateRole();
      return selectedMutation.mutateAsync(...args);
    },
    [selectedMutation.mutateAsync, validateRole],
  );

  // Return the selected mutation with wrapped mutate functions
  return {
    ...selectedMutation,
    mutate,
    mutateAsync,
  };
};

/**
 * Type helper for creating role-based mutation hooks
 *
 * @example
 * ```tsx
 * export const useUpdateInventory: RoleBasedMutationHook<
 *   InventoryResponse,
 *   HTTPValidationError,
 *   { data: InventoryUpdateInput }
 * > = (options, queryClient) => {
 *   const clientMutation = useUpdateInventoryBffClientAppInventoryPatch(options, queryClient);
 *   const sellerMutation = useUpdateInventoryBffSellersAppInventoryPatch(options, queryClient);
 *
 *   return useRoleBasedMutation({
 *     clientMutation,
 *     sellerMutation,
 *     operationName: 'updateInventory'
 *   });
 * };
 * ```
 */
export type RoleBasedMutationHook<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
> = (
  options?: { mutation?: any },
  queryClient?: any,
) => UseMutationResult<TData, TError, TVariables, TContext>;
