import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallLogs } from '../hooks/useCallLogs';
import { usePermissions } from '../hooks/usePermissions';
import { CallLogItem } from '../components/CallLogItem';
import { PermissionGate } from '../components/PermissionGate';
import { Colors, Typography, Spacing, BorderRadius } from '../core/theme';
import { NativeTelecom } from '../services/NativeTelecom';
import { useDialPadStore } from '../core/store';
import type { CallLogEntry, CallType } from '../core/types';

type FilterOption = 'ALL' | CallType;

const FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Missed', value: 'MISSED' },
  { label: 'Incoming', value: 'INCOMING' },
  { label: 'Outgoing', value: 'OUTGOING' },
];

/**
 * Call logs screen with:
 * - Filter chips (All / Missed / Incoming / Outgoing)
 * - Infinite scroll pagination
 * - Pull to refresh
 * - Tap to redial
 */
export function CallLogsScreen() {
  const { permissions, requestAll } = usePermissions();
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const typeFilter = filter === 'ALL' ? undefined : filter;
  const { entries, isLoading, hasMore, loadMore, refresh } = useCallLogs(typeFilter);

  const handleEntryPress = useCallback((entry: CallLogEntry) => {
    if (!entry.number) return;

    Alert.alert(
      `Call ${entry.name || entry.number}?`,
      entry.number,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: async () => {
            try {
              await NativeTelecom.placeCall(entry.number);
            } catch (error: any) {
              Alert.alert('Call Failed', error?.message || 'Unable to place call.');
            }
          },
        },
        {
          text: 'Copy to Dial Pad',
          onPress: () => {
            useDialPadStore.getState().setDigits(entry.number.replace(/\D/g, ''));
          },
        },
      ],
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CallLogEntry }) => (
      <CallLogItem entry={item} onPress={handleEntryPress} />
    ),
    [handleEntryPress],
  );

  const renderFooter = useCallback(() => {
    if (!isLoading || entries.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isLoading, entries.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No call history</Text>
      </View>
    );
  }, [isLoading]);

  const keyExtractor = useCallback((item: CallLogEntry) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PermissionGate
        title="Call Log Access"
        message="This app needs access to your call history to display it here."
        isGranted={permissions.READ_CALL_LOG}
        onRequestPermission={requestAll}>
        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
              android_ripple={{ color: Colors.surfaceVariant }}>
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.value && styles.filterChipTextActive,
                ]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={entries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          onRefresh={refresh}
          refreshing={isLoading && entries.length === 0}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews
        />
      </PermissionGate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.bodySmall,
  },
});
