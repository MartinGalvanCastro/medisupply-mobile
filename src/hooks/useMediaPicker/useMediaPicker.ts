import { useState, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { PermissionManager } from '@/utils/permissions';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import type { MediaFile } from '@/hooks/useMediaFileManager';
import type { UseMediaPickerProps, UseMediaPickerReturn } from './types';

export const useMediaPicker = ({
  onFilesSelected,
  onError,
}: UseMediaPickerProps): UseMediaPickerReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const permissions = useMediaPermissions();

  const createMediaFile = useCallback(
    (asset: ImagePicker.ImagePickerAsset, type: 'photo' | 'video'): MediaFile => {
      const randomId = Crypto.randomUUID();
      return {
        id: `${Date.now()}_${randomId}`,
        uri: asset.uri,
        type,
        name: asset.fileName || `${type}_${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`,
      };
    },
    []
  );

  const launchCameraWithPermission = useCallback(async () => {
    try {
      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const newFile = createMediaFile(pickerResult.assets[0], 'photo');
        onFilesSelected([newFile]);
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
    }
  }, [createMediaFile, onFilesSelected, onError]);

  const takePhoto = useCallback(async () => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      // If already granted, proceed
      if (permissions.camera.isGranted) {
        await launchCameraWithPermission();
        return;
      }

      // If blocked, show settings dialog
      if (permissions.camera.isBlocked) {
        permissions.handleBlockedPermission('camera');
        return;
      }

      // Request permission
      const result = await permissions.requestCameraPermission();

      // If granted after request, proceed
      if (PermissionManager.isGranted(result)) {
        await launchCameraWithPermission();
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    permissions,
    launchCameraWithPermission,
  ]);

  const launchPhotoLibraryWithPermission = useCallback(async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const newFiles: MediaFile[] = pickerResult.assets.map((asset) =>
        createMediaFile(asset, 'photo')
      );
      onFilesSelected(newFiles);
    }
  }, [createMediaFile, onFilesSelected]);

  const uploadPhotos = useCallback(async () => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      // If already granted, proceed
      if (permissions.photoLibrary.isGranted) {
        await launchPhotoLibraryWithPermission();
        return;
      }

      // If blocked, show settings dialog
      if (permissions.photoLibrary.isBlocked) {
        permissions.handleBlockedPermission('photoLibrary');
        return;
      }

      // Request permission
      const result = await permissions.requestPhotoLibraryPermission();

      // If granted after request, proceed
      if (PermissionManager.isGranted(result)) {
        await launchPhotoLibraryWithPermission();
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    permissions,
    launchPhotoLibraryWithPermission,
  ]);

  const launchVideoLibraryWithPermission = useCallback(async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const newFiles: MediaFile[] = pickerResult.assets.map((asset) =>
        createMediaFile(asset, 'video')
      );
      onFilesSelected(newFiles);
    }
  }, [createMediaFile, onFilesSelected]);

  const uploadVideos = useCallback(async () => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      // If already granted, proceed
      if (permissions.mediaLibrary.isGranted) {
        await launchVideoLibraryWithPermission();
        return;
      }

      // If blocked, show settings dialog
      if (permissions.mediaLibrary.isBlocked) {
        permissions.handleBlockedPermission('mediaLibrary');
        return;
      }

      // Request permission
      const result = await permissions.requestMediaLibraryPermission();

      // If granted after request, proceed
      if (PermissionManager.isGranted(result)) {
        await launchVideoLibraryWithPermission();
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    permissions,
    launchVideoLibraryWithPermission,
  ]);

  return {
    takePhoto,
    uploadPhotos,
    uploadVideos,
    isProcessing,
  };
};
