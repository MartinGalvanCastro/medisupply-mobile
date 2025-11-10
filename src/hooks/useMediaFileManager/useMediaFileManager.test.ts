import { renderHook, act } from '@testing-library/react-native';
import { useMediaFileManager } from './useMediaFileManager';
import type { MediaFile } from './types';

describe('useMediaFileManager', () => {
  describe('initial state', () => {
    it('should start with empty files array', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current.files).toEqual([]);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should have correct initial properties', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current).toHaveProperty('files');
      expect(result.current).toHaveProperty('addFile');
      expect(result.current).toHaveProperty('addFiles');
      expect(result.current).toHaveProperty('removeFile');
      expect(result.current).toHaveProperty('clearFiles');
      expect(result.current).toHaveProperty('hasFiles');
      expect(result.current).toHaveProperty('fileCount');
    });
  });

  describe('addFile', () => {
    it('should add a single file', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toEqual(file);
      expect(result.current.fileCount).toBe(1);
      expect(result.current.hasFiles).toBe(true);
    });

    it('should add multiple files sequentially', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image1.jpg',
        type: 'photo',
        name: 'image1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file:///path/to/image2.jpg',
        type: 'photo',
        name: 'image2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
        result.current.addFile(file2);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0]).toEqual(file1);
      expect(result.current.files[1]).toEqual(file2);
      expect(result.current.fileCount).toBe(2);
      expect(result.current.hasFiles).toBe(true);
    });

    it('should allow duplicate IDs in different calls', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image1.jpg',
        type: 'photo',
        name: 'image1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-1', // Same ID
        uri: 'file:///path/to/image2.jpg',
        type: 'photo',
        name: 'image2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
        result.current.addFile(file2);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.fileCount).toBe(2);
    });

    it('should handle video files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const videoFile: MediaFile = {
        id: 'video-1',
        uri: 'file:///path/to/video.mp4',
        type: 'video',
        name: 'video.mp4',
      };

      act(() => {
        result.current.addFile(videoFile);
      });

      expect(result.current.files[0].type).toBe('video');
      expect(result.current.fileCount).toBe(1);
    });
  });

  describe('addFiles', () => {
    it('should add multiple files at once', () => {
      const { result } = renderHook(() => useMediaFileManager());
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

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(3);
      expect(result.current.fileCount).toBe(3);
      expect(result.current.hasFiles).toBe(true);
      expect(result.current.files).toEqual(files);
    });

    it('should add files to existing files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image1.jpg',
        type: 'photo',
        name: 'image1.jpg',
      };
      const newFiles: MediaFile[] = [
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

      act(() => {
        result.current.addFile(file1);
        result.current.addFiles(newFiles);
      });

      expect(result.current.files).toHaveLength(3);
      expect(result.current.files[0]).toEqual(file1);
      expect(result.current.files[1]).toEqual(newFiles[0]);
      expect(result.current.files[2]).toEqual(newFiles[1]);
    });

    it('should handle empty files array', () => {
      const { result } = renderHook(() => useMediaFileManager());

      act(() => {
        result.current.addFiles([]);
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should handle single file in array', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.fileCount).toBe(1);
    });

    it('should handle mixed photo and video files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'photo-1',
          uri: 'file:///path/to/image.jpg',
          type: 'photo',
          name: 'image.jpg',
        },
        {
          id: 'video-1',
          uri: 'file:///path/to/video.mp4',
          type: 'video',
          name: 'video.mp4',
        },
        {
          id: 'photo-2',
          uri: 'file:///path/to/image2.jpg',
          type: 'photo',
          name: 'image2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(3);
      expect(result.current.files.filter((f) => f.type === 'photo')).toHaveLength(2);
      expect(result.current.files.filter((f) => f.type === 'video')).toHaveLength(1);
    });
  });

  describe('removeFile', () => {
    it('should remove file by ID', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image1.jpg',
        type: 'photo',
        name: 'image1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file:///path/to/image2.jpg',
        type: 'photo',
        name: 'image2.jpg',
      };

      act(() => {
        result.current.addFiles([file1, file2]);
        result.current.removeFile('file-1');
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].id).toBe('file-2');
      expect(result.current.fileCount).toBe(1);
    });

    it('should not affect other files when removing one', () => {
      const { result } = renderHook(() => useMediaFileManager());
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

      act(() => {
        result.current.addFiles(files);
        result.current.removeFile('file-2');
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0].id).toBe('file-1');
      expect(result.current.files[1].id).toBe('file-3');
    });

    it('should do nothing when removing non-existent file', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      act(() => {
        result.current.addFile(file);
        result.current.removeFile('non-existent');
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toEqual(file);
    });

    it('should update hasFiles to false when removing last file', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });
      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-1');
      });
      expect(result.current.hasFiles).toBe(false);
      expect(result.current.fileCount).toBe(0);
    });

    it('should remove correct file when multiple have similar IDs', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file:///path/to/image1.jpg',
          type: 'photo',
          name: 'image1.jpg',
        },
        {
          id: 'file-10',
          uri: 'file:///path/to/image10.jpg',
          type: 'photo',
          name: 'image10.jpg',
        },
        {
          id: 'file-12',
          uri: 'file:///path/to/image12.jpg',
          type: 'photo',
          name: 'image12.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
        result.current.removeFile('file-1');
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files.map((f) => f.id)).toEqual(['file-10', 'file-12']);
    });
  });

  describe('clearFiles', () => {
    it('should clear all files', () => {
      const { result } = renderHook(() => useMediaFileManager());
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

      act(() => {
        result.current.addFiles(files);
      });
      expect(result.current.fileCount).toBe(3);

      act(() => {
        result.current.clearFiles();
      });
      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should reset hasFiles to false', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });
      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.clearFiles();
      });
      expect(result.current.hasFiles).toBe(false);
    });

    it('should be idempotent', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      act(() => {
        result.current.clearFiles();
        result.current.clearFiles();
        result.current.clearFiles();
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
    });

    it('should allow adding files after clearing', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image1.jpg',
        type: 'photo',
        name: 'image1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file:///path/to/image2.jpg',
        type: 'photo',
        name: 'image2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
        result.current.clearFiles();
        result.current.addFile(file2);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toEqual(file2);
    });
  });

  describe('hasFiles computed property', () => {
    it('should be false for empty state', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current.hasFiles).toBe(false);
    });

    it('should be true when files exist', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.hasFiles).toBe(true);
    });

    it('should update correctly when adding and removing files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image.jpg',
        type: 'photo',
        name: 'image.jpg',
      };

      expect(result.current.hasFiles).toBe(false);

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-1');
      });

      expect(result.current.hasFiles).toBe(false);
    });
  });

  describe('fileCount computed property', () => {
    it('should return 0 for empty state', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current.fileCount).toBe(0);
    });

    it('should increment with each added file', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = Array.from({ length: 5 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      files.forEach((file) => {
        act(() => {
          result.current.addFile(file);
        });
      });

      expect(result.current.fileCount).toBe(5);
    });

    it('should correctly reflect file count after removal', () => {
      const { result } = renderHook(() => useMediaFileManager());
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

      act(() => {
        result.current.addFiles(files);
      });
      expect(result.current.fileCount).toBe(3);

      act(() => {
        result.current.removeFile('file-2');
      });
      expect(result.current.fileCount).toBe(2);

      act(() => {
        result.current.removeFile('file-1');
      });
      expect(result.current.fileCount).toBe(1);
    });

    it('should be 0 after clearing', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = Array.from({ length: 10 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      act(() => {
        result.current.addFiles(files);
      });
      expect(result.current.fileCount).toBe(10);

      act(() => {
        result.current.clearFiles();
      });
      expect(result.current.fileCount).toBe(0);
    });
  });

  describe('complex scenarios', () => {
    it('should handle add, remove, and clear operations', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file:///path/to/image1.jpg',
        type: 'photo',
        name: 'image1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file:///path/to/image2.jpg',
        type: 'photo',
        name: 'image2.jpg',
      };
      const file3: MediaFile = {
        id: 'file-3',
        uri: 'file:///path/to/image3.jpg',
        type: 'photo',
        name: 'image3.jpg',
      };

      act(() => {
        result.current.addFile(file1);
      });
      expect(result.current.fileCount).toBe(1);

      act(() => {
        result.current.addFiles([file2, file3]);
      });
      expect(result.current.fileCount).toBe(3);

      act(() => {
        result.current.removeFile('file-2');
      });
      expect(result.current.fileCount).toBe(2);

      act(() => {
        result.current.clearFiles();
      });
      expect(result.current.fileCount).toBe(0);
      expect(result.current.files).toHaveLength(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should maintain file order', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = Array.from({ length: 5 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      act(() => {
        result.current.addFiles(files);
      });

      const fileIds = result.current.files.map((f) => f.id);
      expect(fileIds).toEqual(['file-1', 'file-2', 'file-3', 'file-4', 'file-5']);
    });

    it('should handle large number of files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = Array.from({ length: 100 }, (_, i) => ({
        id: `file-${i + 1}`,
        uri: `file:///path/to/image${i + 1}.jpg`,
        type: 'photo' as const,
        name: `image${i + 1}.jpg`,
      }));

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.fileCount).toBe(100);
      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-50');
      });

      expect(result.current.fileCount).toBe(99);
    });
  });
});
