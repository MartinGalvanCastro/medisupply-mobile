import type { ReactNode } from 'react';

export interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  testID?: string;
}
