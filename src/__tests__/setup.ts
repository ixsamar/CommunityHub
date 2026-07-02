/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any, react/display-name */
/**
 * Global Jest test setup — mocks for native modules that aren't available
 * in a Node.js test environment.
 */

// ── react-native-mmkv ────────────────────────────────────────────────────────
jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      getString: jest.fn((key: string) => store[key] ?? null),
      delete: jest.fn((key: string) => {
        delete store[key];
      }),
      getAllKeys: jest.fn(() => Object.keys(store)),
      clearAll: jest.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
      }),
      contains: jest.fn((key: string) => key in store),
    })),
  };
});

// ── @react-native-community/netinfo ──────────────────────────────────────────
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({isConnected: true, isInternetReachable: true}),
    addEventListener: jest.fn(() => jest.fn()), // returns unsubscribe
  },
}));

// ── react-native-reanimated ──────────────────────────────────────────────────
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return (props: any) => React.createElement(Text, props, props.name);
});

// ── @shopify/flash-list ──────────────────────────────────────────────────────
jest.mock('@shopify/flash-list', () => {
  const {FlatList} = require('react-native');
  return {FlashList: FlatList};
});

// ── react-native-responsive-screen ───────────────────────────────────────────
jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: (percent: string) => parseFloat(percent) * 3.75,
  heightPercentageToDP: (percent: string) => parseFloat(percent) * 8.12,
}));

// ── react-native-safe-area-context ────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({children}: {children: React.ReactNode}) => children,
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

// ── react-native-screens ─────────────────────────────────────────────────────
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));
