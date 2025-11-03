import { View } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface InfoRowProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
}

export const InfoRow = ({ icon: IconComponent, label, value }: InfoRowProps) => {
  return (
    <HStack space="md" className="items-start">
      <View className="mt-0.5">
        <Icon as={IconComponent} size="sm" className="text-typography-500" />
      </View>
      <VStack space="xs" className="flex-1">
        <Text className="text-xs text-typography-500 uppercase tracking-wide">
          {label}
        </Text>
        <Text className="text-sm text-typography-900">
          {value}
        </Text>
      </VStack>
    </HStack>
  );
};
