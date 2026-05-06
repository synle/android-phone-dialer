import { NativeModules } from 'react-native';
import type { CallLogEntry, CallType } from '../core/types';

/**
 * Typed wrapper around the native CallLogModule.
 *
 * Provides paginated call log fetching with optional type filtering.
 */

interface CallLogModuleInterface {
  getCallLogs(offset: number, limit: number, typeFilter: CallType | null): Promise<CallLogEntry[]>;
}

const { CallLogModule } = NativeModules;

if (!CallLogModule) {
  throw new Error(
    'CallLogModule is not linked. Ensure the native module is properly registered in DialerPackage.',
  );
}

export const NativeCallLog = CallLogModule as CallLogModuleInterface;
