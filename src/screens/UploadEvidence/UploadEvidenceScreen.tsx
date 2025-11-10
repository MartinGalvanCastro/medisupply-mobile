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
import { useToast } from '@/components/ui/toast';
import { useMediaFileManager } from '@/hooks/useMediaFileManager';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import { useEvidenceUpload } from '@/hooks/useEvidenceUpload';

export const UploadEvidenceScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { visitId } = useLocalSearchParams<{ visitId: string }>();

  // Custom hooks for file management, media picking, and uploading
  const { files, addFiles, removeFile, hasFiles } = useMediaFileManager();
  const { uploadFiles, isUploading } = useEvidenceUpload({ visitId: visitId || '' });

  const { takePhoto, uploadPhotos, uploadVideos, isProcessing } = useMediaPicker({
    onFilesSelected: addFiles,
    onError: (error) => {
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <VStack className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white font-semibold">
                Camera not available on simulator. Please use a physical device to test camera features.
              </Text>
            </VStack>
          );
        },
      });
    },
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/visits');
    }
  };

  const handleUploadEvidence = async () => {
    if (!hasFiles) {
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

    const result = await uploadFiles(files);

    if (result.success) {
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
      router.replace('/(tabs)/visits');
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <VStack className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white font-semibold">
                {result.errors.join('\n')}
              </Text>
            </VStack>
          );
        },
      });
    }
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
                onPress={takePhoto}
                variant="outline"
                size="lg"
                testID="take-photo-button"
                isDisabled={isProcessing}
              >
                <HStack space="sm" className="items-center">
                  <Camera size={20} color="#6b7280" />
                  <ButtonText>{t('uploadEvidence.takePhoto')}</ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={uploadPhotos}
                variant="outline"
                size="lg"
                testID="upload-photo-button"
                isDisabled={isProcessing}
              >
                <HStack space="sm" className="items-center">
                  <ImageIcon size={20} color="#6b7280" />
                  <ButtonText>{t('uploadEvidence.uploadPhoto')}</ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={uploadVideos}
                variant="outline"
                size="lg"
                testID="upload-video-button"
                isDisabled={isProcessing}
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
                          <Image
                            source={{ uri: file.uri }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                          />
                        ) : (
                          <Video size={40} color="#6b7280" />
                        )}
                        <Text className="flex-1 text-typography-900" numberOfLines={1}>
                          {file.name}
                        </Text>
                      </HStack>

                      <Pressable
                        onPress={() => removeFile(file.id)}
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
              isDisabled={isUploading || isProcessing}
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
              isDisabled={isUploading || isProcessing}
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
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
});
