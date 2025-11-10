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
      fileUri: string
    ): Promise<void> => {
      const formData = new FormData();

      // Add all pre-signed fields first
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add the file last (required by AWS S3)
      const fileResponse = await fetch(fileUri);
      const blob = await fileResponse.blob();
      formData.append('file', blob);

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
      const uploadedUrls: string[] = [];
      const errors: string[] = [];

      setProgress({
        uploadedCount: 0,
        totalCount: files.length,
        currentFile: null,
        isUploading: true,
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          setProgress((prev) => ({
            ...prev,
            currentFile: file.name,
          }));

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
            file.uri
          );

          // Step 3: Confirm upload to backend
          await confirmUploadMutation.mutateAsync({
            visitId,
            data: {
              s3_url: urlResponse.s3_url,
            },
          });

          uploadedUrls.push(urlResponse.s3_url);

          setProgress((prev) => ({
            ...prev,
            uploadedCount: prev.uploadedCount + 1,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }

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
