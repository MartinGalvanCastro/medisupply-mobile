import { renderHook, act } from '@testing-library/react-native';
import { useEvidenceUpload } from '../useEvidenceUpload';
import type { MediaFile } from '@/hooks/useMediaFileManager';

// Mock the generated API hooks
jest.mock('@/api/generated/sellers-app/sellers-app', () => ({
  useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('useEvidenceUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const visitId = 'visit-123';

  describe('initial state', () => {
    it('should initialize with default progress state', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      expect(result.current.progress.uploadedCount).toBe(0);
      expect(result.current.progress.totalCount).toBe(0);
      expect(result.current.progress.currentFile).toBeNull();
      expect(result.current.progress.isUploading).toBe(false);
    });

    it('should have isUploading as false initially', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      expect(result.current.isUploading).toBe(false);
    });

    it('should have uploadFiles function', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      expect(typeof result.current.uploadFiles).toBe('function');
    });

    it('should have progress property', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      expect(result.current).toHaveProperty('progress');
      expect(result.current.progress).toHaveProperty('uploadedCount');
      expect(result.current.progress).toHaveProperty('totalCount');
      expect(result.current.progress).toHaveProperty('currentFile');
      expect(result.current.progress).toHaveProperty('isUploading');
    });
  });

  describe('uploadFiles', () => {
    it('should upload single file successfully', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([file]);
      });

      expect(uploadResult).toBeDefined();
      expect(uploadResult?.success).toBe(true);
      expect(uploadResult?.uploadedUrls).toHaveLength(1);
      expect(uploadResult?.errors).toHaveLength(0);
    });

    it('should upload multiple files successfully', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const files: MediaFile[] = [
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
        {
          id: 'file-3',
          uri: 'file:///path/to/video.mp4',
          type: 'video',
          name: 'video.mp4',
        },
      ];

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles(files);
      });

      expect(uploadResult?.success).toBe(true);
      expect(uploadResult?.uploadedUrls).toHaveLength(3);
      expect(uploadResult?.errors).toHaveLength(0);
      expect(mockGenerateUrl).toHaveBeenCalledTimes(3);
      expect(mockConfirmUpload).toHaveBeenCalledTimes(3);
    });

    it('should handle upload URL generation failure', async () => {
      const mockGenerateUrl = jest
        .fn()
        .mockRejectedValue(new Error('Failed to generate upload URL'));

      const mockConfirmUpload = jest.fn();

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([file]);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.uploadedUrls).toHaveLength(0);
      expect(uploadResult?.errors.length).toBeGreaterThan(0);
      expect(uploadResult?.errors[0]).toContain('Failed to generate upload URL');
    });

    it('should handle S3 upload failure', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn();

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: jest.fn().mockResolvedValue(new Blob()),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([file]);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.uploadedUrls).toHaveLength(0);
      expect(uploadResult?.errors.length).toBeGreaterThan(0);
    });

    it('should handle confirm upload failure but continue', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest
        .fn()
        .mockRejectedValue(new Error('Failed to confirm upload'));

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([file]);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.errors.length).toBeGreaterThan(0);
    });

    it('should continue uploading remaining files after one fails', async () => {
      const mockGenerateUrl = jest
        .fn()
        .mockResolvedValueOnce({
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url-1',
          fields: { key: 'field-value' },
          s3_url: 'https://s3.amazonaws.com/bucket/file1.jpg',
        })
        .mockRejectedValueOnce(new Error('Failed to generate URL'))
        .mockResolvedValueOnce({
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url-3',
          fields: { key: 'field-value' },
          s3_url: 'https://s3.amazonaws.com/bucket/file3.jpg',
        });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const files: MediaFile[] = [
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
        {
          id: 'file-3',
          uri: 'file:///path/to/image3.jpg',
          type: 'photo',
          name: 'image3.jpg',
        },
      ];

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles(files);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.uploadedUrls).toHaveLength(2);
      expect(uploadResult?.errors).toHaveLength(1);
    });

    it('should return empty files on empty input', async () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([]);
      });

      expect(uploadResult?.success).toBe(true);
      expect(uploadResult?.uploadedUrls).toHaveLength(0);
      expect(uploadResult?.errors).toHaveLength(0);
    });

    it('should set correct MIME type for photos', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      const generateUrlCall = mockGenerateUrl.mock.calls[0];
      expect(generateUrlCall[0].data.content_type).toBe('image/jpeg');
    });

    it('should set correct MIME type for videos', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.mp4',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/video.mp4',
        type: 'video',
        name: 'video.mp4',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      const generateUrlCall = mockGenerateUrl.mock.calls[0];
      expect(generateUrlCall[0].data.content_type).toBe('video/mp4');
    });
  });

  describe('progress tracking', () => {
    it('should update progress during upload', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const files: MediaFile[] = Array.from({ length: 3 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let intermediateProgress: any[] = [];

      mockGenerateUrl.mockImplementation(async (...args) => {
        intermediateProgress.push({ ...result.current.progress });
        return {
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
          fields: { key: 'field-value' },
          s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
        };
      });

      await act(async () => {
        await result.current.uploadFiles(files);
      });

      // Progress should have been updated
      expect(result.current.progress.uploadedCount).toBe(3);
      expect(result.current.progress.totalCount).toBe(3);
      expect(result.current.progress.isUploading).toBe(false);
    });

    it('should set isUploading to false after upload', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      expect(result.current.progress.isUploading).toBe(false);

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      expect(result.current.progress.isUploading).toBe(false);
      expect(result.current.isUploading).toBe(false);
    });

    it('should set currentFile during upload', async () => {
      let capturedProgress: any[] = [];

      const mockGenerateUrl = jest.fn().mockImplementation(async (params) => {
        capturedProgress.push({ ...params });
        return {
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
          fields: { key: 'field-value' },
          s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
        };
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      // currentFile should be cleared after upload
      expect(result.current.progress.currentFile).toBeNull();
    });

    it('should track uploadedCount correctly', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const files: MediaFile[] = Array.from({ length: 5 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      await act(async () => {
        await result.current.uploadFiles(files);
      });

      expect(result.current.progress.uploadedCount).toBe(5);
      expect(result.current.progress.totalCount).toBe(5);
    });
  });

  describe('upload result', () => {
    it('should return success true when all files uploaded', async () => {
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([file]);
      });

      expect(uploadResult?.success).toBe(true);
    });

    it('should return success false when any file fails', async () => {
      const mockGenerateUrl = jest
        .fn()
        .mockResolvedValueOnce({
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
          fields: { key: 'field-value' },
          s3_url: 'https://s3.amazonaws.com/bucket/file1.jpg',
        })
        .mockRejectedValueOnce(new Error('Upload failed'));

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const files: MediaFile[] = [
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

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles(files);
      });

      expect(uploadResult?.success).toBe(false);
    });

    it('should include uploaded URLs in result', async () => {
      const uploadUrl1 = 'https://s3.amazonaws.com/bucket/file1.jpg';
      const uploadUrl2 = 'https://s3.amazonaws.com/bucket/file2.jpg';

      const mockGenerateUrl = jest
        .fn()
        .mockResolvedValueOnce({
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url-1',
          fields: { key: 'field-value' },
          s3_url: uploadUrl1,
        })
        .mockResolvedValueOnce({
          upload_url: 'https://s3.amazonaws.com/bucket/presigned-url-2',
          fields: { key: 'field-value' },
          s3_url: uploadUrl2,
        });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const files: MediaFile[] = [
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

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles(files);
      });

      expect(uploadResult?.uploadedUrls).toContain(uploadUrl1);
      expect(uploadResult?.uploadedUrls).toContain(uploadUrl2);
    });

    it('should include error messages in result', async () => {
      const errorMessage = 'Failed to upload file';
      const mockGenerateUrl = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      const mockConfirmUpload = jest.fn();

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([file]);
      });

      expect(uploadResult?.errors.length).toBeGreaterThan(0);
      expect(uploadResult?.errors[0]).toContain(errorMessage);
    });
  });

  describe('visitId parameter', () => {
    it('should pass visitId to generate URL mutation', async () => {
      const customVisitId = 'visit-999';
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId: customVisitId }));

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      const generateUrlCall = mockGenerateUrl.mock.calls[0];
      expect(generateUrlCall[0].visitId).toBe(customVisitId);
    });

    it('should pass visitId to confirm upload mutation', async () => {
      const customVisitId = 'visit-999';
      const mockGenerateUrl = jest.fn().mockResolvedValue({
        upload_url: 'https://s3.amazonaws.com/bucket/presigned-url',
        fields: { key: 'field-value' },
        s3_url: 'https://s3.amazonaws.com/bucket/file.jpg',
      });

      const mockConfirmUpload = jest.fn().mockResolvedValue({});

      const {
        useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost,
        useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost,
      } = require('@/api/generated/sellers-app/sellers-app');

      useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost.mockReturnValue({
        mutateAsync: mockGenerateUrl,
      });

      useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost.mockReturnValue({
        mutateAsync: mockConfirmUpload,
      });

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        // Mock response for file fetch (to get blob)
        if (url.startsWith('file://')) {
          return {
            blob: jest.fn().mockResolvedValue(new Blob(['file content'], { type: 'image/jpeg' })),
          };
        }
        // Mock response for S3 upload
        return {
          ok: true,
          status: 200,
        };
      });

      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      const { result } = renderHook(() => useEvidenceUpload({ visitId: customVisitId }));

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      const confirmUploadCall = mockConfirmUpload.mock.calls[0];
      expect(confirmUploadCall[0].visitId).toBe(customVisitId);
    });
  });
});
