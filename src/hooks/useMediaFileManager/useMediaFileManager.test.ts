import { renderHook, act } from '@testing-library/react-native';
import { useMediaFileManager } from './useMediaFileManager';
import type { MediaFile } from './types';

describe('useMediaFileManager', () => {
  describe('Initial State', () => {
    it('should initialize with empty files array', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current.files).toEqual([]);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should have all required methods available', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(typeof result.current.addFile).toBe('function');
      expect(typeof result.current.addFiles).toBe('function');
      expect(typeof result.current.removeFile).toBe('function');
      expect(typeof result.current.clearFiles).toBe('function');
    });
  });

  describe('addFile', () => {
    it('should add a single file to the files array', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const mockFile: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(mockFile);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toEqual(mockFile);
      expect(result.current.fileCount).toBe(1);
      expect(result.current.hasFiles).toBe(true);
    });

    it('should add multiple files sequentially', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
        result.current.addFile(file2);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0]).toEqual(file1);
      expect(result.current.files[1]).toEqual(file2);
      expect(result.current.fileCount).toBe(2);
    });

    it('should allow adding files with different types (photo and video)', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const photoFile: MediaFile = {
        id: 'photo-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };
      const videoFile: MediaFile = {
        id: 'video-1',
        uri: 'file://path/to/video.mp4',
        type: 'video',
        name: 'video.mp4',
      };

      act(() => {
        result.current.addFile(photoFile);
        result.current.addFile(videoFile);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0].type).toBe('photo');
      expect(result.current.files[1].type).toBe('video');
    });

    it('should add files with duplicate IDs (appending behavior)', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-1', // Same ID
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
        result.current.addFile(file2);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0].uri).toBe('file://path/to/photo1.jpg');
      expect(result.current.files[1].uri).toBe('file://path/to/photo2.jpg');
    });

    it('should preserve file properties when adding', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-123',
        uri: 'file://custom/path/my-file.jpg',
        type: 'photo',
        name: 'my-file.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      const addedFile = result.current.files[0];
      expect(addedFile.id).toBe('file-123');
      expect(addedFile.uri).toBe('file://custom/path/my-file.jpg');
      expect(addedFile.type).toBe('photo');
      expect(addedFile.name).toBe('my-file.jpg');
    });
  });

  describe('addFiles', () => {
    it('should add multiple files at once', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files).toEqual(files);
      expect(result.current.fileCount).toBe(2);
      expect(result.current.hasFiles).toBe(true);
    });

    it('should add empty array without affecting files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(file);
        result.current.addFiles([]);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.fileCount).toBe(1);
    });

    it('should append files to existing files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const newFiles: MediaFile[] = [
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
        {
          id: 'file-3',
          uri: 'file://path/to/photo3.jpg',
          type: 'photo',
          name: 'photo3.jpg',
        },
      ];

      act(() => {
        result.current.addFile(file1);
        result.current.addFiles(newFiles);
      });

      expect(result.current.files).toHaveLength(3);
      expect(result.current.files[0].id).toBe('file-1');
      expect(result.current.files[1].id).toBe('file-2');
      expect(result.current.files[2].id).toBe('file-3');
    });

    it('should handle adding single file via addFiles', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo.jpg',
          type: 'photo',
          name: 'photo.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.fileCount).toBe(1);
    });
  });

  describe('removeFile', () => {
    it('should remove a file by ID', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(file);
        result.current.removeFile('file-1');
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should remove only the specified file from multiple files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
        {
          id: 'file-3',
          uri: 'file://path/to/photo3.jpg',
          type: 'photo',
          name: 'photo3.jpg',
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

    it('should not fail when removing non-existent file', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(file);
        result.current.removeFile('non-existent-id');
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].id).toBe('file-1');
    });

    it('should handle removing from empty files array', () => {
      const { result } = renderHook(() => useMediaFileManager());

      act(() => {
        result.current.removeFile('file-1');
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
    });

    it('should correctly update file count after removal', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.fileCount).toBe(2);
      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-1');
      });

      expect(result.current.fileCount).toBe(1);
      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-2');
      });

      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });
  });

  describe('clearFiles', () => {
    it('should clear all files', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(2);

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should handle clearing empty files array', () => {
      const { result } = renderHook(() => useMediaFileManager());

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.fileCount).toBe(0);
      expect(result.current.hasFiles).toBe(false);
    });

    it('should reset state properly after clearing', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.hasFiles).toBe(true);
      expect(result.current.fileCount).toBe(1);

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.hasFiles).toBe(false);
      expect(result.current.fileCount).toBe(0);
    });
  });

  describe('hasFiles flag', () => {
    it('should return true when files exist', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.hasFiles).toBe(true);
    });

    it('should return false when no files exist', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current.hasFiles).toBe(false);
    });

    it('should update when files are added', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      expect(result.current.hasFiles).toBe(false);

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.hasFiles).toBe(true);
    });

    it('should update when files are removed', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
      };

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-1');
      });

      expect(result.current.hasFiles).toBe(false);
    });

    it('should update when files are cleared', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo.jpg',
        type: 'photo',
        name: 'photo.jpg',
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
  });

  describe('fileCount', () => {
    it('should return 0 for empty files array', () => {
      const { result } = renderHook(() => useMediaFileManager());

      expect(result.current.fileCount).toBe(0);
    });

    it('should increment when files are added', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
      });

      expect(result.current.fileCount).toBe(1);

      act(() => {
        result.current.addFile(file2);
      });

      expect(result.current.fileCount).toBe(2);
    });

    it('should reflect correct count after addFiles', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
        {
          id: 'file-3',
          uri: 'file://path/to/photo3.jpg',
          type: 'photo',
          name: 'photo3.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.fileCount).toBe(3);
    });

    it('should decrement when files are removed', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.fileCount).toBe(2);

      act(() => {
        result.current.removeFile('file-1');
      });

      expect(result.current.fileCount).toBe(1);
    });

    it('should reset to 0 when files are cleared', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.fileCount).toBe(2);

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.fileCount).toBe(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed operations in sequence', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };
      const file3: MediaFile = {
        id: 'file-3',
        uri: 'file://path/to/photo3.jpg',
        type: 'photo',
        name: 'photo3.jpg',
      };

      act(() => {
        result.current.addFile(file1);
      });

      expect(result.current.fileCount).toBe(1);

      act(() => {
        result.current.addFiles([file2, file3]);
      });

      expect(result.current.fileCount).toBe(3);
      expect(result.current.hasFiles).toBe(true);

      act(() => {
        result.current.removeFile('file-2');
      });

      expect(result.current.fileCount).toBe(2);
      expect(result.current.files[0].id).toBe('file-1');
      expect(result.current.files[1].id).toBe('file-3');
    });

    it('should maintain integrity with multiple removals', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
        {
          id: 'file-3',
          uri: 'file://path/to/photo3.jpg',
          type: 'photo',
          name: 'photo3.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      act(() => {
        result.current.removeFile('file-1');
        result.current.removeFile('file-3');
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].id).toBe('file-2');
      expect(result.current.fileCount).toBe(1);
    });

    it('should handle add after clear', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
        result.current.clearFiles();
        result.current.addFile(file2);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].id).toBe('file-2');
      expect(result.current.fileCount).toBe(1);
      expect(result.current.hasFiles).toBe(true);
    });

    it('should handle multiple independent hooks without interference', () => {
      const { result: result1 } = renderHook(() => useMediaFileManager());
      const { result: result2 } = renderHook(() => useMediaFileManager());

      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };

      act(() => {
        result1.current.addFile(file1);
        result2.current.addFiles([file2]);
      });

      expect(result1.current.fileCount).toBe(1);
      expect(result2.current.fileCount).toBe(1);
      expect(result1.current.files[0].id).toBe('file-1');
      expect(result2.current.files[0].id).toBe('file-2');
    });
  });

  describe('State Immutability', () => {
    it('should not mutate files array when adding', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const file1: MediaFile = {
        id: 'file-1',
        uri: 'file://path/to/photo1.jpg',
        type: 'photo',
        name: 'photo1.jpg',
      };
      const file2: MediaFile = {
        id: 'file-2',
        uri: 'file://path/to/photo2.jpg',
        type: 'photo',
        name: 'photo2.jpg',
      };

      act(() => {
        result.current.addFile(file1);
      });

      const firstSnapshot = result.current.files;

      act(() => {
        result.current.addFile(file2);
      });

      expect(firstSnapshot).not.toBe(result.current.files);
      expect(firstSnapshot).toHaveLength(1);
      expect(result.current.files).toHaveLength(2);
    });

    it('should not mutate files array when removing', () => {
      const { result } = renderHook(() => useMediaFileManager());
      const files: MediaFile[] = [
        {
          id: 'file-1',
          uri: 'file://path/to/photo1.jpg',
          type: 'photo',
          name: 'photo1.jpg',
        },
        {
          id: 'file-2',
          uri: 'file://path/to/photo2.jpg',
          type: 'photo',
          name: 'photo2.jpg',
        },
      ];

      act(() => {
        result.current.addFiles(files);
      });

      const beforeRemoval = result.current.files;

      act(() => {
        result.current.removeFile('file-1');
      });

      expect(beforeRemoval).not.toBe(result.current.files);
      expect(beforeRemoval).toHaveLength(2);
      expect(result.current.files).toHaveLength(1);
    });
  });
});
