import { Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import { getPermission, isAndroid13Plus } from './platform';

// Store original values
const originalOS = Platform.OS;
const originalVersion = Platform.Version;
const originalSelect = Platform.select;

describe('platform utilities', () => {
  beforeEach(() => {
    // Setup Platform.select to respect Platform.OS value
    (Platform as any).select = (obj: any) => {
      return Platform.OS === 'android' ? obj.android : obj.ios;
    };
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(Platform, 'OS', { value: originalOS, writable: true });
    Object.defineProperty(Platform, 'Version', { value: originalVersion, writable: true });
    (Platform as any).select = originalSelect;
  });

  describe('getPermission', () => {
    it('returns iOS camera permission for iOS', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      const permission = getPermission('camera');
      expect(permission).toBe(PERMISSIONS.IOS.CAMERA);
    });

    it('returns Android camera permission for Android', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 32, writable: true });
      const permission = getPermission('camera');
      expect(permission).toBe(PERMISSIONS.ANDROID.CAMERA);
    });

    it('returns iOS photo library permission for iOS', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      const permission = getPermission('photoLibrary');
      expect(permission).toBe(PERMISSIONS.IOS.PHOTO_LIBRARY);
    });

    it('returns READ_EXTERNAL_STORAGE for Android below 13', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 32, writable: true });
      const permission = getPermission('photoLibrary');
      expect(permission).toBe(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    });

    it('returns READ_MEDIA_IMAGES for Android 13+', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 33, writable: true });
      const permission = getPermission('photoLibrary');
      expect(permission).toBe(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    });

    it('returns iOS photo library permission for mediaLibrary on iOS', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      const permission = getPermission('mediaLibrary');
      expect(permission).toBe(PERMISSIONS.IOS.PHOTO_LIBRARY);
    });

    it('returns READ_EXTERNAL_STORAGE for mediaLibrary on Android below 13', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 32, writable: true });
      const permission = getPermission('mediaLibrary');
      expect(permission).toBe(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    });

    it('returns READ_MEDIA_VIDEO for mediaLibrary on Android 13+', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 33, writable: true });
      const permission = getPermission('mediaLibrary');
      expect(permission).toBe(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
    });

    it('throws error for unknown permission type', () => {
      expect(() => {
        getPermission('unknown' as any);
      }).toThrow('Unknown permission type: unknown');
    });
  });

  describe('isAndroid13Plus', () => {
    it('returns false for iOS', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 16, writable: true });
      expect(isAndroid13Plus()).toBe(false);
    });

    it('returns false for Android below 13', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 32, writable: true });
      expect(isAndroid13Plus()).toBe(false);
    });

    it('returns true for Android 13+', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 33, writable: true });
      expect(isAndroid13Plus()).toBe(true);
    });

    it('returns true for Android 14+', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      Object.defineProperty(Platform, 'Version', { value: 34, writable: true });
      expect(isAndroid13Plus()).toBe(true);
    });
  });
});
