import { ErrorStateCard } from '@/components/ErrorStateCard';
import { InfoRow } from '@/components/InfoRow';
import { InfoSection } from '@/components/InfoSection';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { getInitials } from '@/utils/getInitials';
import { getInstitutionTypeLabel } from '@/utils/getInstitutionTypeLabel';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Building2,
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  UserCircle,
} from 'lucide-react-native';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  // Get client from global store
  const currentClient = useNavigationStore((state) => state.currentClient);
  const clearCurrentClient = useNavigationStore((state) => state.clearCurrentClient);

  // Use client from global store
  const client = currentClient;

  const handleScheduleVisit = () => {
    router.push(`/client/${clientId}/schedule-visit`);
  };

  const handleBack = () => {
    // Clear client from store on back navigation
    clearCurrentClient();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/clients');
    }
  };

  // Error or not found state
  if (!client) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="client-detail-screen">
        <VStack space="lg" className="p-4">
          <ScreenHeader
            title=""
            showBackButton
            onBack={handleBack}
            testID="client-detail-header"
          />
          <ErrorStateCard
            title={t('clientDetail.notFound')}
            message={t('clientDetail.notFoundDescription')}
            showBackButton
            onBack={handleBack}
            backLabel={t('common.back')}
            testID="client-detail-error"
          />
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
          <ScreenHeader
            title=""
            showBackButton
            onBack={handleBack}
            testID="client-detail-header"
          />

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

              {/* Contact Information */}
              <InfoSection title={t('clientDetail.contactInfo')} testID="contact-info">
                <InfoRow
                  icon={Mail}
                  label={t('clientDetail.profile.email')}
                  value={client.email || 'N/A'}
                />

                {!!client.telefono && (
                  <InfoRow
                    icon={Phone}
                    label={t('clientDetail.profile.phone')}
                    value={client.telefono}
                  />
                )}
              </InfoSection>

              {/* Institution Information */}
              {!!(client.nombre_institucion || client.nit) && (
                <InfoSection title={t('clientDetail.institutionInfo')} testID="institution-info">
                  {!!client.nombre_institucion && (
                    <InfoRow
                      icon={Building2}
                      label={t('clientDetail.profile.institution')}
                      value={client.nombre_institucion}
                    />
                  )}

                  {!!client.tipo_institucion && (
                    <InfoRow
                      icon={Building2}
                      label={t('clientDetail.profile.type')}
                      value={getInstitutionTypeLabel(client.tipo_institucion, t)}
                    />
                  )}

                  {!!client.nit && (
                    <InfoRow
                      icon={FileText}
                      label={t('clientDetail.profile.nit')}
                      value={client.nit}
                    />
                  )}

                  {!!client.representante && (
                    <InfoRow
                      icon={UserCircle}
                      label={t('clientDetail.profile.name')}
                      value={client.representante}
                    />
                  )}
                </InfoSection>
              )}

              {/* Location Information */}
              {!!(client.direccion || client.ciudad || client.pais) && (
                <InfoSection title={t('clientDetail.location')} testID="location-info">
                  {!!client.direccion && (
                    <InfoRow
                      icon={MapPin}
                      label={t('clientDetail.profile.address')}
                      value={client.direccion}
                    />
                  )}

                  {!!client.ciudad && (
                    <InfoRow
                      icon={MapPin}
                      label={t('clientDetail.profile.city')}
                      value={client.ciudad}
                    />
                  )}

                  {!!client.pais && (
                    <InfoRow
                      icon={MapPin}
                      label={t('clientDetail.profile.country')}
                      value={client.pais}
                    />
                  )}
                </InfoSection>
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
});
