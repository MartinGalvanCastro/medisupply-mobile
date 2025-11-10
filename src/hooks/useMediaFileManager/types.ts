export interface MediaFile {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  name: string;
}

export interface UseMediaFileManagerReturn {
  files: MediaFile[];
  addFile: (file: MediaFile) => void;
  addFiles: (files: MediaFile[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  hasFiles: boolean;
  fileCount: number;
}
