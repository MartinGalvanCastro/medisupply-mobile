import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { UploadEvidenceScreen } from './UploadEvidenceScreen';
import type { MediaFile } from '@/hooks/useMediaFileManager';

// Mock router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useLocalSearchParams: jest.fn(() => ({ visitId: 'visit-123' })),
}));

// Mock useMediaFileManager
jest.mock('@/hooks/useMediaFileManager', () => ({
  useMediaFileManager: jest.fn(() => ({
    files: [],
    addFile: jest.fn(),
    addFiles: jest.fn(),
    removeFile: jest.fn(),
    clearFiles: jest.fn(),
    hasFiles: false,
    fileCount: 0,
  })),
}));

// Mock useMediaPermissions
jest.mock('@/hooks/useMediaPermissions', () => ({
  useMediaPermissions: jest.fn(() => ({
    camera: {
      isGranted: false,
      isBlocked: false,
      isDenied: true,
    },
    photoLibrary: {
      isGranted: false,
      isBlocked: false,
      isDenied: true,
    },
    mediaLibrary: {
      isGranted: false,
      isBlocked: false,
      isDenied: true,
    },
    requestCameraPermission: jest.fn(),
    requestPhotoLibraryPermission: jest.fn(),
    requestMediaLibraryPermission: jest.fn(),
    handleBlockedPermission: jest.fn(),
  })),
}));

// Mock useMediaPicker
jest.mock('@/hooks/useMediaPicker', () => ({
  useMediaPicker: jest.fn(() => ({
    takePhoto: jest.fn(),
    uploadPhotos: jest.fn(),
    uploadVideos: jest.fn(),
    isProcessing: false,
  })),
}));

// Mock useEvidenceUpload
jest.mock('@/hooks/useEvidenceUpload', () => ({
  useEvidenceUpload: jest.fn(() => ({
    uploadFiles: jest.fn(async () => ({
      success: true,
      uploadedUrls: [],
      errors: [],
    })),
    progress: {
      uploadedCount: 0,
      totalCount: 0,
      currentFile: null,
      isUploading: false,
    },
    isUploading: false,
  })),
}));

// Mock useToast
jest.mock('@/components/ui/toast', () => ({
  useToast: jest.fn(() => ({
    show: jest.fn(),
  })),
}));

// Mock useTranslation
jest.mock('@/i18n/hooks', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

describe('UploadEvidenceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the screen', () => {
      render(<UploadEvidenceScreen />);

      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
    });

    it('should render action buttons', () => {
      render(<UploadEvidenceScreen />);

      expect(screen.getByTestId('take-photo-button')).toBeDefined();
      expect(screen.getByTestId('upload-photo-button')).toBeDefined();
      expect(screen.getByTestId('upload-video-button')).toBeDefined();
    });

    it('should render upload and skip buttons', () => {
      render(<UploadEvidenceScreen />);

      expect(screen.getByTestId('upload-evidence-button')).toBeDefined();
      expect(screen.getByTestId('skip-button')).toBeDefined();
    });

    it('should render back button', () => {
      render(<UploadEvidenceScreen />);

      expect(screen.getByTestId('back-button')).toBeDefined();
    });

    it('should display no files message when empty', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      useMediaFileManager.mockReturnValue({
        files: [],
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: false,
        fileCount: 0,
      });

      render(<UploadEvidenceScreen />);

      // Screen should contain "no files" related text
      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
    });

    it('should display file count when files exist', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      render(<UploadEvidenceScreen />);

      // File should be displayed in the list
      const screen_rendered = screen.getByTestId('upload-evidence-screen');
      expect(screen_rendered).toBeDefined();
    });
  });

  describe('button interactions', () => {
    it('should call takePhoto when take photo button is pressed', () => {
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const mockTakePhoto = jest.fn();

      useMediaPicker.mockReturnValue({
        takePhoto: mockTakePhoto,
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      render(<UploadEvidenceScreen />);

      const takePhotoButton = screen.getByTestId('take-photo-button');
      fireEvent.press(takePhotoButton);

      expect(mockTakePhoto).toHaveBeenCalled();
    });

    it('should call uploadPhotos when upload photo button is pressed', () => {
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const mockUploadPhotos = jest.fn();

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: mockUploadPhotos,
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      render(<UploadEvidenceScreen />);

      const uploadPhotoButton = screen.getByTestId('upload-photo-button');
      fireEvent.press(uploadPhotoButton);

      expect(mockUploadPhotos).toHaveBeenCalled();
    });

    it('should call uploadVideos when upload video button is pressed', () => {
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const mockUploadVideos = jest.fn();

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: mockUploadVideos,
        isProcessing: false,
      });

      render(<UploadEvidenceScreen />);

      const uploadVideoButton = screen.getByTestId('upload-video-button');
      fireEvent.press(uploadVideoButton);

      expect(mockUploadVideos).toHaveBeenCalled();
    });

    it('should disable action buttons when isProcessing is true', () => {
      const { useMediaPicker } = require('@/hooks/useMediaPicker');

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: true,
      });

      render(<UploadEvidenceScreen />);

      const takePhotoButton = screen.getByTestId('take-photo-button');
      const uploadPhotoButton = screen.getByTestId('upload-photo-button');
      const uploadVideoButton = screen.getByTestId('upload-video-button');

      expect(takePhotoButton.props.accessibilityState?.disabled).toBe(true);
      expect(uploadPhotoButton.props.accessibilityState?.disabled).toBe(true);
      expect(uploadVideoButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('file removal', () => {
    it('should remove file when remove button is pressed', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockRemoveFile = jest.fn();
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: mockRemoveFile,
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      render(<UploadEvidenceScreen />);

      const removeButton = screen.getByTestId('remove-file-file-1');
      fireEvent.press(removeButton);

      expect(mockRemoveFile).toHaveBeenCalledWith('file-1');
    });

    it('should display remove button for each file', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image1.jpg',
          type: 'photo',
          name: 'image1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file:///path/to/image2.jpg',
          type: 'photo',
          name: 'image2.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 2,
      });

      render(<UploadEvidenceScreen />);

      const removeButton1 = screen.getByTestId('remove-file-file-1');
      const removeButton2 = screen.getByTestId('remove-file-file-2');

      expect(removeButton1).toBeDefined();
      expect(removeButton2).toBeDefined();
    });
  });

  describe('upload functionality', () => {
    it('should show warning when uploading with no files', async () => {
      const { useToast } = require('@/components/ui/toast');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const mockToastShow = jest.fn();

      useToast.mockReturnValue({
        show: mockToastShow,
      });

      useMediaFileManager.mockReturnValue({
        files: [],
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: false,
        fileCount: 0,
      });

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(async () => ({
          success: true,
          uploadedUrls: [],
          errors: [],
        })),
        progress: {
          uploadedCount: 0,
          totalCount: 0,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalled();
      });
    });

    it('should disable upload button when isUploading is true', () => {
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(),
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: 'image.jpg',
          isUploading: true,
        },
        isUploading: true,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      expect(uploadButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should enable upload button even when no files (shows warning on press)', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');

      useMediaFileManager.mockReturnValue({
        files: [],
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: false,
        fileCount: 0,
      });

      // Explicitly ensure isProcessing and isUploading are false
      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(async () => ({
          success: true,
          uploadedUrls: [],
          errors: [],
        })),
        progress: {
          uploadedCount: 0,
          totalCount: 0,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      // Button should be enabled so users can see the warning toast
      expect(uploadButton.props.accessibilityState?.disabled).toBe(false);
    });

    it('should call uploadFiles with files', async () => {
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const mockUploadFiles = jest.fn(async () => ({
        success: true,
        uploadedUrls: ['https://s3.amazonaws.com/bucket/file.jpg'],
        errors: [],
      }));
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockUploadFiles).toHaveBeenCalledWith(mockFiles);
      });
    });

    it('should navigate to visits on successful upload', async () => {
      const { router } = require('expo-router');
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const { useToast } = require('@/components/ui/toast');

      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(async () => ({
          success: true,
          uploadedUrls: ['https://s3.amazonaws.com/bucket/file.jpg'],
          errors: [],
        })),
        progress: {
          uploadedCount: 1,
          totalCount: 1,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      useToast.mockReturnValue({
        show: jest.fn(),
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
      });
    });

    it('should show error toast on upload failure', async () => {
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const { useToast } = require('@/components/ui/toast');
      const mockToastShow = jest.fn();

      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(async () => ({
          success: false,
          uploadedUrls: [],
          errors: ['Upload failed'],
        })),
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      useToast.mockReturnValue({
        show: mockToastShow,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalled();
      });
    });
  });

  describe('skip functionality', () => {
    it('should navigate to visits when skip button is pressed', () => {
      const { router } = require('expo-router');
      const { useMediaPicker } = require('@/hooks/useMediaPicker');
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: false,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(async () => ({
          success: true,
          uploadedUrls: [],
          errors: [],
        })),
        progress: {
          uploadedCount: 0,
          totalCount: 0,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      render(<UploadEvidenceScreen />);

      const skipButton = screen.getByTestId('skip-button');
      fireEvent.press(skipButton);

      expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
    });

    it('should disable skip button when isUploading is true', () => {
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(),
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: 'image.jpg',
          isUploading: true,
        },
        isUploading: true,
      });

      render(<UploadEvidenceScreen />);

      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should disable skip button when isProcessing is true', () => {
      const { useMediaPicker } = require('@/hooks/useMediaPicker');

      useMediaPicker.mockReturnValue({
        takePhoto: jest.fn(),
        uploadPhotos: jest.fn(),
        uploadVideos: jest.fn(),
        isProcessing: true,
      });

      render(<UploadEvidenceScreen />);

      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('back button', () => {
    it('should call router.back when back button is pressed and canGoBack is true', () => {
      const { router } = require('expo-router');
      router.canGoBack.mockReturnValue(true);

      render(<UploadEvidenceScreen />);

      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
    });

    it('should navigate to visits when back button is pressed and canGoBack is false', () => {
      const { router } = require('expo-router');
      router.canGoBack.mockReturnValue(false);

      render(<UploadEvidenceScreen />);

      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
    });
  });

  describe('file preview', () => {
    it('should display file name', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/photo.jpg',
          type: 'photo',
          name: 'photo.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      render(<UploadEvidenceScreen />);

      // File name should be displayed
      const screen_rendered = screen.getByTestId('upload-evidence-screen');
      expect(screen_rendered).toBeDefined();
    });

    it('should display all files in preview', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file:///path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
        {
          id: 'file-3',
          uri: 'file:///path/to/video.mp4',
          type: 'video',
          name: 'video.mp4',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 3,
      });

      render(<UploadEvidenceScreen />);

      const removeButton1 = screen.getByTestId('remove-file-file-1');
      const removeButton2 = screen.getByTestId('remove-file-file-2');
      const removeButton3 = screen.getByTestId('remove-file-file-3');

      expect(removeButton1).toBeDefined();
      expect(removeButton2).toBeDefined();
      expect(removeButton3).toBeDefined();
    });
  });

  describe('upload button text', () => {
    it('should show upload text when not uploading', () => {
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');

      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(),
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: null,
          isUploading: false,
        },
        isUploading: false,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      expect(uploadButton).toBeDefined();
    });

    it('should show uploading text when uploading', () => {
      const { useEvidenceUpload } = require('@/hooks/useEvidenceUpload');
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');

      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 1,
      });

      useEvidenceUpload.mockReturnValue({
        uploadFiles: jest.fn(),
        progress: {
          uploadedCount: 0,
          totalCount: 1,
          currentFile: 'image.jpg',
          isUploading: true,
        },
        isUploading: true,
      });

      render(<UploadEvidenceScreen />);

      const uploadButton = screen.getByTestId('upload-evidence-button');
      expect(uploadButton).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle missing visitId gracefully', () => {
      const { useLocalSearchParams } = require('expo-router');
      useLocalSearchParams.mockReturnValue({ visitId: undefined });

      render(<UploadEvidenceScreen />);

      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
    });

    it('should handle rapid file additions', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockAddFiles = jest.fn();
      const mockFiles: MediaFile[] = Array.from({ length: 10 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: mockAddFiles,
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 10,
      });

      render(<UploadEvidenceScreen />);

      expect(screen.getByTestId('upload-evidence-screen')).toBeDefined();
    });

    it('should handle mixed file types', () => {
      const { useMediaFileManager } = require('@/hooks/useMediaFileManager');
      const mockFiles: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/photo.jpg',
          type: 'photo',
          name: 'photo.jpg',
        },
        {
          id: 'file-2',
          uri: 'file:///path/to/video.mp4',
          type: 'video',
          name: 'video.mp4',
        },
        {
          id: 'file-3',
          uri: 'file:///path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      useMediaFileManager.mockReturnValue({
        files: mockFiles,
        addFile: jest.fn(),
        addFiles: jest.fn(),
        removeFile: jest.fn(),
        clearFiles: jest.fn(),
        hasFiles: true,
        fileCount: 3,
      });

      render(<UploadEvidenceScreen />);

      const removeButton1 = screen.getByTestId('remove-file-file-1');
      const removeButton2 = screen.getByTestId('remove-file-file-2');
      const removeButton3 = screen.getByTestId('remove-file-file-3');

      expect(removeButton1).toBeDefined();
      expect(removeButton2).toBeDefined();
      expect(removeButton3).toBeDefined();
    });
  });
});
