import { storageUtils } from '@/utils/storage';
import { permissionStorage } from './storage';
import type { PermissionStatus } from './types';
import { RESULTS } from 'react-native-permissions';

// Mock storageUtils
jest.mock('@/utils/storage');

const mockStorageUtils = storageUtils as jest.Mocked<typeof storageUtils>;

describe('permissionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageUtils.getObject.mockReturnValue(null);
    mockStorageUtils.setObject.mockImplementation(jest.fn());
    mockStorageUtils.delete.mockImplementation(jest.fn());
  });

  describe('getAll', () => {
    it('should return empty object when no permissions cached', () => {
      mockStorageUtils.getObject.mockReturnValue(null);

      const result = permissionStorage.getAll();

      expect(result).toEqual({});
      expect(mockStorageUtils.getObject).toHaveBeenCalledWith(
        'permissions_cache'
      );
    });

    it('should return cached permissions metadata', () => {
      const cachedData = {
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(cachedData);

      const result = permissionStorage.getAll();

      expect(result).toEqual(cachedData);
    });

    it('should return all cached permissions for multiple types', () => {
      const cachedData = {
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
        ios_photoLibrary: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: true,
        },
        android_camera: {
          status: RESULTS.BLOCKED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 3,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(cachedData);

      const result = permissionStorage.getAll();

      expect(result).toEqual(cachedData);
      expect(Object.keys(result)).toHaveLength(3);
    });

    it('should use correct cache key', () => {
      permissionStorage.getAll();

      expect(mockStorageUtils.getObject).toHaveBeenCalledWith(
        'permissions_cache'
      );
    });

    it('should handle undefined return from storage as empty object', () => {
      mockStorageUtils.getObject.mockReturnValue(undefined);

      const result = permissionStorage.getAll();

      expect(result).toEqual({});
    });
  });

  describe('get', () => {
    it('should return null when no cached data exists', () => {
      mockStorageUtils.getObject.mockReturnValue(null);

      const result = permissionStorage.get('ios_camera');

      expect(result).toBeNull();
    });

    it('should return null when key does not exist in cache', () => {
      mockStorageUtils.getObject.mockReturnValue({
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      });

      const result = permissionStorage.get('ios_photoLibrary');

      expect(result).toBeNull();
    });

    it('should return cached permission when valid and not expired', () => {
      const now = Date.now();
      const cachedPermission = {
        status: RESULTS.GRANTED as PermissionStatus,
        lastChecked: now,
        requestCount: 1,
        rationaleShown: false,
      };
      mockStorageUtils.getObject.mockReturnValue({
        ios_camera: cachedPermission,
      });

      const result = permissionStorage.get('ios_camera');

      expect(result).toEqual(cachedPermission);
    });

    it('should return null when cache has expired (TTL exceeded)', () => {
      const now = Date.now();
      const expiredTime = now - 6 * 60 * 1000; // 6 minutes ago (TTL is 5 minutes)
      mockStorageUtils.getObject.mockReturnValue({
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: expiredTime,
          requestCount: 1,
          rationaleShown: false,
        },
      });

      const result = permissionStorage.get('ios_camera');

      expect(result).toBeNull();
    });

    it('should handle cache at exact TTL boundary (5 minutes)', () => {
      const now = Date.now();
      const ttlMs = 5 * 60 * 1000;
      const atBoundary = now - ttlMs - 1; // 1ms past the boundary
      mockStorageUtils.getObject.mockReturnValue({
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: atBoundary,
          requestCount: 1,
          rationaleShown: false,
        },
      });

      const result = permissionStorage.get('ios_camera');

      // Past exact TTL boundary should be considered expired
      expect(result).toBeNull();
    });

    it('should return valid cache just before TTL expiration', () => {
      const now = Date.now();
      const ttlMs = 5 * 60 * 1000;
      const justBefore = now - (ttlMs - 1000); // 1 second before expiration
      const cachedPermission = {
        status: RESULTS.GRANTED as PermissionStatus,
        lastChecked: justBefore,
        requestCount: 1,
        rationaleShown: false,
      };
      mockStorageUtils.getObject.mockReturnValue({
        ios_camera: cachedPermission,
      });

      const result = permissionStorage.get('ios_camera');

      expect(result).toEqual(cachedPermission);
    });

    it('should preserve all cache properties when returning valid cache', () => {
      const now = Date.now();
      const cachedPermission = {
        status: RESULTS.LIMITED as PermissionStatus,
        lastChecked: now,
        requestCount: 5,
        rationaleShown: true,
        lastRequestedAt: now - 60000,
      };
      mockStorageUtils.getObject.mockReturnValue({
        ios_photoLibrary: cachedPermission,
      });

      const result = permissionStorage.get('ios_photoLibrary');

      expect(result).toEqual(cachedPermission);
      expect(result?.requestCount).toBe(5);
      expect(result?.rationaleShown).toBe(true);
      expect(result?.lastRequestedAt).toBe(now - 60000);
    });

    it('should handle multiple cache entries and return correct one', () => {
      const now = Date.now();
      const cameraCache = {
        status: RESULTS.GRANTED as PermissionStatus,
        lastChecked: now,
        requestCount: 1,
        rationaleShown: false,
      };
      const photoCache = {
        status: RESULTS.DENIED as PermissionStatus,
        lastChecked: now,
        requestCount: 2,
        rationaleShown: true,
      };
      mockStorageUtils.getObject.mockReturnValue({
        ios_camera: cameraCache,
        ios_photoLibrary: photoCache,
      });

      const cameraResult = permissionStorage.get('ios_camera');
      const photoResult = permissionStorage.get('ios_photoLibrary');

      expect(cameraResult).toEqual(cameraCache);
      expect(photoResult).toEqual(photoCache);
    });
  });

  describe('set', () => {
    it('should set new permission cache with default metadata', () => {
      mockStorageUtils.getObject.mockReturnValue(null);

      permissionStorage.set('ios_camera', RESULTS.GRANTED);

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            status: RESULTS.GRANTED,
            lastChecked: expect.any(Number),
            requestCount: 0,
            rationaleShown: false,
          }),
        })
      );
    });

    it('should preserve existing metadata when updating cache', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now() - 60000,
          requestCount: 3,
          rationaleShown: true,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.set('ios_camera', RESULTS.GRANTED);

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            status: RESULTS.GRANTED,
            requestCount: 3, // preserved
            rationaleShown: true, // preserved
          }),
        })
      );
    });

    it('should override with additional metadata', () => {
      mockStorageUtils.getObject.mockReturnValue(null);

      const additionalData = {
        requestCount: 2,
        lastRequestedAt: Date.now(),
      };

      permissionStorage.set('ios_camera', RESULTS.DENIED, additionalData);

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            status: RESULTS.DENIED,
            requestCount: 2,
            lastRequestedAt: expect.any(Number),
          }),
        })
      );
    });

    it('should update lastChecked to current time', () => {
      mockStorageUtils.getObject.mockReturnValue(null);
      const beforeTime = Date.now();

      permissionStorage.set('ios_camera', RESULTS.GRANTED);

      const afterTime = Date.now();
      const callArgs = mockStorageUtils.setObject.mock.calls[0][1];
      const lastChecked = (callArgs as any).ios_camera.lastChecked;

      expect(lastChecked).toBeGreaterThanOrEqual(beforeTime);
      expect(lastChecked).toBeLessThanOrEqual(afterTime);
    });

    it('should handle all permission status values', () => {
      mockStorageUtils.getObject.mockReturnValue(null);

      const statuses: PermissionStatus[] = [
        RESULTS.UNAVAILABLE,
        RESULTS.DENIED,
        RESULTS.BLOCKED,
        RESULTS.GRANTED,
        RESULTS.LIMITED,
      ];

      statuses.forEach((status) => {
        jest.clearAllMocks();
        mockStorageUtils.getObject.mockReturnValue(null);

        permissionStorage.set('ios_camera', status);

        expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
          'permissions_cache',
          expect.objectContaining({
            ios_camera: expect.objectContaining({ status }),
          })
        );
      });
    });

    it('should not affect other cached permissions', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
        ios_photoLibrary: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: true,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.set('android_camera', RESULTS.BLOCKED);

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: existing.ios_camera,
          ios_photoLibrary: existing.ios_photoLibrary,
          android_camera: expect.any(Object),
        })
      );
    });

    it('should merge additional metadata with existing data', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now() - 100000,
          requestCount: 2,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.set('ios_camera', RESULTS.GRANTED, {
        requestCount: 3,
        rationaleShown: true,
        lastRequestedAt: Date.now(),
      });

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            status: RESULTS.GRANTED,
            requestCount: 3,
            rationaleShown: true,
            lastRequestedAt: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('incrementRequestCount', () => {
    it('should increment request count for existing cache', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.incrementRequestCount('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            requestCount: 3,
          }),
        })
      );
    });

    it('should do nothing when key does not exist', () => {
      mockStorageUtils.getObject.mockReturnValue({
        ios_photoLibrary: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      });

      permissionStorage.incrementRequestCount('ios_camera');

      expect(mockStorageUtils.setObject).not.toHaveBeenCalled();
    });

    it('should update lastRequestedAt timestamp', () => {
      const beforeTime = Date.now();
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.incrementRequestCount('ios_camera');

      const afterTime = Date.now();
      const callArgs = mockStorageUtils.setObject.mock.calls[0][1];
      const lastRequestedAt = (callArgs as any).ios_camera.lastRequestedAt;

      expect(lastRequestedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(lastRequestedAt).toBeLessThanOrEqual(afterTime);
    });

    it('should handle multiple increments', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 0,
          rationaleShown: false,
        },
      };

      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.incrementRequestCount('ios_camera');
      existing.ios_camera.requestCount = 1;

      permissionStorage.incrementRequestCount('ios_camera');
      existing.ios_camera.requestCount = 2;

      permissionStorage.incrementRequestCount('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledTimes(3);
    });

    it('should preserve other properties when incrementing', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: true,
          lastRequestedAt: Date.now() - 60000,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.incrementRequestCount('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            status: RESULTS.DENIED,
            requestCount: 3,
            rationaleShown: true,
          }),
        })
      );
    });

    it('should not affect other cache entries', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
        ios_photoLibrary: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: true,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.incrementRequestCount('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({ requestCount: 2 }),
          ios_photoLibrary: expect.objectContaining({ requestCount: 2 }),
        })
      );
    });
  });

  describe('markRationaleShown', () => {
    it('should mark rationale as shown for existing cache', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.markRationaleShown('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            rationaleShown: true,
          }),
        })
      );
    });

    it('should do nothing when key does not exist', () => {
      mockStorageUtils.getObject.mockReturnValue({
        ios_photoLibrary: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      });

      permissionStorage.markRationaleShown('ios_camera');

      expect(mockStorageUtils.setObject).not.toHaveBeenCalled();
    });

    it('should preserve other properties when marking rationale shown', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 3,
          rationaleShown: false,
          lastRequestedAt: Date.now() - 60000,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.markRationaleShown('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({
            status: RESULTS.DENIED,
            requestCount: 3,
            rationaleShown: true,
            lastRequestedAt: existing.ios_camera.lastRequestedAt,
          }),
        })
      );
    });

    it('should not affect other cache entries', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
        ios_photoLibrary: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: true,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.markRationaleShown('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          ios_camera: expect.objectContaining({ rationaleShown: true }),
          ios_photoLibrary: expect.objectContaining({
            rationaleShown: true,
          }),
        })
      );
    });

    it('should handle marking rationale shown multiple times', () => {
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.markRationaleShown('ios_camera');
      permissionStorage.markRationaleShown('ios_camera');

      // Both calls should update, even if already true
      expect(mockStorageUtils.setObject).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearAll', () => {
    it('should delete the entire permissions cache', () => {
      permissionStorage.clearAll();

      expect(mockStorageUtils.delete).toHaveBeenCalledWith(
        'permissions_cache'
      );
    });

    it('should use correct cache key for deletion', () => {
      permissionStorage.clearAll();

      expect(mockStorageUtils.delete).toHaveBeenCalledWith(
        'permissions_cache'
      );
    });

    it('should not call other storage methods', () => {
      permissionStorage.clearAll();

      expect(mockStorageUtils.getObject).not.toHaveBeenCalled();
      expect(mockStorageUtils.setObject).not.toHaveBeenCalled();
    });

    it('should handle multiple clear calls', () => {
      permissionStorage.clearAll();
      permissionStorage.clearAll();

      expect(mockStorageUtils.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete permission lifecycle', () => {
      // Initial state - no cache
      mockStorageUtils.getObject.mockReturnValue(null);
      expect(permissionStorage.get('ios_camera')).toBeNull();

      // Set initial permission
      permissionStorage.set('ios_camera', RESULTS.DENIED);

      // Update with additional data
      const existing = {
        ios_camera: {
          status: RESULTS.DENIED as PermissionStatus,
          lastChecked: Date.now(),
          requestCount: 0,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(existing);

      permissionStorage.incrementRequestCount('ios_camera');
      permissionStorage.markRationaleShown('ios_camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple permission types concurrently', () => {
      mockStorageUtils.getObject.mockReturnValue(null);

      permissionStorage.set('ios_camera', RESULTS.GRANTED);
      permissionStorage.set('ios_photoLibrary', RESULTS.DENIED);
      permissionStorage.set('android_camera', RESULTS.BLOCKED);

      expect(mockStorageUtils.setObject).toHaveBeenCalledTimes(3);
    });

    it('should handle TTL expiration with get after set', () => {
      const now = Date.now();
      const ttlMs = 5 * 60 * 1000;

      // Set cache
      mockStorageUtils.getObject.mockReturnValue(null);
      permissionStorage.set('ios_camera', RESULTS.GRANTED);

      // Immediately get (should be valid)
      const cachedData = {
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: now,
          requestCount: 0,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(cachedData);
      let result = permissionStorage.get('ios_camera');
      expect(result).not.toBeNull();

      // Simulate expiration
      const expiredData = {
        ios_camera: {
          status: RESULTS.GRANTED as PermissionStatus,
          lastChecked: now - ttlMs - 1000, // Just past TTL
          requestCount: 0,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(expiredData);
      result = permissionStorage.get('ios_camera');
      expect(result).toBeNull();
    });
  });
});
