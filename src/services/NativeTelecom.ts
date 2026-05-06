import { NativeModules } from 'react-native';

/**
 * Typed wrapper around the native TelecomModule.
 *
 * Provides methods for placing calls and validating phone numbers.
 */

interface TelecomModuleInterface {
  placeCall(phoneNumber: string): Promise<void>;
  isValidPhoneNumber(number: string): Promise<boolean>;
  hasCallPhonePermission(): Promise<boolean>;
}

const { TelecomModule } = NativeModules;

if (!TelecomModule) {
  throw new Error(
    'TelecomModule is not linked. Ensure the native module is properly registered in DialerPackage.',
  );
}

export const NativeTelecom = TelecomModule as TelecomModuleInterface;
