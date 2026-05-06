import { useCallback, useEffect, useState } from 'react';
import {
  requestDialerPermissions,
  checkPermission,
  type PermissionName,
} from '../services/PermissionsService';

/**
 * Hook for managing runtime permissions.
 *
 * On mount, checks which permissions are already granted.
 * Provides requestAll() to batch-request all dialer permissions.
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<Record<PermissionName, boolean>>({
    CALL_PHONE: false,
    READ_CONTACTS: false,
    READ_CALL_LOG: false,
    READ_PHONE_STATE: false,
    POST_NOTIFICATIONS: false,
  });
  const [hasChecked, setHasChecked] = useState(false);

  const checkAll = useCallback(async () => {
    const results: Record<PermissionName, boolean> = {
      CALL_PHONE: await checkPermission('CALL_PHONE'),
      READ_CONTACTS: await checkPermission('READ_CONTACTS'),
      READ_CALL_LOG: await checkPermission('READ_CALL_LOG'),
      READ_PHONE_STATE: await checkPermission('READ_PHONE_STATE'),
      POST_NOTIFICATIONS: await checkPermission('POST_NOTIFICATIONS'),
    };
    setPermissions(results);
    setHasChecked(true);
  }, []);

  const requestAll = useCallback(async () => {
    const results = await requestDialerPermissions();
    setPermissions(results);
    return results;
  }, []);

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  const allGranted = Object.values(permissions).every(Boolean);

  return {
    permissions,
    hasChecked,
    allGranted,
    requestAll,
    refreshPermissions: checkAll,
  };
}
