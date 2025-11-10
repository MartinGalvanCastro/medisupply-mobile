import type { MediaFile } from '@/hooks/useMediaFileManager';

export interface UseEvidenceUploadProps {
  visitId: string;
}

export interface UploadProgress {
  uploadedCount: number;
  totalCount: number;
  currentFile: string | null;
  isUploading: boolean;
}

export interface UploadResult {
  success: boolean;
  uploadedUrls: string[];
  errors: string[];
}

export interface UseEvidenceUploadReturn {
  uploadFiles: (files: MediaFile[]) => Promise<UploadResult>;
  progress: UploadProgress;
  isUploading: boolean;
}
