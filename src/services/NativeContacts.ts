import { NativeModules } from 'react-native';
import type { Contact } from '../core/types';

/**
 * Typed wrapper around the native ContactsModule.
 *
 * Provides paginated contact fetching with optional search.
 */

interface ContactsModuleInterface {
  getContacts(offset: number, limit: number, searchQuery: string | null): Promise<Contact[]>;
  getContactsCount(searchQuery: string | null): Promise<number>;
}

const { ContactsModule } = NativeModules;

if (!ContactsModule) {
  throw new Error(
    'ContactsModule is not linked. Ensure the native module is properly registered in DialerPackage.',
  );
}

export const NativeContacts = ContactsModule as ContactsModuleInterface;
