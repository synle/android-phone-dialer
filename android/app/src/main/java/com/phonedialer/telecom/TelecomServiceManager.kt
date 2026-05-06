package com.phonedialer.telecom

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.telecom.TelecomManager
import androidx.core.content.ContextCompat

/**
 * Central manager for telecom operations: placing calls, querying phone accounts,
 * and interacting with the system TelecomManager.
 *
 * All operations validate permissions before execution and return structured
 * results rather than throwing exceptions, making them safe to call from the
 * React Native bridge.
 */
class TelecomServiceManager(private val context: Context) {

    private val telecomManager: TelecomManager
        get() = context.getSystemService(Context.TELECOM_SERVICE) as TelecomManager

    /**
     * Result of a call placement attempt.
     */
    sealed class PlaceCallResult {
        data object Success : PlaceCallResult()
        data class Error(val reason: String) : PlaceCallResult()
    }

    /**
     * Places an outgoing call to the given phone number.
     *
     * Validates:
     * - CALL_PHONE permission is granted
     * - Phone number is non-empty
     * - TelecomManager is available
     */
    fun placeCall(phoneNumber: String): PlaceCallResult {
        if (phoneNumber.isBlank()) {
            return PlaceCallResult.Error("Phone number is empty")
        }

        if (!hasCallPhonePermission()) {
            return PlaceCallResult.Error("CALL_PHONE permission not granted")
        }

        return try {
            val uri = Uri.fromParts("tel", phoneNumber, null)
            val extras = android.os.Bundle()
            telecomManager.placeCall(uri, extras)
            PlaceCallResult.Success
        } catch (e: SecurityException) {
            PlaceCallResult.Error("SecurityException: ${e.message}")
        } catch (e: Exception) {
            PlaceCallResult.Error("Failed to place call: ${e.message}")
        }
    }

    /**
     * Returns true if CALL_PHONE permission is currently granted.
     */
    fun hasCallPhonePermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Returns true if READ_PHONE_STATE permission is currently granted.
     */
    fun hasReadPhoneStatePermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_PHONE_STATE
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Opens the system dialer with the given number pre-filled.
     * This does NOT place the call — it just shows the dialer.
     * Useful as a fallback when CALL_PHONE is not granted.
     */
    fun openSystemDialer(phoneNumber: String) {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:$phoneNumber")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }
}
