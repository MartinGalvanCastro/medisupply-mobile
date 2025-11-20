import { storage, storageUtils, mmkvStorage } from './storage';
import { zustandStorage } from './zustand-mmkv';

describe('zustandStorage adapter', () => {
  beforeEach(() => {
    mmkvStorage.clearAll();
  });

  describe('getItem', () => {
    it('returns null for non-existent key', () => {
      expect(zustandStorage.getItem('non-existent')).toBeNull();
    });

    it('returns stored string value', () => {
      mmkvStorage.set('zustand-key', 'zustand-value');
      expect(zustandStorage.getItem('zustand-key')).toBe('zustand-value');
    });

    it('returns JSON serialized state', () => {
      const stateJson = JSON.stringify({ count: 1, name: 'test' });
      mmkvStorage.set('store-state', stateJson);
      expect(zustandStorage.getItem('store-state')).toBe(stateJson);
    });
  });

  describe('setItem', () => {
    it('stores string value', () => {
      zustandStorage.setItem('zustand-key', 'zustand-value');
      expect(mmkvStorage.getString('zustand-key')).toBe('zustand-value');
    });

    it('stores JSON serialized state', () => {
      const stateJson = JSON.stringify({ count: 5, name: 'zustand' });
      zustandStorage.setItem('store-state', stateJson);
      expect(mmkvStorage.getString('store-state')).toBe(stateJson);
    });
  });

  describe('removeItem', () => {
    it('removes stored value', () => {
      mmkvStorage.set('zustand-key', 'zustand-value');
      zustandStorage.removeItem('zustand-key');
      expect(mmkvStorage.getString('zustand-key')).toBeUndefined();
    });

    it('removes state without error', () => {
      zustandStorage.setItem('store-state', JSON.stringify({ count: 10 }));
      expect(() => zustandStorage.removeItem('store-state')).not.toThrow();
      expect(mmkvStorage.getString('store-state')).toBeUndefined();
    });
  });
});

describe('storage adapter', () => {
  beforeEach(() => {
    mmkvStorage.clearAll();
  });

  describe('getItem', () => {
    it('returns null for non-existent key', () => {
      expect(storage.getItem('non-existent')).toBeNull();
    });

    it('returns stored string value', () => {
      mmkvStorage.set('test-key', 'test-value');
      expect(storage.getItem('test-key')).toBe('test-value');
    });
  });

  describe('setItem', () => {
    it('stores string value', () => {
      storage.setItem('key', 'value');
      expect(mmkvStorage.getString('key')).toBe('value');
    });
  });

  describe('removeItem', () => {
    it('removes stored value', () => {
      mmkvStorage.set('key', 'value');
      storage.removeItem('key');
      expect(mmkvStorage.getString('key')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('removes all stored values', () => {
      mmkvStorage.set('key1', 'value1');
      mmkvStorage.set('key2', 'value2');
      storage.clear();
      expect(mmkvStorage.getAllKeys()).toHaveLength(0);
    });
  });

  describe('getAllKeys', () => {
    it('returns all stored keys', () => {
      mmkvStorage.set('key1', 'value1');
      mmkvStorage.set('key2', 'value2');
      const keys = storage.getAllKeys!();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });
});

describe('storageUtils', () => {
  beforeEach(() => {
    mmkvStorage.clearAll();
  });

  describe('string operations', () => {
    it('sets and gets string', () => {
      storageUtils.setString('str-key', 'hello');
      expect(storageUtils.getString('str-key')).toBe('hello');
    });

    it('returns undefined for non-existent string', () => {
      expect(storageUtils.getString('non-existent')).toBeUndefined();
    });
  });

  describe('number operations', () => {
    it('sets and gets number', () => {
      storageUtils.setNumber('num-key', 42);
      expect(storageUtils.getNumber('num-key')).toBe(42);
    });

    it('returns undefined for non-existent number', () => {
      expect(storageUtils.getNumber('non-existent')).toBeUndefined();
    });
  });

  describe('boolean operations', () => {
    it('sets and gets boolean true', () => {
      storageUtils.setBoolean('bool-key', true);
      expect(storageUtils.getBoolean('bool-key')).toBe(true);
    });

    it('sets and gets boolean false', () => {
      storageUtils.setBoolean('bool-key', false);
      expect(storageUtils.getBoolean('bool-key')).toBe(false);
    });

    it('returns undefined for non-existent boolean', () => {
      expect(storageUtils.getBoolean('non-existent')).toBeUndefined();
    });
  });

  describe('object operations', () => {
    it('sets and gets object', () => {
      const obj = { name: 'test', value: 123 };
      storageUtils.setObject('obj-key', obj);
      expect(storageUtils.getObject('obj-key')).toEqual(obj);
    });

    it('returns null for non-existent object', () => {
      expect(storageUtils.getObject('non-existent')).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      mmkvStorage.set('invalid-json', 'not-json{');
      expect(storageUtils.getObject('invalid-json')).toBeNull();
    });
  });

  describe('delete', () => {
    it('removes value', () => {
      storageUtils.setString('key', 'value');
      storageUtils.delete('key');
      expect(storageUtils.getString('key')).toBeUndefined();
    });
  });

  describe('clearAll', () => {
    it('removes all values', () => {
      storageUtils.setString('key1', 'value1');
      storageUtils.setNumber('key2', 42);
      storageUtils.clearAll();
      expect(storageUtils.getAllKeys()).toHaveLength(0);
    });
  });

  describe('contains', () => {
    it('returns true for existing key', () => {
      storageUtils.setString('key', 'value');
      expect(storageUtils.contains('key')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      expect(storageUtils.contains('non-existent')).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('returns empty array when no keys', () => {
      expect(storageUtils.getAllKeys()).toEqual([]);
    });

    it('returns all keys', () => {
      storageUtils.setString('a', '1');
      storageUtils.setString('b', '2');
      const keys = storageUtils.getAllKeys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });
  });
});
