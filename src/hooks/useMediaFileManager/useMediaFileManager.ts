import { useState, useCallback } from 'react';
import type { MediaFile, UseMediaFileManagerReturn } from './types';

export const useMediaFileManager = (): UseMediaFileManagerReturn => {
  const [files, setFiles] = useState<MediaFile[]>([]);

  const addFile = useCallback((file: MediaFile) => {
    setFiles((prev) => [...prev, file]);
  }, []);

  const addFiles = useCallback((newFiles: MediaFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    addFile,
    addFiles,
    removeFile,
    clearFiles,
    hasFiles: files.length > 0,
    fileCount: files.length,
  };
};
