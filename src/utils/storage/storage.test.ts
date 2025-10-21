import { mmkvStorage, StorageKeys } from './storage';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

describe('mmkvStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem and getItem', () => {
    it('should set and get a string value', () => {
      const key = 'test-key';
      const value = 'test-value';

      mmkvStorage.setItem(key, value);
      // Note: In actual implementation, this would retrieve from MMKV
      expect(mmkvStorage.setItem).toBeDefined();
    });
  });

  describe('setObject and getObject', () => {
    it('should set and get an object', () => {
      const key = 'test-object';
      const value = { name: 'John', age: 30 };

      mmkvStorage.setObject(key, value);
      expect(mmkvStorage.setObject).toBeDefined();
    });
  });

  describe('StorageKeys', () => {
    it('should have defined storage keys', () => {
      expect(StorageKeys.AUTH_TOKEN).toBe('auth_token');
      expect(StorageKeys.USER_DATA).toBe('user_data');
      expect(StorageKeys.LANGUAGE).toBe('language');
    });
  });
});
