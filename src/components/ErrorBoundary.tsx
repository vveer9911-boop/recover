import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  diagCode: string;
}

// Strip out potential tokens, secrets, or passwords from error message
function sanitizeErrorMessage(msg: string): string {
  if (!msg) return 'An unexpected application error occurred.';
  return msg
    .replace(/(?:key|token|secret|password|auth|bearer)=['"]?[^'"\s&]+['"]?/gi, '[PROTECTED]')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[FIREBASE_KEY]')
    .replace(/ghp_[0-9A-Za-z]{36}/g, '[GITHUB_TOKEN]');
}

export default class ErrorBoundary extends Component<Props, State> {
  private originalHandler: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      diagCode: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
    return {
      hasError: true,
      error,
      diagCode: `ERR-RN-${hash}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Keep internal stack trace in developer console only
    console.error('[RecoverErrorBoundary] Uncaught render exception:', error, errorInfo);
  }

  componentDidMount() {
    // Intercept unhandled JS errors in React Native
    const globalObj = globalThis as any;
    if (typeof globalObj.ErrorUtils !== 'undefined') {
      this.originalHandler = globalObj.ErrorUtils.getGlobalHandler();
      globalObj.ErrorUtils.setGlobalHandler((err: any, isFatal?: boolean) => {
        console.error('[RecoverErrorBoundary] Global JS Error:', err, 'isFatal:', isFatal);
        if (isFatal) {
          const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
          this.setState({
            hasError: true,
            error: err instanceof Error ? err : new Error(String(err)),
            diagCode: `ERR-FATAL-${hash}`,
          });
        } else if (this.originalHandler) {
          this.originalHandler(err, isFatal);
        }
      });
    }
  }

  componentWillUnmount() {
    const globalObj = globalThis as any;
    if (this.originalHandler && typeof globalObj.ErrorUtils !== 'undefined') {
      globalObj.ErrorUtils.setGlobalHandler(this.originalHandler);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      diagCode: '',
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      const safeMessage = sanitizeErrorMessage(this.state.error?.message || 'Application encountered an issue');

      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="warning-outline" size={36} color="#EF4444" />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              Recover intercepted an unhandled error to prevent the app from closing.
            </Text>

            <View style={styles.errorCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="bug-outline" size={16} color="#A1A1AA" />
                <Text style={styles.cardHeaderText}>Diagnostic Reference</Text>
              </View>
              <Text style={styles.diagCode}>{this.state.diagCode || 'ERR-RECOVER'}</Text>
              <Text style={styles.errorText} numberOfLines={4}>
                {safeMessage}
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={this.resetError}
              >
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 320,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diagCode: {
    fontSize: 14,
    fontFamily: fonts.mono || fonts.semibold,
    color: '#38BDF8',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#E4E4E7',
    lineHeight: 18,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
