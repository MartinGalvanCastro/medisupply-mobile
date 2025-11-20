import { renderHook, act } from '@testing-library/react-native';
import { useEvidenceUpload } from './useEvidenceUpload';
import type { MediaFile } from '@/hooks/useMediaFileManager';

// Mock the API hooks
const mockGenerateUrlMutation = {
  mutateAsync: jest.fn(),
};

const mockConfirmUploadMutation = {
  mutateAsync: jest.fn(),
};

jest.mock('@/api/generated/sellers-app/sellers-app', () => ({
  useGenerateEvidenceUploadUrlBffSellersAppVisitsVisitIdEvidenceUploadUrlPost: jest.fn(
    () => mockGenerateUrlMutation
  ),
  useConfirmEvidenceUploadBffSellersAppVisitsVisitIdEvidenceConfirmPost: jest.fn(
    () => mockConfirmUploadMutation
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('useEvidenceUpload', () => {
  const mockVisitId = 'visit-123';
  const mockUploadUrl = 'https://s3.amazonaws.com/bucket/upload';
  const mockS3Url = 'https://s3.amazonaws.com/bucket/file.jpg';

  const mockPhotoFile: MediaFile = {
    id: 'photo-1',
    uri: 'file:///path/to/photo.jpg',
    type: 'photo',
    name: 'photo.jpg',
  };

  const mockVideoFile: MediaFile = {
    id: 'video-1',
    uri: 'file:///path/to/video.mp4',
    type: 'video',
    name: 'video.mp4',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty progress', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      expect(result.current.progress).toEqual({
        uploadedCount: 0,
        totalCount: 0,
        currentFile: null,
        isUploading: false,
      });
    });

    it('should initialize isUploading as false', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      expect(result.current.isUploading).toBe(false);
    });

    it('should expose uploadFiles function', () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      expect(typeof result.current.uploadFiles).toBe('function');
    });
  });

  describe('uploadFiles - Single File Success', () => {
    it('should successfully upload a single photo file', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: { key: 'file-key', policy: 'policy-value' },
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.success).toBe(true);
      expect(uploadResult?.uploadedUrls).toContain(mockS3Url);
      expect(uploadResult?.errors).toHaveLength(0);
    });

    it('should successfully upload a single video file', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: { key: 'file-key', policy: 'policy-value' },
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockVideoFile]);
      });

      expect(uploadResult?.success).toBe(true);
      expect(uploadResult?.uploadedUrls).toContain(mockS3Url);
    });

    it('should set isUploading to false after upload completes', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(result.current.progress.isUploading).toBe(false);
    });

    it('should update progress with correct total count', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(result.current.progress.totalCount).toBe(1);
    });

    it('should update progress with correct uploaded count after successful upload', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(result.current.progress.uploadedCount).toBe(1);
    });
  });

  describe('uploadFiles - Multiple Files', () => {
    it('should upload multiple files successfully', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile, mockVideoFile]);
      });

      expect(uploadResult?.uploadedUrls).toHaveLength(2);
      expect(mockGenerateUrlMutation.mutateAsync).toHaveBeenCalledTimes(2);
      expect(mockConfirmUploadMutation.mutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should update progress count correctly for multiple files', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile, mockVideoFile]);
      });

      expect(result.current.progress.totalCount).toBe(2);
      expect(result.current.progress.uploadedCount).toBe(2);
    });

    it('should handle empty file array', async () => {
      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([]);
      });

      expect(uploadResult?.success).toBe(true);
      expect(uploadResult?.uploadedUrls).toHaveLength(0);
      expect(uploadResult?.errors).toHaveLength(0);
      expect(result.current.progress.totalCount).toBe(0);
    });
  });

  describe('uploadFiles - Error Handling', () => {
    it('should handle URL generation failure gracefully', async () => {
      mockGenerateUrlMutation.mutateAsync.mockRejectedValue(
        new Error('Failed to generate upload URL')
      );

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.uploadedUrls).toHaveLength(0);
      expect(uploadResult?.errors).toHaveLength(1);
      expect(uploadResult?.errors[0]).toContain('Failed to upload photo.jpg');
    });

    it('should handle S3 upload failure gracefully', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
      });

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.errors).toHaveLength(1);
      expect(uploadResult?.errors[0]).toContain('S3 upload failed');
    });

    it('should handle confirmation failure gracefully', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockRejectedValue(
        new Error('Failed to confirm upload')
      );

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.success).toBe(false);
      expect(uploadResult?.errors).toHaveLength(1);
      expect(uploadResult?.errors[0]).toContain('Failed to confirm upload');
    });

    it('should continue uploading other files if one fails', async () => {
      mockGenerateUrlMutation.mutateAsync
        .mockRejectedValueOnce(new Error('URL generation failed'))
        .mockResolvedValueOnce({
          upload_url: mockUploadUrl,
          fields: {},
          s3_url: mockS3Url,
        });

      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile, mockVideoFile]);
      });

      expect(uploadResult?.uploadedUrls).toHaveLength(1);
      expect(uploadResult?.errors).toHaveLength(1);
      expect(uploadResult?.success).toBe(false);
    });
  });

  describe('MIME Type Detection', () => {
    it('should use image/jpeg for photo files', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(mockGenerateUrlMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content_type: 'image/jpeg',
          }),
        })
      );
    });

    it('should use video/mp4 for video files', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockVideoFile]);
      });

      expect(mockGenerateUrlMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content_type: 'video/mp4',
          }),
        })
      );
    });
  });

  describe('API Integration', () => {
    it('should pass correct visitId to generateUrl mutation', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(mockGenerateUrlMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          visitId: mockVisitId,
        })
      );
    });

    it('should pass correct filename to generateUrl mutation', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(mockGenerateUrlMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            filename: mockPhotoFile.name,
          }),
        })
      );
    });

    it('should pass s3_url to confirm mutation', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(mockConfirmUploadMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            s3_url: mockS3Url,
          }),
        })
      );
    });

    it('should pass visitId to confirm mutation', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(mockConfirmUploadMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          visitId: mockVisitId,
        })
      );
    });
  });

  describe('S3 Upload', () => {
    it('should use correct HTTP method for S3 upload', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: { key: 'file-key' },
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        mockUploadUrl,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should send FormData to correct S3 URL', async () => {
      const expectedS3Url = 'https://s3.amazonaws.com/custom-bucket/upload';

      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: expectedS3Url,
        fields: { key: 'file-key' },
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(global.fetch).toHaveBeenCalledWith(expectedS3Url, expect.any(Object));
    });

    it('should throw error on S3 upload response not ok', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.errors[0]).toContain('S3 upload failed: Bad Request');
    });
  });

  describe('Progress Tracking', () => {
    it('should reset progress when upload starts', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      // Do initial upload
      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(result.current.progress.uploadedCount).toBe(1);
      expect(result.current.progress.totalCount).toBe(1);

      // Start new upload
      await act(async () => {
        await result.current.uploadFiles([mockVideoFile]);
      });

      expect(result.current.progress.uploadedCount).toBe(1);
      expect(result.current.progress.totalCount).toBe(1);
    });

    it('should set currentFile to null after upload completes', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      await act(async () => {
        await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(result.current.progress.currentFile).toBe(null);
    });
  });

  describe('Return Values', () => {
    it('should return correct structure on success', async () => {
      mockGenerateUrlMutation.mutateAsync.mockResolvedValue({
        upload_url: mockUploadUrl,
        fields: {},
        s3_url: mockS3Url,
      });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult).toHaveProperty('success');
      expect(uploadResult).toHaveProperty('uploadedUrls');
      expect(uploadResult).toHaveProperty('errors');
      expect(Array.isArray(uploadResult?.uploadedUrls)).toBe(true);
      expect(Array.isArray(uploadResult?.errors)).toBe(true);
    });

    it('should return URLs for successful uploads', async () => {
      const mockS3Url1 = 'https://s3.amazonaws.com/bucket/file1.jpg';
      const mockS3Url2 = 'https://s3.amazonaws.com/bucket/file2.mp4';

      mockGenerateUrlMutation.mutateAsync
        .mockResolvedValueOnce({
          upload_url: mockUploadUrl,
          fields: {},
          s3_url: mockS3Url1,
        })
        .mockResolvedValueOnce({
          upload_url: mockUploadUrl,
          fields: {},
          s3_url: mockS3Url2,
        });
      mockConfirmUploadMutation.mutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile, mockVideoFile]);
      });

      expect(uploadResult?.uploadedUrls).toContain(mockS3Url1);
      expect(uploadResult?.uploadedUrls).toContain(mockS3Url2);
    });

    it('should return error messages for failed uploads', async () => {
      mockGenerateUrlMutation.mutateAsync.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.errors).toHaveLength(1);
      expect(typeof uploadResult?.errors[0]).toBe('string');
      expect(uploadResult?.errors[0]).toContain('photo.jpg');
    });
  });

  describe('Error Message Formatting', () => {
    it('should include filename in error message', async () => {
      mockGenerateUrlMutation.mutateAsync.mockRejectedValue(
        new Error('Upload failed')
      );

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.errors[0]).toContain('photo.jpg');
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockGenerateUrlMutation.mutateAsync.mockRejectedValue('String error');

      const { result } = renderHook(() => useEvidenceUpload({ visitId: mockVisitId }));

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadFiles([mockPhotoFile]);
      });

      expect(uploadResult?.errors).toHaveLength(1);
      expect(uploadResult?.errors[0]).toContain('Unknown error');
    });
  });
});
