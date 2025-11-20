// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map();
  return {
    createMMKV: () => ({
      set: (key, value) => {
        mockStorage.set(key, value);
      },
      getString: (key) => {
        const value = mockStorage.get(key);
        return typeof value === 'string' ? value : undefined;
      },
      getNumber: (key) => {
        const value = mockStorage.get(key);
        return typeof value === 'number' ? value : undefined;
      },
      getBoolean: (key) => {
        const value = mockStorage.get(key);
        return typeof value === 'boolean' ? value : undefined;
      },
      remove: (key) => {
        mockStorage.delete(key);
      },
      clearAll: () => {
        mockStorage.clear();
      },
      contains: (key) => {
        return mockStorage.has(key);
      },
      getAllKeys: () => {
        return Array.from(mockStorage.keys());
      },
    }),
  };
});

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
      READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    GRANTED: 'granted',
    LIMITED: 'limited',
  },
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  openSettings: jest.fn(async () => {}),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => children,
}));

// Setup testing library
require('@testing-library/react-native/dont-cleanup-after-each');
