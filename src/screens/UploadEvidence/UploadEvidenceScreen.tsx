import { ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { useTranslation } from '@/i18n/hooks';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Video,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

type MediaFile = {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  name: string;
};

export const UploadEvidenceScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { visitId } = useLocalSearchParams<{ visitId: string }>();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/visits');
    }
  };

  const handleTakePhoto = async () => {
    // TODO: Implement camera functionality
    // For now, show a placeholder message
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <VStack className="bg-info-500 p-4 rounded-lg">
            <Text className="text-white font-semibold">
              Camera functionality will be implemented
            </Text>
          </VStack>
        );
      },
    });
  };

  const handleUploadPhoto = async () => {
    // TODO: Implement photo picker functionality
    // For now, show a placeholder message
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <VStack className="bg-info-500 p-4 rounded-lg">
            <Text className="text-white font-semibold">
              Photo picker will be implemented
            </Text>
          </VStack>
        );
      },
    });
  };

  const handleUploadVideo = async () => {
    // TODO: Implement video picker functionality
    // For now, show a placeholder message
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <VStack className="bg-info-500 p-4 rounded-lg">
            <Text className="text-white font-semibold">
              Video picker will be implemented
            </Text>
          </VStack>
        );
      },
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUploadEvidence = async () => {
    if (files.length === 0) {
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <VStack className="bg-warning-500 p-4 rounded-lg">
              <Text className="text-white font-semibold">
                Please add at least one file
              </Text>
            </VStack>
          );
        },
      });
      return;
    }

    setIsUploading(true);

    // TODO: Implement actual upload logic
    // 1. Generate upload URL for each file
    // 2. Upload files to S3
    // 3. Confirm upload to backend

    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <VStack className="bg-success-500 p-4 rounded-lg">
              <Text className="text-white font-semibold">
                {t('uploadEvidence.uploadSuccess')}
              </Text>
            </VStack>
          );
        },
      });

      // Navigate back to visits
      router.replace('/(tabs)/visits');
    }, 2000);
  };

  const handleSkip = () => {
    router.replace('/(tabs)/visits');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="upload-evidence-screen">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-4 pb-8">
          {/* Header with back button */}
          <HStack space="md" className="items-center mb-2">
            <Pressable onPress={handleBack} testID="back-button" style={styles.backButton}>
              <ArrowLeft size={24} color="#6b7280" />
            </Pressable>
            <Heading size="xl">{t('uploadEvidence.title')}</Heading>
          </HStack>

          {/* Description */}
          <Text className="text-typography-700 mb-2">
            {t('uploadEvidence.description')}
          </Text>

          {/* Action Buttons */}
          <Card variant="elevated" className="p-4 bg-white">
            <VStack space="md">
              <Button
                onPress={handleTakePhoto}
                variant="outline"
                size="lg"
                testID="take-photo-button"
              >
                <HStack space="sm" className="items-center">
                  <Camera size={20} color="#6b7280" />
                  <ButtonText>{t('uploadEvidence.takePhoto')}</ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={handleUploadPhoto}
                variant="outline"
                size="lg"
                testID="upload-photo-button"
              >
                <HStack space="sm" className="items-center">
                  <ImageIcon size={20} color="#6b7280" />
                  <ButtonText>{t('uploadEvidence.uploadPhoto')}</ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={handleUploadVideo}
                variant="outline"
                size="lg"
                testID="upload-video-button"
              >
                <HStack space="sm" className="items-center">
                  <Video size={20} color="#6b7280" />
                  <ButtonText>{t('uploadEvidence.uploadVideo')}</ButtonText>
                </HStack>
              </Button>
            </VStack>
          </Card>

          {/* Files Preview */}
          <Card variant="elevated" className="p-4 bg-white">
            <VStack space="md">
              <Heading size="md">
                {files.length > 0
                  ? t('uploadEvidence.filesUploaded').replace('{{count}}', String(files.length))
                  : t('uploadEvidence.noFilesYet')}
              </Heading>

              {files.length > 0 && (
                <VStack space="sm">
                  {files.map((file) => (
                    <HStack
                      key={file.id}
                      space="md"
                      className="items-center justify-between p-3 bg-background-50 rounded-lg"
                    >
                      <HStack space="md" className="items-center flex-1">
                        {file.type === 'photo' ? (
                          <ImageIcon size={24} color="#6b7280" />
                        ) : (
                          <Video size={24} color="#6b7280" />
                        )}
                        <Text className="flex-1 text-typography-900" numberOfLines={1}>
                          {file.name}
                        </Text>
                      </HStack>

                      <Pressable
                        onPress={() => handleRemoveFile(file.id)}
                        testID={`remove-file-${file.id}`}
                        style={styles.removeButton}
                      >
                        <X size={20} color="#ef4444" />
                      </Pressable>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Upload/Skip Buttons */}
          <VStack space="md" className="mt-4">
            <Button
              onPress={handleUploadEvidence}
              action="positive"
              size="lg"
              testID="upload-evidence-button"
              isDisabled={isUploading || files.length === 0}
            >
              <ButtonText>
                {isUploading ? t('uploadEvidence.uploading') : t('uploadEvidence.uploadButton')}
              </ButtonText>
            </Button>

            <Button
              onPress={handleSkip}
              variant="outline"
              size="lg"
              testID="skip-button"
              isDisabled={isUploading}
            >
              <ButtonText>{t('uploadEvidence.skipButton')}</ButtonText>
            </Button>
          </VStack>
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
  removeButton: {
    padding: 4,
  },
});
