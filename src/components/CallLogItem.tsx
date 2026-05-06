import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors, Typography, Spacing } from '../core/theme';
import type { CallLogEntry, CallType } from '../core/types';
import { formatDuration, formatRelativeTime } from '../services/PhoneNumberFormatter';

interface CallLogItemProps {
  entry: CallLogEntry;
  onPress: (entry: CallLogEntry) => void;
}

function getCallTypeIcon(type: CallType): string {
  switch (type) {
    case 'INCOMING':
      return '\u2199'; // ↙
    case 'OUTGOING':
      return '\u2197'; // ↗
    case 'MISSED':
      return '\u2199'; // ↙ (red)
    case 'REJECTED':
      return '\u2717'; // ✗
    case 'BLOCKED':
      return '\u26D4'; // ⛔
    default:
      return '\u2022'; // •
  }
}

function getCallTypeColor(type: CallType): string {
  switch (type) {
    case 'INCOMING':
      return Colors.incoming;
    case 'OUTGOING':
      return Colors.outgoing;
    case 'MISSED':
      return Colors.missed;
    case 'REJECTED':
      return Colors.missed;
    case 'BLOCKED':
      return Colors.textTertiary;
    default:
      return Colors.textSecondary;
  }
}

/**
 * Single call log entry row.
 *
 * Displays call type icon, contact name/number, time, and duration.
 * Tap to redial.
 */
export const CallLogItem = React.memo(function CallLogItem({
  entry,
  onPress,
}: CallLogItemProps) {
  const handlePress = useCallback(() => {
    onPress(entry);
  }, [entry, onPress]);

  const typeColor = getCallTypeColor(entry.type);
  const typeIcon = getCallTypeIcon(entry.type);
  const displayName = entry.name || entry.number || 'Unknown';

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      android_ripple={{ color: Colors.surfaceVariant }}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: typeColor }]}>{typeIcon}</Text>
      </View>
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            entry.type === 'MISSED' && styles.missedName,
          ]}
          numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.details}>
          {entry.type.charAt(0) + entry.type.slice(1).toLowerCase()}
          {entry.duration > 0 ? ` \u2022 ${formatDuration(entry.duration)}` : ''}
        </Text>
      </View>
      <Text style={styles.time}>{formatRelativeTime(entry.date)}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
  },
  missedName: {
    color: Colors.missed,
  },
  details: {
    ...Typography.caption,
    marginTop: 2,
  },
  time: {
    ...Typography.caption,
    marginLeft: Spacing.sm,
  },
});
