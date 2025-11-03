import { Pressable, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react-native';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    institution_name: string;
    institution_type: string;
    city: string;
    phone: string;
  };
  onPress: () => void;
  testID?: string;
}

const getInstitutionTypeBadgeAction = (institutionType: string) => {
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error' | 'muted'> = {
    hospital: 'info',
    clinic: 'success',
    pharmacy: 'warning',
    laboratory: 'error',
  };
  return typeMap[institutionType?.toLowerCase()] || 'muted';
};

export const ClientCard = ({ client, onPress, testID }: ClientCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.pressable,
        /* istanbul ignore next */
        pressed && styles.pressed,
      ]}
    >
      <Box className="bg-white rounded-lg my-2 mx-0" style={styles.card}>
        <HStack space="md" className="items-center p-4">
          <VStack space="xs" className="flex-1">
            <Heading size="sm" className="text-typography-900">
              {client.name}
            </Heading>
            <Text size="sm" className="text-typography-600">
              {client.institution_name}
            </Text>
            <HStack space="sm" className="items-center mt-1">
              <Badge
                action={getInstitutionTypeBadgeAction(client.institution_type)}
                size="sm"
              >
                <BadgeText>{client.institution_type}</BadgeText>
              </Badge>
            </HStack>
            <Text size="xs" className="text-typography-500 mt-1">
              {client.city} • {client.phone}
            </Text>
          </VStack>
          <ChevronRight size={20} color="#9CA3AF" />
        </HStack>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
