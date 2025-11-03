import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Divider } from '@/components/ui/divider';
import { InfoRow } from '@/components/InfoRow';
import { useTranslation } from '@/i18n/hooks';
import { getInitials } from '@/utils/getInitials';
import { getInstitutionTypeLabel } from '@/utils/getInstitutionTypeLabel';
import { useListClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  UserCircle,
  Calendar,
  ArrowLeft,
} from 'lucide-react-native';
import { useMemo } from 'react';

const getInstitutionTypeBadgeAction = (institutionType: string) => {
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error' | 'muted'> = {
    hospital: 'info',
    clinica: 'success',
    farmacia: 'warning',
    laboratorio: 'error',
  };
  return typeMap[institutionType?.toLowerCase()] || 'muted';
};

export const ClientDetailScreen = () => {
  const { t } = useTranslation();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  // Fetch all clients (since there's no single client endpoint)
  const { data, isLoading, error } = useListClientsBffSellersAppClientsGet(
    undefined,
    {
      query: {
        enabled: true,
        staleTime: 5 * 60 * 1000,
      },
    }
  );

  // Find the specific client by ID
  const client = useMemo(() => {
    if (!data?.clients || !clientId) return null;
    return data.clients.find((c) => c.cliente_id === clientId);
  }, [data?.clients, clientId]);

  const handleScheduleVisit = () => {
    router.push(`/client/${clientId}/schedule-visit`);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/clients');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="client-detail-screen">
        <VStack space="lg" className="p-4">
          <HStack space="md" className="items-center mb-4">
            <Pressable onPress={handleBack} testID="back-button" style={styles.backButton}>
              <ArrowLeft size={24} color="#6b7280" />
            </Pressable>
          </HStack>
          <Card variant="elevated" className="p-8 bg-white">
            <Text className="text-center text-typography-600">
              {t('clientDetail.loading')}
            </Text>
          </Card>
        </VStack>
      </SafeAreaView>
    );
  }

  // Error or not found state
  if (error || !client) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="client-detail-screen">
        <VStack space="lg" className="p-4">
          <HStack space="md" className="items-center mb-4">
            <Pressable onPress={handleBack} testID="back-button" style={styles.backButton}>
              <ArrowLeft size={24} color="#6b7280" />
            </Pressable>
          </HStack>
          <Card variant="elevated" className="p-8 bg-white">
            <VStack space="md" className="items-center">
              <Text className="text-lg font-semibold text-typography-900">
                {t('clientDetail.notFound')}
              </Text>
              <Text className="text-center text-typography-600">
                {t('clientDetail.notFoundDescription')}
              </Text>
              <Button onPress={handleBack} className="mt-4" testID="back-to-clients-button">
                <ButtonText>{t('common.back')}</ButtonText>
              </Button>
            </VStack>
          </Card>
        </VStack>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="client-detail-screen">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-4 pb-8">
          {/* Header with back button */}
          <HStack space="md" className="items-center mb-2">
            <Pressable onPress={handleBack} testID="back-button" style={styles.backButton}>
              <ArrowLeft size={24} color="#6b7280" />
            </Pressable>
          </HStack>

          {/* Client Profile Card */}
          <Card variant="elevated" className="p-6 bg-white">
            <VStack space="md">
              {/* Avatar and Basic Info */}
              <HStack space="md" className="items-center">
                <Avatar size="xl" className="bg-primary-500">
                  <AvatarFallbackText className="text-white font-bold">
                    {getInitials(client.representante)}
                  </AvatarFallbackText>
                </Avatar>

                <VStack space="xs" className="flex-1">
                  <Heading size="lg" className="text-typography-900">
                    {client.representante}
                  </Heading>

                  <Badge
                    action={getInstitutionTypeBadgeAction(client.tipo_institucion)}
                    variant="solid"
                    size="sm"
                    className="self-start"
                  >
                    <BadgeText>
                      {getInstitutionTypeLabel(client.tipo_institucion, t)}
                    </BadgeText>
                  </Badge>
                </VStack>
              </HStack>

              <Divider className="my-2" />

              {/* Contact Information */}
              <VStack space="md">
                <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                  {t('clientDetail.contactInfo')}
                </Text>

                <InfoRow
                  icon={Mail}
                  label={t('clientDetail.profile.email')}
                  value={client.email || 'N/A'}
                />

                {client.telefono && (
                  <InfoRow
                    icon={Phone}
                    label={t('clientDetail.profile.phone')}
                    value={client.telefono}
                  />
                )}
              </VStack>

              {/* Institution Information */}
              {(client.nombre_institucion || client.nit) && (
                <>
                  <Divider className="my-2" />
                  <VStack space="md">
                    <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                      {t('clientDetail.institutionInfo')}
                    </Text>

                    {client.nombre_institucion && (
                      <InfoRow
                        icon={Building2}
                        label={t('clientDetail.profile.institution')}
                        value={client.nombre_institucion}
                      />
                    )}

                    {client.tipo_institucion && (
                      <InfoRow
                        icon={Building2}
                        label={t('clientDetail.profile.type')}
                        value={getInstitutionTypeLabel(client.tipo_institucion, t)}
                      />
                    )}

                    {client.nit && (
                      <InfoRow
                        icon={FileText}
                        label={t('clientDetail.profile.nit')}
                        value={client.nit}
                      />
                    )}

                    {client.representante && (
                      <InfoRow
                        icon={UserCircle}
                        label={t('clientDetail.profile.name')}
                        value={client.representante}
                      />
                    )}
                  </VStack>
                </>
              )}

              {/* Location Information */}
              {(client.direccion || client.ciudad || client.pais) && (
                <>
                  <Divider className="my-2" />
                  <VStack space="md">
                    <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                      {t('clientDetail.location')}
                    </Text>

                    {client.direccion && (
                      <InfoRow
                        icon={MapPin}
                        label={t('clientDetail.profile.address')}
                        value={client.direccion}
                      />
                    )}

                    {client.ciudad && (
                      <InfoRow
                        icon={MapPin}
                        label={t('clientDetail.profile.city')}
                        value={client.ciudad}
                      />
                    )}

                    {client.pais && (
                      <InfoRow
                        icon={MapPin}
                        label={t('clientDetail.profile.country')}
                        value={client.pais}
                      />
                    )}
                  </VStack>
                </>
              )}
            </VStack>
          </Card>

          {/* Schedule Visit Button */}
          <Button
            onPress={handleScheduleVisit}
            action="primary"
            size="lg"
            className="mt-4"
            testID="schedule-visit-button"
          >
            <HStack space="sm" className="items-center">
              <Calendar size={20} color="#fff" />
              <ButtonText>{t('clientDetail.scheduleVisit')}</ButtonText>
            </HStack>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
});
