import { useCallback, useEffect, useState } from 'react';
import { NativeDialerRole } from '../services/NativeDialerRole';

/**
 * Hook for managing the default dialer role.
 *
 * Checks status on mount and provides a method to request the role.
 */
export function useDialerRole() {
  const [isDefault, setIsDefault] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkRole = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await NativeDialerRole.isDefaultDialer();
      setIsDefault(result);
    } catch (error) {
      console.error('Failed to check dialer role:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const requestRole = useCallback(async (): Promise<boolean> => {
    try {
      const result = await NativeDialerRole.requestDefaultDialerRole();
      setIsDefault(result);
      return result;
    } catch (error) {
      console.error('Failed to request dialer role:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  return {
    isDefault,
    isChecking,
    requestRole,
    refreshRole: checkRole,
  };
}
