import { createMMKV } from 'react-native-mmkv';
import type { StorageAdapter } from './types';

// Create MMKV instance
export const mmkvStorage = createMMKV({
  id: 'medisupply-storage',
  encryptionKey: 'your-encryption-key-here', // TODO: Use secure key from env
});

// Storage adapter compatible with Zustand and other libraries
export const storage: StorageAdapter = {
  getItem: (key: string) => {
    const value = mmkvStorage.getString(key);
    return value ?? null;
  },

  setItem: (key: string, value: string) => {
    mmkvStorage.set(key, value);
  },

  removeItem: (key: string) => {
    mmkvStorage.remove(key);
  },

  clear: () => {
    mmkvStorage.clearAll();
  },

  getAllKeys: () => {
    return mmkvStorage.getAllKeys();
  },
};

// Typed storage methods for common operations
export const storageUtils = {
  // String operations
  setString: (key: string, value: string) => mmkvStorage.set(key, value),
  getString: (key: string): string | undefined => mmkvStorage.getString(key),

  // Number operations
  setNumber: (key: string, value: number) => mmkvStorage.set(key, value),
  getNumber: (key: string): number | undefined => mmkvStorage.getNumber(key),

  // Boolean operations
  setBoolean: (key: string, value: boolean) => mmkvStorage.set(key, value),
  getBoolean: (key: string): boolean | undefined => mmkvStorage.getBoolean(key),

  // Object operations (JSON)
  setObject: <T>(key: string, value: T) => {
    mmkvStorage.set(key, JSON.stringify(value));
  },
  getObject: <T>(key: string): T | null => {
    const value = mmkvStorage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  // Delete
  delete: (key: string) => mmkvStorage.remove(key),

  // Clear all
  clearAll: () => mmkvStorage.clearAll(),

  // Check if key exists
  contains: (key: string): boolean => mmkvStorage.contains(key),

  // Get all keys
  getAllKeys: (): string[] => mmkvStorage.getAllKeys(),
};

export default storage;
