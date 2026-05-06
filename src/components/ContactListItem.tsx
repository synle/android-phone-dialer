import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../core/theme';
import type { Contact } from '../core/types';

interface ContactListItemProps {
  contact: Contact;
  onPress: (contact: Contact) => void;
}

/**
 * Single contact row for the contacts list.
 *
 * Displays avatar (or initial), name, and phone number.
 * Memoized to prevent re-renders during scroll.
 */
export const ContactListItem = React.memo(function ContactListItem({
  contact,
  onPress,
}: ContactListItemProps) {
  const handlePress = useCallback(() => {
    onPress(contact);
  }, [contact, onPress]);

  const initial = contact.displayName.charAt(0).toUpperCase();

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      android_ripple={{ color: Colors.surfaceVariant }}>
      <View style={styles.avatar}>
        {contact.photoUri ? (
          <Image source={{ uri: contact.photoUri }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.displayName}
        </Text>
        {contact.phoneNumber ? (
          <Text style={styles.phone} numberOfLines={1}>
            {contact.phoneNumber}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
  },
  phone: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
});
