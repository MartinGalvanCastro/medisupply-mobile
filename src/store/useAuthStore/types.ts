export type User = {
  /**
   * User ID
   */
  id: string;

  /**
   * User email address
   */
  email: string;

  /**
   * User display name
   */
  name: string;
};

export type AuthState = {
  /**
   * Current authenticated user
   */
  user: User | null;

  /**
   * Authentication token
   */
  token: string | null;

  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Set the current user
   */
  setUser: (user: User | null) => void;

  /**
   * Set the authentication token
   */
  setToken: (token: string | null) => void;

  /**
   * Logout and clear all auth state
   */
  logout: () => void;
};
