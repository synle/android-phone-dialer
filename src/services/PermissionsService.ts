import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Centralized runtime permission management.
 *
 * All permission requests go through this service to:
 * 1. Provide a single place to handle permission logic
 * 2. Support batch requesting (reduces number of dialogs)
 * 3. Return strongly-typed results
 */

export type PermissionName =
  | 'CALL_PHONE'
  | 'READ_CONTACTS'
  | 'READ_CALL_LOG'
  | 'READ_PHONE_STATE'
  | 'POST_NOTIFICATIONS';

const PERMISSION_MAP: Record<PermissionName, string> = {
  CALL_PHONE: PermissionsAndroid.PERMISSIONS.CALL_PHONE,
  READ_CONTACTS: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
  READ_CALL_LOG: PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  READ_PHONE_STATE: PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
  POST_NOTIFICATIONS: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
};

export async function checkPermission(name: PermissionName): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PERMISSION_MAP[name]);
}

export async function requestPermission(name: PermissionName): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const result = await PermissionsAndroid.request(PERMISSION_MAP[name]);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Request all dialer-critical permissions at once.
 * Returns a record of which permissions were granted.
 */
export async function requestDialerPermissions(): Promise<Record<PermissionName, boolean>> {
  if (Platform.OS !== 'android') {
    return {
      CALL_PHONE: false,
      READ_CONTACTS: false,
      READ_CALL_LOG: false,
      READ_PHONE_STATE: false,
      POST_NOTIFICATIONS: false,
    };
  }

  const results = await PermissionsAndroid.requestMultiple([
    PERMISSION_MAP.CALL_PHONE,
    PERMISSION_MAP.READ_CONTACTS,
    PERMISSION_MAP.READ_CALL_LOG,
    PERMISSION_MAP.READ_PHONE_STATE,
    PERMISSION_MAP.POST_NOTIFICATIONS,
  ]);

  return {
    CALL_PHONE: results[PERMISSION_MAP.CALL_PHONE] === PermissionsAndroid.RESULTS.GRANTED,
    READ_CONTACTS: results[PERMISSION_MAP.READ_CONTACTS] === PermissionsAndroid.RESULTS.GRANTED,
    READ_CALL_LOG: results[PERMISSION_MAP.READ_CALL_LOG] === PermissionsAndroid.RESULTS.GRANTED,
    READ_PHONE_STATE:
      results[PERMISSION_MAP.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED,
    POST_NOTIFICATIONS:
      results[PERMISSION_MAP.POST_NOTIFICATIONS] === PermissionsAndroid.RESULTS.GRANTED,
  };
}
