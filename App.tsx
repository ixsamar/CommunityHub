import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { store } from './src/app/store';
import { useTheme } from './src/theme';
import { RootNavigator, linking } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/common/components/ErrorBoundary';
import { OfflineBanner } from './src/common/components/OfflineBanner';
import { useNetInfo } from './src/common/hooks/useNetInfo';
import { ToastProvider } from './src/common/components/ToastContext';
import { OfflineManager } from './src/common/services/offline/OfflineManager';

const InnerApp = () => {
  const currentTheme = useTheme();
  const isOffline = !useNetInfo();

  useEffect(() => {
    OfflineManager.initialize();
  }, []);

  const navTheme: Theme = {
    dark: currentTheme.dark,
    colors: {
      primary: currentTheme.colors.primary,
      background: currentTheme.colors.background,
      card: currentTheme.colors.card,
      text: currentTheme.colors.text,
      border: currentTheme.colors.border,
      notification: currentTheme.colors.secondary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <StatusBar
        barStyle={currentTheme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.colors.surface}
      />
      <OfflineBanner isOffline={isOffline} />
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <ToastProvider>
            <InnerApp />
          </ToastProvider>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}
