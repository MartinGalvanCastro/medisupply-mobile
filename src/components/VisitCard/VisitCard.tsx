import { Pressable, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { ChevronRight, Calendar, MapPin } from 'lucide-react-native';
import { formatDateTime } from '@/utils/formatDate';
import { useTranslation } from '@/i18n/hooks';
import { getVisitStatusBadgeAction } from '@/utils/getVisitStatusBadgeAction';

interface VisitCardProps {
  visit: {
    id: string;
    clientName: string;
    institutionName: string;
    visitDate: string;
    status: string;
    notes?: string | null;
    location?: string;
  };
  onPress: () => void;
  testID?: string;
}

export const VisitCard = ({ visit, onPress, testID }: VisitCardProps) => {
  const { t } = useTranslation();
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
              {visit.clientName}
            </Heading>
            <Text size="sm" className="text-typography-600">
              {visit.institutionName}
            </Text>

            <HStack space="xs" className="items-center mt-1">
              <Calendar size={14} color="#6B7280" />
              <Text size="xs" className="text-typography-500">
                {formatDateTime(visit.visitDate)}
              </Text>
            </HStack>

            {visit.location && (
              <HStack space="xs" className="items-center mt-1">
                <MapPin size={14} color="#6B7280" />
                <Text size="xs" className="text-typography-500" numberOfLines={1}>
                  {visit.location}
                </Text>
              </HStack>
            )}

            <HStack space="sm" className="items-center mt-2">
              <Badge action={getVisitStatusBadgeAction(visit.status)} size="sm">
                <BadgeText>{t(`visits.status.${visit.status?.toLowerCase()}` as any)}</BadgeText>
              </Badge>
            </HStack>

            {visit.notes && (
              <Text size="xs" className="text-typography-400 mt-2" numberOfLines={2}>
                {visit.notes}
              </Text>
            )}
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
