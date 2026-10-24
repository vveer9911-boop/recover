import React from 'react';
import { View, StyleSheet } from 'react-native';
import App from '../App';

/**
 * Root Application Entry:
 * Recover - Mobile Focus Study Wallet
 */
export default function RootApp() {
  return (
    <View style={styles.container}>
      <App />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#028BFF',
  },
});
