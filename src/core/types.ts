/**
 * Core type definitions for the Phone Dialer application.
 * All types used across multiple modules are defined here.
 */

// ============================================================
// Contacts
// ============================================================

export interface Contact {
  id: string;
  displayName: string;
  phoneNumber: string | null;
  photoUri: string | null;
  starred: boolean;
}

export interface ContactSection {
  title: string;
  data: Contact[];
}

// ============================================================
// Call Logs
// ============================================================

export type CallType = 'INCOMING' | 'OUTGOING' | 'MISSED' | 'REJECTED' | 'BLOCKED' | 'UNKNOWN';

export interface CallLogEntry {
  id: string;
  number: string;
  name: string | null;
  type: CallType;
  date: number; // Unix timestamp in ms
  duration: number; // seconds
  photoUri: string | null;
}

// ============================================================
// Call State (InCallService events)
// ============================================================

export type CallState =
  | 'NEW'
  | 'DIALING'
  | 'RINGING'
  | 'HOLDING'
  | 'ACTIVE'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'DISCONNECTING'
  | 'SELECT_PHONE_ACCOUNT'
  | 'PULLING_CALL'
  | 'UNKNOWN';

export interface CallStateEvent {
  phoneNumber: string;
  state: CallState;
  callIndex: number;
}

export interface CallRemovedEvent {
  phoneNumber: string;
  state: 'DISCONNECTED';
}

// ============================================================
// Permissions
// ============================================================

export type PermissionStatus = 'granted' | 'denied' | 'never_ask_again';

export interface PermissionResult {
  [permission: string]: PermissionStatus;
}

// ============================================================
// Dialer
// ============================================================

export type DialPadKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '*'
  | '#';

export const DIAL_PAD_LETTERS: Record<DialPadKey, string> = {
  '0': '+',
  '1': '',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
  '*': '',
  '#': '',
};

// ============================================================
// Navigation
// ============================================================

export type RootTabParamList = {
  DialPad: undefined;
  Contacts: undefined;
  CallLogs: undefined;
};
