import type { PermissionStatus } from '@/utils/permissions';

export interface PermissionState {
  status: PermissionStatus;
  isLoading: boolean;
  isRequesting: boolean;
  isGranted: boolean;
  isBlocked: boolean;
  isDenied: boolean;
}

export interface UseMediaPermissionsReturn {
  camera: PermissionState;
  photoLibrary: PermissionState;
  mediaLibrary: PermissionState;
  requestCameraPermission: () => Promise<PermissionStatus>;
  requestPhotoLibraryPermission: () => Promise<PermissionStatus>;
  requestMediaLibraryPermission: () => Promise<PermissionStatus>;
  handleBlockedPermission: (type: 'camera' | 'photoLibrary' | 'mediaLibrary') => void;
}

export interface PermissionAlertConfig {
  title: string;
  message: string;
}
