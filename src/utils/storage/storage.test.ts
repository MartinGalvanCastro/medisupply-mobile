// Mock react-native-mmkv BEFORE import
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map<string, string | number | boolean>();

  return {
    createMMKV: () => ({
      set: (key: string, value: string | number | boolean) => {
        mockStorage.set(key, value);
      },
      getString: (key: string) => {
        const value = mockStorage.get(key);
        return typeof value === 'string' ? value : undefined;
      },
      getNumber: (key: string) => {
        const value = mockStorage.get(key);
        return typeof value === 'number' ? value : undefined;
      },
      getBoolean: (key: string) => {
        const value = mockStorage.get(key);
        return typeof value === 'boolean' ? value : undefined;
      },
      remove: (key: string) => {
        mockStorage.delete(key);
      },
      clearAll: () => {
        mockStorage.clear();
      },
      contains: (key: string) => {
        return mockStorage.has(key);
      },
      getAllKeys: () => {
        return Array.from(mockStorage.keys());
      },
    }),
  };
});

import { storage, storageUtils, mmkvStorage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('getItem', () => {
    it('should return null for non-existent key', () => {
      expect(storage.getItem('non-existent')).toBeNull();
    });

    it('should return value for existing key', () => {
      storage.setItem('test-key', 'test-value');
      expect(storage.getItem('test-key')).toBe('test-value');
    });
  });

  describe('setItem', () => {
    it('should store string value', () => {
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });

    it('should overwrite existing value', () => {
      storage.setItem('key', 'value1');
      storage.setItem('key', 'value2');
      expect(storage.getItem('key')).toBe('value2');
    });
  });

  describe('removeItem', () => {
    it('should remove existing item', () => {
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
    });

    it('should not throw when removing non-existent item', () => {
      expect(() => storage.removeItem('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });
  });

  describe('getAllKeys', () => {
    it('should return all stored keys', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      const keys = storage.getAllKeys?.();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });
});

describe('storageUtils', () => {
  beforeEach(() => {
    storageUtils.clearAll();
  });

  describe('string operations', () => {
    it('should store and retrieve string', () => {
      storageUtils.setString('key', 'value');
      expect(storageUtils.getString('key')).toBe('value');
    });
  });

  describe('number operations', () => {
    it('should store and retrieve number', () => {
      storageUtils.setNumber('key', 42);
      expect(storageUtils.getNumber('key')).toBe(42);
    });
  });

  describe('boolean operations', () => {
    it('should store and retrieve boolean', () => {
      storageUtils.setBoolean('key', true);
      expect(storageUtils.getBoolean('key')).toBe(true);
    });
  });

  describe('object operations', () => {
    it('should store and retrieve object', () => {
      const obj = { name: 'test', value: 123 };
      storageUtils.setObject('key', obj);
      expect(storageUtils.getObject('key')).toEqual(obj);
    });

    it('should return null for non-existent object', () => {
      expect(storageUtils.getObject('non-existent')).toBeNull();
    });

    it('should handle complex nested objects', () => {
      const complex = {
        user: { id: 1, name: 'John' },
        items: [1, 2, 3],
      };
      storageUtils.setObject('complex', complex);
      expect(storageUtils.getObject('complex')).toEqual(complex);
    });

    it('should return null for invalid JSON', () => {
      storage.setItem('invalid', 'not-valid-json{');
      expect(storageUtils.getObject('invalid')).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete key', () => {
      storageUtils.setString('key', 'value');
      storageUtils.delete('key');
      expect(storageUtils.getString('key')).toBeUndefined();
    });
  });

  describe('contains', () => {
    it('should return true for existing key', () => {
      storageUtils.setString('key', 'value');
      expect(storageUtils.contains('key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(storageUtils.contains('non-existent')).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys', () => {
      storageUtils.setString('key1', 'value1');
      storageUtils.setNumber('key2', 42);
      const keys = storageUtils.getAllKeys();
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('clearAll', () => {
    it('should clear all storage', () => {
      storageUtils.setString('key1', 'value1');
      storageUtils.setNumber('key2', 42);
      storageUtils.clearAll();
      expect(storageUtils.getString('key1')).toBeUndefined();
      expect(storageUtils.getNumber('key2')).toBeUndefined();
    });
  });
});
