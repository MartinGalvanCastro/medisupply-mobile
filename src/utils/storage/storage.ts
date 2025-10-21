import { MMKV } from 'react-native-mmkv';

/**
 * MMKV Storage Instance
 * Fast, small, and efficient key-value storage for React Native
 *
 * ⚠️ IMPORTANT: Use with Zustand's `partialize` option
 * When using with Zustand stores, ALWAYS specify which fields to persist:
 *
 * @example
 * ```typescript
 * persist(
 *   (set) => ({ count: 0, tempData: null }),
 *   {
 *     storage: createJSONStorage(() => zustandStorage),
 *     partialize: (state) => ({ count: state.count }), // Only persist count
 *   }
 * )
 * ```
 */
export const storage = new MMKV({
  id: 'medisupply-storage',
  encryptionKey: 'your-encryption-key-here', // TODO: Use a secure key from env or keychain
});

/**
 * Storage utility functions
 *
 * Use these for direct key-value storage outside of Zustand stores.
 * For Zustand stores, use the `zustandStorage` adapter with `partialize`.
 */
export const mmkvStorage = {
  /**
   * Set a value in storage
   */
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },

  /**
   * Get a value from storage
   */
  getItem: (key: string): string | undefined => {
    return storage.getString(key);
  },

  /**
   * Remove a value from storage
   */
  removeItem: (key: string) => {
    storage.delete(key);
  },

  /**
   * Clear all storage
   */
  clearAll: () => {
    storage.clearAll();
  },

  /**
   * Check if a key exists
   */
  has: (key: string): boolean => {
    return storage.contains(key);
  },

  /**
   * Get all keys
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  /**
   * Set a JSON object (automatically stringified)
   */
  setObject: <T>(key: string, value: T) => {
    storage.set(key, JSON.stringify(value));
  },

  /**
   * Get a JSON object (automatically parsed)
   */
  getObject: <T>(key: string): T | undefined => {
    const value = storage.getString(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error parsing JSON for key "${key}":`, error);
      return undefined;
    }
  },

  /**
   * Set a boolean value
   */
  setBoolean: (key: string, value: boolean) => {
    storage.set(key, value);
  },

  /**
   * Get a boolean value
   */
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  /**
   * Set a number value
   */
  setNumber: (key: string, value: number) => {
    storage.set(key, value);
  },

  /**
   * Get a number value
   */
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },
};

/**
 * Storage keys used throughout the app
 */
export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC: 'last_sync',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
