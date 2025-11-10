import type { MediaFile } from '@/hooks/useMediaFileManager';

export interface UseMediaPickerProps {
  onFilesSelected: (files: MediaFile[]) => void;
  onError?: (error: Error) => void;
}

export interface UseMediaPickerReturn {
  takePhoto: () => Promise<void>;
  uploadPhotos: () => Promise<void>;
  uploadVideos: () => Promise<void>;
  isProcessing: boolean;
}
