import { NativeModules, NativeEventEmitter } from 'react-native';
import type { CallStateEvent, CallRemovedEvent } from '../core/types';

/**
 * Typed wrapper around the native InCallModule.
 *
 * Provides in-call controls and event subscription for call state changes.
 */

interface InCallModuleInterface {
  answerCall(): Promise<void>;
  rejectCall(): Promise<void>;
  disconnectCall(): Promise<void>;
  holdCall(): Promise<void>;
  unholdCall(): Promise<void>;
  toggleMute(): Promise<void>;
  setSpeaker(on: boolean): Promise<void>;
  getActiveCallCount(): Promise<number>;
}

const { InCallModule } = NativeModules;

if (!InCallModule) {
  throw new Error(
    'InCallModule is not linked. Ensure the native module is properly registered in DialerPackage.',
  );
}

export const NativeInCall = InCallModule as InCallModuleInterface;

/**
 * Event emitter for call state changes.
 * Events:
 * - 'onCallStateChanged': Emitted when a call's state changes
 * - 'onCallRemoved': Emitted when a call is removed
 */
export const InCallEventEmitter = new NativeEventEmitter(InCallModule);

export type InCallEvent = 'onCallStateChanged' | 'onCallRemoved';

export function subscribeToCallState(
  onStateChange: (event: CallStateEvent) => void,
  onCallRemoved: (event: CallRemovedEvent) => void,
): () => void {
  const stateSubscription = InCallEventEmitter.addListener('onCallStateChanged', onStateChange);
  const removedSubscription = InCallEventEmitter.addListener('onCallRemoved', onCallRemoved);

  return () => {
    stateSubscription.remove();
    removedSubscription.remove();
  };
}
