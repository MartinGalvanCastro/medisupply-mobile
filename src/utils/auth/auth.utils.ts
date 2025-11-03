import type { GetMeAuthMeGet200, LoginResponse } from '@/api/generated/models';
import type { User, UserProfile, AuthTokens } from '@/store/useAuthStore/types';

/**
 * Transform Cognito JWT claims to User object
 *
 * Converts the API response from /auth/me endpoint into a properly typed User object.
 * Handles custom Cognito attributes and maps them to the User and UserProfile interfaces.
 *
 * @param data - The raw response from the /auth/me endpoint
 * @returns Transformed User object with typed profile data
 */
export const transformUserData = (data: GetMeAuthMeGet200): User => {
  // Extract profile fields from custom attributes
  const profile: UserProfile = {
    telefono: data['custom:telefono'] ? String(data['custom:telefono']) : undefined,
    nombreInstitucion: data['custom:nombre_institucion'] ? String(data['custom:nombre_institucion']) : undefined,
    tipoInstitucion: data['custom:tipo_institucion'] ? String(data['custom:tipo_institucion']) : undefined,
    nit: data['custom:nit'] ? String(data['custom:nit']) : undefined,
    direccion: data['custom:direccion'] ? String(data['custom:direccion']) : undefined,
    ciudad: data['custom:ciudad'] ? String(data['custom:ciudad']) : undefined,
    pais: data['custom:pais'] ? String(data['custom:pais']) : undefined,
    representante: data['custom:representante'] ? String(data['custom:representante']) : undefined,
  };

  // Check if any profile fields exist
  const hasProfileData = Object.values(profile).some(value => value !== undefined);

  const user: User = {
    id: String(data.sub ?? data.id ?? ''),
    email: String(data.email ?? ''),
    name: String(data.name ?? ''),
    role: data['custom:role'] ? String(data['custom:role']) : data['custom:user_type'] ? String(data['custom:user_type']) : undefined,
    groups: Array.isArray(data['cognito:groups'])
      ? data['cognito:groups'].map(String)
      : Array.isArray(data.groups)
        ? data.groups.map(String)
        : undefined,
    profile: hasProfileData ? profile : undefined,
  };

  return user;
};

/**
 * Transform login response tokens to AuthTokens
 *
 * Converts the LoginResponse from the API into the AuthTokens format
 * used by the auth store. Maps snake_case API fields to camelCase.
 *
 * @param response - The login response from the API
 * @returns Transformed AuthTokens object
 */
export const transformTokensFromLogin = (response: LoginResponse): AuthTokens => ({
  accessToken: response.access_token,
  idToken: response.id_token,
  refreshToken: response.refresh_token,
  expiresIn: response.expires_in,
  tokenType: response.token_type,
});
