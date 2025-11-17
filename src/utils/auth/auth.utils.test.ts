import { transformUserData, transformTokensFromLogin } from './auth.utils';
import type { UserMeResponse, LoginResponse } from '@/api/generated/models';

describe('auth.utils', () => {
  describe('transformUserData', () => {
    it('should transform complete user data with all fields', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        user_type: 'seller',
        groups: ['group1', 'group2'],
        user_details: {
          telefono: '555-1234',
          nombre_institucion: 'Test Hospital',
          tipo_institucion: 'hospital',
          nit: '123456789',
          direccion: '123 Main St',
          ciudad: 'Test City',
          pais: 'Test Country',
          representante: 'Jane Doe',
        },
      };

      const result = transformUserData(input);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        role: 'seller',
        groups: ['group1', 'group2'],
        profile: {
          telefono: '555-1234',
          nombreInstitucion: 'Test Hospital',
          tipoInstitucion: 'hospital',
          nit: '123456789',
          direccion: '123 Main St',
          ciudad: 'Test City',
          pais: 'Test Country',
          representante: 'Jane Doe',
        },
      });
    });

    it('should handle basic user data without optional fields', () => {
      const input: UserMeResponse = {
        user_id: 'user-456',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = transformUserData(input);

      expect(result.id).toBe('user-456');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should handle missing optional fields', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = transformUserData(input);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: undefined,
        groups: undefined,
        profile: undefined,
      });
    });

    it('should use user_type as role', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        user_type: 'client',
      };

      const result = transformUserData(input);

      expect(result.role).toBe('client');
    });

    it('should handle groups field', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        groups: ['group1', 'group2'],
      };

      const result = transformUserData(input);

      expect(result.groups).toEqual(['group1', 'group2']);
    });

    it('should handle seller user type', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'seller@example.com',
        name: 'Test Seller',
        user_type: 'seller',
        groups: ['seller_users'],
      };

      const result = transformUserData(input);

      expect(result.role).toBe('seller');
      expect(result.groups).toEqual(['seller_users']);
    });

    it('should include profile when at least one profile field exists', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        user_details: {
          telefono: '555-1234',
        },
      };

      const result = transformUserData(input);

      expect(result.profile).toEqual({
        telefono: '555-1234',
        nombreInstitucion: undefined,
        tipoInstitucion: undefined,
        nit: undefined,
        direccion: undefined,
        ciudad: undefined,
        pais: undefined,
        representante: undefined,
      });
    });

    it('should convert numeric profile values to strings', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        user_details: {
          telefono: 5551234,
          nit: 123456789,
        },
      };

      const result = transformUserData(input);

      expect(result.profile?.telefono).toBe('5551234');
      expect(result.profile?.nit).toBe('123456789');
    });

    it('should handle all profile fields as undefined when none are provided', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = transformUserData(input);

      expect(result.profile).toBeUndefined();
    });

    it('should handle null user_details', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        user_details: null,
      };

      const result = transformUserData(input);

      expect(result.profile).toBeUndefined();
    });

    it('should handle empty user_details object', () => {
      const input: UserMeResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        user_details: {},
      };

      const result = transformUserData(input);

      expect(result.profile).toBeUndefined();
    });
  });

  describe('transformTokensFromLogin', () => {
    it('should transform login response to auth tokens', () => {
      const input: LoginResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        refresh_token: 'refresh-token-789',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const result = transformTokensFromLogin(input);

      expect(result).toEqual({
        accessToken: 'access-token-123',
        idToken: 'id-token-456',
        refreshToken: 'refresh-token-789',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });
    });

    it('should handle different token types', () => {
      const input: LoginResponse = {
        access_token: 'access-123',
        id_token: 'id-123',
        refresh_token: 'refresh-123',
        expires_in: 7200,
        token_type: 'Custom',
      };

      const result = transformTokensFromLogin(input);

      expect(result.tokenType).toBe('Custom');
      expect(result.expiresIn).toBe(7200);
    });

    it('should handle numeric string tokens', () => {
      const input: LoginResponse = {
        access_token: '12345',
        id_token: '67890',
        refresh_token: 'abcdef',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const result = transformTokensFromLogin(input);

      expect(result.accessToken).toBe('12345');
      expect(result.idToken).toBe('67890');
      expect(result.refreshToken).toBe('abcdef');
    });
  });
});
