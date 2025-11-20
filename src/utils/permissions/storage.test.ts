import { permissionStorage } from './storage';
import { storageUtils } from '@/utils/storage';
import { RESULTS } from 'react-native-permissions';

jest.mock('@/utils/storage', () => ({
  storageUtils: {
    getObject: jest.fn(),
    setObject: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('permissionStorage', () => {
  const mockStorageUtils = storageUtils as jest.Mocked<typeof storageUtils>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns empty object when no cache exists', () => {
      mockStorageUtils.getObject.mockReturnValue(null);
      const result = permissionStorage.getAll();
      expect(result).toEqual({});
    });

    it('returns permission metadata from storage', () => {
      const mockMetadata = {
        'android_camera': {
          status: RESULTS.GRANTED,
          lastChecked: Date.now(),
          requestCount: 1,
          rationaleShown: false,
        },
      };
      mockStorageUtils.getObject.mockReturnValue(mockMetadata);
      const result = permissionStorage.getAll();
      expect(result).toEqual(mockMetadata);
    });
  });

  describe('get', () => {
    it('returns null when key does not exist', () => {
      mockStorageUtils.getObject.mockReturnValue({});
      const result = permissionStorage.get('camera');
      expect(result).toBeNull();
    });

    it('returns null when cache is expired', () => {
      const expiredTime = Date.now() - 6 * 60 * 1000; // 6 minutes ago
      mockStorageUtils.getObject.mockReturnValue({
        camera: {
          status: RESULTS.GRANTED,
          lastChecked: expiredTime,
          requestCount: 0,
          rationaleShown: false,
        },
      });
      const result = permissionStorage.get('camera');
      expect(result).toBeNull();
    });

    it('returns cached permission within TTL', () => {
      const recentTime = Date.now() - 2 * 60 * 1000; // 2 minutes ago
      const cachedData = {
        status: RESULTS.GRANTED,
        lastChecked: recentTime,
        requestCount: 1,
        rationaleShown: true,
      };
      mockStorageUtils.getObject.mockReturnValue({
        camera: cachedData,
      });
      const result = permissionStorage.get('camera');
      expect(result).toEqual(cachedData);
    });
  });

  describe('set', () => {
    it('creates new permission entry', () => {
      mockStorageUtils.getObject.mockReturnValue({});
      permissionStorage.set('camera', RESULTS.GRANTED);

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          camera: expect.objectContaining({
            status: RESULTS.GRANTED,
            requestCount: 0,
            rationaleShown: false,
          }),
        })
      );
    });

    it('preserves requestCount and rationaleShown when updating', () => {
      mockStorageUtils.getObject.mockReturnValue({
        camera: {
          status: RESULTS.DENIED,
          lastChecked: Date.now(),
          requestCount: 2,
          rationaleShown: true,
        },
      });
      permissionStorage.set('camera', RESULTS.GRANTED);

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          camera: expect.objectContaining({
            status: RESULTS.GRANTED,
            requestCount: 2,
            rationaleShown: true,
          }),
        })
      );
    });

    it('merges additional data when setting', () => {
      mockStorageUtils.getObject.mockReturnValue({});
      const now = Date.now();
      permissionStorage.set('camera', RESULTS.GRANTED, {
        lastRequestedAt: now,
        requestCount: 1,
      });

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          camera: expect.objectContaining({
            status: RESULTS.GRANTED,
            lastRequestedAt: now,
            requestCount: 1,
          }),
        })
      );
    });
  });

  describe('incrementRequestCount', () => {
    it('increments request count for existing permission', () => {
      const now = Date.now();
      mockStorageUtils.getObject.mockReturnValue({
        camera: {
          status: RESULTS.DENIED,
          lastChecked: now,
          requestCount: 2,
          rationaleShown: false,
        },
      });

      permissionStorage.incrementRequestCount('camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          camera: expect.objectContaining({
            requestCount: 3,
            lastRequestedAt: expect.any(Number),
          }),
        })
      );
    });

    it('does nothing when permission does not exist', () => {
      mockStorageUtils.getObject.mockReturnValue({});
      permissionStorage.incrementRequestCount('camera');
      expect(mockStorageUtils.setObject).not.toHaveBeenCalled();
    });
  });

  describe('markRationaleShown', () => {
    it('marks rationale as shown for existing permission', () => {
      const now = Date.now();
      mockStorageUtils.getObject.mockReturnValue({
        camera: {
          status: RESULTS.DENIED,
          lastChecked: now,
          requestCount: 1,
          rationaleShown: false,
        },
      });

      permissionStorage.markRationaleShown('camera');

      expect(mockStorageUtils.setObject).toHaveBeenCalledWith(
        'permissions_cache',
        expect.objectContaining({
          camera: expect.objectContaining({
            rationaleShown: true,
          }),
        })
      );
    });

    it('does nothing when permission does not exist', () => {
      mockStorageUtils.getObject.mockReturnValue({});
      permissionStorage.markRationaleShown('camera');
      expect(mockStorageUtils.setObject).not.toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    it('deletes permission cache', () => {
      permissionStorage.clearAll();
      expect(mockStorageUtils.delete).toHaveBeenCalledWith('permissions_cache');
    });
  });
});
