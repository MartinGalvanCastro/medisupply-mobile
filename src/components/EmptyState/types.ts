import type { LucideIcon } from 'lucide-react-native';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  testID?: string;
}
