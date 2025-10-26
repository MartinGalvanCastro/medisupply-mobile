import type { SignupResponse } from '@/api/generated/models';

export interface AuthContextValue {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    telefono: string,
    nombre_institucion: string,
    tipo_institucion: string,
    nit: string,
    direccion: string,
    ciudad: string,
    pais: string,
    representante: string
  ) => Promise<SignupResponse>;
  isLoginPending: boolean;
  isRefreshPending: boolean;
  isSignupPending: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
