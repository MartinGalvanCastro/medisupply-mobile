import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAuthStore.getState().logout();
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user and update isAuthenticated', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set token', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setToken('test-token-123');
    });

    expect(result.current.token).toBe('test-token-123');
  });

  it('should logout and clear all state', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    // First set user and token
    act(() => {
      result.current.setUser(mockUser);
      result.current.setToken('test-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set isAuthenticated to false when user is null', () => {
    const { result } = renderHook(() => useAuthStore());

    // First set a user
    act(() => {
      result.current.setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then set user to null
    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should persist state across multiple hook calls', () => {
    const { result: result1 } = renderHook(() => useAuthStore());
    const { result: result2 } = renderHook(() => useAuthStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    act(() => {
      result1.current.setUser(mockUser);
    });

    expect(result2.current.user).toEqual(mockUser);
    expect(result2.current.isAuthenticated).toBe(true);
  });
});
