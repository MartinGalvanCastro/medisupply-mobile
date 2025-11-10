import { Platform } from 'react-native';
import { PERMISSIONS, Permission } from 'react-native-permissions';
import type { PermissionType } from './types';

const getAndroidSDK = (): number => {
  if (Platform.OS !== 'android') return 0;
  return Platform.Version as number;
};

export const getPermission = (type: PermissionType): Permission => {
  switch (type) {
    case 'camera':
      return Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      })!;

    case 'photoLibrary':
      return Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android:
          getAndroidSDK() >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      })!;

    case 'mediaLibrary':
      return Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android:
          getAndroidSDK() >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      })!;

    default:
      throw new Error(`Unknown permission type: ${type}`);
  }
};

export const isAndroid13Plus = (): boolean => {
  return Platform.OS === 'android' && getAndroidSDK() >= 33;
};
