import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import type { ScreenHeaderProps } from './types';

export const ScreenHeader = ({
  title,
  showBackButton = false,
  onBack,
  testID = 'screen-header',
}: ScreenHeaderProps) => {
  return (
    <HStack
      space="md"
      className="items-center px-4 py-2"
      testID={testID}
    >
      {showBackButton && onBack && (
        <Pressable
          onPress={onBack}
          testID={`${testID}-back-button`}
          className="p-2"
        >
          <Icon
            as={ArrowLeft}
            size="lg"
            className="text-typography-900"
          />
        </Pressable>
      )}

      <Heading
        size="2xl"
        className="text-typography-900 flex-1"
        testID={`${testID}-title`}
      >
        {title}
      </Heading>
    </HStack>
  );
};
