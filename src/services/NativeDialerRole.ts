import { NativeModules } from 'react-native';

/**
 * Typed wrapper around the native DialerRoleModule.
 *
 * Provides methods for checking and requesting default dialer status.
 * All methods are async because they cross the JS-Native bridge.
 */

interface DialerRoleModuleInterface {
  isDefaultDialer(): Promise<boolean>;
  requestDefaultDialerRole(): Promise<boolean>;
}

const { DialerRoleModule } = NativeModules;

if (!DialerRoleModule) {
  throw new Error(
    'DialerRoleModule is not linked. Ensure the native module is properly registered in DialerPackage.',
  );
}

export const NativeDialerRole = DialerRoleModule as DialerRoleModuleInterface;
