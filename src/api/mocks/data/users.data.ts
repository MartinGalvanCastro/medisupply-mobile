/**
 * Centralized Mock User Data
 *
 * Realistic user data for authentication flows with Colombian medical supply context.
 * This data is used across all authentication mock handlers to ensure consistency.
 */

import type { LoginResponse, SignupRequest, SignupResponse } from '@/api/generated/models';

export interface MockUser {
  userId: string;
  email: string;
  password: string;
  name: string;
  userType: 'client' | 'seller' | 'admin';
  userGroups: string[];
  profile: {
    telefono: string;
    nombreInstitucion?: string;
    tipoInstitucion?: string;
    nit?: string;
    direccion?: string;
    ciudad?: string;
    pais?: string;
    representante?: string;
  };
  tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

/**
 * Mock Users Database
 * Simulates a database of registered users
 */
export const mockUsers: MockUser[] = [
  {
    userId: 'client-user-001',
    email: 'client@medisupply.com',
    password: 'Test1234!',
    name: 'Dr. Carlos Mendoza',
    userType: 'client',
    userGroups: ['client'],
    profile: {
      telefono: '+57 301 234 5678',
      nombreInstitucion: 'Hospital San Rafael de Bogotá',
      tipoInstitucion: 'hospital',
      nit: '900123456-7',
      direccion: 'Calle 45 #23-12, Chapinero',
      ciudad: 'Bogotá',
      pais: 'Colombia',
      representante: 'Dr. Carlos Mendoza',
    },
    tokens: {
      accessToken: 'mock-access-token-client-001',
      idToken: 'mock-id-token-client-001',
      refreshToken: 'mock-refresh-token-client-001',
      expiresIn: 3600,
    },
  },
  {
    userId: 'seller-user-001',
    email: 'seller@medisupply.com',
    password: 'Test1234!',
    name: 'María González',
    userType: 'seller',
    userGroups: ['seller'],
    profile: {
      telefono: '+57 310 987 6543',
      nombreInstitucion: 'MediSupply S.A.S',
      ciudad: 'Medellín',
      pais: 'Colombia',
      representante: 'María González',
    },
    tokens: {
      accessToken: 'mock-access-token-seller-001',
      idToken: 'mock-id-token-seller-001',
      refreshToken: 'mock-refresh-token-seller-001',
      expiresIn: 3600,
    },
  },
  {
    userId: 'admin-user-001',
    email: 'admin@medisupply.com',
    password: 'Admin1234!',
    name: 'Juan Pablo Ramírez',
    userType: 'admin',
    userGroups: ['admin', 'seller', 'client'],
    profile: {
      telefono: '+57 320 555 7890',
      nombreInstitucion: 'MediSupply S.A.S',
      ciudad: 'Bogotá',
      pais: 'Colombia',
      representante: 'Juan Pablo Ramírez',
    },
    tokens: {
      accessToken: 'mock-access-token-admin-001',
      idToken: 'mock-id-token-admin-001',
      refreshToken: 'mock-refresh-token-admin-001',
      expiresIn: 3600,
    },
  },
];

/**
 * Find user by email and password
 */
export const findUserByCredentials = (
  email: string,
  password: string
): MockUser | undefined => {
  return mockUsers.find(
    (user) => user.email === email && user.password === password
  );
};

/**
 * Find user by email only
 */
export const findUserByEmail = (email: string): MockUser | undefined => {
  return mockUsers.find((user) => user.email === email);
};

/**
 * Find user by user ID
 */
export const findUserById = (userId: string): MockUser | undefined => {
  return mockUsers.find((user) => user.userId === userId);
};

/**
 * Find user by refresh token
 */
export const findUserByRefreshToken = (
  refreshToken: string
): MockUser | undefined => {
  return mockUsers.find((user) => user.tokens.refreshToken === refreshToken);
};

/**
 * Convert MockUser to LoginResponse
 */
export const createLoginResponse = (user: MockUser): LoginResponse => {
  return {
    access_token: user.tokens.accessToken,
    id_token: user.tokens.idToken,
    refresh_token: user.tokens.refreshToken,
    token_type: 'Bearer',
    expires_in: user.tokens.expiresIn,
    user_groups: user.userGroups,
  };
};

/**
 * Create a new mock user from signup request
 */
export const createMockUserFromSignup = (
  request: SignupRequest
): { user: MockUser; response: SignupResponse } => {
  const userId = `client-user-${Date.now()}`;

  const newUser: MockUser = {
    userId,
    email: request.email,
    password: request.password,
    name: request.name,
    userType: 'client',
    userGroups: ['client'],
    profile: {
      telefono: request.telefono,
      nombreInstitucion: request.nombre_institucion,
      tipoInstitucion: request.tipo_institucion,
      nit: request.nit,
      direccion: request.direccion,
      ciudad: request.ciudad,
      pais: request.pais,
      representante: request.representante,
    },
    tokens: {
      accessToken: `mock-access-token-${userId}`,
      idToken: `mock-id-token-${userId}`,
      refreshToken: `mock-refresh-token-${userId}`,
      expiresIn: 3600,
    },
  };

  // Add to mock users array
  mockUsers.push(newUser);

  const response: SignupResponse = {
    user_id: userId,
    email: request.email,
    message: `Usuario creado exitosamente. Bienvenido a MediSupply, ${request.name}!`,
  };

  return { user: newUser, response };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, with at least one uppercase, one lowercase, one number, and one special char
  return password.length >= 8;
};
