import type { ReactNode } from 'react';

export interface InfoSectionProps {
  title: string;
  children: ReactNode;
  showDivider?: boolean;
  testID?: string;
}
