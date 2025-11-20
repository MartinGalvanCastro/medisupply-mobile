import { getUserRole, transformUserData, transformTokensFromLogin } from './auth.utils';
import type { User } from '@/store/useAuthStore/types';
import type { UserMeResponse, LoginResponse } from '@/api/generated/models';

describe('getUserRole', () => {
  it('returns client for null user', () => {
    expect(getUserRole(null)).toBe('client');
  });

  it('returns client for undefined user', () => {
    expect(getUserRole(undefined)).toBe('client');
  });

  it('returns explicit role when set', () => {
    const user: User = { id: '1', email: 'test@test.com', name: 'Test', role: 'seller' };
    expect(getUserRole(user)).toBe('seller');
  });

  it('returns seller when user is in seller_users group', () => {
    const user: User = { id: '1', email: 'test@test.com', name: 'Test', groups: ['seller_users'] };
    expect(getUserRole(user)).toBe('seller');
  });

  it('returns client when no role or seller group', () => {
    const user: User = { id: '1', email: 'test@test.com', name: 'Test', groups: ['other_group'] };
    expect(getUserRole(user)).toBe('client');
  });

  it('prefers explicit role over groups', () => {
    const user: User = { id: '1', email: 'test@test.com', name: 'Test', role: 'client', groups: ['seller_users'] };
    expect(getUserRole(user)).toBe('client');
  });
});

describe('transformUserData', () => {
  it('transforms basic user data', () => {
    const response: UserMeResponse = {
      user_id: '123',
      email: 'test@example.com',
      name: 'Test User',
      user_type: 'seller',
      groups: ['seller_users'],
    };

    const result = transformUserData(response);

    expect(result.id).toBe('123');
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(result.role).toBe('seller');
    expect(result.groups).toEqual(['seller_users']);
  });

  it('transforms user with Spanish field names in details', () => {
    const response: UserMeResponse = {
      user_id: '123',
      email: 'test@example.com',
      name: 'Test User',
      user_details: {
        telefono: '123456789',
        nombre_institucion: 'Hospital Test',
        tipo_institucion: 'hospital',
        nit: '900123456',
        direccion: 'Calle 123',
        ciudad: 'Bogotá',
        pais: 'Colombia',
        representante: 'Dr. Test',
      },
    };

    const result = transformUserData(response);

    expect(result.profile).toBeDefined();
    expect(result.profile?.telefono).toBe('123456789');
    expect(result.profile?.nombreInstitucion).toBe('Hospital Test');
    expect(result.profile?.tipoInstitucion).toBe('hospital');
    expect(result.profile?.nit).toBe('900123456');
    expect(result.profile?.direccion).toBe('Calle 123');
    expect(result.profile?.ciudad).toBe('Bogotá');
    expect(result.profile?.pais).toBe('Colombia');
    expect(result.profile?.representante).toBe('Dr. Test');
  });

  it('transforms user with English field names in details', () => {
    const response: UserMeResponse = {
      user_id: '123',
      email: 'test@example.com',
      name: 'Test User',
      user_details: {
        phone: '123456789',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
      },
    };

    const result = transformUserData(response);

    expect(result.profile?.telefono).toBe('123456789');
    expect(result.profile?.direccion).toBe('123 Main St');
    expect(result.profile?.ciudad).toBe('New York');
    expect(result.profile?.pais).toBe('USA');
  });

  it('returns undefined profile when no details exist', () => {
    const response: UserMeResponse = {
      user_id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const result = transformUserData(response);

    expect(result.profile).toBeUndefined();
  });
});

describe('transformTokensFromLogin', () => {
  it('transforms login response to auth tokens', () => {
    const response: LoginResponse = {
      access_token: 'access123',
      id_token: 'id123',
      refresh_token: 'refresh123',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    const result = transformTokensFromLogin(response);

    expect(result.accessToken).toBe('access123');
    expect(result.idToken).toBe('id123');
    expect(result.refreshToken).toBe('refresh123');
    expect(result.expiresIn).toBe(3600);
    expect(result.tokenType).toBe('Bearer');
  });
});
