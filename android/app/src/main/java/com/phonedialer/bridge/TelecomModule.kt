package com.phonedialer.bridge

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.phonedialer.telecom.OutgoingCallManager
import com.phonedialer.telecom.TelecomServiceManager

/**
 * React Native bridge module for telecom operations (placing calls).
 *
 * Exposes:
 * - placeCall(phoneNumber: String): Promise<void>
 * - isValidPhoneNumber(number: String): Promise<Boolean>
 * - hasCallPhonePermission(): Promise<Boolean>
 */
class TelecomModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val telecomServiceManager = TelecomServiceManager(reactContext)
    private val outgoingCallManager = OutgoingCallManager(reactContext, telecomServiceManager)

    override fun getName(): String = "TelecomModule"

    @ReactMethod
    fun placeCall(phoneNumber: String, promise: Promise) {
        when (val result = outgoingCallManager.initiateCall(phoneNumber)) {
            is OutgoingCallManager.CallResult.Success -> {
                promise.resolve(null)
            }
            is OutgoingCallManager.CallResult.InvalidNumber -> {
                promise.reject("INVALID_NUMBER", "Phone number is invalid")
            }
            is OutgoingCallManager.CallResult.PermissionDenied -> {
                promise.reject("PERMISSION_DENIED", "CALL_PHONE permission not granted")
            }
            is OutgoingCallManager.CallResult.Failed -> {
                promise.reject("CALL_FAILED", result.reason)
            }
        }
    }

    @ReactMethod
    fun isValidPhoneNumber(number: String, promise: Promise) {
        promise.resolve(outgoingCallManager.isValidPhoneNumber(number))
    }

    @ReactMethod
    fun hasCallPhonePermission(promise: Promise) {
        promise.resolve(telecomServiceManager.hasCallPhonePermission())
    }
}
