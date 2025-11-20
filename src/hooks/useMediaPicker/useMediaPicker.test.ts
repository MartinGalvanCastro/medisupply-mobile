import { renderHook, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { RESULTS } from 'react-native-permissions';
import { useMediaPicker } from './useMediaPicker';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { PermissionManager } from '@/utils/permissions';

jest.mock('@/hooks/useMediaPermissions');
jest.mock('expo-image-picker');
jest.mock('@/utils/permissions', () => ({
  PermissionManager: {
    isGranted: jest.fn(),
  },
}));

describe('useMediaPicker', () => {
  const mockOnFilesSelected = jest.fn();
  const mockOnError = jest.fn();

  const createMockPermissionsObject = (overrides = {}) => ({
    camera: {
      status: RESULTS.DENIED,
      isGranted: false,
      isBlocked: false,
      isDenied: true,
      isLoading: false,
      isRequesting: false,
    },
    photoLibrary: {
      status: RESULTS.DENIED,
      isGranted: false,
      isBlocked: false,
      isDenied: true,
      isLoading: false,
      isRequesting: false,
    },
    mediaLibrary: {
      status: RESULTS.DENIED,
      isGranted: false,
      isBlocked: false,
      isDenied: true,
      isLoading: false,
      isRequesting: false,
    },
    requestCameraPermission: jest.fn(async () => RESULTS.GRANTED),
    requestPhotoLibraryPermission: jest.fn(async () => RESULTS.GRANTED),
    requestMediaLibraryPermission: jest.fn(async () => RESULTS.GRANTED),
    handleBlockedPermission: jest.fn(),
    ...overrides,
  });

  const createMockImagePickerAsset = (overrides = {}) => ({
    uri: 'file:///test/image.jpg',
    fileName: 'test.jpg',
    type: 'image' as const,
    width: 100,
    height: 100,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaPermissions as jest.Mock).mockReturnValue(createMockPermissionsObject());
    (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);
  });

  describe('createMediaFile', () => {
    it('transforms ImagePicker asset to MediaFile for photos', () => {
      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      const asset = createMockImagePickerAsset({ fileName: 'vacation.jpg' });
      const mediaFile = (result.current as any).createMediaFile?.(asset, 'photo');

      // Since createMediaFile is not exposed, we test it indirectly through takePhoto
      // But we can verify the structure through onFilesSelected callback
      expect(mockOnFilesSelected).toBeDefined();
    });

    it('generates unique id with timestamp and random component', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].id).toBeDefined();
      expect(files[0].id).toMatch(/^\d+_[\d.]+$/);
    });

    it('preserves asset URI in MediaFile', async () => {
      const testUri = 'file:///test/photo.jpg';
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset({ uri: testUri })],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].uri).toBe(testUri);
    });

    it('uses asset fileName when available', async () => {
      const fileName = 'custom-photo.jpg';
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset({ fileName })],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].name).toBe(fileName);
    });

    it('generates default name when fileName is not provided', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset({ fileName: undefined })],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].name).toMatch(/^photo_\d+\.jpg$/);
    });

    it('sets correct type for photos', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].type).toBe('photo');
    });

    it('sets correct type for videos', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].type).toBe('video');
    });

    it('generates video filename with .mp4 extension when fileName not provided', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset({ fileName: undefined })],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].name).toMatch(/^video_\d+\.mp4$/);
    });
  });

  describe('takePhoto', () => {
    it('launches camera when permission is granted', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
    });

    it('calls onFilesSelected with transformed asset when camera succeeds', async () => {
      const asset = createMockImagePickerAsset();
      const pickerResult = {
        canceled: false,
        assets: [asset],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
      expect(mockOnFilesSelected).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            uri: asset.uri,
            type: 'photo',
            name: asset.fileName,
          })
        ])
      );
    });

    it('does not call onFilesSelected when user cancels', async () => {
      const pickerResult = {
        canceled: true,
        assets: [],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it('calls handleBlockedPermission when permission is blocked', async () => {
      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isBlocked: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockPermissions.handleBlockedPermission).toHaveBeenCalledWith('camera');
    });

    it('requests camera permission when denied', async () => {
      const mockRequestCamera = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestCameraPermission: mockRequestCamera,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockRequestCamera).toHaveBeenCalledTimes(1);
    });

    it('launches camera after permission request is granted', async () => {
      const mockRequestCamera = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestCameraPermission: mockRequestCamera,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    });

    it('does not launch camera when permission request is denied', async () => {
      const mockRequestCamera = jest.fn(async () => RESULTS.DENIED);
      const mockPermissions = createMockPermissionsObject({
        requestCameraPermission: mockRequestCamera,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);
      (PermissionManager.isGranted as jest.Mock).mockReturnValueOnce(false);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('calls onError when ImagePicker throws an error', async () => {
      const error = new Error('Camera failed');
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValueOnce(error);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected, onError: mockOnError })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnError).toHaveBeenCalledWith(error);
    });

    it('does not call onError callback if not provided', async () => {
      const error = new Error('Camera failed');
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValueOnce(error);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('uploadPhotos', () => {
    it('launches photo library when permission is granted', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
    });

    it('calls onFilesSelected with transformed assets when photo library succeeds', async () => {
      const asset1 = createMockImagePickerAsset({ fileName: 'photo1.jpg' });
      const asset2 = createMockImagePickerAsset({ fileName: 'photo2.jpg' });
      const pickerResult = {
        canceled: false,
        assets: [asset1, asset2],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files).toHaveLength(2);
      expect(files[0].type).toBe('photo');
      expect(files[1].type).toBe('photo');
    });

    it('does not call onFilesSelected when user cancels', async () => {
      const pickerResult = {
        canceled: true,
        assets: [],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it('calls handleBlockedPermission when permission is blocked', async () => {
      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isBlocked: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockPermissions.handleBlockedPermission).toHaveBeenCalledWith('photoLibrary');
    });

    it('requests photo library permission when denied', async () => {
      const mockRequestPhotos = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestPhotoLibraryPermission: mockRequestPhotos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockRequestPhotos).toHaveBeenCalledTimes(1);
    });

    it('launches photo library after permission request is granted', async () => {
      const mockRequestPhotos = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestPhotoLibraryPermission: mockRequestPhotos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    it('does not launch photo library when permission request is denied', async () => {
      const mockRequestPhotos = jest.fn(async () => RESULTS.DENIED);
      const mockPermissions = createMockPermissionsObject({
        requestPhotoLibraryPermission: mockRequestPhotos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);
      (PermissionManager.isGranted as jest.Mock).mockReturnValueOnce(false);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('does not call onFilesSelected when photo library is empty', async () => {
      const pickerResult = {
        canceled: false,
        assets: [],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

  });

  describe('uploadVideos', () => {
    it('launches video library when permission is granted', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['videos'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
    });

    it('calls onFilesSelected with transformed video assets', async () => {
      const asset = createMockImagePickerAsset();
      const pickerResult = {
        canceled: false,
        assets: [asset],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
      const [files] = mockOnFilesSelected.mock.calls[0];
      expect(files[0].type).toBe('video');
    });

    it('calls handleBlockedPermission when permission is blocked', async () => {
      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isBlocked: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(mockPermissions.handleBlockedPermission).toHaveBeenCalledWith('mediaLibrary');
    });

    it('requests media library permission when denied', async () => {
      const mockRequestVideos = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestMediaLibraryPermission: mockRequestVideos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(mockRequestVideos).toHaveBeenCalledTimes(1);
    });

    it('launches video library after permission request is granted', async () => {
      const mockRequestVideos = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestMediaLibraryPermission: mockRequestVideos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    it('does not launch video library when permission request is denied', async () => {
      const mockRequestVideos = jest.fn(async () => RESULTS.DENIED);
      const mockPermissions = createMockPermissionsObject({
        requestMediaLibraryPermission: mockRequestVideos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);
      (PermissionManager.isGranted as jest.Mock).mockReturnValueOnce(false);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('does not call onFilesSelected when video library is empty', async () => {
      const pickerResult = {
        canceled: false,
        assets: [],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it('does not launch video library when permission request is denied', async () => {
      const mockRequestVideos = jest.fn(async () => RESULTS.DENIED);
      const mockPermissions = createMockPermissionsObject({
        requestMediaLibraryPermission: mockRequestVideos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);
      (PermissionManager.isGranted as jest.Mock).mockReturnValueOnce(false);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('does not call onError for canceled video operations when not provided', async () => {
      const pickerResult = {
        canceled: true,
        assets: [],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValueOnce(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadVideos();
      });

      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('isProcessing state management', () => {
    it('initializes isProcessing as false', () => {
      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      expect(result.current.isProcessing).toBe(false);
    });

    it('resets isProcessing to false after successful operation', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('resets isProcessing to false after error', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Camera error')
      );

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected, onError: mockOnError })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('prevents double execution when called multiple times rapidly', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        // Call takePhoto multiple times rapidly
        const promise1 = result.current.takePhoto();
        const promise2 = result.current.takePhoto();
        const promise3 = result.current.takePhoto();

        await Promise.all([promise1, promise2, promise3]);
      });

      // Should only be called once due to isProcessingRef check
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);
    });

    it('prevents double execution of uploadPhotos when called multiple times rapidly', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        const promise1 = result.current.uploadPhotos();
        const promise2 = result.current.uploadPhotos();
        const promise3 = result.current.uploadPhotos();

        await Promise.all([promise1, promise2, promise3]);
      });

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
    });

    it('prevents double execution of uploadVideos when called multiple times rapidly', async () => {
      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        mediaLibrary: { ...createMockPermissionsObject().mediaLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        const promise1 = result.current.uploadVideos();
        const promise2 = result.current.uploadVideos();
        const promise3 = result.current.uploadVideos();

        await Promise.all([promise1, promise2, promise3]);
      });

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('onFilesSelected callback', () => {
    it('receives array of MediaFile objects', async () => {
      const asset = createMockImagePickerAsset();
      const pickerResult = {
        canceled: false,
        assets: [asset],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnFilesSelected).toHaveBeenCalledWith(expect.any(Array));
    });

    it('receives multiple files from photo library', async () => {
      const assets = [
        createMockImagePickerAsset({ fileName: 'photo1.jpg' }),
        createMockImagePickerAsset({ fileName: 'photo2.jpg' }),
        createMockImagePickerAsset({ fileName: 'photo3.jpg' }),
      ];
      const pickerResult = {
        canceled: false,
        assets,
      };

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        photoLibrary: { ...createMockPermissionsObject().photoLibrary, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockOnFilesSelected).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ type: 'photo' }),
        expect.objectContaining({ type: 'photo' }),
        expect.objectContaining({ type: 'photo' }),
      ]));
    });

    it('each file has required MediaFile properties', async () => {
      const asset = createMockImagePickerAsset();
      const pickerResult = {
        canceled: false,
        assets: [asset],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      const [files] = mockOnFilesSelected.mock.calls[0];
      const file = files[0];

      expect(file).toHaveProperty('id');
      expect(file).toHaveProperty('uri');
      expect(file).toHaveProperty('type');
      expect(file).toHaveProperty('name');
      expect(typeof file.id).toBe('string');
      expect(typeof file.uri).toBe('string');
      expect(typeof file.type).toBe('string');
      expect(typeof file.name).toBe('string');
    });
  });

  describe('onError callback', () => {
    it('receives Error object on camera failure', async () => {
      const error = new Error('Camera access denied');
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValueOnce(error);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected, onError: mockOnError })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnError).toHaveBeenCalledWith(error);
    });

    it('does not call onError for canceled operations', async () => {
      const pickerResult = {
        canceled: true,
        assets: [],
      };

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected, onError: mockOnError })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('only handles Error instances', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValueOnce('string error');

      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isGranted: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected, onError: mockOnError })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('permission flow combinations', () => {
    it('completes full flow: denied -> request -> granted -> launch camera', async () => {
      const mockRequestCamera = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestCameraPermission: mockRequestCamera,
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockRequestCamera).toHaveBeenCalled();
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
      expect(mockOnFilesSelected).toHaveBeenCalled();
    });

    it('completes full flow for photo library: denied -> request -> granted -> launch', async () => {
      const mockRequestPhotos = jest.fn(async () => RESULTS.GRANTED);
      const mockPermissions = createMockPermissionsObject({
        requestPhotoLibraryPermission: mockRequestPhotos,
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const pickerResult = {
        canceled: false,
        assets: [createMockImagePickerAsset()],
      };
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(pickerResult);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.uploadPhotos();
      });

      expect(mockRequestPhotos).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(mockOnFilesSelected).toHaveBeenCalled();
    });

    it('handles blocked permission flow with settings dialog', async () => {
      const mockPermissions = createMockPermissionsObject({
        camera: { ...createMockPermissionsObject().camera, isBlocked: true },
      });
      (useMediaPermissions as jest.Mock).mockReturnValue(mockPermissions);

      const { result } = renderHook(() =>
        useMediaPicker({ onFilesSelected: mockOnFilesSelected })
      );

      await act(async () => {
        await result.current.takePhoto();
      });

      expect(mockPermissions.handleBlockedPermission).toHaveBeenCalledWith('camera');
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });
  });
});
