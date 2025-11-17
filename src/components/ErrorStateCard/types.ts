import type { LucideIcon } from 'lucide-react-native';

export interface ErrorStateCardProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  testID?: string;
}
