import { Platform } from 'react-native';
import { check, request, openSettings, RESULTS } from 'react-native-permissions';
import { PermissionManager } from './manager';
import { getPermission } from './platform';
import { permissionStorage } from './storage';

jest.mock('react-native-permissions');
jest.mock('./platform');
jest.mock('./storage');

describe('PermissionManager', () => {
  const mockGetPermission = getPermission as jest.MockedFunction<typeof getPermission>;
  const mockCheck = check as jest.MockedFunction<typeof check>;
  const mockRequest = request as jest.MockedFunction<typeof request>;
  const mockOpenSettings = openSettings as jest.MockedFunction<typeof openSettings>;
  const mockPermissionStorage = permissionStorage as jest.Mocked<typeof permissionStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios' as any;
    mockGetPermission.mockReturnValue('ios.permission.CAMERA');
    mockCheck.mockResolvedValue(RESULTS.GRANTED);
    mockRequest.mockResolvedValue(RESULTS.GRANTED);
    mockOpenSettings.mockResolvedValue(undefined);
    mockPermissionStorage.get.mockReturnValue(null);
  });

  describe('checkPermission', () => {
    it('checks permission and stores result', async () => {
      const result = await PermissionManager.checkPermission('camera');

      expect(mockGetPermission).toHaveBeenCalledWith('camera');
      expect(mockCheck).toHaveBeenCalledWith('ios.permission.CAMERA');
      expect(mockPermissionStorage.set).toHaveBeenCalledWith('ios_camera', RESULTS.GRANTED);
      expect(result).toBe(RESULTS.GRANTED);
    });

    it('returns BLOCKED status for Android if previously blocked', async () => {
      Platform.OS = 'android' as any;
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.BLOCKED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.BLOCKED);
    });

    it('returns actual status for iOS even if previously blocked', async () => {
      Platform.OS = 'ios' as any;
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.BLOCKED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const result = await PermissionManager.checkPermission('camera');

      expect(result).toBe(RESULTS.GRANTED);
    });
  });

  describe('requestPermission', () => {
    it('requests permission and stores result', async () => {
      const result = await PermissionManager.requestPermission('camera');

      expect(mockGetPermission).toHaveBeenCalledWith('camera');
      expect(mockRequest).toHaveBeenCalledWith('ios.permission.CAMERA', undefined);
      expect(mockPermissionStorage.set).toHaveBeenCalled();
      expect(result).toBe(RESULTS.GRANTED);
    });

    it('increments request count when previously cached', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: false,
      });

      await PermissionManager.requestPermission('camera');

      expect(mockPermissionStorage.incrementRequestCount).toHaveBeenCalledWith('ios_camera');
    });

    it('includes request count in set call', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: false,
      });

      await PermissionManager.requestPermission('camera');

      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.GRANTED,
        expect.objectContaining({
          requestCount: 3,
          lastRequestedAt: expect.any(Number),
        })
      );
    });

    it('sets initial request count when no previous cache', async () => {
      mockPermissionStorage.get.mockReturnValue(null);

      await PermissionManager.requestPermission('camera');

      expect(mockPermissionStorage.set).toHaveBeenCalledWith(
        'ios_camera',
        RESULTS.GRANTED,
        expect.objectContaining({
          requestCount: 1,
        })
      );
    });

    it('passes rationale to request', async () => {
      const rationale = {
        title: 'Camera access needed',
        message: 'Please allow camera access',
        buttonPositive: 'OK',
      };

      await PermissionManager.requestPermission('camera', rationale);

      expect(mockRequest).toHaveBeenCalledWith('ios.permission.CAMERA', rationale);
    });
  });

  describe('shouldShowRationale', () => {
    it('returns true when status is denied, cached exists, and rationale not shown', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 2,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale('camera', RESULTS.DENIED);

      expect(result).toBe(true);
    });

    it('returns false when status is not denied', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale('camera', RESULTS.GRANTED);

      expect(result).toBe(false);
    });

    it('returns false when not cached', () => {
      mockPermissionStorage.get.mockReturnValue(null);

      const result = PermissionManager.shouldShowRationale('camera', RESULTS.DENIED);

      expect(result).toBe(false);
    });

    it('returns false when request count is 0', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 0,
        rationaleShown: false,
      });

      const result = PermissionManager.shouldShowRationale('camera', RESULTS.DENIED);

      expect(result).toBe(false);
    });

    it('returns false when rationale already shown', () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: true,
      });

      const result = PermissionManager.shouldShowRationale('camera', RESULTS.DENIED);

      expect(result).toBe(false);
    });
  });

  describe('markRationaleShown', () => {
    it('marks rationale as shown', () => {
      PermissionManager.markRationaleShown('camera');

      expect(mockPermissionStorage.markRationaleShown).toHaveBeenCalledWith('ios_camera');
    });
  });

  describe('openAppSettings', () => {
    it('calls openSettings', async () => {
      await PermissionManager.openAppSettings();

      expect(mockOpenSettings).toHaveBeenCalled();
    });
  });

  describe('isGranted', () => {
    it('returns true for GRANTED status', () => {
      expect(PermissionManager.isGranted(RESULTS.GRANTED)).toBe(true);
    });

    it('returns true for LIMITED status', () => {
      expect(PermissionManager.isGranted(RESULTS.LIMITED)).toBe(true);
    });

    it('returns false for DENIED status', () => {
      expect(PermissionManager.isGranted(RESULTS.DENIED)).toBe(false);
    });

    it('returns false for BLOCKED status', () => {
      expect(PermissionManager.isGranted(RESULTS.BLOCKED)).toBe(false);
    });

    it('returns false for UNAVAILABLE status', () => {
      expect(PermissionManager.isGranted(RESULTS.UNAVAILABLE)).toBe(false);
    });
  });

  describe('isBlocked', () => {
    it('returns true for BLOCKED status', () => {
      expect(PermissionManager.isBlocked(RESULTS.BLOCKED)).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(PermissionManager.isBlocked(RESULTS.GRANTED)).toBe(false);
      expect(PermissionManager.isBlocked(RESULTS.DENIED)).toBe(false);
      expect(PermissionManager.isBlocked(RESULTS.LIMITED)).toBe(false);
      expect(PermissionManager.isBlocked(RESULTS.UNAVAILABLE)).toBe(false);
    });
  });

  describe('isDenied', () => {
    it('returns true for DENIED status', () => {
      expect(PermissionManager.isDenied(RESULTS.DENIED)).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(PermissionManager.isDenied(RESULTS.GRANTED)).toBe(false);
      expect(PermissionManager.isDenied(RESULTS.BLOCKED)).toBe(false);
      expect(PermissionManager.isDenied(RESULTS.LIMITED)).toBe(false);
      expect(PermissionManager.isDenied(RESULTS.UNAVAILABLE)).toBe(false);
    });
  });

  describe('detectAutoRevocation', () => {
    it('returns false when no cached permission', async () => {
      mockPermissionStorage.get.mockReturnValue(null);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });

    it('returns false when cached status is not GRANTED', async () => {
      mockPermissionStorage.get.mockReturnValue({
        status: RESULTS.DENIED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });

    it('returns true when permission was GRANTED but is now DENIED', async () => {
      mockPermissionStorage.get.mockReturnValueOnce({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(true);
    });

    it('returns true when permission was GRANTED but is now BLOCKED', async () => {
      mockPermissionStorage.get.mockReturnValueOnce({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(true);
    });

    it('returns false when permission is still GRANTED', async () => {
      mockPermissionStorage.get.mockReturnValueOnce({
        status: RESULTS.GRANTED,
        lastChecked: Date.now(),
        requestCount: 1,
        rationaleShown: false,
      });
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const result = await PermissionManager.detectAutoRevocation('camera');

      expect(result).toBe(false);
    });
  });
});
