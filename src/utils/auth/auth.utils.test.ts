import { transformUserData, transformTokensFromLogin } from './auth.utils';
import type { GetMeAuthMeGet200, LoginResponse } from '@/api/generated/models';

describe('auth.utils', () => {
  describe('transformUserData', () => {
    it('should transform complete user data with all fields', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        'custom:role': 'admin',
        'cognito:groups': ['group1', 'group2'],
        'custom:telefono': '555-1234',
        'custom:nombre_institucion': 'Test Hospital',
        'custom:tipo_institucion': 'hospital',
        'custom:nit': '123456789',
        'custom:direccion': '123 Main St',
        'custom:ciudad': 'Test City',
        'custom:pais': 'Test Country',
        'custom:representante': 'Jane Doe',
      };

      const result = transformUserData(input);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        role: 'admin',
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

    it('should use id field when sub is not available', () => {
      const input: GetMeAuthMeGet200 = {
        id: 'user-456',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = transformUserData(input);

      expect(result.id).toBe('user-456');
    });

    it('should handle missing optional fields', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
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

    it('should use user_type when role is not available', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        'custom:user_type': 'client',
      };

      const result = transformUserData(input);

      expect(result.role).toBe('client');
    });

    it('should prioritize cognito:groups over groups field', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        'cognito:groups': ['cognito-group'],
        groups: ['regular-group'],
      };

      const result = transformUserData(input);

      expect(result.groups).toEqual(['cognito-group']);
    });

    it('should use groups field when cognito:groups is not available', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        groups: ['regular-group'],
      };

      const result = transformUserData(input);

      expect(result.groups).toEqual(['regular-group']);
    });

    it('should handle non-array groups field', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        groups: 'not-an-array' as any,
      };

      const result = transformUserData(input);

      expect(result.groups).toBeUndefined();
    });

    it('should include profile when at least one profile field exists', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        'custom:telefono': '555-1234',
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
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        'custom:telefono': 5551234 as any,
        'custom:nit': 123456789 as any,
      };

      const result = transformUserData(input);

      expect(result.profile?.telefono).toBe('5551234');
      expect(result.profile?.nit).toBe('123456789');
    });

    it('should handle empty string values', () => {
      const input: GetMeAuthMeGet200 = {
        sub: '',
        email: '',
        name: '',
      };

      const result = transformUserData(input);

      expect(result).toEqual({
        id: '',
        email: '',
        name: '',
        role: undefined,
        groups: undefined,
        profile: undefined,
      });
    });

    it('should handle all profile fields as undefined when none are provided', () => {
      const input: GetMeAuthMeGet200 = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = transformUserData(input);

      expect(result.profile).toBeUndefined();
    });

    it('should handle null values for sub, id, email, and name', () => {
      const input: GetMeAuthMeGet200 = {
        sub: null as any,
        id: null as any,
        email: null as any,
        name: null as any,
      };

      const result = transformUserData(input);

      expect(result).toEqual({
        id: '',
        email: '',
        name: '',
        role: undefined,
        groups: undefined,
        profile: undefined,
      });
    });

    it('should handle undefined values for sub, id, email, and name', () => {
      const input: GetMeAuthMeGet200 = {
        sub: undefined,
        id: undefined,
        email: undefined,
        name: undefined,
      };

      const result = transformUserData(input);

      expect(result).toEqual({
        id: '',
        email: '',
        name: '',
        role: undefined,
        groups: undefined,
        profile: undefined,
      });
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
