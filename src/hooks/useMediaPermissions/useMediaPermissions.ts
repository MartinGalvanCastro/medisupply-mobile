import { useCallback } from 'react';
import { Alert } from 'react-native';
import { usePermission } from '@/hooks/usePermission';
import type { UseMediaPermissionsReturn, PermissionAlertConfig } from './types';

const PERMISSION_ALERTS: Record<'camera' | 'photoLibrary' | 'mediaLibrary', PermissionAlertConfig> = {
  camera: {
    title: 'Camera Permission Required',
    message: 'Camera access is blocked. Please enable it in Settings to take photos.',
  },
  photoLibrary: {
    title: 'Photo Library Permission Required',
    message: 'Photo library access is blocked. Please enable it in Settings to upload photos.',
  },
  mediaLibrary: {
    title: 'Media Library Permission Required',
    message: 'Media library access is blocked. Please enable it in Settings to upload videos.',
  },
};

export const useMediaPermissions = (): UseMediaPermissionsReturn => {
  const cameraPermission = usePermission('camera');
  const photoLibraryPermission = usePermission('photoLibrary');
  const mediaLibraryPermission = usePermission('mediaLibrary');

  const requestCameraPermission = useCallback(async () => {
    return await cameraPermission.request({
      title: 'Camera Permission',
      message: 'Allow MediSupply to access your camera to take photos of visit evidence.',
      buttonPositive: 'Allow',
    });
  }, [cameraPermission]);

  const requestPhotoLibraryPermission = useCallback(async () => {
    return await photoLibraryPermission.request({
      title: 'Photo Library Permission',
      message: 'Allow MediSupply to access your photo library to upload photos of visit evidence.',
      buttonPositive: 'Allow',
    });
  }, [photoLibraryPermission]);

  const requestMediaLibraryPermission = useCallback(async () => {
    return await mediaLibraryPermission.request({
      title: 'Media Library Permission',
      message: 'Allow MediSupply to access your media library to upload videos of visit evidence.',
      buttonPositive: 'Allow',
    });
  }, [mediaLibraryPermission]);

  const handleBlockedPermission = useCallback(
    (type: 'camera' | 'photoLibrary' | 'mediaLibrary') => {
      const config = PERMISSION_ALERTS[type];
      const permission =
        type === 'camera'
          ? cameraPermission
          : type === 'photoLibrary'
            ? photoLibraryPermission
            : mediaLibraryPermission;

      Alert.alert(config.title, config.message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => permission.openSettings(),
        },
      ]);
    },
    [cameraPermission, photoLibraryPermission, mediaLibraryPermission]
  );

  return {
    camera: {
      status: cameraPermission.status,
      isLoading: cameraPermission.isLoading,
      isRequesting: cameraPermission.isRequesting,
      isGranted: cameraPermission.isGranted,
      isBlocked: cameraPermission.isBlocked,
      isDenied: cameraPermission.isDenied,
    },
    photoLibrary: {
      status: photoLibraryPermission.status,
      isLoading: photoLibraryPermission.isLoading,
      isRequesting: photoLibraryPermission.isRequesting,
      isGranted: photoLibraryPermission.isGranted,
      isBlocked: photoLibraryPermission.isBlocked,
      isDenied: photoLibraryPermission.isDenied,
    },
    mediaLibrary: {
      status: mediaLibraryPermission.status,
      isLoading: mediaLibraryPermission.isLoading,
      isRequesting: mediaLibraryPermission.isRequesting,
      isGranted: mediaLibraryPermission.isGranted,
      isBlocked: mediaLibraryPermission.isBlocked,
      isDenied: mediaLibraryPermission.isDenied,
    },
    requestCameraPermission,
    requestPhotoLibraryPermission,
    requestMediaLibraryPermission,
    handleBlockedPermission,
  };
};
