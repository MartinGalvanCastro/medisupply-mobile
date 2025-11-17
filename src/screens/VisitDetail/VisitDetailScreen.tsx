import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { InfoRow } from '@/components/InfoRow';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch } from '@/api/generated/sellers-app/sellers-app';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import { useToast } from '@/components/ui/toast';
import { getVisitStatusBadgeAction } from '@/utils/getVisitStatusBadgeAction';

export const VisitDetailScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { visitId } = useLocalSearchParams<{ visitId: string }>();

  // Get visit from global store
  const currentVisit = useNavigationStore((state) => state.currentVisit);
  const updateCurrentVisitStatus = useNavigationStore((state) => state.updateCurrentVisitStatus);
  const clearCurrentVisit = useNavigationStore((state) => state.clearCurrentVisit);

  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // Update visit status mutation
  const updateVisitStatus = useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch({
    mutation: {
      onSuccess: (data, variables) => {
        console.log('🔵 [VisitDetail] Mutation onSuccess - Backend response:', data);
        console.log('🔵 [VisitDetail] Mutation variables sent:', variables);
        console.log('🔵 [VisitDetail] Current visit before update:', currentVisit);

        // Update the global store with the new status
        updateCurrentVisitStatus(
          variables.data.status,
          variables.data.recomendaciones
        );

        console.log('🟢 [VisitDetail] Global store updated with status:', variables.data.status);

        // Invalidate visits query cache to trigger refetch on list screen
        // Use 'visits' key to match the actual query key used in VisitsScreen
        queryClient.invalidateQueries({
          queryKey: ['visits'],
        });

        console.log('🟢 [VisitDetail] Query cache invalidated with key: [\'visits\']');

        // Close modals
        setShowCompleteModal(false);
        setShowCancelModal(false);

        // Reset form fields
        setNotes('');
        setRecommendations('');

        // If completed, navigate to upload evidence
        if (variables.data.status === 'completada') {
          toast.show({
            placement: 'top',
            render: /* istanbul ignore next */ ({ id }) => {
              return (
                <VStack className="bg-success-500 p-4 rounded-lg">
                  <Text className="text-white font-semibold">
                    {t('visitDetail.visitCompleted')}
                  </Text>
                </VStack>
              );
            },
          });

          // Navigate to upload evidence screen
          router.push(`/visit/${visitId}/upload-evidence`);
        } else if (variables.data.status === 'cancelada') {
          toast.show({
            placement: 'top',
            render: /* istanbul ignore next */ ({ id }) => {
              return (
                <VStack className="bg-error-500 p-4 rounded-lg">
                  <Text className="text-white font-semibold">
                    {t('visitDetail.visitCancelled')}
                  </Text>
                </VStack>
              );
            },
          });
        }
      },
      onError: () => {
        toast.show({
          placement: 'top',
          render: /* istanbul ignore next */ ({ id }) => {
            return (
              <VStack className="bg-error-500 p-4 rounded-lg">
                <Text className="text-white font-semibold">
                  {t('visitDetail.updateStatusError')}
                </Text>
              </VStack>
            );
          },
        });
      },
    },
  });

  // Use visit from global store
  const visit = currentVisit;

  console.log('🟡 [VisitDetail] Render - Current visit from store:', visit);
  console.log('🟡 [VisitDetail] Render - Visit status:', visit?.status);

  const handleBack = () => {
    // Clear visit from store on back navigation
    clearCurrentVisit();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/visits');
    }
  };

  const handleCompleteVisitClick = () => {
    setShowCompleteModal(true);
  };

  const handleCancelVisitClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmComplete = () => {
    if (!visitId) return;

    updateVisitStatus.mutate({
      visitId,
      data: {
        status: 'completada',
        recomendaciones: recommendations || undefined,
      },
    });
  };

  const handleConfirmCancel = () => {
    if (!visitId) return;

    updateVisitStatus.mutate({
      visitId,
      data: {
        status: 'cancelada',
      },
    });
  };

  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    setNotes('');
    setRecommendations('');
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setNotes('');
  };

  // Error or not found state
  if (!visit) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="visit-detail-screen">
        <VStack space="lg" className="p-4">
          <HStack space="md" className="items-center mb-4">
            <Pressable onPress={handleBack} testID="back-button" style={styles.backButton}>
              <ArrowLeft size={24} color="#6b7280" />
            </Pressable>
          </HStack>
          <Card variant="elevated" className="p-8 bg-white">
            <VStack space="md" className="items-center">
              <Text className="text-lg font-semibold text-typography-900">
                {t('visitDetail.notFound')}
              </Text>
              <Text className="text-center text-typography-600">
                {t('visitDetail.notFoundDescription')}
              </Text>
              <Button onPress={handleBack} className="mt-4" testID="back-to-visits-button">
                <ButtonText>{t('common.back')}</ButtonText>
              </Button>
            </VStack>
          </Card>
        </VStack>
      </SafeAreaView>
    );
  }

  const isPending = visit.status?.toLowerCase() === 'pending' || visit.status?.toLowerCase() === 'programada';
  const isCompleted = visit.status?.toLowerCase() === 'completed' || visit.status?.toLowerCase() === 'completada';
  const isCancelled = visit.status?.toLowerCase() === 'cancelled' || visit.status?.toLowerCase() === 'cancelada';

  // Main content
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="visit-detail-screen">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-4 pb-8">
          {/* Header with back button */}
          <HStack space="md" className="items-center mb-2">
            <Pressable onPress={handleBack} testID="back-button" style={styles.backButton}>
              <ArrowLeft size={24} color="#6b7280" />
            </Pressable>
          </HStack>

          {/* Client Information Card */}
          <Card variant="elevated" className="p-6 bg-white">
            <VStack space="md">
              <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                {t('visitDetail.clientInfo')}
              </Text>

              <InfoRow
                icon={Building2}
                label={t('visitDetail.profile.institution')}
                value={visit.client_nombre_institucion}
              />

              <InfoRow
                icon={MapPin}
                label={t('visitDetail.profile.client')}
                value={visit.client_direccion}
              />
            </VStack>
          </Card>

          {/* Visit Information Card */}
          <Card variant="elevated" className="p-6 bg-white">
            <VStack space="md">
              <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                {t('visitDetail.visitInfo')}
              </Text>

              <InfoRow
                icon={Calendar}
                label={t('visitDetail.profile.date')}
                value={formatDate(visit.fecha_visita)}
              />

              <HStack space="md" className="items-start">
                <VStack space="xs" className="flex-1">
                  <Text className="text-xs text-typography-500 uppercase tracking-wide">
                    {t('visitDetail.profile.status')}
                  </Text>
                  <Badge
                    action={getVisitStatusBadgeAction(visit.status)}
                    variant="solid"
                    size="sm"
                    className="self-start"
                  >
                    <BadgeText>
                      {t(`visits.status.${visit.status?.toLowerCase()}` as any)}
                    </BadgeText>
                  </Badge>
                </VStack>
              </HStack>

              {visit.notas_visita && (
                <>
                  <Divider className="my-2" />
                  <InfoRow
                    icon={FileText}
                    label={t('visitDetail.profile.notes')}
                    value={visit.notas_visita}
                  />
                </>
              )}

              {!visit.notas_visita && (
                <>
                  <Divider className="my-2" />
                  <Text className="text-sm text-typography-500 italic">
                    {t('visitDetail.profile.noNotes')}
                  </Text>
                </>
              )}
            </VStack>
          </Card>

          {/* Recommendations Card */}
          {visit.recomendaciones && (
            <Card variant="elevated" className="p-6 bg-white">
              <VStack space="md">
                <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                  {t('visitDetail.recommendations')}
                </Text>
                <Text className="text-sm text-typography-900">
                  {visit.recomendaciones}
                </Text>
              </VStack>
            </Card>
          )}

          {!visit.recomendaciones && (
            <Card variant="elevated" className="p-6 bg-white">
              <VStack space="md">
                <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                  {t('visitDetail.recommendations')}
                </Text>
                <Text className="text-sm text-typography-500 italic">
                  {t('visitDetail.profile.noRecommendations')}
                </Text>
              </VStack>
            </Card>
          )}

          {/* Evidence Files Card */}
          {visit.archivos_evidencia && (
            <Card variant="elevated" className="p-6 bg-white">
              <VStack space="md">
                <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                  {t('visitDetail.evidence')}
                </Text>
                <Text className="text-sm text-typography-900">
                  {visit.archivos_evidencia}
                </Text>
              </VStack>
            </Card>
          )}

          {!visit.archivos_evidencia && (
            <Card variant="elevated" className="p-6 bg-white">
              <VStack space="md">
                <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                  {t('visitDetail.evidence')}
                </Text>
                <Text className="text-sm text-typography-500 italic">
                  {t('visitDetail.profile.noEvidence')}
                </Text>
              </VStack>
            </Card>
          )}

          {/* Action Buttons */}
          {isPending && (
            <VStack space="md" className="mt-4">
              <Button
                onPress={handleCompleteVisitClick}
                action="positive"
                size="lg"
                testID="complete-visit-button"
                isDisabled={updateVisitStatus.isPending}
              >
                <HStack space="sm" className="items-center">
                  <CheckCircle size={20} color="#fff" />
                  <ButtonText>{t('visitDetail.completeVisit')}</ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={handleCancelVisitClick}
                action="negative"
                size="lg"
                variant="outline"
                testID="cancel-visit-button"
                isDisabled={updateVisitStatus.isPending}
              >
                <HStack space="sm" className="items-center">
                  <XCircle size={20} color="#ef4444" />
                  <ButtonText className="text-error-500">{t('visitDetail.cancelVisit')}</ButtonText>
                </HStack>
              </Button>
            </VStack>
          )}
        </VStack>
      </ScrollView>

      {/* Complete Visit Modal */}
      <Modal isOpen={showCompleteModal} onClose={handleCloseCompleteModal} size="lg">
        <ModalBackdrop />
        <ModalContent testID="complete-visit-modal">
          <ModalHeader>
            <Heading size="lg">{t('visitDetail.completeModal.title')}</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="lg">
              <Text className="text-typography-700">
                {t('visitDetail.completeModal.description')}
              </Text>

              <VStack space="xs">
                <Text className="text-sm font-medium text-typography-900">
                  {t('visitDetail.completeModal.notesLabel')}
                </Text>
                <Textarea>
                  <TextareaInput
                    placeholder={t('visitDetail.completeModal.notesPlaceholder')}
                    value={notes}
                    onChangeText={setNotes}
                    testID="complete-modal-notes-input"
                  />
                </Textarea>
              </VStack>

              <VStack space="xs">
                <Text className="text-sm font-medium text-typography-900">
                  {t('visitDetail.completeModal.recommendationsLabel')}
                </Text>
                <Textarea>
                  <TextareaInput
                    placeholder={t('visitDetail.completeModal.recommendationsPlaceholder')}
                    value={recommendations}
                    onChangeText={setRecommendations}
                    testID="complete-modal-recommendations-input"
                  />
                </Textarea>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" className="justify-end w-full">
              <Button
                variant="outline"
                onPress={handleCloseCompleteModal}
                testID="complete-modal-cancel-button"
                isDisabled={updateVisitStatus.isPending}
              >
                <ButtonText>{t('visitDetail.completeModal.cancelButton')}</ButtonText>
              </Button>
              <Button
                action="positive"
                onPress={handleConfirmComplete}
                testID="complete-modal-confirm-button"
                isDisabled={updateVisitStatus.isPending}
              >
                <ButtonText>{t('visitDetail.completeModal.confirmButton')}</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Visit Modal */}
      <Modal isOpen={showCancelModal} onClose={handleCloseCancelModal} size="lg">
        <ModalBackdrop />
        <ModalContent testID="cancel-visit-modal">
          <ModalHeader>
            <Heading size="lg">{t('visitDetail.cancelModal.title')}</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="lg">
              <Text className="text-typography-700">
                {t('visitDetail.cancelModal.description')}
              </Text>

              <VStack space="xs">
                <Text className="text-sm font-medium text-typography-900">
                  {t('visitDetail.cancelModal.notesLabel')}
                </Text>
                <Textarea>
                  <TextareaInput
                    placeholder={t('visitDetail.cancelModal.notesPlaceholder')}
                    value={notes}
                    onChangeText={setNotes}
                    testID="cancel-modal-notes-input"
                  />
                </Textarea>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" className="justify-end w-full">
              <Button
                variant="outline"
                onPress={handleCloseCancelModal}
                testID="cancel-modal-cancel-button"
                isDisabled={updateVisitStatus.isPending}
              >
                <ButtonText>{t('visitDetail.cancelModal.cancelButton')}</ButtonText>
              </Button>
              <Button
                action="negative"
                onPress={handleConfirmCancel}
                testID="cancel-modal-confirm-button"
                isDisabled={updateVisitStatus.isPending}
              >
                <ButtonText>{t('visitDetail.cancelModal.confirmButton')}</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
