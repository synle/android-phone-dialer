import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { DialPadGrid } from '../components/DialPadGrid';
import { useDialPadStore } from '../core/store';
import { Colors, Typography, Spacing, BorderRadius } from '../core/theme';
import { formatPhoneNumber, stripFormatting } from '../services/PhoneNumberFormatter';
import { NativeTelecom } from '../services/NativeTelecom';
import { requestPermission } from '../services/PermissionsService';
import type { DialPadKey } from '../core/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Dial pad screen with number display, keypad, call button, and backspace.
 *
 * Features:
 * - Animated call button
 * - Phone number formatting as you type
 * - Long-press '0' for '+'
 * - Long-press backspace to clear all
 * - Permission check before placing call
 */
export function DialPadScreen() {
  const { digits, appendDigit, deleteLastDigit, clearAll } = useDialPadStore();
  const callButtonScale = useSharedValue(1);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formattedNumber = formatPhoneNumber(digits);

  const handleDigitPress = useCallback(
    (digit: DialPadKey) => {
      appendDigit(digit);
    },
    [appendDigit],
  );

  const handleZeroLongPress = useCallback(() => {
    // Long press '0' inserts '+' at the beginning if not already there
    const store = useDialPadStore.getState();
    if (!store.digits.startsWith('+')) {
      useDialPadStore.getState().setDigits('+' + store.digits);
    }
  }, []);

  const handleBackspace = useCallback(() => {
    deleteLastDigit();
  }, [deleteLastDigit]);

  const handleBackspaceLongPress = useCallback(() => {
    clearAll();
  }, [clearAll]);

  const handleCall = useCallback(async () => {
    if (digits.length === 0) return;

    const rawNumber = stripFormatting(digits.startsWith('+') ? digits : formattedNumber);

    // Check permission first
    const hasPermission = await NativeTelecom.hasCallPhonePermission();
    if (!hasPermission) {
      const granted = await requestPermission('CALL_PHONE');
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'CALL_PHONE permission is needed to place calls.',
        );
        return;
      }
    }

    // Validate
    const isValid = await NativeTelecom.isValidPhoneNumber(rawNumber);
    if (!isValid) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }

    try {
      await NativeTelecom.placeCall(rawNumber);
    } catch (error: any) {
      Alert.alert('Call Failed', error?.message || 'Unable to place call.');
    }
  }, [digits, formattedNumber]);

  const callButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: callButtonScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Number Display */}
      <View style={styles.displayContainer}>
        <Text
          style={[
            styles.displayText,
            digits.length > 12 && styles.displayTextSmall,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {formattedNumber || '\u00A0'}
        </Text>
      </View>

      {/* Dial Pad */}
      <DialPadGrid onDigitPress={handleDigitPress} onZeroLongPress={handleZeroLongPress} />

      {/* Action Row: Call + Backspace */}
      <View style={styles.actionRow}>
        {/* Spacer for symmetry */}
        <View style={styles.actionSpacer} />

        {/* Call Button */}
        <AnimatedPressable
          style={[styles.callButton, callButtonAnimatedStyle]}
          onPress={handleCall}
          onPressIn={() => {
            callButtonScale.value = withTiming(0.92, { duration: 80 });
          }}
          onPressOut={() => {
            callButtonScale.value = withTiming(1, { duration: 120 });
          }}
          disabled={digits.length === 0}
          android_ripple={{ color: '#2E7D32', borderless: true, radius: 32 }}>
          <Text style={styles.callIcon}>{'\u260E'}</Text>
        </AnimatedPressable>

        {/* Backspace */}
        <View style={styles.actionSpacer}>
          {digits.length > 0 ? (
            <Pressable
              style={styles.backspaceButton}
              onPress={handleBackspace}
              onLongPress={handleBackspaceLongPress}
              delayLongPress={600}
              android_ripple={{ color: Colors.surfaceVariant, borderless: true, radius: 24 }}>
              <Text style={styles.backspaceIcon}>{'\u232B'}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'flex-end',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    minHeight: 80,
  },
  displayText: {
    ...Typography.dialpadNumber,
    textAlign: 'center',
  },
  displayTextSmall: {
    fontSize: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  actionSpacer: {
    flex: 1,
    alignItems: 'center',
  },
  callButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.callGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.callGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  callIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  backspaceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backspaceIcon: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
});
