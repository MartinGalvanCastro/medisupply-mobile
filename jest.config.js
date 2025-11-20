module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@gluestack-ui|@react-native|@react-native-community|react-native|@expo|expo|expo-crypto|expo-modules-core|@legendapp|react-native-reanimated|react-native-mmkv|react-native-nitro-modules|nativewind|react-native-css-interop)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/types.ts',
    '!src/types/**', // Exclude types folder
    '!src/api/**', // Exclude entire API folder (generated and manual code)
    '!src/api/generated/**', // Exclude generated API code
    '!src/components/ui/**',
    '!src/i18n/config/**', // i18n config has optional chaining in module initialization
    '!src/i18n/locales/**', // Exclude locale translation files
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/api/',
    '/src/api/generated/',
    '/src/types/',
    '/src/i18n/locales/',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
  ],
};
