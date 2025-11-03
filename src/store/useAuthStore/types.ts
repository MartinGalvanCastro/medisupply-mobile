export interface UserProfile {
  telefono?: string;
  nombreInstitucion?: string;
  tipoInstitucion?: string;
  nit?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  representante?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  groups?: string[];
  profile?: UserProfile;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateTokens: (tokens: Partial<AuthTokens>) => void;
}

export type AuthStore = AuthState & AuthActions;
