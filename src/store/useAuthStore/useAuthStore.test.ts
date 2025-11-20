import { useAuthStore } from './useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import type { User, AuthTokens } from './types';

// Mock the cartStore
jest.mock('@/store/useCartStore');

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the auth store state before each test
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });

    // Setup default mock for useCartStore
    const mockClearCart = jest.fn();
    (useCartStore.getState as jest.Mock).mockReturnValue({
      clearCart: mockClearCart,
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null user and tokens, and isAuthenticated as false', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and update isAuthenticated to true', () => {
      const mockUser = createMockUser();

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set user to null and update isAuthenticated to false', () => {
      // First set a user
      useAuthStore.getState().setUser(createMockUser());

      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      // Then clear the user
      useAuthStore.getState().setUser(null);

      state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should update user properties correctly', () => {
      const user1 = createMockUser('user1', 'user1@example.com', 'User One');
      const user2 = createMockUser('user2', 'user2@example.com', 'User Two');

      useAuthStore.getState().setUser(user1);

      let state = useAuthStore.getState();
      expect(state.user?.id).toBe('user1');
      expect(state.user?.email).toBe('user1@example.com');

      useAuthStore.getState().setUser(user2);

      state = useAuthStore.getState();
      expect(state.user?.id).toBe('user2');
      expect(state.user?.email).toBe('user2@example.com');
    });

    it('should preserve user profile data', () => {
      const userWithProfile = {
        id: 'user1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin',
        profile: {
          telefono: '1234567890',
          nombreInstitucion: 'Test Institution',
          tipoInstitucion: 'Hospital',
          nit: 'NIT123',
          direccion: 'Test Address',
          ciudad: 'Test City',
          pais: 'Test Country',
          representante: 'Test Rep',
        },
      };

      useAuthStore.getState().setUser(userWithProfile);

      const state = useAuthStore.getState();
      expect(state.user?.profile).toEqual(userWithProfile.profile);
      expect(state.user?.profile?.nombreInstitucion).toBe('Test Institution');
    });
  });

  describe('setTokens', () => {
    it('should set tokens and update isAuthenticated to true', () => {
      const mockTokens = createMockTokens();

      useAuthStore.getState().setTokens(mockTokens);

      const state = useAuthStore.getState();
      expect(state.tokens).toEqual(mockTokens);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set tokens to null and update isAuthenticated to false', () => {
      // First set tokens
      useAuthStore.getState().setTokens(createMockTokens());

      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      // Then clear tokens
      useAuthStore.getState().setTokens(null);

      state = useAuthStore.getState();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should update tokens correctly', () => {
      const tokens1 = createMockTokens(
        'access-token-1',
        'id-token-1',
        'refresh-token-1'
      );
      const tokens2 = createMockTokens(
        'access-token-2',
        'id-token-2',
        'refresh-token-2'
      );

      useAuthStore.getState().setTokens(tokens1);

      let state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('access-token-1');
      expect(state.tokens?.idToken).toBe('id-token-1');

      useAuthStore.getState().setTokens(tokens2);

      state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('access-token-2');
      expect(state.tokens?.idToken).toBe('id-token-2');
    });

    it('should preserve all token fields', () => {
      const mockTokens: AuthTokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      useAuthStore.getState().setTokens(mockTokens);

      const state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('access-token');
      expect(state.tokens?.idToken).toBe('id-token');
      expect(state.tokens?.refreshToken).toBe('refresh-token');
      expect(state.tokens?.expiresIn).toBe(3600);
      expect(state.tokens?.tokenType).toBe('Bearer');
    });
  });

  describe('login', () => {
    it('should set both user and tokens and set isAuthenticated to true', () => {
      const mockUser = createMockUser();
      const mockTokens = createMockTokens();

      useAuthStore.getState().login(mockUser, mockTokens);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should replace existing user and tokens on subsequent login', () => {
      const user1 = createMockUser('user1', 'user1@example.com');
      const tokens1 = createMockTokens('access-1', 'id-1');

      const user2 = createMockUser('user2', 'user2@example.com');
      const tokens2 = createMockTokens('access-2', 'id-2');

      useAuthStore.getState().login(user1, tokens1);

      let state = useAuthStore.getState();
      expect(state.user?.id).toBe('user1');
      expect(state.tokens?.accessToken).toBe('access-1');

      useAuthStore.getState().login(user2, tokens2);

      state = useAuthStore.getState();
      expect(state.user?.id).toBe('user2');
      expect(state.tokens?.accessToken).toBe('access-2');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should maintain complete user profile on login', () => {
      const userWithProfile = {
        id: 'user1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'doctor',
        groups: ['group1', 'group2'],
        profile: {
          telefono: '1234567890',
          nombreInstitucion: 'Test Institution',
          tipoInstitucion: 'Clinic',
        },
      };

      const mockTokens = createMockTokens();

      useAuthStore.getState().login(userWithProfile, mockTokens);

      const state = useAuthStore.getState();
      expect(state.user?.role).toBe('doctor');
      expect(state.user?.groups).toEqual(['group1', 'group2']);
      expect(state.user?.profile?.nombreInstitucion).toBe('Test Institution');
    });
  });

  describe('logout', () => {
    it('should clear user and tokens and set isAuthenticated to false', () => {
      // First login
      useAuthStore.getState().login(createMockUser(), createMockTokens());

      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      // Then logout
      useAuthStore.getState().logout();

      state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear cart when logging out', () => {
      const mockClearCart = jest.fn();
      (useCartStore.getState as jest.Mock).mockReturnValue({
        clearCart: mockClearCart,
      });

      // First login
      useAuthStore.getState().login(createMockUser(), createMockTokens());

      // Then logout
      useAuthStore.getState().logout();

      expect(mockClearCart).toHaveBeenCalled();
    });

    it('should be safe to logout when already logged out', () => {
      // Should not throw error
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should reset to initial state on logout', () => {
      const user = createMockUser();
      const tokens = createMockTokens();

      useAuthStore.getState().login(user, tokens);

      useAuthStore.getState().logout();

      // Verify state matches initial state
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user properties', () => {
      const mockUser = createMockUser('user1', 'user@example.com', 'John Doe');

      useAuthStore.getState().setUser(mockUser);

      useAuthStore.getState().updateUser({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('Jane Doe');
      expect(state.user?.email).toBe('jane@example.com');
      expect(state.user?.id).toBe('user1'); // Other properties should remain
    });

    it('should update user role', () => {
      const mockUser = createMockUser();

      useAuthStore.getState().setUser(mockUser);

      useAuthStore.getState().updateUser({ role: 'admin' });

      const state = useAuthStore.getState();
      expect(state.user?.role).toBe('admin');
    });

    it('should update user groups', () => {
      const mockUser = createMockUser();

      useAuthStore.getState().setUser(mockUser);

      useAuthStore.getState().updateUser({
        groups: ['group1', 'group2', 'group3'],
      });

      const state = useAuthStore.getState();
      expect(state.user?.groups).toEqual(['group1', 'group2', 'group3']);
    });

    it('should update user profile', () => {
      const userWithoutProfile = createMockUser();

      useAuthStore.getState().setUser(userWithoutProfile);

      useAuthStore.getState().updateUser({
        profile: {
          telefono: '9876543210',
          nombreInstitucion: 'New Institution',
          tipoInstitucion: 'Pharmacy',
        },
      });

      const state = useAuthStore.getState();
      expect(state.user?.profile?.telefono).toBe('9876543210');
      expect(state.user?.profile?.nombreInstitucion).toBe('New Institution');
    });

    it('should not update user when user is null', () => {
      useAuthStore.getState().updateUser({ name: 'Test Name' });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should merge partial updates with existing user data', () => {
      const mockUser = {
        id: 'user1',
        email: 'user@example.com',
        name: 'Original Name',
        role: 'doctor',
        groups: ['group1'],
      };

      useAuthStore.getState().setUser(mockUser);

      useAuthStore.getState().updateUser({ name: 'Updated Name' });

      const state = useAuthStore.getState();
      expect(state.user?.id).toBe('user1');
      expect(state.user?.email).toBe('user@example.com');
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.role).toBe('doctor');
      expect(state.user?.groups).toEqual(['group1']);
    });

    it('should handle multiple sequential updates', () => {
      const mockUser = createMockUser();

      useAuthStore.getState().setUser(mockUser);

      useAuthStore.getState().updateUser({ name: 'New Name' });

      let state = useAuthStore.getState();
      expect(state.user?.name).toBe('New Name');

      useAuthStore.getState().updateUser({ email: 'newemail@example.com' });

      state = useAuthStore.getState();
      expect(state.user?.email).toBe('newemail@example.com');
      expect(state.user?.name).toBe('New Name'); // Previous update should persist
    });
  });

  describe('updateTokens', () => {
    it('should update token properties', () => {
      const mockTokens = createMockTokens(
        'old-access-token',
        'old-id-token',
        'old-refresh-token'
      );

      useAuthStore.getState().setTokens(mockTokens);

      useAuthStore.getState().updateTokens({
        accessToken: 'new-access-token',
        idToken: 'new-id-token',
      });

      const state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('new-access-token');
      expect(state.tokens?.idToken).toBe('new-id-token');
      expect(state.tokens?.refreshToken).toBe('old-refresh-token'); // Other properties should remain
    });

    it('should update token expiration', () => {
      const mockTokens = createMockTokens();

      useAuthStore.getState().setTokens(mockTokens);

      useAuthStore.getState().updateTokens({ expiresIn: 7200 });

      const state = useAuthStore.getState();
      expect(state.tokens?.expiresIn).toBe(7200);
    });

    it('should update refresh token', () => {
      const mockTokens = createMockTokens();

      useAuthStore.getState().setTokens(mockTokens);

      useAuthStore.getState().updateTokens({ refreshToken: 'new-refresh-token' });

      const state = useAuthStore.getState();
      expect(state.tokens?.refreshToken).toBe('new-refresh-token');
    });

    it('should not update tokens when tokens are null', () => {
      useAuthStore.getState().updateTokens({ accessToken: 'new-token' });

      const state = useAuthStore.getState();
      expect(state.tokens).toBeNull();
    });

    it('should merge partial token updates with existing tokens', () => {
      const mockTokens: AuthTokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      useAuthStore.getState().setTokens(mockTokens);

      useAuthStore.getState().updateTokens({ accessToken: 'new-access-token' });

      const state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('new-access-token');
      expect(state.tokens?.idToken).toBe('id-token');
      expect(state.tokens?.refreshToken).toBe('refresh-token');
      expect(state.tokens?.expiresIn).toBe(3600);
      expect(state.tokens?.tokenType).toBe('Bearer');
    });

    it('should handle multiple sequential token updates', () => {
      const mockTokens = createMockTokens();

      useAuthStore.getState().setTokens(mockTokens);

      useAuthStore.getState().updateTokens({ accessToken: 'updated-access-1' });

      let state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('updated-access-1');

      useAuthStore.getState().updateTokens({ idToken: 'updated-id-1' });

      state = useAuthStore.getState();
      expect(state.tokens?.idToken).toBe('updated-id-1');
      expect(state.tokens?.accessToken).toBe('updated-access-1'); // Previous update should persist
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency when setting user and tokens separately', () => {
      const mockUser = createMockUser();
      const mockTokens = createMockTokens();

      useAuthStore.getState().setUser(mockUser);

      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      useAuthStore.getState().setTokens(mockTokens);

      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.tokens).toEqual(mockTokens);
    });

    it('should handle login after logout correctly', () => {
      const user1 = createMockUser('user1');
      const tokens1 = createMockTokens();

      // First login
      useAuthStore.getState().login(user1, tokens1);

      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      // Logout
      useAuthStore.getState().logout();

      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);

      // Login again with different user
      const user2 = createMockUser('user2');
      const tokens2 = createMockTokens('different-token', 'different-id');

      useAuthStore.getState().login(user2, tokens2);

      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.id).toBe('user2');
      expect(state.tokens?.accessToken).toBe('different-token');
    });

    it('should maintain isAuthenticated state based on user and tokens', () => {
      let state = useAuthStore.getState();

      // Initially not authenticated
      expect(state.isAuthenticated).toBe(false);

      // Set user makes authenticated
      useAuthStore.getState().setUser(createMockUser());
      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      // Clear user makes not authenticated
      useAuthStore.getState().setUser(null);
      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);

      // Set tokens makes authenticated
      useAuthStore.getState().setTokens(createMockTokens());
      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);

      // Clear tokens makes not authenticated
      useAuthStore.getState().setTokens(null);
      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle full authentication lifecycle', () => {
      const mockClearCart = jest.fn();
      (useCartStore.getState as jest.Mock).mockReturnValue({
        clearCart: mockClearCart,
      });

      let state = useAuthStore.getState();

      // Initial state
      expect(state.isAuthenticated).toBe(false);

      // Login
      const user = createMockUser();
      const tokens = createMockTokens();

      useAuthStore.getState().login(user, tokens);

      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(user);
      expect(state.tokens).toEqual(tokens);

      // Update user info
      useAuthStore.getState().updateUser({ name: 'Updated User' });

      state = useAuthStore.getState();
      expect(state.user?.name).toBe('Updated User');

      // Refresh tokens
      useAuthStore.getState().updateTokens({
        accessToken: 'new-access-token',
        expiresIn: 7200,
      });

      state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('new-access-token');
      expect(state.tokens?.expiresIn).toBe(7200);

      // Logout
      useAuthStore.getState().logout();

      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(mockClearCart).toHaveBeenCalled();
    });

    it('should handle quick user swaps (logout and login new user)', () => {
      const mockClearCart = jest.fn();
      (useCartStore.getState as jest.Mock).mockReturnValue({
        clearCart: mockClearCart,
      });

      const user1 = createMockUser('user1', 'user1@example.com', 'User One');
      const user2 = createMockUser('user2', 'user2@example.com', 'User Two');

      // Login first user
      useAuthStore.getState().login(user1, createMockTokens('token1', 'id1'));

      let state = useAuthStore.getState();
      expect(state.user?.id).toBe('user1');

      // Logout first user
      useAuthStore.getState().logout();

      // Login second user immediately
      useAuthStore.getState().login(user2, createMockTokens('token2', 'id2'));

      state = useAuthStore.getState();
      expect(state.user?.id).toBe('user2');
      expect(state.user?.email).toBe('user2@example.com');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle token refresh during session', () => {
      const user = createMockUser();
      const tokens = createMockTokens(
        'initial-token',
        'initial-id',
        'initial-refresh'
      );

      useAuthStore.getState().login(user, tokens);

      // Simulate token refresh after some time
      useAuthStore.getState().updateTokens({
        accessToken: 'refreshed-token',
        idToken: 'refreshed-id',
        expiresIn: 7200,
      });

      const state = useAuthStore.getState();
      expect(state.tokens?.accessToken).toBe('refreshed-token');
      expect(state.tokens?.idToken).toBe('refreshed-id');
      expect(state.tokens?.refreshToken).toBe('initial-refresh'); // Refresh token may not change
      expect(state.user).toEqual(user); // User should remain unchanged
    });

    it('should handle user profile updates during session', () => {
      const user = createMockUser();

      useAuthStore.getState().setUser(user);

      // Update user profile information
      useAuthStore.getState().updateUser({
        profile: {
          telefono: '1234567890',
          nombreInstitucion: 'Updated Institution',
          tipoInstitucion: 'Hospital',
          nit: 'NIT123',
          direccion: 'New Address',
          ciudad: 'New City',
          pais: 'New Country',
          representante: 'New Rep',
        },
      });

      const state = useAuthStore.getState();
      expect(state.user?.profile?.nombreInstitucion).toBe('Updated Institution');
      expect(state.user?.profile?.ciudad).toBe('New City');
      expect(state.user?.id).toBe(user.id); // User ID should remain unchanged
    });
  });
});

// Helper functions
function createMockUser(
  id: string = 'test-user-id',
  email: string = 'test@example.com',
  name: string = 'Test User',
  role: string = 'user',
  groups: string[] = []
): User {
  return {
    id,
    email,
    name,
    role,
    groups: groups.length > 0 ? groups : undefined,
  };
}

function createMockTokens(
  accessToken: string = 'test-access-token',
  idToken: string = 'test-id-token',
  refreshToken: string = 'test-refresh-token',
  expiresIn: number = 3600
): AuthTokens {
  return {
    accessToken,
    idToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer',
  };
}
