import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react-native';
import type { LoadingCardProps } from './types';

export const LoadingCard = ({
  message = 'Loading...',
  showBackButton = false,
  onBack,
  testID = 'loading-card',
}: LoadingCardProps) => {
  return (
    <Card
      variant="elevated"
      className="bg-white m-4"
      testID={testID}
    >
      <VStack space="lg" className="p-6">
        <HStack space="md" className="items-center justify-center">
          <Spinner size="small" testID={`${testID}-spinner`} />
          <Text
            className="text-typography-700"
            testID={`${testID}-message`}
          >
            {message}
          </Text>
        </HStack>

        {showBackButton && onBack && (
          <Button
            onPress={onBack}
            variant="outline"
            size="md"
            testID={`${testID}-back-button`}
          >
            <ButtonIcon as={ArrowLeft} />
            <ButtonText>Back</ButtonText>
          </Button>
        )}
      </VStack>
    </Card>
  );
};
