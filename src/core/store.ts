import { create } from 'zustand';
import type { Contact, CallLogEntry, CallState, ContactSection } from './types';

// ============================================================
// Dial Pad Store
// ============================================================

interface DialPadState {
  digits: string;
  appendDigit: (digit: string) => void;
  deleteLastDigit: () => void;
  clearAll: () => void;
  setDigits: (digits: string) => void;
}

export const useDialPadStore = create<DialPadState>((set) => ({
  digits: '',
  appendDigit: (digit) =>
    set((state) => ({
      digits: state.digits.length < 20 ? state.digits + digit : state.digits,
    })),
  deleteLastDigit: () =>
    set((state) => ({
      digits: state.digits.slice(0, -1),
    })),
  clearAll: () => set({ digits: '' }),
  setDigits: (digits) => set({ digits }),
}));

// ============================================================
// Contacts Store
// ============================================================

interface ContactsState {
  contacts: Contact[];
  sections: ContactSection[];
  totalCount: number;
  isLoading: boolean;
  searchQuery: string;
  hasMore: boolean;
  setContacts: (contacts: Contact[], totalCount: number) => void;
  appendContacts: (contacts: Contact[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
}

function buildSections(contacts: Contact[]): ContactSection[] {
  const sectionMap = new Map<string, Contact[]>();

  for (const contact of contacts) {
    const firstChar = contact.displayName.charAt(0).toUpperCase();
    const key = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
    const existing = sectionMap.get(key) || [];
    existing.push(contact);
    sectionMap.set(key, existing);
  }

  return Array.from(sectionMap.entries())
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(([title, data]) => ({ title, data }));
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  sections: [],
  totalCount: 0,
  isLoading: false,
  searchQuery: '',
  hasMore: true,
  setContacts: (contacts, totalCount) =>
    set({
      contacts,
      sections: buildSections(contacts),
      totalCount,
      hasMore: contacts.length < totalCount,
    }),
  appendContacts: (newContacts) =>
    set((state) => {
      const merged = [...state.contacts, ...newContacts];
      return {
        contacts: merged,
        sections: buildSections(merged),
        hasMore: merged.length < state.totalCount,
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setHasMore: (hasMore) => set({ hasMore }),
  reset: () => set({ contacts: [], sections: [], totalCount: 0, hasMore: true, searchQuery: '' }),
}));

// ============================================================
// Call Log Store
// ============================================================

interface CallLogState {
  entries: CallLogEntry[];
  isLoading: boolean;
  hasMore: boolean;
  setEntries: (entries: CallLogEntry[]) => void;
  appendEntries: (entries: CallLogEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
}

export const useCallLogStore = create<CallLogState>((set) => ({
  entries: [],
  isLoading: false,
  hasMore: true,
  setEntries: (entries) => set({ entries }),
  appendEntries: (newEntries) =>
    set((state) => ({ entries: [...state.entries, ...newEntries] })),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  reset: () => set({ entries: [], hasMore: true }),
}));

// ============================================================
// Active Call Store (for in-call UI)
// ============================================================

interface ActiveCallState {
  phoneNumber: string | null;
  callState: CallState | null;
  isMuted: boolean;
  isSpeaker: boolean;
  setCallState: (phoneNumber: string, state: CallState) => void;
  clearCall: () => void;
  setMuted: (muted: boolean) => void;
  setSpeaker: (speaker: boolean) => void;
}

export const useActiveCallStore = create<ActiveCallState>((set) => ({
  phoneNumber: null,
  callState: null,
  isMuted: false,
  isSpeaker: false,
  setCallState: (phoneNumber, callState) => set({ phoneNumber, callState }),
  clearCall: () =>
    set({ phoneNumber: null, callState: null, isMuted: false, isSpeaker: false }),
  setMuted: (isMuted) => set({ isMuted }),
  setSpeaker: (isSpeaker) => set({ isSpeaker }),
}));
