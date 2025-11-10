import { storageUtils } from '@/utils/storage';
import type { PermissionCache, PermissionMetadata, PermissionStatus } from './types';

const PERMISSION_CACHE_KEY = 'permissions_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const permissionStorage = {
  getAll(): PermissionMetadata {
    return storageUtils.getObject<PermissionMetadata>(PERMISSION_CACHE_KEY) ?? {};
  },

  get(key: string): PermissionCache | null {
    const all = this.getAll();
    const cached = all[key];

    if (!cached) return null;

    const age = Date.now() - cached.lastChecked;
    if (age > CACHE_TTL) return null;

    return cached;
  },

  set(key: string, status: PermissionStatus, additionalData?: Partial<PermissionCache>): void {
    const all = this.getAll();
    const existing = all[key];

    all[key] = {
      status,
      lastChecked: Date.now(),
      requestCount: existing?.requestCount ?? 0,
      rationaleShown: existing?.rationaleShown ?? false,
      ...additionalData,
    };

    storageUtils.setObject(PERMISSION_CACHE_KEY, all);
  },

  incrementRequestCount(key: string): void {
    const all = this.getAll();
    const existing = all[key];

    if (existing) {
      existing.requestCount += 1;
      existing.lastRequestedAt = Date.now();
      storageUtils.setObject(PERMISSION_CACHE_KEY, all);
    }
  },

  markRationaleShown(key: string): void {
    const all = this.getAll();
    const existing = all[key];

    if (existing) {
      existing.rationaleShown = true;
      storageUtils.setObject(PERMISSION_CACHE_KEY, all);
    }
  },

  clearAll(): void {
    storageUtils.delete(PERMISSION_CACHE_KEY);
  },
};
