import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { InfoRow } from '@/components/InfoRow';
import { ScreenContainer } from '@/components/ScreenContainer';
import { InfoSection } from '@/components/InfoSection';
import { useAuthStore } from '@/store';
import { useAuth } from '@/providers';
import { useTranslation } from '@/i18n/hooks';
import { getInitials } from '@/utils/getInitials';
import { getUserTypeBadge } from '@/utils/getUserTypeBadge';
import { getInstitutionTypeLabel } from '@/utils/getInstitutionTypeLabel';
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  UserCircle,
  LogOut,
} from 'lucide-react-native';

export const AccountScreen = () => {
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const userTypeBadge = getUserTypeBadge(user?.role, t);

  return (
    <ScreenContainer testID="account-screen">
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <VStack space="lg" className="p-4 pb-8">
          {/* Header */}
          <Heading size="xl" className="mb-2">{t('account.title')}</Heading>

          {/* User Profile Card */}
          <Card variant="elevated" className="p-6 bg-white">
            <VStack space="md">
              {/* Avatar and Basic Info */}
              <HStack space="md" className="items-center">
                <Avatar size="xl" className="bg-primary-500">
                  <AvatarFallbackText className="text-white font-bold">
                    {getInitials(user?.name)}
                  </AvatarFallbackText>
                </Avatar>

                <VStack space="xs" className="flex-1">
                  <Heading size="lg" className="text-typography-900">
                    {user?.name || 'Usuario'}
                  </Heading>

                  <Badge action={userTypeBadge.action} variant="solid" size="sm" className="self-start">
                    <BadgeText>{userTypeBadge.label}</BadgeText>
                  </Badge>

                  {/* Only show groups if user has multiple groups or group differs from role */}
                  {user?.groups && user.groups.length > 1 && (
                    <HStack space="xs" className="mt-1 flex-wrap">
                      {user.groups.map((group, index) => (
                        <Badge key={index} action="muted" variant="outline" size="sm">
                          <BadgeText className="capitalize">{group}</BadgeText>
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </HStack>

              {/* Contact Information */}
              <InfoSection title={t('account.contactInfo')} testID="contact-info">
                <InfoRow
                  icon={Mail}
                  label={t('account.profile.email')}
                  value={user?.email || 'N/A'}
                />

                {user?.profile?.telefono && (
                  <InfoRow
                    icon={Phone}
                    label={t('account.profile.phone')}
                    value={user.profile.telefono}
                  />
                )}
              </InfoSection>

              {/* Institution Information - Only show for clients with institution data */}
              {user?.role === 'client' && (user?.profile?.nombreInstitucion || user?.profile?.tipoInstitucion) && (
                <InfoSection title={t('account.institutionInfo')} testID="institution-info">
                  {user?.profile?.nombreInstitucion && (
                    <InfoRow
                      icon={Building2}
                      label={t('account.profile.institution')}
                      value={user.profile.nombreInstitucion}
                    />
                  )}

                  {user?.profile?.tipoInstitucion && (
                    <InfoRow
                      icon={Building2}
                      label={t('account.profile.type')}
                      value={getInstitutionTypeLabel(user.profile.tipoInstitucion, t)}
                    />
                  )}

                  {user?.profile?.nit && (
                    <InfoRow
                      icon={FileText}
                      label={t('account.profile.nit')}
                      value={user.profile.nit}
                    />
                  )}

                  {user?.profile?.representante && (
                    <InfoRow
                      icon={UserCircle}
                      label={t('account.profile.representative')}
                      value={user.profile.representante}
                    />
                  )}
                </InfoSection>
              )}

              {/* Location Information */}
              {(user?.profile?.direccion || user?.profile?.ciudad || user?.profile?.pais) && (
                <InfoSection title={t('account.location')} testID="location-info">
                  {user?.profile?.direccion && (
                    <InfoRow
                      icon={MapPin}
                      label={t('account.profile.address')}
                      value={user.profile.direccion}
                    />
                  )}

                  {user?.profile?.ciudad && (
                    <InfoRow
                      icon={MapPin}
                      label={t('account.profile.city')}
                      value={user.profile.ciudad}
                    />
                  )}

                  {user?.profile?.pais && (
                    <InfoRow
                      icon={MapPin}
                      label={t('account.profile.country')}
                      value={user.profile.pais}
                    />
                  )}
                </InfoSection>
              )}
            </VStack>
          </Card>

          {/* Logout Button */}
          <Button
            testID="account-logout-button"
            onPress={handleLogout}
            action="negative"
            size="lg"
            className="mt-4"
          >
            <Icon as={LogOut} className="mr-2" size="sm" />
            <ButtonText>{t('account.logout')}</ButtonText>
          </Button>

          {/* App Info */}
          <Card variant="outline" className="p-4 mt-2 bg-background-50">
            <VStack space="xs">
              <Text className="text-xs text-typography-500 text-center">
                {t('account.appInfo.appName')}
              </Text>
              <Text className="text-xs text-typography-400 text-center">
                {t('account.appInfo.version', { version: '1.0.0' })}
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
