import { Platform } from 'react-native';
import { check, request, openSettings, RESULTS } from 'react-native-permissions';
import { getPermission } from './platform';
import { permissionStorage } from './storage';
import type { PermissionType, PermissionStatus } from './types';

export class PermissionManager {
  static async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    const permission = getPermission(type);
    const cacheKey = `${Platform.OS}_${type}`;

    const cached = permissionStorage.get(cacheKey);
    const actualStatus = await check(permission);

    permissionStorage.set(cacheKey, actualStatus);

    if (Platform.OS === 'android' && cached?.status === RESULTS.BLOCKED) {
      return RESULTS.BLOCKED;
    }

    return actualStatus;
  }

  static async requestPermission(
    type: PermissionType,
    rationale?: { title: string; message: string; buttonPositive: string }
  ): Promise<PermissionStatus> {
    const permission = getPermission(type);
    const cacheKey = `${Platform.OS}_${type}`;

    const cached = permissionStorage.get(cacheKey);
    if (cached) {
      permissionStorage.incrementRequestCount(cacheKey);
    }

    const result = await request(permission, rationale);

    permissionStorage.set(cacheKey, result, {
      lastRequestedAt: Date.now(),
      requestCount: (cached?.requestCount ?? 0) + 1,
    });

    return result;
  }

  static shouldShowRationale(type: PermissionType, currentStatus: PermissionStatus): boolean {
    const cacheKey = `${Platform.OS}_${type}`;
    const cached = permissionStorage.get(cacheKey);

    return (
      currentStatus === RESULTS.DENIED &&
      cached !== null &&
      cached.requestCount > 0 &&
      !cached.rationaleShown
    );
  }

  static markRationaleShown(type: PermissionType): void {
    const cacheKey = `${Platform.OS}_${type}`;
    permissionStorage.markRationaleShown(cacheKey);
  }

  static async openAppSettings(): Promise<void> {
    await openSettings();
  }

  static isGranted(status: PermissionStatus): boolean {
    return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
  }

  static isBlocked(status: PermissionStatus): boolean {
    return status === RESULTS.BLOCKED;
  }

  static isDenied(status: PermissionStatus): boolean {
    return status === RESULTS.DENIED;
  }

  static async detectAutoRevocation(type: PermissionType): Promise<boolean> {
    const cacheKey = `${Platform.OS}_${type}`;
    const cached = permissionStorage.get(cacheKey);

    if (!cached || cached.status !== RESULTS.GRANTED) {
      return false;
    }

    const current = await this.checkPermission(type);

    return cached.status === RESULTS.GRANTED && (current === RESULTS.DENIED || current === RESULTS.BLOCKED);
  }
}
