import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import type { ErrorStateCardProps } from './types';

export const ErrorStateCard = ({
  title,
  message,
  icon: IconComponent = AlertCircle,
  onRetry,
  retryLabel = 'Retry',
  showBackButton = false,
  onBack,
  backLabel = 'Back',
  testID = 'error-state-card',
}: ErrorStateCardProps) => {
  return (
    <Card
      variant="elevated"
      className="bg-white m-4"
      testID={testID}
    >
      <VStack space="lg" className="p-6">
        <VStack space="md" className="items-center">
          <Icon
            as={IconComponent}
            size="xl"
            className="text-error-500"
          />

          <VStack space="xs" className="items-center">
            <Text
              className="text-typography-900 text-lg font-semibold text-center"
              testID={`${testID}-title`}
            >
              {title}
            </Text>

            {message && (
              <Text
                className="text-typography-600 text-center"
                testID={`${testID}-message`}
              >
                {message}
              </Text>
            )}
          </VStack>
        </VStack>

        <VStack space="sm">
          {onRetry && (
            <Button
              onPress={onRetry}
              variant="solid"
              size="md"
              testID={`${testID}-retry-button`}
            >
              <ButtonIcon as={RefreshCw} />
              <ButtonText>{retryLabel}</ButtonText>
            </Button>
          )}

          {showBackButton && onBack && (
            <Button
              onPress={onBack}
              variant="outline"
              size="md"
              testID={`${testID}-back-button`}
            >
              <ButtonIcon as={ArrowLeft} />
              <ButtonText>{backLabel}</ButtonText>
            </Button>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};
