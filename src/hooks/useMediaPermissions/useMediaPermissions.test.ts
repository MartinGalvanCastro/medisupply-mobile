import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { useMediaPermissions } from './useMediaPermissions';
import { usePermission } from '@/hooks/usePermission';

jest.mock('@/hooks/usePermission');

describe('useMediaPermissions', () => {
  const mockUsePermission = usePermission as jest.MockedFunction<typeof usePermission>;

  const createMockPermission = (status: any = RESULTS.DENIED) => ({
    status,
    isLoading: false,
    isRequesting: false,
    isGranted: status === RESULTS.GRANTED || status === RESULTS.LIMITED,
    isBlocked: status === RESULTS.BLOCKED,
    isDenied: status === RESULTS.DENIED,
    request: jest.fn(async () => status),
    openSettings: jest.fn(async () => {}),
    checkStatus: jest.fn(async () => {}),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePermission.mockImplementation((type) => createMockPermission(RESULTS.DENIED));
  });

  describe('initial state', () => {
    it('returns initial permission states for all media types', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.status).toBe(RESULTS.DENIED);
      expect(result.current.photoLibrary.status).toBe(RESULTS.DENIED);
      expect(result.current.mediaLibrary.status).toBe(RESULTS.DENIED);
    });

    it('initializes all permission states with correct property values', () => {
      const { result } = renderHook(() => useMediaPermissions());

      const expectedState = {
        status: RESULTS.DENIED,
        isLoading: false,
        isRequesting: false,
        isGranted: false,
        isBlocked: false,
        isDenied: true,
      };

      expect(result.current.camera).toEqual(expectedState);
      expect(result.current.photoLibrary).toEqual(expectedState);
      expect(result.current.mediaLibrary).toEqual(expectedState);
    });

    it('provides callable request and handler functions', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.requestCameraPermission).toBe('function');
      expect(typeof result.current.requestPhotoLibraryPermission).toBe('function');
      expect(typeof result.current.requestMediaLibraryPermission).toBe('function');
      expect(typeof result.current.handleBlockedPermission).toBe('function');
    });

    it('initializes with usePermission called for each media type', () => {
      renderHook(() => useMediaPermissions());

      expect(mockUsePermission).toHaveBeenCalledWith('camera');
      expect(mockUsePermission).toHaveBeenCalledWith('photoLibrary');
      expect(mockUsePermission).toHaveBeenCalledWith('mediaLibrary');
      expect(mockUsePermission).toHaveBeenCalledTimes(3);
    });
  });

  describe('requestCameraPermission', () => {
    it('calls camera permission request with correct rationale', async () => {
      const mockRequest = jest.fn(async () => RESULTS.GRANTED);
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        request: mockRequest,
      });

      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        await result.current.requestCameraPermission();
      });

      expect(mockRequest).toHaveBeenCalledWith({
        title: 'Camera Permission',
        message: 'Allow MediSupply to access your camera to take photos of visit evidence.',
        buttonPositive: 'Allow',
      });
    });

    it('returns permission status from request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.GRANTED);
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        request: mockRequest,
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestCameraPermission();
      });

      expect(returnValue).toBe(RESULTS.GRANTED);
    });

    it('handles denied status from camera request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.DENIED);
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        request: mockRequest,
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestCameraPermission();
      });

      expect(returnValue).toBe(RESULTS.DENIED);
    });

    it('handles blocked status from camera request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.BLOCKED);
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        request: mockRequest,
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestCameraPermission();
      });

      expect(returnValue).toBe(RESULTS.BLOCKED);
    });
  });

  describe('requestPhotoLibraryPermission', () => {
    it('calls photo library permission request with correct rationale', async () => {
      const mockRequest = jest.fn(async () => RESULTS.GRANTED);
      mockUsePermission.mockImplementation((type) => {
        if (type === 'photoLibrary') {
          return {
            ...createMockPermission(),
            request: mockRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        await result.current.requestPhotoLibraryPermission();
      });

      expect(mockRequest).toHaveBeenCalledWith({
        title: 'Photo Library Permission',
        message: 'Allow MediSupply to access your photo library to upload photos of visit evidence.',
        buttonPositive: 'Allow',
      });
    });

    it('returns permission status from request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.GRANTED);
      mockUsePermission.mockImplementation((type) => {
        if (type === 'photoLibrary') {
          return {
            ...createMockPermission(RESULTS.GRANTED),
            request: mockRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestPhotoLibraryPermission();
      });

      expect(returnValue).toBe(RESULTS.GRANTED);
    });

    it('handles denied status from photo library request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.DENIED);
      mockUsePermission.mockImplementation((type) => {
        if (type === 'photoLibrary') {
          return {
            ...createMockPermission(),
            request: mockRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestPhotoLibraryPermission();
      });

      expect(returnValue).toBe(RESULTS.DENIED);
    });
  });

  describe('requestMediaLibraryPermission', () => {
    it('calls media library permission request with correct rationale', async () => {
      const mockRequest = jest.fn(async () => RESULTS.GRANTED);
      mockUsePermission.mockImplementation((type) => {
        if (type === 'mediaLibrary') {
          return {
            ...createMockPermission(),
            request: mockRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        await result.current.requestMediaLibraryPermission();
      });

      expect(mockRequest).toHaveBeenCalledWith({
        title: 'Media Library Permission',
        message: 'Allow MediSupply to access your media library to upload videos of visit evidence.',
        buttonPositive: 'Allow',
      });
    });

    it('returns permission status from request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.GRANTED);
      mockUsePermission.mockImplementation((type) => {
        if (type === 'mediaLibrary') {
          return {
            ...createMockPermission(RESULTS.GRANTED),
            request: mockRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestMediaLibraryPermission();
      });

      expect(returnValue).toBe(RESULTS.GRANTED);
    });

    it('handles denied status from media library request', async () => {
      const mockRequest = jest.fn(async () => RESULTS.DENIED);
      mockUsePermission.mockImplementation((type) => {
        if (type === 'mediaLibrary') {
          return {
            ...createMockPermission(),
            request: mockRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.requestMediaLibraryPermission();
      });

      expect(returnValue).toBe(RESULTS.DENIED);
    });
  });

  describe('handleBlockedPermission for camera', () => {
    it('shows alert with camera permission title and message', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      const mockOpenSettings = jest.fn(async () => {});
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(RESULTS.BLOCKED),
        openSettings: mockOpenSettings,
      });

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Camera Permission Required',
        'Camera access is blocked. Please enable it in Settings to take photos.',
        expect.any(Array)
      );

      alertSpy.mockRestore();
    });

    it('alert includes Cancel button', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      mockUsePermission.mockReturnValueOnce(createMockPermission());

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      const buttons = alertSpy.mock.calls[0][2];
      const cancelButton = buttons?.find((btn: any) => btn.text === 'Cancel');

      expect(cancelButton).toBeDefined();
      expect(cancelButton?.style).toBe('cancel');

      alertSpy.mockRestore();
    });

    it('alert includes Open Settings button that calls openSettings', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      const mockOpenSettings = jest.fn(async () => {});
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        openSettings: mockOpenSettings,
      });

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      const buttons = alertSpy.mock.calls[0][2];
      const settingsButton = buttons?.find((btn: any) => btn.text === 'Open Settings');

      expect(settingsButton).toBeDefined();

      act(() => {
        settingsButton?.onPress?.();
      });

      expect(mockOpenSettings).toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('handleBlockedPermission for photoLibrary', () => {
    it('shows alert with photo library permission title and message', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      const mockOpenSettings = jest.fn(async () => {});
      mockUsePermission.mockImplementation((type) => {
        if (type === 'photoLibrary') {
          return {
            ...createMockPermission(RESULTS.BLOCKED),
            openSettings: mockOpenSettings,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('photoLibrary');
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Photo Library Permission Required',
        'Photo library access is blocked. Please enable it in Settings to upload photos.',
        expect.any(Array)
      );

      alertSpy.mockRestore();
    });

    it('alert Open Settings button calls correct permission openSettings', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      const mockOpenSettings = jest.fn(async () => {});
      mockUsePermission.mockImplementation((type) => {
        if (type === 'photoLibrary') {
          return {
            ...createMockPermission(),
            openSettings: mockOpenSettings,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('photoLibrary');
      });

      const buttons = alertSpy.mock.calls[0][2];
      const settingsButton = buttons?.find((btn: any) => btn.text === 'Open Settings');

      act(() => {
        settingsButton?.onPress?.();
      });

      expect(mockOpenSettings).toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('handleBlockedPermission for mediaLibrary', () => {
    it('shows alert with media library permission title and message', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      const mockOpenSettings = jest.fn(async () => {});
      mockUsePermission.mockImplementation((type) => {
        if (type === 'mediaLibrary') {
          return {
            ...createMockPermission(RESULTS.BLOCKED),
            openSettings: mockOpenSettings,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('mediaLibrary');
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Media Library Permission Required',
        'Media library access is blocked. Please enable it in Settings to upload videos.',
        expect.any(Array)
      );

      alertSpy.mockRestore();
    });

    it('alert Open Settings button calls correct permission openSettings', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      const mockOpenSettings = jest.fn(async () => {});
      mockUsePermission.mockImplementation((type) => {
        if (type === 'mediaLibrary') {
          return {
            ...createMockPermission(),
            openSettings: mockOpenSettings,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('mediaLibrary');
      });

      const buttons = alertSpy.mock.calls[0][2];
      const settingsButton = buttons?.find((btn: any) => btn.text === 'Open Settings');

      act(() => {
        settingsButton?.onPress?.();
      });

      expect(mockOpenSettings).toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('permission state updates', () => {
    it('reflects granted status for camera', () => {
      mockUsePermission.mockReturnValue({
        ...createMockPermission(RESULTS.GRANTED),
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.status).toBe(RESULTS.GRANTED);
      expect(result.current.camera.isGranted).toBe(true);
      expect(result.current.camera.isDenied).toBe(false);
      expect(result.current.camera.isBlocked).toBe(false);
    });

    it('reflects granted status for photo library', () => {
      mockUsePermission.mockImplementation((type) => {
        if (type === 'photoLibrary') {
          return createMockPermission(RESULTS.GRANTED);
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.photoLibrary.status).toBe(RESULTS.GRANTED);
      expect(result.current.photoLibrary.isGranted).toBe(true);
      expect(result.current.photoLibrary.isDenied).toBe(false);
      expect(result.current.photoLibrary.isBlocked).toBe(false);
    });

    it('reflects granted status for media library', () => {
      mockUsePermission.mockImplementation((type) => {
        if (type === 'mediaLibrary') {
          return createMockPermission(RESULTS.GRANTED);
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.mediaLibrary.status).toBe(RESULTS.GRANTED);
      expect(result.current.mediaLibrary.isGranted).toBe(true);
      expect(result.current.mediaLibrary.isDenied).toBe(false);
      expect(result.current.mediaLibrary.isBlocked).toBe(false);
    });

    it('reflects blocked status for camera', () => {
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(RESULTS.BLOCKED),
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.status).toBe(RESULTS.BLOCKED);
      expect(result.current.camera.isBlocked).toBe(true);
      expect(result.current.camera.isDenied).toBe(false);
      expect(result.current.camera.isGranted).toBe(false);
    });

    it('reflects limited status for camera', () => {
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(RESULTS.LIMITED),
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.status).toBe(RESULTS.LIMITED);
      expect(result.current.camera.isGranted).toBe(true);
      expect(result.current.camera.isBlocked).toBe(false);
      expect(result.current.camera.isDenied).toBe(false);
    });

    it('reflects loading state for camera', () => {
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        isLoading: true,
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.isLoading).toBe(true);
    });

    it('reflects requesting state for camera', () => {
      mockUsePermission.mockReturnValueOnce({
        ...createMockPermission(),
        isRequesting: true,
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.isRequesting).toBe(true);
    });
  });

  describe('hook independence', () => {
    it('maintains separate state for each permission type', () => {
      mockUsePermission.mockImplementation((type) => {
        if (type === 'camera') {
          return createMockPermission(RESULTS.GRANTED);
        }
        if (type === 'photoLibrary') {
          return createMockPermission(RESULTS.BLOCKED);
        }
        return createMockPermission(RESULTS.DENIED);
      });

      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.status).toBe(RESULTS.GRANTED);
      expect(result.current.photoLibrary.status).toBe(RESULTS.BLOCKED);
      expect(result.current.mediaLibrary.status).toBe(RESULTS.DENIED);
    });

    it('request functions are independent and do not affect each other', async () => {
      const mockCameraRequest = jest.fn(async () => RESULTS.GRANTED);
      const mockPhotoRequest = jest.fn(async () => RESULTS.DENIED);

      mockUsePermission.mockImplementation((type) => {
        if (type === 'camera') {
          return {
            ...createMockPermission(),
            request: mockCameraRequest,
          };
        }
        if (type === 'photoLibrary') {
          return {
            ...createMockPermission(),
            request: mockPhotoRequest,
          };
        }
        return createMockPermission();
      });

      const { result } = renderHook(() => useMediaPermissions());

      let cameraResult;
      let photoResult;

      await act(async () => {
        cameraResult = await result.current.requestCameraPermission();
        photoResult = await result.current.requestPhotoLibraryPermission();
      });

      expect(cameraResult).toBe(RESULTS.GRANTED);
      expect(photoResult).toBe(RESULTS.DENIED);
      expect(mockCameraRequest).toHaveBeenCalledTimes(1);
      expect(mockPhotoRequest).toHaveBeenCalledTimes(1);
    });
  });
});
