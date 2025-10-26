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

// Setup testing library
require('@testing-library/react-native/dont-cleanup-after-each');
