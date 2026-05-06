import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../core/theme';

interface PermissionGateProps {
  title: string;
  message: string;
  onRequestPermission: () => void;
  children: React.ReactNode;
  isGranted: boolean;
}

/**
 * Wraps content that requires a permission.
 * Shows a prompt if the permission is not granted.
 */
export function PermissionGate({
  title,
  message,
  onRequestPermission,
  children,
  isGranted,
}: PermissionGateProps) {
  if (isGranted) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={styles.button}
        onPress={onRequestPermission}
        android_ripple={{ color: Colors.primaryDark }}>
        <Text style={styles.buttonText}>Grant Permission</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.heading,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
