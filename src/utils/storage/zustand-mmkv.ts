import { StateStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';

/**
 * MMKV Storage adapter for Zustand persist middleware
 *
 * This adapter allows Zustand stores to persist their state using MMKV
 *
 * @example
 * ```typescript
 * import { create } from 'zustand';
 * import { persist } from 'zustand/middleware';
 * import { zustandStorage } from '@/utils/storage';
 *
 * export const useMyStore = create(
 *   persist(
 *     (set) => ({
 *       count: 0,
 *       increment: () => set((state) => ({ count: state.count + 1 })),
 *     }),
 *     {
 *       name: 'my-store',
 *       storage: zustandStorage,
 *     }
 *   )
 * );
 * ```
 */
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return mmkvStorage.setItem(name, value);
  },
  getItem: (name) => {
    const value = mmkvStorage.getItem(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return mmkvStorage.removeItem(name);
  },
};
