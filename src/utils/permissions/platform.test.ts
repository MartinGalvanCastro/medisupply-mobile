import { Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import { getPermission, isAndroid13Plus } from './platform';

describe('platform utilities', () => {
  // Get the current platform to adjust tests accordingly
  const currentOS = Platform.OS;
  const currentVersion = Platform.Version;

  describe('getPermission', () => {
    describe('iOS permissions', () => {
      it('should return iOS CAMERA permission for camera type on iOS', () => {
        if (currentOS === 'ios') {
          const permission = getPermission('camera');
          expect(permission).toBe(PERMISSIONS.IOS.CAMERA);
        } else {
          // On Android in test environment, just verify it doesn't throw
          expect(() => getPermission('camera')).not.toThrow();
        }
      });

      it('should return iOS PHOTO_LIBRARY permission for photoLibrary type on iOS', () => {
        if (currentOS === 'ios') {
          const permission = getPermission('photoLibrary');
          expect(permission).toBe(PERMISSIONS.IOS.PHOTO_LIBRARY);
        }
      });

      it('should return iOS PHOTO_LIBRARY permission for mediaLibrary type on iOS', () => {
        if (currentOS === 'ios') {
          const permission = getPermission('mediaLibrary');
          expect(permission).toBe(PERMISSIONS.IOS.PHOTO_LIBRARY);
        }
      });
    });

    describe('Android permissions', () => {
      it('should support camera permission', () => {
        // Verify the permission type is handled
        expect(() => getPermission('camera')).not.toThrow();
      });

      it('should support photoLibrary permission', () => {
        // Verify the permission type is handled
        expect(() => getPermission('photoLibrary')).not.toThrow();
      });

      it('should support mediaLibrary permission', () => {
        // Verify the permission type is handled
        expect(() => getPermission('mediaLibrary')).not.toThrow();
      });
    });

    describe('Error handling', () => {
      it('should throw error for unknown permission type', () => {
        expect(() => {
          getPermission('unknownPermission' as any);
        }).toThrow('Unknown permission type: unknownPermission');
      });

      it('should throw error with correct message for invalid type', () => {
        expect(() => {
          getPermission('microphone' as any);
        }).toThrow(new Error('Unknown permission type: microphone'));
      });

      it('should throw error for null-like permission types', () => {
        expect(() => {
          getPermission('' as any);
        }).toThrow('Unknown permission type:');
      });

      it('should throw error consistently for same invalid type', () => {
        const invalidType = 'location' as any;
        expect(() => {
          getPermission(invalidType);
        }).toThrow('Unknown permission type: location');

        expect(() => {
          getPermission(invalidType);
        }).toThrow('Unknown permission type: location');
      });
    });

    describe('Cross-platform consistency', () => {
      it('should handle rapid permission type changes', () => {
        // Just verify these don't throw
        expect(() => getPermission('camera')).not.toThrow();
        expect(() => getPermission('photoLibrary')).not.toThrow();
        expect(() => getPermission('mediaLibrary')).not.toThrow();
      });
    });

    describe('Permission value validation', () => {
      it('should return defined permission values', () => {
        const camera = getPermission('camera');
        const photoLibrary = getPermission('photoLibrary');

        expect(camera).toBeDefined();
        expect(photoLibrary).toBeDefined();
        expect(typeof camera).toBe('string');
        expect(typeof photoLibrary).toBe('string');
      });

      it('should return consistent values for same input', () => {
        const permission1 = getPermission('camera');
        const permission2 = getPermission('camera');

        expect(permission1).toBe(permission2);
      });

      it('should return different values for different permission types', () => {
        const camera = getPermission('camera');
        const photoLibrary = getPermission('photoLibrary');

        expect(camera).not.toBe(photoLibrary);
      });
    });
  });

  describe('isAndroid13Plus', () => {
    it('should return boolean value', () => {
      const result = isAndroid13Plus();
      expect(typeof result).toBe('boolean');
    });

    it('should return false on iOS', () => {
      if (currentOS === 'ios') {
        expect(isAndroid13Plus()).toBe(false);
      }
    });

    it('should be consistent across multiple calls', () => {
      const result1 = isAndroid13Plus();
      const result2 = isAndroid13Plus();
      const result3 = isAndroid13Plus();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should only return true if on Android', () => {
      const result = isAndroid13Plus();
      if (currentOS !== 'android') {
        expect(result).toBe(false);
      }
    });

    it('should validate Android version logic', () => {
      if (currentOS === 'android') {
        // If we're on Android, the result depends on the SDK version
        const result = isAndroid13Plus();
        if (typeof currentVersion === 'number' && currentVersion >= 33) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete permission flow', () => {
      // Just verify these don't throw
      expect(() => getPermission('camera')).not.toThrow();
      expect(() => getPermission('photoLibrary')).not.toThrow();
      expect(() => getPermission('mediaLibrary')).not.toThrow();
    });

    it('should work with permission type variations', () => {
      const permissionTypes: Array<'camera' | 'photoLibrary' | 'mediaLibrary'> = [
        'camera',
        'photoLibrary',
        'mediaLibrary',
      ];

      permissionTypes.forEach((type) => {
        const permission = getPermission(type);
        expect(permission).toBeDefined();
        expect(typeof permission).toBe('string');
      });
    });

    it('should handle consistent permission values across calls', () => {
      const permission1a = getPermission('camera');
      const permission1b = getPermission('camera');

      const permission2a = getPermission('photoLibrary');
      const permission2b = getPermission('photoLibrary');

      expect(permission1a).toBe(permission1b);
      expect(permission2a).toBe(permission2b);
    });
  });

  describe('Permission type coverage', () => {
    it('should handle all valid permission types', () => {
      const validTypes: Array<'camera' | 'photoLibrary' | 'mediaLibrary'> = [
        'camera',
        'photoLibrary',
        'mediaLibrary',
      ];

      validTypes.forEach((type) => {
        expect(() => getPermission(type)).not.toThrow();
      });
    });

    it('should provide non-empty permission strings', () => {
      const permissionTypes: Array<'camera' | 'photoLibrary' | 'mediaLibrary'> = [
        'camera',
        'photoLibrary',
        'mediaLibrary',
      ];

      permissionTypes.forEach((type) => {
        const permission = getPermission(type);
        expect(permission.length).toBeGreaterThan(0);
        expect(permission).not.toBeFalsy();
      });
    });
  });

  describe('SDK version detection', () => {
    it('should provide isAndroid13Plus function that returns boolean', () => {
      const result = isAndroid13Plus();
      expect(typeof result).toBe('boolean');
    });

    it('should indicate correct platform detection', () => {
      const result = isAndroid13Plus();
      if (currentOS === 'ios') {
        // Should always return false on iOS
        expect(result).toBe(false);
      } else if (currentOS === 'android') {
        // Should return true/false based on SDK version
        expect(result).toBe(typeof currentVersion === 'number' && currentVersion >= 33);
      }
    });
  });
});
