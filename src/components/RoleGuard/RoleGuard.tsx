import { useAuthStore } from '@/store/useAuthStore';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: ('seller' | 'client')[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard = ({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.role) {
    return <>{fallback}</>;
  }

  const hasAccess = allowedRoles.includes(user.role as 'seller' | 'client');

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
