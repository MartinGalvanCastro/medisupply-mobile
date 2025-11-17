import { useState, useCallback } from 'react';
import {
  useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
  useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
} from '@/api/generated/sellers-app/sellers-app';
import type { MediaFile } from '@/hooks/useMediaFileManager';
import type {
  UseEvidenceUploadProps,
  UseEvidenceUploadReturn,
  UploadProgress,
  UploadResult,
} from './types';

const getMimeType = (file: MediaFile): string => {
  if (file.type === 'photo') {
    return 'image/jpeg';
  }
  return 'video/mp4';
};

export const useEvidenceUpload = ({
  visitId,
}: UseEvidenceUploadProps): UseEvidenceUploadReturn => {
  const [progress, setProgress] = useState<UploadProgress>({
    uploadedCount: 0,
    totalCount: 0,
    currentFile: null,
    isUploading: false,
  });

  const generateUrlMutation =
    useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost();
  const confirmUploadMutation =
    useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost();

  const uploadToS3 = useCallback(
    async (
      presignedUrl: string,
      fields: Record<string, string>,
      fileUri: string,
      fileName: string,
      mimeType: string
    ): Promise<void> => {
      const formData = new FormData();

      // Add all pre-signed fields first
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add the file last (required by AWS S3)
      // In React Native, FormData expects an object with uri, type, and name
      formData.append('file', {
        uri: fileUri,
        type: mimeType,
        name: fileName,
      } as any);

      const response = await fetch(presignedUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`);
      }
    },
    []
  );

  const uploadFiles = useCallback(
    async (files: MediaFile[]): Promise<UploadResult> => {
      setProgress({
        uploadedCount: 0,
        totalCount: files.length,
        currentFile: null,
        isUploading: true,
      });

      // Upload all files in parallel
      const uploadPromises = files.map(async (file) => {
        try {
          // Step 1: Generate pre-signed upload URL
          const urlResponse = await generateUrlMutation.mutateAsync({
            visitId,
            data: {
              filename: file.name,
              content_type: getMimeType(file),
            },
          });

          // Step 2: Upload to S3
          await uploadToS3(
            urlResponse.upload_url,
            urlResponse.fields,
            file.uri,
            file.name,
            getMimeType(file)
          );

          // Step 3: Confirm upload to backend
          await confirmUploadMutation.mutateAsync({
            visitId,
            data: {
              s3_url: urlResponse.s3_url,
            },
          });

          // Update progress
          setProgress((prev) => ({
            ...prev,
            uploadedCount: prev.uploadedCount + 1,
          }));

          return { success: true, url: urlResponse.s3_url };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          return {
            success: false,
            error: `Failed to upload ${file.name}: ${errorMessage}`
          };
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);

      // Separate successes and errors
      const uploadedUrls = results
        .filter((r) => r.success)
        .map((r) => r.url as string);

      const errors = results
        .filter((r) => !r.success)
        .map((r) => r.error as string);

      setProgress((prev) => ({
        ...prev,
        currentFile: null,
        isUploading: false,
      }));

      return {
        success: errors.length === 0,
        uploadedUrls,
        errors,
      };
    },
    [visitId, generateUrlMutation, confirmUploadMutation, uploadToS3]
  );

  return {
    uploadFiles,
    progress,
    isUploading: progress.isUploading,
  };
};
