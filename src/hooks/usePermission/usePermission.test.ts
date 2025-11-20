import { renderHook, act, waitFor } from '@testing-library/react-native';
import { RESULTS } from 'react-native-permissions';
import { usePermission } from './usePermission';
import { PermissionManager } from '@/utils/permissions/manager';

jest.mock('@/utils/permissions/manager');

describe('usePermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Set default mocks
    (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    (PermissionManager.openAppSettings as jest.Mock).mockResolvedValue(undefined);
    (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);
    (PermissionManager.isBlocked as jest.Mock).mockReturnValue(false);
    (PermissionManager.isDenied as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Initial state and checkStatus', () => {
    it('should initialize with DENIED status and isLoading true', () => {
      const { result } = renderHook(() => usePermission('camera'));

      expect(result.current.status).toBe(RESULTS.DENIED);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isRequesting).toBe(false);
    });

    it('should call checkStatus on mount', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;

      renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(mockCheckPermission).toHaveBeenCalledWith('camera');
      });
    });

    it('should update status after checkStatus completes', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.GRANTED);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set isLoading to false after checkStatus completes', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle checkStatus when permission is blocked', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.BLOCKED);
      });
    });

    it('should handle checkStatus when permission is denied', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.DENIED);
      });
    });

    it('should handle checkStatus when permission is limited', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.LIMITED);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.LIMITED);
      });
    });

    it('should re-check permission when permission type changes', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;

      const { rerender } = renderHook((({ type }: any) => usePermission(type)) as any, {
        initialProps: { type: 'camera' as const },
      });

      await waitFor(() => {
        expect(mockCheckPermission).toHaveBeenCalledWith('camera');
      });

      mockCheckPermission.mockClear();

      rerender({ type: 'photoLibrary' as const });

      await waitFor(() => {
        expect(mockCheckPermission).toHaveBeenCalledWith('photoLibrary');
      });
    });

    it('should set isLoading to true during checkStatus', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(RESULTS.GRANTED), 100);
          })
      );

      const { result } = renderHook(() => usePermission('camera'));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('request method', () => {
    it('should call PermissionManager.requestPermission with correct type', async () => {
      const mockRequestPermission = PermissionManager.requestPermission as jest.Mock;
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockRequestPermission.mockClear();

      await act(async () => {
        await result.current.request();
      });

      expect(mockRequestPermission).toHaveBeenCalledWith('camera', undefined);
    });

    it('should pass rationale to requestPermission', async () => {
      const mockRequestPermission = PermissionManager.requestPermission as jest.Mock;
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockRequestPermission.mockClear();

      const rationale = { title: 'Camera Access', message: 'We need camera access', buttonPositive: 'Allow' };

      await act(async () => {
        await result.current.request(rationale);
      });

      expect(mockRequestPermission).toHaveBeenCalledWith('photoLibrary', rationale);
    });

    it('should update status after successful request', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
    });

    it('should return the result from requestPermission', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let requestResult;
      await act(async () => {
        requestResult = await result.current.request();
      });

      expect(requestResult).toBe(RESULTS.BLOCKED);
    });

    it('should set isRequesting to false after request completes', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.isRequesting).toBe(false);
    });

    it('should handle request rejection gracefully', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      const mockError = new Error('Request failed');
      (PermissionManager.requestPermission as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          return result.current.request();
        })
      ).rejects.toThrow('Request failed');

      expect(result.current.isRequesting).toBe(false);
    });

    it('should handle multiple consecutive requests', async () => {
      const mockRequestPermission = PermissionManager.requestPermission as jest.Mock;
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      mockRequestPermission.mockResolvedValueOnce(RESULTS.DENIED).mockResolvedValueOnce(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.status).toBe(RESULTS.DENIED);

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(mockRequestPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('openSettings method', () => {
    it('should call PermissionManager.openAppSettings', async () => {
      const mockOpenSettings = PermissionManager.openAppSettings as jest.Mock;
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockOpenSettings.mockClear();

      await act(async () => {
        await result.current.openSettings();
      });

      expect(mockOpenSettings).toHaveBeenCalled();
    });

    it('should call checkStatus after opening settings with delay', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;
      const mockOpenSettings = PermissionManager.openAppSettings as jest.Mock;
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      mockOpenSettings.mockResolvedValue(undefined);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockCheckPermission.mock.calls.length;

      await act(async () => {
        await result.current.openSettings();
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockCheckPermission.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('should delay checkStatus by 1000ms after opening settings', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;
      const mockOpenSettings = PermissionManager.openAppSettings as jest.Mock;
      mockOpenSettings.mockResolvedValue(undefined);

      let checkStatusCalled = false;
      mockCheckPermission.mockImplementation(() => {
        checkStatusCalled = true;
        return Promise.resolve(RESULTS.GRANTED);
      });

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCheckPermission.mockClear();
      checkStatusCalled = false;

      await act(async () => {
        await result.current.openSettings();
      });

      expect(checkStatusCalled).toBe(false);

      act(() => {
        jest.advanceTimersByTime(999);
      });

      expect(checkStatusCalled).toBe(false);

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(checkStatusCalled).toBe(true);
      });
    });

    it('should reflect updated permission status after openSettings', async () => {
      (PermissionManager.openAppSettings as jest.Mock).mockResolvedValue(undefined);
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;
      mockCheckPermission.mockResolvedValueOnce(RESULTS.BLOCKED).mockResolvedValueOnce(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.BLOCKED);
      });

      await act(async () => {
        await result.current.openSettings();
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.GRANTED);
      });
    });
  });

  describe('Status helper methods', () => {
    it('should return true for isGranted when status is GRANTED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isGranted).toBe(true);
      });
    });

    it('should return true for isGranted when status is LIMITED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.LIMITED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.isGranted).toBe(true);
      });
    });

    it('should return false for isGranted when status is DENIED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isGranted).toBe(false);
      });
    });

    it('should return false for isGranted when status is BLOCKED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.isGranted).toBe(false);
      });
    });

    it('should return true for isBlocked when status is BLOCKED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isBlocked).toBe(true);
      });
    });

    it('should return false for isBlocked when status is GRANTED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.isBlocked).toBe(false);
      });
    });

    it('should return true for isDenied when status is DENIED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isDenied).toBe(true);
      });
    });

    it('should return false for isDenied when status is BLOCKED', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.isDenied).toBe(false);
      });
    });
  });

  describe('checkStatus method', () => {
    it('should be callable manually', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCheckPermission.mockClear();

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(mockCheckPermission).toHaveBeenCalledWith('camera');
    });

    it('should update status when called manually', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;
      mockCheckPermission.mockResolvedValueOnce(RESULTS.DENIED).mockResolvedValueOnce(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.DENIED);
      });

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
    });

    it('should handle checkStatus error gracefully', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Now mock the error for the manual call
      (PermissionManager.checkPermission as jest.Mock).mockImplementation(() => {
        return Promise.reject(new Error('Check failed'));
      });

      await expect(
        act(async () => {
          return result.current.checkStatus();
        })
      ).rejects.toThrow('Check failed');

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle permission flow: denied -> request -> granted', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.DENIED);
      });

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(result.current.isGranted).toBe(true);
    });

    it('should handle permission flow: denied -> request -> denied -> openSettings -> granted', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;

      mockCheckPermission.mockResolvedValueOnce(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.openAppSettings as jest.Mock).mockResolvedValue(undefined);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.DENIED);
      });

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.status).toBe(RESULTS.DENIED);
      expect(result.current.isGranted).toBe(false);

      mockCheckPermission.mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);

      await act(async () => {
        await result.current.openSettings();
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.GRANTED);
        expect(result.current.isGranted).toBe(true);
      });
    });

    it('should maintain state consistency with permission type change', async () => {
      const mockCheckPermission = PermissionManager.checkPermission as jest.Mock;
      mockCheckPermission.mockResolvedValueOnce(RESULTS.GRANTED);

      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);

      const { rerender, result } = renderHook((({ type }: any) => usePermission(type)) as any, {
        initialProps: { type: 'camera' as const },
      });

      await waitFor(() => {
        expect((result.current as any).status).toBe(RESULTS.GRANTED);
        expect((result.current as any).isGranted).toBe(true);
      });

      mockCheckPermission.mockResolvedValueOnce(RESULTS.DENIED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);

      rerender({ type: 'photoLibrary' as const });

      await waitFor(() => {
        expect((result.current as any).status).toBe(RESULTS.DENIED);
        expect((result.current as any).isGranted).toBe(false);
      });
    });
  });
});
