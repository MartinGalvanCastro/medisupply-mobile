import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n/hooks';
import { useCreateVisitBffSellersAppVisitsPost } from '@/api/generated/sellers-app/sellers-app';
import { Calendar, Clock, ArrowLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/toast';

// Types
type ScheduleVisitFormData = {
  visitDate: Date;
  visitTime: Date;
  notes?: string;
};

// Schema factory
const createScheduleVisitSchema = (t: (key: any) => string) =>
  z.object({
    visitDate: z.date({
      required_error: t('clientDetail.validation.dateRequired'),
      invalid_type_error: t('clientDetail.validation.dateInvalid'),
    }).refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate > today;
    }, {
      message: t('clientDetail.validation.dateTodayNotAllowed'),
    }),
    visitTime: z.date({
      required_error: t('clientDetail.validation.timeRequired'),
      invalid_type_error: t('clientDetail.validation.dateInvalid'),
    }),
    notes: z.string().optional(),
  });

export const ScheduleVisitScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  // Picker state
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  // Get tomorrow as minimum date
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);

  // Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ScheduleVisitFormData>({
    resolver: zodResolver(createScheduleVisitSchema(t)),
    defaultValues: {
      visitDate: minDate,
      visitTime: new Date(),
      notes: '',
    },
  });

  const visitDate = watch('visitDate');
  const visitTime = watch('visitTime');

  // Create visit mutation
  const createVisit = useCreateVisitBffSellersAppVisitsPost({
    mutation: {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <VStack className="bg-success-500 p-4 rounded-lg">
                <Text className="text-white font-semibold">
                  {t('clientDetail.scheduleVisitSuccess')}
                </Text>
                <Text className="text-white text-sm">
                  {t('clientDetail.scheduleVisitSuccessMessage')}
                </Text>
              </VStack>
            );
          },
        });

        // Navigate to visits screen
        router.replace('/(tabs)/visits');
      },
      onError: () => {
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <VStack className="bg-error-500 p-4 rounded-lg">
                <Text className="text-white font-semibold">
                  {t('clientDetail.scheduleVisitError')}
                </Text>
              </VStack>
            );
          },
        });
      },
    },
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/clients');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date change event:', event.type, selectedDate);
    setPickerMode(null);

    if (selectedDate && event.type === 'set') {
      setValue('visitDate', selectedDate, { shouldValidate: true });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time change event:', event.type, selectedTime);
    setPickerMode(null);

    if (selectedTime && event.type === 'set') {
      setValue('visitTime', selectedTime, { shouldValidate: true });
    }
  };

  const handleConfirmSchedule = handleSubmit((data) => {
    if (!clientId) return;

    // Combine date and time into a single ISO 8601 string
    const combinedDateTime = new Date(data.visitDate);
    combinedDateTime.setHours(data.visitTime.getHours());
    combinedDateTime.setMinutes(data.visitTime.getMinutes());
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);

    createVisit.mutate({
      data: {
        client_id: clientId,
        fecha_visita: combinedDateTime.toISOString(),
        notas_visita: data.notes || undefined,
      },
    });
  });

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDisplayTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="schedule-visit-screen">
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space="lg" className="p-4 pb-8">
            {/* Header */}
            <HStack space="md" className="items-center mb-2">
              <TouchableOpacity onPress={handleBack} testID="back-button" style={styles.backButton}>
                <ArrowLeft size={24} color="#6b7280" />
              </TouchableOpacity>
              <Heading size="xl" className="text-typography-900">
                {t('clientDetail.scheduleVisitModal.title')}
              </Heading>
            </HStack>

            <Text className="text-typography-700 mb-4">
              {t('clientDetail.scheduleVisitModal.description')}
            </Text>

            {/* Date Selection */}
            <View>
              <Text className="text-sm font-medium text-typography-900 mb-2">
                {t('clientDetail.scheduleVisitModal.dateLabel')}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerMode('date')}
                testID="select-date-button"
                activeOpacity={0.7}
                style={styles.pickerButton}
              >
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.pickerButtonText}>
                  {visitDate ? formatDisplayDate(visitDate) : t('clientDetail.scheduleVisitModal.selectDate')}
                </Text>
              </TouchableOpacity>
              {errors.visitDate && (
                <Text style={styles.errorText}>
                  {errors.visitDate.message}
                </Text>
              )}
            </View>

            {/* Time Selection */}
            <View>
              <Text className="text-sm font-medium text-typography-900 mb-2">
                {t('clientDetail.scheduleVisitModal.timeLabel')}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerMode('time')}
                testID="select-time-button"
                activeOpacity={0.7}
                style={styles.pickerButton}
              >
                <Clock size={16} color="#6b7280" />
                <Text style={styles.pickerButtonText}>
                  {visitTime ? formatDisplayTime(visitTime) : t('clientDetail.scheduleVisitModal.selectTime')}
                </Text>
              </TouchableOpacity>
              {errors.visitTime && (
                <Text style={styles.errorText}>
                  {errors.visitTime.message}
                </Text>
              )}
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-medium text-typography-900 mb-2">
                {t('clientDetail.scheduleVisitModal.notesLabel')}
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Textarea className="border-outline-300">
                    <TextareaInput
                      placeholder={t('clientDetail.scheduleVisitModal.notesPlaceholder')}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      testID="notes-input"
                    />
                  </Textarea>
                )}
              />
            </View>

            {/* Actions */}
            <VStack space="md" className="mt-6">
              <Button
                action="primary"
                onPress={handleConfirmSchedule}
                testID="schedule-confirm-button"
                isDisabled={createVisit.isPending}
                size="lg"
              >
                <ButtonText>
                  {createVisit.isPending
                    ? t('clientDetail.scheduleVisitModal.scheduling')
                    : t('clientDetail.scheduleVisitModal.confirmButton')}
                </ButtonText>
              </Button>
              <Button
                variant="outline"
                onPress={handleBack}
                testID="schedule-cancel-button"
                isDisabled={createVisit.isPending}
              >
                <ButtonText>{t('clientDetail.scheduleVisitModal.cancelButton')}</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>

      {/* Date/Time Picker - OUTSIDE SafeAreaView */}
      {pickerMode === 'date' && (
        <DateTimePicker
          testID="date-picker"
          value={visitDate || minDate}
          mode="date"
          onChange={handleDateChange}
          minimumDate={minDate}
        />
      )}
      {pickerMode === 'time' && (
        <DateTimePicker
          testID="time-picker"
          value={visitTime || new Date()}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
    </>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});
