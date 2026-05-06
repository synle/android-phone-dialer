import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContacts } from '../hooks/useContacts';
import { usePermissions } from '../hooks/usePermissions';
import { ContactListItem } from '../components/ContactListItem';
import { SearchBar } from '../components/SearchBar';
import { PermissionGate } from '../components/PermissionGate';
import { Colors, Typography, Spacing } from '../core/theme';
import { NativeTelecom } from '../services/NativeTelecom';
import type { Contact, ContactSection } from '../core/types';

/**
 * Contacts screen with:
 * - Search bar with debounced native query
 * - Alphabetical section headers
 * - Infinite scroll pagination
 * - Pull to refresh
 * - Tap contact to call
 */
export function ContactsScreen() {
  const { permissions, requestAll } = usePermissions();
  const { sections, isLoading, hasMore, searchQuery, loadMore, refresh, search } = useContacts();

  const handleContactPress = useCallback(async (contact: Contact) => {
    if (!contact.phoneNumber) {
      Alert.alert('No Number', 'This contact does not have a phone number.');
      return;
    }

    Alert.alert(
      `Call ${contact.displayName}?`,
      contact.phoneNumber,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: async () => {
            try {
              await NativeTelecom.placeCall(contact.phoneNumber!);
            } catch (error: any) {
              Alert.alert('Call Failed', error?.message || 'Unable to place call.');
            }
          },
        },
      ],
    );
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: ContactSection }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactListItem contact={item} onPress={handleContactPress} />
    ),
    [handleContactPress],
  );

  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isLoading]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchQuery ? 'No contacts found' : 'No contacts available'}
        </Text>
      </View>
    );
  }, [isLoading, searchQuery]);

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PermissionGate
        title="Contacts Access"
        message="This app needs access to your contacts to display them here."
        isGranted={permissions.READ_CONTACTS}
        onRequestPermission={requestAll}>
        <SearchBar value={searchQuery} onChangeText={search} placeholder="Search contacts..." />
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          onRefresh={refresh}
          refreshing={isLoading && sections.length === 0}
          stickySectionHeadersEnabled
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
  sectionHeader: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  sectionHeaderText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primary,
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
