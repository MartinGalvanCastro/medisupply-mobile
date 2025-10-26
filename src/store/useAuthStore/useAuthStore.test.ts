import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from './useAuthStore';
import type { User, AuthTokens } from './types';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAuthStore.getState().logout();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  describe('setUser', () => {
    it('should set user and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore());
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      act(() => {
        result.current.setUser(user);
      });

      expect(result.current.user).toEqual(user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set user to null and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setTokens', () => {
    it('should set tokens and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore());
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      act(() => {
        result.current.setTokens(tokens);
      });

      expect(result.current.tokens).toEqual(tokens);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set tokens to null and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTokens(null);
      });

      expect(result.current.tokens).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login user with tokens', () => {
      const { result } = renderHook(() => useAuthStore());
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      };
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      act(() => {
        result.current.login(user, tokens);
      });

      expect(result.current.user).toEqual(user);
      expect(result.current.tokens).toEqual(tokens);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear user and tokens', () => {
      const { result } = renderHook(() => useAuthStore());
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      act(() => {
        result.current.login(user, tokens);
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user properties', () => {
      const { result } = renderHook(() => useAuthStore());
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      act(() => {
        result.current.setUser(user);
        result.current.updateUser({ name: 'Updated Name' });
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.email).toBe('test@example.com');
    });

    it('should not update when user is null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updateUser({ name: 'Updated Name' });
      });

      expect(result.current.user).toBeNull();
    });

    it('should update multiple properties', () => {
      const { result } = renderHook(() => useAuthStore());
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      act(() => {
        result.current.setUser(user);
        result.current.updateUser({
          name: 'Updated Name',
          role: 'user',
        });
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.role).toBe('user');
    });
  });

  describe('updateTokens', () => {
    it('should update token properties', () => {
      const { result } = renderHook(() => useAuthStore());
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      act(() => {
        result.current.setTokens(tokens);
        result.current.updateTokens({ accessToken: 'new-access-456' });
      });

      expect(result.current.tokens?.accessToken).toBe('new-access-456');
      expect(result.current.tokens?.refreshToken).toBe('refresh-123');
    });

    it('should not update when tokens is null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updateTokens({ accessToken: 'new-access' });
      });

      expect(result.current.tokens).toBeNull();
    });

    it('should update multiple token properties', () => {
      const { result } = renderHook(() => useAuthStore());
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      act(() => {
        result.current.setTokens(tokens);
        result.current.updateTokens({
          accessToken: 'new-access-456',
          expiresIn: 7200,
        });
      });

      expect(result.current.tokens?.accessToken).toBe('new-access-456');
      expect(result.current.tokens?.expiresIn).toBe(7200);
      expect(result.current.tokens?.refreshToken).toBe('refresh-123');
    });
  });
});
