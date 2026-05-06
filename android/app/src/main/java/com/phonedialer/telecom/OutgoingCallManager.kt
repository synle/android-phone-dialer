package com.phonedialer.telecom

import android.content.Context
import android.util.Log

/**
 * Orchestrates outgoing call flow:
 * 1. Validates the phone number
 * 2. Checks permissions
 * 3. Delegates to TelecomServiceManager
 * 4. Emits state changes for the React Native layer
 *
 * This class exists as a higher-level coordinator so that TelecomServiceManager
 * stays a thin wrapper over Android APIs, while business logic (validation,
 * pre-call checks, analytics hooks) lives here.
 */
class OutgoingCallManager(
    private val context: Context,
    private val telecomServiceManager: TelecomServiceManager
) {
    companion object {
        private const val TAG = "OutgoingCallManager"
    }

    /**
     * Minimal phone number validation.
     * Production apps should use libphonenumber for proper validation.
     */
    fun isValidPhoneNumber(number: String): Boolean {
        val cleaned = number.replace(Regex("[\\s\\-().]"), "")
        if (cleaned.isEmpty()) return false
        if (cleaned.length < 3) return false
        // Allow + prefix for international, then digits only
        return cleaned.matches(Regex("^\\+?[0-9]{3,15}$"))
    }

    /**
     * Normalize a phone number for dialing.
     * Strips formatting characters, keeps + prefix if present.
     */
    fun normalizeNumber(number: String): String {
        return number.replace(Regex("[\\s\\-().]"), "")
    }

    /**
     * Initiates an outgoing call. Returns a result describing success or failure.
     */
    fun initiateCall(rawNumber: String): CallResult {
        val normalized = normalizeNumber(rawNumber)

        if (!isValidPhoneNumber(normalized)) {
            Log.w(TAG, "Invalid phone number: $normalized")
            return CallResult.InvalidNumber
        }

        if (!telecomServiceManager.hasCallPhonePermission()) {
            Log.w(TAG, "CALL_PHONE permission not granted")
            return CallResult.PermissionDenied
        }

        return when (val result = telecomServiceManager.placeCall(normalized)) {
            is TelecomServiceManager.PlaceCallResult.Success -> {
                Log.i(TAG, "Call placed successfully to $normalized")
                CallResult.Success
            }
            is TelecomServiceManager.PlaceCallResult.Error -> {
                Log.e(TAG, "Call failed: ${result.reason}")
                CallResult.Failed(result.reason)
            }
        }
    }

    sealed class CallResult {
        data object Success : CallResult()
        data object InvalidNumber : CallResult()
        data object PermissionDenied : CallResult()
        data class Failed(val reason: String) : CallResult()
    }
}
