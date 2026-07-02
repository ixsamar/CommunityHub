import React, {Component, ErrorInfo, ReactNode} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {storage} from '../storage/mmkv';
import {Logger} from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error, errorInfo: null};
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({errorInfo});
    Logger.error('Application crashed caught by ErrorBoundary', 'ErrorBoundary', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({hasError: false, error: null, errorInfo: null});
  };

  private handleClearStorage = () => {
    try {
      storage.clearAll();
      this.handleReset();
      Logger.info('Cleared application storage on crash reset trigger', 'ErrorBoundary');
    } catch (err) {
      Logger.error('Failed to clear storage during crash recovery', 'ErrorBoundary', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Icon name="bug-outline" size={64} color="#ef4444" style={styles.icon} />
            <Text style={styles.title}>Application Crash Detected</Text>
            <Text style={styles.subtitle}>
              An unexpected rendering issue has occurred. The error details have been logged.
            </Text>

            {/* Error Detail Scroll Area */}
            <View style={styles.errorLogBox}>
              <ScrollView style={styles.logScroll} showsVerticalScrollIndicator={true}>
                <Text style={styles.errorMsg}>
                  {this.state.error?.name}: {this.state.error?.message}
                </Text>
                {this.state.error?.stack && (
                  <Text style={styles.errorStack}>{this.state.error.stack}</Text>
                )}
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.errorStack}>
                    Component Stack: {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* Recovery Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.primaryBtn]}
                onPress={this.handleReset}
                activeOpacity={0.8}>
                <Icon name="refresh" size={16} color="#ffffff" style={styles.btnIcon} />
                <Text style={styles.buttonText}>Restart Screen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dangerBtn]}
                onPress={this.handleClearStorage}
                activeOpacity={0.8}>
                <Icon name="trash-outline" size={16} color="#ffffff" style={styles.btnIcon} />
                <Text style={styles.buttonText}>Reset & Clear Cache</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f14',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('6%'),
  },
  icon: {
    marginBottom: hp('1.5%'),
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: hp('2.5%'),
    textAlign: 'center',
    lineHeight: 20,
  },
  errorLogBox: {
    width: '100%',
    height: hp('22%'),
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: wp('3.5%'),
    marginBottom: hp('3%'),
    borderWidth: 1,
    borderColor: '#334155',
  },
  logScroll: {
    flex: 1,
  },
  errorMsg: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#f87171',
    fontWeight: '700',
    marginBottom: hp('1%'),
  },
  errorStack: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
    paddingVertical: hp('1.6%'),
    borderRadius: 10,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
  },
  dangerBtn: {
    backgroundColor: '#b91c1c',
  },
  btnIcon: {
    marginRight: wp('1.5%'),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
