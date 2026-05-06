package com.phonedialer.bridge

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.phonedialer.telecom.DialerInCallService

/**
 * React Native bridge module for in-call control.
 *
 * Provides control over active calls via the DialerInCallService singleton.
 * Only functional when the app is the default dialer and InCallService is bound.
 *
 * Exposes:
 * - answerCall(): Promise<void>
 * - rejectCall(): Promise<void>
 * - disconnectCall(): Promise<void>
 * - holdCall(): Promise<void>
 * - unholdCall(): Promise<void>
 * - toggleMute(): Promise<void>
 * - setSpeaker(on: Boolean): Promise<void>
 * - getActiveCallCount(): Promise<Int>
 */
class InCallModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InCallModule"

    private fun getService(): DialerInCallService? = DialerInCallService.instance

    @ReactMethod
    fun answerCall(promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.answerCall()
        promise.resolve(null)
    }

    @ReactMethod
    fun rejectCall(promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.rejectCall()
        promise.resolve(null)
    }

    @ReactMethod
    fun disconnectCall(promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.disconnectCall()
        promise.resolve(null)
    }

    @ReactMethod
    fun holdCall(promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.holdCall()
        promise.resolve(null)
    }

    @ReactMethod
    fun unholdCall(promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.unholdCall()
        promise.resolve(null)
    }

    @ReactMethod
    fun toggleMute(promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.toggleMute()
        promise.resolve(null)
    }

    @ReactMethod
    fun setSpeaker(on: Boolean, promise: Promise) {
        val service = getService()
        if (service == null) {
            promise.reject("NO_SERVICE", "InCallService not bound")
            return
        }
        service.setSpeaker(on)
        promise.resolve(null)
    }

    @ReactMethod
    fun getActiveCallCount(promise: Promise) {
        val count = getService()?.getActiveCallCount() ?: 0
        promise.resolve(count)
    }
}
