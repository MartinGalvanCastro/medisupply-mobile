/**
 * Authentication Mock Handlers
 *
 * Custom Axios interceptor handlers for authentication endpoints.
 * Provides realistic authentication flows with validation and error handling.
 */

import type { AxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetMeAuthMeGet200,
} from '@/api/generated/models';

import type { MockHandler, MockResponse } from './types';
import { mockConfig } from '../config';
import {
  findUserByCredentials,
  findUserByEmail,
  findUserByRefreshToken,
  createLoginResponse,
  createMockUserFromSignup,
  isValidEmail,
  isValidPassword,
  mockUsers,
} from '../data/users.data';

/**
 * Simulate network delay
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * POST /auth/login
 * Authenticate user with email and password
 */
const loginHandler: MockHandler = {
  method: 'POST',
  endpoint: '/auth/login',
  description: 'Authenticate user with email and password',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse<LoginResponse>> => {
    // config.data can be a string or object, handle both cases
    const body = (typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data || {}) as LoginRequest;

    // Scenario: Error response
    if (mockConfig.scenarios.authentication === 'error') {
      return {
        status: 500,
        data: {
          detail: 'Internal server error',
          status: 500,
        } as any,
      };
    }

    // Validate request body
    if (!body.email || !body.password) {
      return {
        status: 422,
        data: {
          detail: [
            {
              loc: ['body', !body.email ? 'email' : 'password'],
              msg: 'field required',
              type: 'value_error.missing',
            },
          ],
        } as any,
      };
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return {
        status: 400,
        data: {
          detail: 'Invalid email format',
          status: 400,
        } as any,
      };
    }

    // Find user by credentials
    console.log('[Mock Handler] POST /auth/login - Attempting login for:', body.email);
    const user = findUserByCredentials(body.email, body.password);

    if (!user) {
      console.log('[Mock Handler] POST /auth/login - User not found or invalid password');
      return {
        status: 401,
        data: {
          detail: 'Invalid email or password',
          status: 401,
        } as any,
      };
    }

    console.log('[Mock Handler] POST /auth/login - Login successful for:', user.email, '- userType:', user.userType);
    console.log('[Mock Handler] POST /auth/login - Returning tokens:', {
      accessToken: user.tokens.accessToken,
      idToken: user.tokens.idToken,
    });

    // Scenario: Slow response
    if (mockConfig.scenarios.authentication === 'slow') {
      await delay(3000);
    }

    // Success response
    const response = createLoginResponse(user);
    return {
      status: 200,
      data: response,
    };
  },
};

/**
 * POST /auth/signup
 * Register a new client user
 */
const signupHandler: MockHandler = {
  method: 'POST',
  endpoint: '/auth/signup',
  description: 'Register a new client user',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse<SignupResponse>> => {
    // config.data can be a string or object, handle both cases
    const body = (typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data || {}) as SignupRequest;

    // Scenario: Error response
    if (mockConfig.scenarios.authentication === 'error') {
      return {
        status: 500,
        data: {
          detail: 'Internal server error',
          status: 500,
        } as any,
      };
    }

    // Validate required fields
    const requiredFields: (keyof SignupRequest)[] = [
      'email',
      'password',
      'name',
      'telefono',
      'nombre_institucion',
      'tipo_institucion',
      'nit',
      'direccion',
      'ciudad',
      'pais',
      'representante',
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return {
        status: 422,
        data: {
          detail: missingFields.map((field) => ({
            loc: ['body', field],
            msg: 'field required',
            type: 'value_error.missing',
          })),
        } as any,
      };
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return {
        status: 400,
        data: {
          detail: 'Invalid email format',
          status: 400,
        } as any,
      };
    }

    // Validate password strength
    if (!isValidPassword(body.password)) {
      return {
        status: 400,
        data: {
          detail: 'Password must be at least 8 characters long',
          status: 400,
        } as any,
      };
    }

    // Check if user already exists
    const existingUser = findUserByEmail(body.email);
    if (existingUser) {
      return {
        status: 409,
        data: {
          detail: 'User with this email already exists',
          status: 409,
        } as any,
      };
    }

    // Scenario: Slow response
    if (mockConfig.scenarios.authentication === 'slow') {
      await delay(3000);
    }

    // Create new user
    const { response } = createMockUserFromSignup(body);
    return {
      status: 201,
      data: response,
    };
  },
};

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
const refreshHandler: MockHandler = {
  method: 'POST',
  endpoint: '/auth/refresh',
  description: 'Refresh access token using refresh token',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse<RefreshTokenResponse>> => {
    // config.data can be a string or object, handle both cases
    const body = (typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data || {}) as RefreshTokenRequest;

    // Scenario: Error response
    if (mockConfig.scenarios.authentication === 'error') {
      return {
        status: 500,
        data: {
          detail: 'Internal server error',
          status: 500,
        } as any,
      };
    }

    // Validate request body
    if (!body.refresh_token) {
      return {
        status: 422,
        data: {
          detail: [
            {
              loc: ['body', 'refresh_token'],
              msg: 'field required',
              type: 'value_error.missing',
            },
          ],
        } as any,
      };
    }

    // Find user by refresh token
    const user = findUserByRefreshToken(body.refresh_token);

    if (!user) {
      return {
        status: 401,
        data: {
          detail: 'Invalid refresh token',
          status: 401,
        } as any,
      };
    }

    // Generate new tokens
    const response: RefreshTokenResponse = {
      access_token: `${user.tokens.accessToken}-refreshed-${Date.now()}`,
      id_token: `${user.tokens.idToken}-refreshed-${Date.now()}`,
      token_type: 'Bearer',
      expires_in: user.tokens.expiresIn,
    };

    return {
      status: 200,
      data: response,
    };
  },
};

/**
 * GET /auth/me
 * Get current authenticated user information
 */
const getMeHandler: MockHandler = {
  method: 'GET',
  endpoint: '/auth/me',
  description: 'Get current authenticated user information',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse<GetMeAuthMeGet200>> => {
    // Scenario: Error response
    if (mockConfig.scenarios.authentication === 'error') {
      return {
        status: 500,
        data: {
          detail: 'Internal server error',
          status: 500,
        } as any,
      };
    }

    // Get authorization header
    const authHeader = config.headers?.['Authorization'] as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        data: {
          detail: 'Missing or invalid authorization header',
          status: 401,
        } as any,
      };
    }

    // Extract token (in real scenario, would validate JWT)
    const token = authHeader.replace('Bearer ', '');
    console.log('[Mock Handler] GET /auth/me - Received token:', token);

    // Find user by token (simplified - in reality would decode JWT)
    const user = mockUsers.find(
      (u) => {
        const matches =
          u.tokens.idToken === token ||
          u.tokens.accessToken === token ||
          token.includes(u.tokens.idToken) ||
          token.includes(u.tokens.accessToken);
        console.log(`[Mock Handler] Checking user ${u.email}: ${matches}`);
        return matches;
      }
    );

    console.log('[Mock Handler] GET /auth/me - Found user:', user?.email || 'NOT FOUND');

    if (!user) {
      return {
        status: 401,
        data: {
          detail: 'Invalid or expired token',
          status: 401,
        } as any,
      };
    }

    // Return user profile with Cognito JWT claims format
    const response: GetMeAuthMeGet200 = {
      sub: user.userId,
      email: user.email,
      name: user.name,
      'custom:user_type': user.userType,
      'custom:role': user.userType,
      'cognito:groups': user.userGroups,
      'custom:telefono': user.profile.telefono,
      'custom:nombre_institucion': user.profile.nombreInstitucion,
      'custom:tipo_institucion': user.profile.tipoInstitucion,
      'custom:nit': user.profile.nit,
      'custom:direccion': user.profile.direccion,
      'custom:ciudad': user.profile.ciudad,
      'custom:pais': user.profile.pais,
      'custom:representante': user.profile.representante,
    };

    console.log('[Mock Handler] GET /auth/me - Response:', JSON.stringify(response, null, 2));

    return {
      status: 200,
      data: response,
    };
  },
};

/**
 * Export all authentication handlers
 */
export const authenticationHandlers: MockHandler[] = [
  loginHandler,
  signupHandler,
  refreshHandler,
  getMeHandler,
];
