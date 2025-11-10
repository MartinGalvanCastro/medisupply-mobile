import { renderHook, waitFor, act } from '@testing-library/react-native';
import { RESULTS } from 'react-native-permissions';
import { usePermission } from './usePermission';
import { PermissionManager } from '@/utils/permissions/manager';

// Mock PermissionManager
jest.mock('@/utils/permissions/manager', () => ({
  PermissionManager: {
    checkPermission: jest.fn(),
    requestPermission: jest.fn(),
    openAppSettings: jest.fn(),
    isGranted: jest.fn(),
    isBlocked: jest.fn(),
    isDenied: jest.fn(),
  },
}));

describe('usePermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial check', () => {
    it('should check permission status on mount', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(false);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('camera'));

      expect(result.current.isLoading).toBe(true);
      expect(PermissionManager.checkPermission).toHaveBeenCalledWith('camera');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(result.current.isGranted).toBe(true);
    });

    it('should set status to DENIED initially', () => {
      (PermissionManager.checkPermission as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => usePermission('camera'));

      expect(result.current.status).toBe(RESULTS.DENIED);
      expect(result.current.isLoading).toBe(true);
    });

  });

  describe('request', () => {
    it('should request permission and update status', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(false);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBe(RESULTS.DENIED);
      expect(result.current.isRequesting).toBe(false);

      let requestResult: string | undefined;
      await act(async () => {
        requestResult = await result.current.request();
      });

      expect(PermissionManager.requestPermission).toHaveBeenCalledWith('camera', undefined);
      expect(requestResult).toBe(RESULTS.GRANTED);
      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(result.current.isRequesting).toBe(false);
    });

    it('should pass rationale to request permission', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const rationale = {
        title: 'Camera Permission',
        message: 'We need camera access',
        buttonPositive: 'OK',
      };

      await act(async () => {
        await result.current.request(rationale);
      });

      expect(PermissionManager.requestPermission).toHaveBeenCalledWith('camera', rationale);
    });

    it('should set isRequesting during request', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.requestPermission as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(RESULTS.GRANTED), 100))
      );

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isRequesting).toBe(false);

      act(() => {
        result.current.request();
      });

      expect(result.current.isRequesting).toBe(true);

      await waitFor(() => {
        expect(result.current.isRequesting).toBe(false);
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
    });

  });

  describe('openSettings', () => {
    it('should open settings and recheck status after delay', async () => {
      (PermissionManager.checkPermission as jest.Mock)
        .mockResolvedValueOnce(RESULTS.DENIED)
        .mockResolvedValueOnce(RESULTS.GRANTED);
      (PermissionManager.openAppSettings as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBe(RESULTS.DENIED);

      await act(async () => {
        await result.current.openSettings();
      });

      expect(PermissionManager.openAppSettings).toHaveBeenCalled();

      // Fast-forward the 1 second delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(RESULTS.GRANTED);
      });

      expect(PermissionManager.checkPermission).toHaveBeenCalledTimes(2);
    });

  });

  describe('checkStatus', () => {
    it('should manually check status when called', async () => {
      (PermissionManager.checkPermission as jest.Mock)
        .mockResolvedValueOnce(RESULTS.DENIED)
        .mockResolvedValueOnce(RESULTS.GRANTED);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBe(RESULTS.DENIED);

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(PermissionManager.checkPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('status helpers', () => {
    it('should compute isGranted correctly', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(false);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.isBlocked).toBe(false);
      expect(result.current.isDenied).toBe(false);
    });

    it('should compute isBlocked correctly', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(true);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(false);
      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isDenied).toBe(false);
    });

    it('should compute isDenied correctly', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(false);
      (PermissionManager.isBlocked as jest.Mock).mockReturnValue(false);
      (PermissionManager.isDenied as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('camera'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(false);
      expect(result.current.isBlocked).toBe(false);
      expect(result.current.isDenied).toBe(true);
    });
  });

  describe('different permission types', () => {
    it('should work with photoLibrary permission', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('photoLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(PermissionManager.checkPermission).toHaveBeenCalledWith('photoLibrary');
      expect(result.current.status).toBe(RESULTS.GRANTED);
    });

    it('should work with mediaLibrary permission', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.LIMITED);
      (PermissionManager.isGranted as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => usePermission('mediaLibrary'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(PermissionManager.checkPermission).toHaveBeenCalledWith('mediaLibrary');
      expect(result.current.status).toBe(RESULTS.LIMITED);
    });
  });

  describe('hook re-rendering', () => {
    it('should recheck permission when type changes', async () => {
      (PermissionManager.checkPermission as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const { result, rerender } = renderHook(
        ({ type }) => usePermission(type),
        { initialProps: { type: 'camera' as const } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(PermissionManager.checkPermission).toHaveBeenCalledWith('camera');
      expect(PermissionManager.checkPermission).toHaveBeenCalledTimes(1);

      rerender({ type: 'photoLibrary' });

      await waitFor(() => {
        expect(PermissionManager.checkPermission).toHaveBeenCalledWith('photoLibrary');
      });

      expect(PermissionManager.checkPermission).toHaveBeenCalledTimes(2);
    });
  });
});
