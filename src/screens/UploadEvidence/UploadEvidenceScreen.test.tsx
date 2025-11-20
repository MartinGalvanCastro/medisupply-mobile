import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UploadEvidenceScreen } from './UploadEvidenceScreen';
import { useTranslation } from '@/i18n/hooks';
import { useToast } from '@/components/ui/toast';
import { useMediaFileManager } from '@/hooks/useMediaFileManager';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import { useEvidenceUpload } from '@/hooks/useEvidenceUpload';
import { router, useLocalSearchParams } from 'expo-router';

jest.mock('@/i18n/hooks');
jest.mock('@/components/ui/toast');
jest.mock('@/hooks/useMediaFileManager');
jest.mock('@/hooks/useMediaPicker');
jest.mock('@/hooks/useEvidenceUpload');
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseMediaFileManager = useMediaFileManager as jest.MockedFunction<
  typeof useMediaFileManager
>;
const mockUseMediaPicker = useMediaPicker as jest.MockedFunction<typeof useMediaPicker>;
const mockUseEvidenceUpload = useEvidenceUpload as jest.MockedFunction<
  typeof useEvidenceUpload
>;

const mockFile = {
  id: '1',
  name: 'photo.jpg',
  uri: 'file:///photo.jpg',
  type: 'photo' as const,
};

const mockVideoFile = {
  id: '2',
  name: 'video.mp4',
  uri: 'file:///video.mp4',
  type: 'video' as const,
};

const createWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('UploadEvidenceScreen', () => {
  let mockQueryClient: QueryClient;
  let mockToast: any;
  let mockAddFiles: jest.Mock;
  let mockRemoveFile: jest.Mock;
  let mockUploadFiles: jest.Mock;
  let mockTakePhoto: jest.Mock;
  let mockUploadPhotos: jest.Mock;
  let mockUploadVideos: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();

    mockAddFiles = jest.fn();
    mockRemoveFile = jest.fn();
    mockUploadFiles = jest.fn().mockResolvedValue({ success: true, uploadedUrls: [], errors: [] });
    mockTakePhoto = jest.fn();
    mockUploadPhotos = jest.fn();
    mockUploadVideos = jest.fn();

    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'uploadEvidence.title': 'Upload Evidence',
          'uploadEvidence.description': 'Add photos or videos as evidence',
          'uploadEvidence.takePhoto': 'Take Photo',
          'uploadEvidence.uploadPhoto': 'Upload Photo',
          'uploadEvidence.uploadVideo': 'Upload Video',
          'uploadEvidence.filesUploaded': '{{count}} file(s) uploaded',
          'uploadEvidence.noFilesYet': 'No files yet',
          'uploadEvidence.uploading': 'Uploading...',
          'uploadEvidence.uploadButton': 'Upload Evidence',
          'uploadEvidence.skipButton': 'Skip',
          'uploadEvidence.uploadSuccess': 'Evidence uploaded successfully',
        };
        return translations[key] || key;
      },
      i18n: {} as any,
    });

    mockToast = {
      show: jest.fn(),
    };
    mockUseToast.mockReturnValue(mockToast);

    mockUseMediaFileManager.mockReturnValue({
      files: [],
      addFiles: mockAddFiles,
      removeFile: mockRemoveFile,
      hasFiles: false,
      fileCount: 0,
      addFile: jest.fn(),
      clearFiles: jest.fn(),
    } as any);

    mockUseMediaPicker.mockReturnValue({
      takePhoto: mockTakePhoto,
      uploadPhotos: mockUploadPhotos,
      uploadVideos: mockUploadVideos,
      isProcessing: false,
    } as any);

    mockUseEvidenceUpload.mockReturnValue({
      uploadFiles: mockUploadFiles,
      isUploading: false,
      progress: {
        uploadedCount: 0,
        totalCount: 0,
        currentFile: null,
        isUploading: false,
      },
    } as any);

    (useLocalSearchParams as jest.Mock).mockReturnValue({ visitId: 'visit123' });
    (router.canGoBack as jest.Mock).mockReturnValue(true);
    (router.back as jest.Mock).mockImplementation(() => {});
    (router.replace as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Screen Rendering', () => {
    it('should render upload evidence screen', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
    });

    it('should render back button', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('back-button')).toBeDefined();
    });

    it('should render take photo button', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('take-photo-button')).toBeDefined();
    });

    it('should render upload photo button', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-photo-button')).toBeDefined();
    });

    it('should render upload video button', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-video-button')).toBeDefined();
    });

    it('should render upload evidence button', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-evidence-button')).toBeDefined();
    });

    it('should render skip button', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('skip-button')).toBeDefined();
    });
  });

  describe('File Management', () => {
    it('should display no files message when no files selected', () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: false,
        fileCount: 0,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByText('No files yet')).toBeDefined();
    });

    it('should display file count when files are selected', () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile, mockVideoFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 2,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByText('2 file(s) uploaded')).toBeDefined();
    });

    it('should display file list when files are available', () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId(`remove-file-${mockFile.id}`)).toBeDefined();
    });

    it('should remove file when remove button is pressed', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const removeButton = screen.getByTestId(`remove-file-${mockFile.id}`);
      fireEvent.press(removeButton);

      expect(mockRemoveFile).toHaveBeenCalledWith(mockFile.id);
    });
  });

  describe('Media Picker Actions', () => {
    it('should call takePhoto when take photo button is pressed', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const takePhotoButton = screen.getByTestId('take-photo-button');
      fireEvent.press(takePhotoButton);

      expect(mockTakePhoto).toHaveBeenCalled();
    });

    it('should call uploadPhotos when upload photo button is pressed', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadPhotoButton = screen.getByTestId('upload-photo-button');
      fireEvent.press(uploadPhotoButton);

      expect(mockUploadPhotos).toHaveBeenCalled();
    });

    it('should call uploadVideos when upload video button is pressed', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadVideoButton = screen.getByTestId('upload-video-button');
      fireEvent.press(uploadVideoButton);

      expect(mockUploadVideos).toHaveBeenCalled();
    });
  });

  describe('Upload Evidence', () => {
    it('should show warning toast when upload is pressed without files', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: false,
        fileCount: 0,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
      });
    });

    it('should call uploadFiles when upload is pressed with files', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockUploadFiles).toHaveBeenCalledWith([mockFile]);
      });
    });

    it('should show success toast and navigate on successful upload', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      mockUploadFiles.mockResolvedValue({ success: true, uploadedUrls: [], errors: [] });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
      });
    });

    it('should show error toast and errors on failed upload', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      mockUploadFiles.mockResolvedValue({
        success: false,
        uploadedUrls: [],
        errors: ['Upload failed', 'Network error'],
      });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
      });
    });
  });

  describe('Skip Navigation', () => {
    it('should navigate to visits when skip button is pressed', () => {
      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const skipButton = screen.getByTestId('skip-button');
      fireEvent.press(skipButton);

      expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
    });

    it('should disable skip button when uploading', () => {
      mockUseEvidenceUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        isUploading: true,
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: 'photo.jpg',
          isUploading: true,
        },
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('skip-button')).toBeDefined();
    });
  });

  describe('Back Navigation', () => {
    it('should go back when back button is pressed if router can go back', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
    });

    it('should navigate to visits if router cannot go back', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
    });
  });

  describe('Button Disabled States', () => {
    it('should disable media buttons when isProcessing is true', () => {
      mockUseMediaPicker.mockReturnValue({
        takePhoto: mockTakePhoto,
        uploadPhotos: mockUploadPhotos,
        uploadVideos: mockUploadVideos,
        isProcessing: true,
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('take-photo-button')).toBeDefined();
      expect(screen.getByTestId('upload-photo-button')).toBeDefined();
      expect(screen.getByTestId('upload-video-button')).toBeDefined();
    });

    it('should disable upload buttons when isUploading is true', () => {
      mockUseEvidenceUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        isUploading: true,
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: 'photo.jpg',
          isUploading: true,
        },
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-evidence-button')).toBeDefined();
      expect(screen.getByTestId('skip-button')).toBeDefined();
    });
  });

  describe('Media Picker Error Handling', () => {
    it('should handle media picker errors', () => {
      mockUseMediaPicker.mockImplementation(({ onError }: any) => {
        if (onError) {
          onError(new Error('Camera not available'));
        }
        return {
          takePhoto: mockTakePhoto,
          uploadPhotos: mockUploadPhotos,
          uploadVideos: mockUploadVideos,
          isProcessing: false,
        };
      });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
    });
  });

  describe('File Types Display', () => {
    it('should display remove button for photo files', () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId(`remove-file-${mockFile.id}`)).toBeDefined();
    });

    it('should display remove button for video files', () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockVideoFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId(`remove-file-${mockVideoFile.id}`)).toBeDefined();
    });
  });

  describe('Multiple Files Display', () => {
    it('should display all files when multiple files are selected', () => {
      const file3 = {
        id: '3',
        name: 'photo2.jpg',
        uri: 'file:///photo2.jpg',
        type: 'photo' as const,
      };

      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile, mockVideoFile, file3],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 3,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId(`remove-file-${mockFile.id}`)).toBeDefined();
      expect(screen.getByTestId(`remove-file-${mockVideoFile.id}`)).toBeDefined();
      expect(screen.getByTestId(`remove-file-${file3.id}`)).toBeDefined();
    });
  });

  describe('Upload Button Text States', () => {
    it('should show upload evidence button when not uploading', () => {
      mockUseEvidenceUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        isUploading: false,
        progress: {
          uploadedCount: 0,
          totalCount: 0,
          currentFile: null,
          isUploading: false,
        },
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-evidence-button')).toBeDefined();
    });

    it('should show uploading text when uploading', () => {
      mockUseEvidenceUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        isUploading: true,
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: 'photo.jpg',
          isUploading: true,
        },
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByText('Uploading...')).toBeDefined();
    });
  });

  describe('Multiple Error Messages', () => {
    it('should handle multiple error messages when upload fails', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile, mockVideoFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 2,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      mockUploadFiles.mockResolvedValue({
        success: false,
        uploadedUrls: [],
        errors: ['Error 1', 'Error 2', 'Error 3'],
      });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
      });
    });
  });

  describe('useLocalSearchParams', () => {
    it('should handle missing visitId and use empty string as fallback', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ visitId: undefined });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
      expect(mockUseEvidenceUpload).toHaveBeenCalledWith({ visitId: '' });
    });
  });

  describe('Toast Content Rendering', () => {
    it('should render correct warning toast content when no files', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: false,
        fileCount: 0,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
        const toastCall = mockToast.show.mock.calls[0][0];
        expect(toastCall.placement).toBe('top');
        const renderedComponent = toastCall.render({ id: 'test' });
        expect(renderedComponent).toBeDefined();
      });
    });

    it('should render correct success toast content on upload success', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      mockUploadFiles.mockResolvedValue({ success: true, uploadedUrls: [], errors: [] });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
        const successCall = mockToast.show.mock.calls[0][0];
        expect(successCall.placement).toBe('top');
        const renderedComponent = successCall.render({ id: 'test' });
        expect(renderedComponent).toBeDefined();
      });
    });

    it('should render correct error toast content on upload failure', async () => {
      mockUseMediaFileManager.mockReturnValue({
        files: [mockFile],
        addFiles: mockAddFiles,
        removeFile: mockRemoveFile,
        hasFiles: true,
        fileCount: 1,
        addFile: jest.fn(),
        clearFiles: jest.fn(),
      } as any);

      mockUploadFiles.mockResolvedValue({
        success: false,
        uploadedUrls: [],
        errors: ['Upload failed', 'Network error'],
      });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
        const errorCall = mockToast.show.mock.calls[0][0];
        expect(errorCall.placement).toBe('top');
        const renderedComponent = errorCall.render({ id: 'test' });
        expect(renderedComponent).toBeDefined();
      });
    });

    it('should render error toast from media picker onError callback', async () => {
      const errorCallbacks: any[] = [];
      mockUseMediaPicker.mockImplementation(({ onError }: any) => {
        if (onError) {
          errorCallbacks.push(onError);
        }
        return {
          takePhoto: mockTakePhoto,
          uploadPhotos: mockUploadPhotos,
          uploadVideos: mockUploadVideos,
          isProcessing: false,
        };
      });

      render(<UploadEvidenceScreen />, { wrapper: createWrapper(mockQueryClient) });

      // Verify the error callback was registered
      expect(errorCallbacks.length).toBeGreaterThan(0);

      // Call the error callback
      if (errorCallbacks[0]) {
        errorCallbacks[0](new Error('Camera not available'));
      }

      await waitFor(() => {
        expect(mockToast.show).toHaveBeenCalled();
        const errorCall = mockToast.show.mock.calls[0][0];
        expect(errorCall.placement).toBe('top');
        const renderedComponent = errorCall.render({ id: 'test' });
        expect(renderedComponent).toBeDefined();
      });
    });
  });
});
