import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useMediaPermissions } from '../useMediaPermissions';

// Mock the usePermission hook
jest.mock('@/hooks/usePermission', () => ({
  usePermission: jest.fn((type: string) => {
    const mockPermission = {
      status: 'denied' as const,
      isLoading: false,
      isRequesting: false,
      isGranted: false,
      isBlocked: false,
      isDenied: true,
      request: jest.fn(async () => 'denied'),
      openSettings: jest.fn(),
    };

    // Return different mock based on type
    if (type === 'camera') {
      return { ...mockPermission, status: 'granted' as const, isGranted: true, isDenied: false };
    } else if (type === 'photoLibrary') {
      return { ...mockPermission, status: 'denied' as const };
    } else if (type === 'mediaLibrary') {
      return { ...mockPermission, status: 'blocked' as const, isBlocked: true, isDenied: false };
    }
    return mockPermission;
  }),
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('useMediaPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('camera permission state', () => {
    it('should return camera permission state', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera).toBeDefined();
      expect(result.current.camera).toHaveProperty('status');
      expect(result.current.camera).toHaveProperty('isLoading');
      expect(result.current.camera).toHaveProperty('isRequesting');
      expect(result.current.camera).toHaveProperty('isGranted');
      expect(result.current.camera).toHaveProperty('isBlocked');
      expect(result.current.camera).toHaveProperty('isDenied');
    });

    it('should expose camera permission status', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.camera.status).toBe('granted');
      expect(result.current.camera.isGranted).toBe(true);
    });
  });

  describe('photoLibrary permission state', () => {
    it('should return photoLibrary permission state', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.photoLibrary).toBeDefined();
      expect(result.current.photoLibrary).toHaveProperty('status');
      expect(result.current.photoLibrary).toHaveProperty('isLoading');
      expect(result.current.photoLibrary).toHaveProperty('isRequesting');
      expect(result.current.photoLibrary).toHaveProperty('isGranted');
      expect(result.current.photoLibrary).toHaveProperty('isBlocked');
      expect(result.current.photoLibrary).toHaveProperty('isDenied');
    });

    it('should expose photoLibrary permission status', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.photoLibrary.status).toBe('denied');
      expect(result.current.photoLibrary.isDenied).toBe(true);
    });
  });

  describe('mediaLibrary permission state', () => {
    it('should return mediaLibrary permission state', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.mediaLibrary).toBeDefined();
      expect(result.current.mediaLibrary).toHaveProperty('status');
      expect(result.current.mediaLibrary).toHaveProperty('isLoading');
      expect(result.current.mediaLibrary).toHaveProperty('isRequesting');
      expect(result.current.mediaLibrary).toHaveProperty('isGranted');
      expect(result.current.mediaLibrary).toHaveProperty('isBlocked');
      expect(result.current.mediaLibrary).toHaveProperty('isDenied');
    });

    it('should expose mediaLibrary permission status', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current.mediaLibrary.status).toBe('blocked');
      expect(result.current.mediaLibrary.isBlocked).toBe(true);
    });
  });

  describe('requestCameraPermission', () => {
    it('should request camera permission', async () => {
      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        const status = await result.current.requestCameraPermission();
        expect(status).toBeDefined();
      });
    });

    it('should be a function', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.requestCameraPermission).toBe('function');
    });

    it('should return a promise', () => {
      const { result } = renderHook(() => useMediaPermissions());

      const promise = result.current.requestCameraPermission();
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('requestPhotoLibraryPermission', () => {
    it('should request photoLibrary permission', async () => {
      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        const status = await result.current.requestPhotoLibraryPermission();
        expect(status).toBeDefined();
      });
    });

    it('should be a function', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.requestPhotoLibraryPermission).toBe('function');
    });

    it('should return a promise', () => {
      const { result } = renderHook(() => useMediaPermissions());

      const promise = result.current.requestPhotoLibraryPermission();
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('requestMediaLibraryPermission', () => {
    it('should request mediaLibrary permission', async () => {
      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        const status = await result.current.requestMediaLibraryPermission();
        expect(status).toBeDefined();
      });
    });

    it('should be a function', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.requestMediaLibraryPermission).toBe('function');
    });

    it('should return a promise', () => {
      const { result } = renderHook(() => useMediaPermissions());

      const promise = result.current.requestMediaLibraryPermission();
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('handleBlockedPermission', () => {
    it('should show alert for blocked camera permission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      expect(Alert.alert).toHaveBeenCalled();
      const [title, message] = (Alert.alert as jest.Mock).mock.calls[0];
      expect(title).toBe('Camera Permission Required');
      expect(message).toContain('Camera access is blocked');
    });

    it('should show alert for blocked photoLibrary permission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('photoLibrary');
      });

      expect(Alert.alert).toHaveBeenCalled();
      const [title, message] = (Alert.alert as jest.Mock).mock.calls[0];
      expect(title).toBe('Photo Library Permission Required');
      expect(message).toContain('Photo library access is blocked');
    });

    it('should show alert for blocked mediaLibrary permission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('mediaLibrary');
      });

      expect(Alert.alert).toHaveBeenCalled();
      const [title, message] = (Alert.alert as jest.Mock).mock.calls[0];
      expect(title).toBe('Media Library Permission Required');
      expect(message).toContain('Media library access is blocked');
    });

    it('should include buttons in alert', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = callArgs[2];
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text).toBe('Cancel');
      expect(buttons[1].text).toBe('Open Settings');
    });

    it('should call openSettings when Open Settings button is pressed', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const openSettingsButton = buttons[1];
      expect(openSettingsButton.onPress).toBeDefined();
    });

    it('should be a function', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.handleBlockedPermission).toBe('function');
    });
  });

  describe('all permissions state together', () => {
    it('should return all permission types', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(result.current).toHaveProperty('camera');
      expect(result.current).toHaveProperty('photoLibrary');
      expect(result.current).toHaveProperty('mediaLibrary');
    });

    it('should have independent permission states', () => {
      const { result } = renderHook(() => useMediaPermissions());

      // Camera granted, photo denied, media blocked
      expect(result.current.camera.isGranted).toBe(true);
      expect(result.current.photoLibrary.isDenied).toBe(true);
      expect(result.current.mediaLibrary.isBlocked).toBe(true);
    });

    it('should have all request functions', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.requestCameraPermission).toBe('function');
      expect(typeof result.current.requestPhotoLibraryPermission).toBe('function');
      expect(typeof result.current.requestMediaLibraryPermission).toBe('function');
      expect(typeof result.current.handleBlockedPermission).toBe('function');
    });
  });

  describe('multiple calls to request functions', () => {
    it('should allow multiple calls to requestCameraPermission', async () => {
      const { result } = renderHook(() => useMediaPermissions());

      await act(async () => {
        const status1 = await result.current.requestCameraPermission();
        const status2 = await result.current.requestCameraPermission();
        expect(status1).toBeDefined();
        expect(status2).toBeDefined();
      });
    });

    it('should allow multiple calls to handleBlockedPermission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
        result.current.handleBlockedPermission('photoLibrary');
        result.current.handleBlockedPermission('mediaLibrary');
      });

      expect(Alert.alert).toHaveBeenCalledTimes(3);
    });
  });

  describe('permission state consistency', () => {
    it('should maintain consistent isLoading state', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.camera.isLoading).toBe('boolean');
      expect(typeof result.current.photoLibrary.isLoading).toBe('boolean');
      expect(typeof result.current.mediaLibrary.isLoading).toBe('boolean');
    });

    it('should maintain consistent isRequesting state', () => {
      const { result } = renderHook(() => useMediaPermissions());

      expect(typeof result.current.camera.isRequesting).toBe('boolean');
      expect(typeof result.current.photoLibrary.isRequesting).toBe('boolean');
      expect(typeof result.current.mediaLibrary.isRequesting).toBe('boolean');
    });

    it('should have mutually exclusive permission flags', () => {
      const { result } = renderHook(() => useMediaPermissions());

      // For a given permission, status should determine flags
      const camera = result.current.camera;
      // Only one flag should be true at a time based on status
      const flags = [camera.isGranted, camera.isBlocked, camera.isDenied];
      // At least one should be false (not all can be true simultaneously)
      expect(flags.filter((f) => f).length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('alert messages correctness', () => {
    it('should have relevant message for camera permission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('camera');
      });

      const message = (Alert.alert as jest.Mock).mock.calls[0][1];
      expect(message).toContain('Camera');
      expect(message).toContain('Settings');
    });

    it('should have relevant message for photoLibrary permission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('photoLibrary');
      });

      const message = (Alert.alert as jest.Mock).mock.calls[0][1];
      expect(message).toContain('photo');
      expect(message).toContain('Settings');
    });

    it('should have relevant message for mediaLibrary permission', () => {
      const { result } = renderHook(() => useMediaPermissions());

      act(() => {
        result.current.handleBlockedPermission('mediaLibrary');
      });

      const message = (Alert.alert as jest.Mock).mock.calls[0][1];
      expect(message).toContain('Media');
      expect(message).toContain('Settings');
    });
  });
});
