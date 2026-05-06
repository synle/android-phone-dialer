import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { DialPadButton } from './DialPadButton';
import { Spacing } from '../core/theme';
import type { DialPadKey } from '../core/types';

const ROWS: DialPadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

interface DialPadGridProps {
  onDigitPress: (digit: DialPadKey) => void;
  onZeroLongPress?: () => void;
}

/**
 * 4x3 grid of dial pad buttons.
 *
 * Layout is stable and does not re-render on digit input
 * because callbacks are memoized and individual buttons are React.memo'd.
 */
export const DialPadGrid = React.memo(function DialPadGrid({
  onDigitPress,
  onZeroLongPress,
}: DialPadGridProps) {
  const handleLongPress = useCallback(
    (digit: DialPadKey) => {
      if (digit === '0') {
        onZeroLongPress?.();
      }
    },
    [onZeroLongPress],
  );

  return (
    <View style={styles.grid}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((digit) => (
            <DialPadButton
              key={digit}
              digit={digit}
              onPress={onDigitPress}
              onLongPress={handleLongPress}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.sm,
  },
});
