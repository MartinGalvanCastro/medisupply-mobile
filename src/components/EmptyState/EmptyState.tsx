import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { PackageOpen } from 'lucide-react-native';
import type { EmptyStateProps } from './types';

export const EmptyState = ({
  icon: IconComponent = PackageOpen,
  title,
  description,
  action,
  testID = 'empty-state',
}: EmptyStateProps) => {
  return (
    <Box className="flex-1 justify-center items-center p-8" testID={testID}>
      <VStack space="lg" className="items-center max-w-md">
        <Icon
          as={IconComponent}
          size="xl"
          className="text-typography-400"
        />

        <VStack space="sm" className="items-center">
          <Text
            className="text-typography-900 text-lg font-semibold text-center"
            testID={`${testID}-title`}
          >
            {title}
          </Text>

          {description && (
            <Text
              className="text-typography-600 text-center"
              testID={`${testID}-description`}
            >
              {description}
            </Text>
          )}
        </VStack>

        {action && (
          <Button
            onPress={action.onPress}
            variant="outline"
            size="md"
            testID={`${testID}-action`}
          >
            <ButtonText>{action.label}</ButtonText>
          </Button>
        )}
      </VStack>
    </Box>
  );
};
