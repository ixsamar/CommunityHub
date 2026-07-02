/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  // setupFiles: run before test framework installs (no expect/beforeAll globals)
  setupFiles: ['./src/Utils/__tests__/setup.ts'],
  // setupFilesAfterEnv: run after test framework — beforeAll/afterAll available
  setupFilesAfterEnv: ['./src/Utils/__tests__/setupFramework.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-vector-icons|@shopify/flash-list|react-native-mmkv|react-native-responsive-screen|@reduxjs/toolkit|redux|react-redux|react-native-svg)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/Utils/__mocks__/fileMock.js',
  },
  testRegex: '(/__tests__/.*\\.)(test|spec)\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/Utils/__tests__/setup\\.ts$',
    'src/Utils/__tests__/setupFramework\\.ts$',
    'src/Utils/__mocks__/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
};
