import { StateStorage } from 'zustand/middleware';
import { storage } from './storage';

/**
 * Zustand storage adapter using MMKV
 * This adapter allows Zustand stores to persist state using MMKV
 */
export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getItem(name);
    return value;
  },
  setItem: (name: string, value: string): void => {
    storage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    storage.removeItem(name);
  },
};
