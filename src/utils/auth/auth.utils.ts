import type { LoginResponse, UserMeResponse } from '@/api/generated/models';
import type { User, UserProfile, AuthTokens } from '@/store/useAuthStore/types';

/**
 * Get user role with fallback to groups
 *
 * Determines the user's role from the role field or groups array.
 * Falls back to 'seller' if user is in seller_users group.
 * Defaults to 'client' if no role or group information is available.
 *
 * @param user - The user object from auth store
 * @returns The user's role ('seller' or 'client')
 */
export const getUserRole = (user: User | null | undefined): 'seller' | 'client' => {
  if (!user) return 'client';

  // If role is explicitly set, use it
  if (user.role) {
    return user.role as 'seller' | 'client';
  }

  // Fallback: Check if user is in seller_users group
  if (user.groups?.includes('seller_users')) {
    return 'seller';
  }

  // Default to client
  return 'client';
};

/**
 * Transform /me API response to User object
 *
 * Converts the API response from /auth/me endpoint into a properly typed User object.
 * The new /me endpoint returns structured data instead of raw JWT claims.
 *
 * @param data - The response from the /auth/me endpoint
 * @returns Transformed User object with typed profile data
 */
export const transformUserData = (data: UserMeResponse): User => {
  // Debug: Log API response
  console.log('[transformUserData] /me response:', data);
  console.log('[transformUserData] user_type:', data.user_type);
  console.log('[transformUserData] groups:', data.groups);

  // Extract profile from user_details if available
  // Support both Spanish field names (old) and English field names (new)
  const details = data.user_details || {};
  const profile: UserProfile = {
    // Phone: support both 'telefono' and 'phone'
    telefono: details['telefono'] ? String(details['telefono']) :
              details['phone'] ? String(details['phone']) : undefined,
    // Institution name: support 'nombre_institucion'
    nombreInstitucion: details['nombre_institucion'] ? String(details['nombre_institucion']) : undefined,
    // Institution type: support 'tipo_institucion'
    tipoInstitucion: details['tipo_institucion'] ? String(details['tipo_institucion']) : undefined,
    // Tax ID: support 'nit'
    nit: details['nit'] ? String(details['nit']) : undefined,
    // Address: support both 'direccion' and 'address'
    direccion: details['direccion'] ? String(details['direccion']) :
               details['address'] ? String(details['address']) : undefined,
    // City: support both 'ciudad' and 'city'
    ciudad: details['ciudad'] ? String(details['ciudad']) :
            details['city'] ? String(details['city']) : undefined,
    // Country: support both 'pais' and 'country'
    pais: details['pais'] ? String(details['pais']) :
          details['country'] ? String(details['country']) : undefined,
    // Representative: support 'representante'
    representante: details['representante'] ? String(details['representante']) : undefined,
  };

  // Check if any profile fields exist
  const hasProfileData = Object.values(profile).some(value => value !== undefined);

  const user: User = {
    id: data.user_id,
    email: data.email,
    name: data.name,
    role: data.user_type || undefined,
    groups: data.groups,
    profile: hasProfileData ? profile : undefined,
  };

  console.log('[transformUserData] Transformed user:', user);
  console.log('[transformUserData] Final role:', user.role);

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
