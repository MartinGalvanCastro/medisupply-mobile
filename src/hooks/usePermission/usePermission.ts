import { useState, useEffect, useCallback } from 'react';
import { RESULTS } from 'react-native-permissions';
import { PermissionManager } from '@/utils/permissions/manager';
import type { PermissionType, PermissionStatus } from '@/utils/permissions/types';

export const usePermission = (type: PermissionType) => {
  const [status, setStatus] = useState<PermissionStatus>(RESULTS.DENIED);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await PermissionManager.checkPermission(type);
      setStatus(result);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const request = useCallback(
    async (rationale?: { title: string; message: string; buttonPositive: string }) => {
      setIsRequesting(true);
      try {
        const result = await PermissionManager.requestPermission(type, rationale);
        setStatus(result);
        return result;
      } finally {
        setIsRequesting(false);
      }
    },
    [type]
  );

  const openSettings = useCallback(async () => {
    await PermissionManager.openAppSettings();
    setTimeout(checkStatus, 1000);
  }, [checkStatus]);

  return {
    status,
    isLoading,
    isRequesting,
    isGranted: PermissionManager.isGranted(status),
    isBlocked: PermissionManager.isBlocked(status),
    isDenied: PermissionManager.isDenied(status),
    request,
    openSettings,
    checkStatus,
  };
};
