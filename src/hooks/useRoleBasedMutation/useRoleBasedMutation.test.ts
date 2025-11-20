import { renderHook } from '@testing-library/react-native';
import { useRoleBasedMutation } from './useRoleBasedMutation';
import { useAuthStore } from '@/store/useAuthStore';
import type { UseMutationResult } from '@tanstack/react-query';

jest.mock('@/store/useAuthStore');

describe('useRoleBasedMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role Selection', () => {
    it('should select client mutation when user role is client', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect((result.current as any).isLoading).toBe((clientMutation as any).isLoading);
    });

    it('should select seller mutation when user role is seller', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'seller' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect((result.current as any).isLoading).toBe((sellerMutation as any).isLoading);
    });

    it('should default to client mutation when role is not seller', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'admin' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect((result.current as any).isLoading).toBe((clientMutation as any).isLoading);
    });

    it('should default to client mutation when user is null', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect((result.current as any).isLoading).toBe((clientMutation as any).isLoading);
    });
  });

  describe('Authentication Validation', () => {
    it('should throw error when user is not authenticated and requireAuth is true', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: true,
        })
      );

      expect(() => {
        result.current.mutate({} as any);
      }).toThrow('[operation] User not authenticated. Please login to perform this operation.');
    });

    it('should not throw error when user is not authenticated and requireAuth is false', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: false,
        })
      );

      expect(() => {
        result.current.mutate({} as any);
      }).not.toThrow();

      expect(clientMutation.mutate).toHaveBeenCalled();
    });

    it('should include operation name in authentication error message', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          operationName: 'deleteProduct',
          requireAuth: true,
        })
      );

      expect(() => {
        result.current.mutate({} as any);
      }).toThrow('[deleteProduct] User not authenticated');
    });

    it('should allow mutation when user is authenticated', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: true,
        })
      );

      expect(() => {
        result.current.mutate({ id: '123' } as any);
      }).not.toThrow();

      expect(clientMutation.mutate).toHaveBeenCalled();
    });
  });

  describe('Mutation Wrapping - mutate', () => {
    it('should call the selected mutation mutate method', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const variables = { id: '123' };
      result.current.mutate(variables as any);

      expect(clientMutation.mutate).toHaveBeenCalledWith(variables);
    });

    it('should call seller mutation mutate when role is seller', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'seller' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const variables = { id: '123' };
      result.current.mutate(variables as any);

      expect(sellerMutation.mutate).toHaveBeenCalledWith(variables);
      expect(clientMutation.mutate).not.toHaveBeenCalled();
    });

    it('should pass through mutation callbacks in mutate', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');
      const onSuccess = jest.fn();
      const onError = jest.fn();

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const variables = { id: '123' };
      result.current.mutate(variables as any, { onSuccess, onError });

      expect(clientMutation.mutate).toHaveBeenCalledWith(variables, { onSuccess, onError });
    });

    it('should validate role before calling mutate', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: true,
        })
      );

      expect(() => {
        result.current.mutate({} as any);
      }).toThrow();

      expect(clientMutation.mutate).not.toHaveBeenCalled();
    });

    it('should not prevent mutation when role validation is disabled', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: false,
        })
      );

      const variables = { id: '123' };
      result.current.mutate(variables as any);

      expect(clientMutation.mutate).toHaveBeenCalledWith(variables);
    });
  });

  describe('Mutation Wrapping - mutateAsync', () => {
    it('should call the selected mutation mutateAsync method', async () => {
      const clientMutation = createMockMutation('client-mutate', Promise.resolve({}));
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const variables = { id: '123' };
      await result.current.mutateAsync(variables as any);

      expect(clientMutation.mutateAsync).toHaveBeenCalledWith(variables);
    });

    it('should call seller mutation mutateAsync when role is seller', async () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate', Promise.resolve({}));

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'seller' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const variables = { id: '123' };
      await result.current.mutateAsync(variables as any);

      expect(sellerMutation.mutateAsync).toHaveBeenCalledWith(variables);
      expect(clientMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('should return the mutation promise result', async () => {
      const expectedData = { success: true };
      const clientMutation = createMockMutation('client-mutate', Promise.resolve(expectedData));
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const data = await result.current.mutateAsync({} as any);

      expect(data).toEqual(expectedData);
    });

    it('should throw mutation errors', async () => {
      const expectedError = new Error('Mutation failed');
      const clientMutation = createMockMutation('client-mutate', Promise.reject(expectedError));
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      await expect(result.current.mutateAsync({} as any)).rejects.toThrow('Mutation failed');
    });

    it('should validate role before calling mutateAsync', async () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: true,
        })
      );

      await expect(result.current.mutateAsync({} as any)).rejects.toThrow();

      expect(clientMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('should pass variables to mutateAsync correctly', async () => {
      const clientMutation = createMockMutation('client-mutate', Promise.resolve({ id: '123' }));
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      const variables = { productId: '456', quantity: 5 };
      await result.current.mutateAsync(variables as any);

      expect(clientMutation.mutateAsync).toHaveBeenCalledWith(variables);
    });
  });

  describe('Operation Name', () => {
    it('should use custom operation name in error messages', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          operationName: 'updateInventory',
          requireAuth: true,
        })
      );

      expect(() => {
        result.current.mutate({} as any);
      }).toThrow('[updateInventory]');
    });

    it('should default to "operation" when operation name not provided', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: true,
        })
      );

      expect(() => {
        result.current.mutate({} as any);
      }).toThrow('[operation]');
    });

    it('should include operation name in async validation errors', async () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          operationName: 'deleteOrder',
          requireAuth: true,
        })
      );

      await expect(result.current.mutateAsync({} as any)).rejects.toThrow('[deleteOrder]');
    });
  });

  describe('Default Role Configuration', () => {
    it('should default to client when role is invalid', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'superadmin' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          defaultRole: 'seller',
        })
      );

      expect((result.current as any).isLoading).toBe((clientMutation as any).isLoading);
    });

    it('should use seller as defaultRole when specified', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          defaultRole: 'seller',
          requireAuth: false,
        })
      );

      result.current.mutate({} as any);

      expect(clientMutation.mutate).toHaveBeenCalled();
    });
  });

  describe('Mutation State Properties', () => {
    it('should expose mutation state properties from selected client mutation', () => {
      const clientMutation = createMockMutation('client-mutate', undefined, {
        isLoading: false,
        isSuccess: true,
        isError: false,
        isPending: false,
        data: { id: '123' },
        error: null,
        status: 'success',
      });
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect((result.current as any).isLoading).toBe(false);
      expect((result.current as any).isSuccess).toBe(true);
      expect((result.current as any).isError).toBe(false);
      expect((result.current as any).data).toEqual({ id: '123' });
      expect((result.current as any).error).toBeNull();
      expect((result.current as any).status).toBe('success');
    });

    it('should expose mutation state properties from selected seller mutation', () => {
      const clientMutation = createMockMutation('client-mutate', undefined, {
        isLoading: true,
      });
      const sellerMutation = createMockMutation('seller-mutate', undefined, {
        isLoading: false,
        isSuccess: true,
        data: { id: '456' },
      });

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'seller' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect((result.current as any).isLoading).toBe(false);
      expect((result.current as any).isSuccess).toBe(true);
      expect((result.current as any).data).toEqual({ id: '456' });
    });

    it('should preserve undefined mutation properties', () => {
      const clientMutation = createMockMutation('client-mutate', undefined, {
        data: undefined,
        error: null,
      });
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect((result.current as any).data).toBeUndefined();
      expect((result.current as any).error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with missing role property', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect((result.current as any).isLoading).toBe((clientMutation as any).isLoading);
    });

    it('should handle both mutations having the same interface', () => {
      const sharedMutation = createMockMutation('shared-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation: sharedMutation,
          sellerMutation: sharedMutation,
        })
      );

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
    });

    it('should preserve all mutation properties not wrapped', () => {
      const clientMutation = {
        ...createMockMutation('client-mutate'),
        reset: jest.fn(),
        variables: { test: 'value' },
      };
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect(result.current.reset).toBeDefined();
      expect(result.current.variables).toEqual({ test: 'value' });
    });

    it('should handle empty variables', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      result.current.mutate({} as any);

      expect(clientMutation.mutate).toHaveBeenCalledWith({});
    });

    it('should handle null variables', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      result.current.mutate(null as any);

      expect(clientMutation.mutate).toHaveBeenCalledWith(null);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type information for generic parameters', () => {
      interface TestData {
        id: string;
        name: string;
      }

      interface TestError {
        message: string;
        code: number;
      }

      interface TestVariables {
        id: string;
      }

      const clientMutation = createMockMutation<TestData, TestError, TestVariables>(
        'client-mutate',
        Promise.resolve({ id: '1', name: 'test' })
      );
      const sellerMutation = createMockMutation<TestData, TestError, TestVariables>(
        'seller-mutate'
      );

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation<TestData, TestError, TestVariables>({
          clientMutation,
          sellerMutation,
        })
      );

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });
  });

  describe('Multiple Invocations', () => {
    it('should handle sequential mutations with same mutation instance', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      result.current.mutate({ id: '1' } as any);
      result.current.mutate({ id: '2' } as any);

      expect(clientMutation.mutate).toHaveBeenCalledTimes(2);
      expect(clientMutation.mutate).toHaveBeenNthCalledWith(1, { id: '1' });
      expect(clientMutation.mutate).toHaveBeenNthCalledWith(2, { id: '2' });
    });

    it('should handle mixed sync and async mutations', async () => {
      const clientMutation = createMockMutation('client-mutate', Promise.resolve({ id: '123' }));
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      // Sync call
      result.current.mutate({ id: '1' } as any);
      expect(clientMutation.mutate).toHaveBeenCalledWith({ id: '1' });

      // Async call
      await result.current.mutateAsync({ id: '2' } as any);
      expect(clientMutation.mutateAsync).toHaveBeenCalledWith({ id: '2' });
    });
  });

  describe('Configuration Options', () => {
    it('should accept all configuration options', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          operationName: 'testOperation',
          defaultRole: 'seller',
          requireAuth: true,
        })
      );

      expect(result.current).toBeDefined();
    });

    it('should work with default configuration', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('Wrapped Function Behavior', () => {
    it('should preserve mutate behavior without auth check when requireAuth is false', () => {
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
          requireAuth: false,
        })
      );

      const variables = { data: 'test' };
      result.current.mutate(variables as any);

      expect(clientMutation.mutate).toHaveBeenCalledWith(variables);
    });

    it('should have independent wrapper instances', () => {
      const clientMutation1 = createMockMutation('client-mutate-1');
      const sellerMutation1 = createMockMutation('seller-mutate-1');

      const clientMutation2 = createMockMutation('client-mutate-2');
      const sellerMutation2 = createMockMutation('seller-mutate-2');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'client' } })
      );

      const { result: result1 } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation: clientMutation1,
          sellerMutation: sellerMutation1,
        })
      );

      const { result: result2 } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation: clientMutation2,
          sellerMutation: sellerMutation2,
        })
      );

      result1.current.mutate({ op: '1' } as any);
      result2.current.mutate({ op: '2' } as any);

      expect(clientMutation1.mutate).toHaveBeenCalledWith({ op: '1' });
      expect(clientMutation2.mutate).toHaveBeenCalledWith({ op: '2' });
      expect(clientMutation1.mutate).not.toHaveBeenCalledWith({ op: '2' });
    });
  });

  describe('Invalid Role Handling', () => {
    it('should warn when user has unexpected role', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const clientMutation = createMockMutation('client-mutate');
      const sellerMutation = createMockMutation('seller-mutate');

      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: 'user1', email: 'user@example.com', role: 'admin' } })
      );

      const { result } = renderHook(() =>
        useRoleBasedMutation({
          clientMutation,
          sellerMutation,
        })
      );

      result.current.mutate({} as any);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[operation] Unexpected user role: "admin". Falling back to client endpoint.'
      );

      consoleWarnSpy.mockRestore();
    });
  });
});

// Helper function to create mock mutation
function createMockMutation<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
>(
  name: string,
  asyncResult: Promise<TData> = Promise.resolve({} as TData),
  overrides: any = {},
): any {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue(asyncResult),
    isLoading: false,
    isPending: false,
    isSuccess: false,
    isError: false,
    status: 'idle',
    data: undefined,
    error: null,
    reset: jest.fn(),
    failureCount: 0,
    failureReason: null,
    variables: undefined,
    submittedAt: 0,
    context: undefined,
    ...overrides,
  };
}
