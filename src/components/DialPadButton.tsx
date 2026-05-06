import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../core/theme';
import { DIAL_PAD_LETTERS, type DialPadKey } from '../core/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DialPadButtonProps {
  digit: DialPadKey;
  onPress: (digit: DialPadKey) => void;
  onLongPress?: (digit: DialPadKey) => void;
}

/**
 * Individual dial pad key with press animation.
 *
 * Uses Reanimated for smooth 60fps scale animation on press.
 * Long-press on '0' typically inserts '+' (handled by parent).
 */
export const DialPadButton = React.memo(function DialPadButton({
  digit,
  onPress,
  onLongPress,
}: DialPadButtonProps) {
  const scale = useSharedValue(1);
  const letters = DIAL_PAD_LETTERS[digit];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.9, { duration: 80 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 120 });
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress(digit);
  }, [digit, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(digit);
  }, [digit, onLongPress]);

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: Colors.surfaceVariant, borderless: true, radius: 36 }}
      delayLongPress={500}>
      <View style={styles.content}>
        <Text style={styles.digit}>{digit}</Text>
        {letters ? <Text style={styles.letters}>{letters}</Text> : null}
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  digit: {
    ...Typography.dialpadKey,
  },
  letters: {
    ...Typography.dialpadLetters,
    marginTop: -2,
  },
});
