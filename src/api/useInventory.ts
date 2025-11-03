import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { customInstance } from '@/api/client';
import type { MockInventory } from '@/api/mocks/inventory';

interface UseInventoryParams {
  search?: string;
  sku?: string;
  warehouseId?: string;
}

interface UseInventoryReturn {
  data: MockInventory[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useInventory = (params?: UseInventoryParams): UseInventoryReturn => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'client';

  // Determine endpoint based on user role
  const endpoint =
    userRole === 'seller'
      ? '/bff/sellers-app/inventories'
      : '/bff/client-app/inventories';

  const { data, isLoading, error, refetch } = useQuery<MockInventory[], Error>({
    queryKey: ['inventory', userRole, params],
    queryFn: async () => {
      const response = await customInstance<MockInventory[]>({
        url: endpoint,
        method: 'GET',
        params: {
          search: params?.search,
          sku: params?.sku,
          warehouse_id: params?.warehouseId,
        },
      });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
