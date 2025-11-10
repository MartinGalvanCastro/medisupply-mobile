import { Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  RESULTS,
} from 'react-native-permissions';
import { PermissionManager } from './manager';
import { getPermission } from './platform';
import { permissionStorage } from './storage';

// Mock dependencies
jest.mock('./platform');
jest.mock('./storage');

const mockGetPermission = getPermission as jest.MockedFunction<
  typeof getPermission
>;
const mockPermissionStorage = permissionStorage as jest.Mocked<
  typeof permissionStorage
>;

describe('PermissionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    (openSettings as jest.Mock).mockResolvedValue(undefined);
    mockGetPermission.mockReturnValue('ios.permission.CAMERA');
    mockPermissionStorage.get.mockReturnValue(null);
    mockPermissionStorage.incrementRequestCount.mockImplementation(
      jest.fn()
    );
  });

  describe('checkPermission', () => {
    it('should check permission and cache result', async () => {
      mockPermissionStorage.get.mockReturnValue(null);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.GRANTED);
      expect(check).toHaveBeenCalledWith('ios.permission.CAMERA');
      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.GRANTED
      );
    });

    it('should use correct cache key based on platform and type', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      (Platform.OS as string) = 'ios';

      await PermissionManager.checkPermission('photoLibrary');

      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        expect.stringContaining('_photoLibrary'),
        RESULTS.GRANTED
      );
    });

    it('should return BLOCKED status on Android when cached status is BLOCKED', async () => {
      (Platform.OS as string) = 'android';
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.BLOCKED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.BLOCKED);
    });

    it('should not return BLOCKED on iOS even if cached status is BLOCKED', async () => {
      (Platform.OS as string) = 'ios';
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.BLOCKED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.DENIED);
    });

    it('should handle unavailable permission status', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      (check as jest.Mock).mockResolvedValue(RESULTS.UNAVAILABLE);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.UNAVAILABLE);
    });

    it('should handle denied permission status', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.DENIED);
    });
  });

  describe('requestPermission', () => {
    it('should request permission without rationale', async () => {
      mockPermissionStorage.get.mockReturnValue(null);

      const result = await PermissionManager.requestPermission('camera');

      expect(result).toBe(RESULTS.GRANTED);
      expect(request).toHaveBeenCalledWith('ios.permission.CAMERA', undefined);
    });

    it('should request permission with rationale', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      const rationale = {
        title: 'Camera Permission',
        message: 'We need camera access',
        buttonPositive: 'Allow',
      };

      const result = await PermissionManager.requestPermission(
        'camera',
        rationale
      );

      expect(result).toBe(RESULTS.GRANTED);
      expect(request).toHaveBeenCalledWith('ios.permission.CAMERA', rationale);
    });

    it('should increment request count and update cache', async () => {
      const cachedData = {
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      };
      mockPermissionStorage.get.mockReturnValue(cachedData);

      await PermissionManager.requestPermission('camera');

      expect(mockPermissionStorage.incrementRequestCount).toHaveBeenCalledWith(
        'ios_camera'
      );
      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.GRANTED,
        expect.objectContaining({
          lastRequestedAt: expect.any(Number),
          requestCount: 2,
        })
      );
    });

    it('should handle first permission request (no cache)', async () => {
      mockPermissionStorage.get.mockReturnValue(null);

      await PermissionManager.requestPermission('camera');

      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.GRANTED,
        expect.objectContaining({
          requestCount: 1,
          lastRequestedAt: expect.any(Number),
        })
      );
    });

    it('should handle denied permission after request', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.requestPermission('camera');

      expect(result).toBe(RESULTS.DENIED);
      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.DENIED,
        expect.any(Object)
      );
    });

    it('should handle blocked permission after request', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      (request as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const result = await PermissionManager.requestPermission('camera');

      expect(result).toBe(RESULTS.BLOCKED);
    });

    it('should handle limited permission (iOS)', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      (request as jest.Mock).mockResolvedValue(RESULTS.LIMITED);

      const result = await PermissionManager.requestPermission(
        'photoLibrary'
      );

      expect(result).toBe(RESULTS.LIMITED);
    });

    it('should use correct permission type for different media types', async () => {
      mockPermissionStorage.get.mockReturnValue(null);
      mockGetPermission.mockReturnValue('android.permission.READ_MEDIA_VIDEO');

      await PermissionManager.requestPermission('mediaLibrary');

      expect(mockGetPermission).toHaveBeenCalledWith('mediaLibrary');
      expect(request).toHaveBeenCalledWith(
        'android.permission.READ_MEDIA_VIDEO',
        undefined
      );
    });
  });

  describe('shouldShowRationale', () => {
    it('should return true when status is DENIED, cached, request count > 0, rationale not shown', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale(
        'camera',
        RESULTS.DENIED
      );

      expect(result).toBe(true);
    });

    it('should return false when status is not DENIED', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale(
        'camera',
        RESULTS.GRANTED
      );

      expect(result).toBe(false);
    });

    it('should return false when no cached data exists', () => {
      mockPermissionStorage.get.mockReturnValue(null);

      const result = PermissionManager.shouldShowRationale(
        'camera',
        RESULTS.DENIED
      );

      expect(result).toBe(false);
    });

    it('should return false when request count is 0', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 0,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale(
        'camera',
        RESULTS.DENIED
      );

      expect(result).toBe(false);
    });

    it('should return false when rationale already shown', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: true,
      });

      const result = PermissionManager.shouldShowRationale(
        'camera',
        RESULTS.DENIED
      );

      expect(result).toBe(false);
    });

    it('should return false when status is BLOCKED', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale(
        'camera',
        RESULTS.BLOCKED
      );

      expect(result).toBe(false);
    });

    it('should consider all conditions together', () => {
      // All conditions met
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });

      expect(
        PermissionManager.shouldShowRationale('camera', RESULTS.DENIED)
      ).toBe(true);

      // Request count is 0
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 0,
        rationaleShown: false,
      });

      expect(
        PermissionManager.shouldShowRationale('camera', RESULTS.DENIED)
      ).toBe(false);
    });
  });

  describe('markRationaleShown', () => {
    it('should mark rationale as shown in storage', () => {
      PermissionManager.markRationaleShown('camera');

      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith(
        'ios_camera'
      );
    });

    it('should use correct cache key for different permission types', () => {
      PermissionManager.markRationaleShown('photoLibrary');

      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith(
        expect.stringContaining('_photoLibrary')
      );
    });

    it('should use correct cache key based on platform', () => {
      (Platform.OS as string) = 'android';

      PermissionManager.markRationaleShown('camera');

      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith(
        'android_camera'
      );
    });
  });

  describe('openAppSettings', () => {
    it('should call openSettings from react-native-permissions', async () => {
      await PermissionManager.openAppSettings();

      expect(openSettings).toHaveBeenCalled();
    });

    it('should handle openSettings error gracefully', async () => {
      (openSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Settings error')
      );

      await expect(PermissionManager.openAppSettings()).rejects.toThrow(
        'Settings error'
      );
    });
  });

  describe('isGranted', () => {
    it('should return true for GRANTED status', () => {
      expect(PermissionManager.isGranted(RESULTS.GRANTED)).toBe(true);
    });

    it('should return true for LIMITED status (iOS)', () => {
      expect(PermissionManager.isGranted(RESULTS.LIMITED)).toBe(true);
    });

    it('should return false for DENIED status', () => {
      expect(PermissionManager.isGranted(RESULTS.DENIED)).toBe(false);
    });

    it('should return false for BLOCKED status', () => {
      expect(PermissionManager.isGranted(RESULTS.BLOCKED)).toBe(false);
    });

    it('should return false for UNAVAILABLE status', () => {
      expect(PermissionManager.isGranted(RESULTS.UNAVAILABLE)).toBe(false);
    });
  });

  describe('isBlocked', () => {
    it('should return true for BLOCKED status', () => {
      expect(PermissionManager.isBlocked(RESULTS.BLOCKED)).toBe(true);
    });

    it('should return false for GRANTED status', () => {
      expect(PermissionManager.isBlocked(RESULTS.GRANTED)).toBe(false);
    });

    it('should return false for DENIED status', () => {
      expect(PermissionManager.isBlocked(RESULTS.DENIED)).toBe(false);
    });

    it('should return false for LIMITED status', () => {
      expect(PermissionManager.isBlocked(RESULTS.LIMITED)).toBe(false);
    });

    it('should return false for UNAVAILABLE status', () => {
      expect(PermissionManager.isBlocked(RESULTS.UNAVAILABLE)).toBe(false);
    });
  });

  describe('isDenied', () => {
    it('should return true for DENIED status', () => {
      expect(PermissionManager.isDenied(RESULTS.DENIED)).toBe(true);
    });

    it('should return false for GRANTED status', () => {
      expect(PermissionManager.isDenied(RESULTS.GRANTED)).toBe(false);
    });

    it('should return false for BLOCKED status', () => {
      expect(PermissionManager.isDenied(RESULTS.BLOCKED)).toBe(false);
    });

    it('should return false for LIMITED status', () => {
      expect(PermissionManager.isDenied(RESULTS.LIMITED)).toBe(false);
    });

    it('should return false for UNAVAILABLE status', () => {
      expect(PermissionManager.isDenied(RESULTS.UNAVAILABLE)).toBe(false);
    });
  });

  describe('detectAutoRevocation', () => {
    it('should return false when no cached data exists', async () => {
      mockPermissionStorage.get.mockReturnValue(null);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });

    it('should return false when cached status is not GRANTED', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 0,
        rationaleShown: false,
      });

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });

    it('should return true when permission was GRANTED but is now DENIED', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(true);
    });

    it('should return true when permission was GRANTED but is now BLOCKED', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(true);
    });

    it('should return false when permission remains GRANTED', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });

    it('should return false when permission changes from GRANTED to LIMITED', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.LIMITED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });

    it('should detect revocation for different permission types', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.detectAutoRevocation(
        'photoLibrary'
      );

      expect(result).toBe(true);
    });

    it('should call checkPermission internally', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      await PermissionManager.detectAutoRevocation('camera');

      expect(check).toHaveBeenCalled();
    });
  });

  describe('Cache key construction', () => {
    it('should construct correct cache key on iOS', () => {
      (Platform.OS as string) = 'ios';

      PermissionManager.markRationaleShown('camera');

      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith(
        'ios_camera'
      );
    });

    it('should construct correct cache key on Android', () => {
      (Platform.OS as string) = 'android';

      PermissionManager.markRationaleShown('camera');

      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith(
        'android_camera'
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete permission flow: request -> rationale -> grant', async () => {
      (Platform.OS as string) = 'ios';
      mockPermissionStorage.get.mockReturnValue(null);

      // First request
      (request as jest.Mock).mockResolvedValueOnce(RESULTS.DENIED);
      await PermissionManager.requestPermission('camera');

      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.DENIED,
        expect.objectContaining({ requestCount: 1 })
      );

      // Check if rationale should be shown
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });

      expect(
        PermissionManager.shouldShowRationale('camera', RESULTS.DENIED)
      ).toBe(true);

      // Mark rationale as shown
      PermissionManager.markRationaleShown('camera');
      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith(
        'ios_camera'
      );
    });

    it('should handle permission lifecycle with auto-revocation detection', async () => {
      // Permission granted initially
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now() - 60000, // 1 minute ago
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      // Check and confirm still granted
      let result = await PermissionManager.checkPermission('camera');
      expect(PermissionManager.isGranted(result)).toBe(true);

      // Simulate auto-revocation
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const isRevoked = await PermissionManager.detectAutoRevocation('camera');
      expect(isRevoked).toBe(true);
    });
  });
});
