import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import type { InfoSectionProps } from './types';

export const InfoSection = ({
  title,
  children,
  showDivider = true,
  testID = 'info-section',
}: InfoSectionProps) => {
  return (
    <VStack space="md" testID={testID}>
      <Text
        className="text-sm font-semibold text-typography-700 uppercase tracking-wide"
        testID={`${testID}-title`}
      >
        {title}
      </Text>

      {showDivider && <Divider testID={`${testID}-divider`} />}

      <VStack space="sm" testID={`${testID}-content`}>
        {children}
      </VStack>
    </VStack>
  );
};
