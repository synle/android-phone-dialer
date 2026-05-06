package com.phonedialer.telecom

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telecom.TelecomManager
import androidx.annotation.RequiresApi

/**
 * Manages the default dialer role for this application.
 *
 * On Android Q+ (API 29+), uses RoleManager.
 * On Android O-P (API 26-28), uses TelecomManager.ACTION_CHANGE_DEFAULT_DIALER.
 *
 * This class does NOT hold Activity references — it receives them transiently
 * to avoid memory leaks.
 */
class DialerRoleManager(private val context: Context) {

    companion object {
        const val REQUEST_CODE_SET_DEFAULT_DIALER = 1001
    }

    /**
     * Returns true if this app is currently the default dialer.
     */
    fun isDefaultDialer(): Boolean {
        val telecomManager = context.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
        return telecomManager.defaultDialerPackage == context.packageName
    }

    /**
     * Creates an Intent that, when started with startActivityForResult,
     * prompts the user to set this app as the default dialer.
     *
     * Returns null if the role cannot be requested (e.g., already default).
     */
    fun createSetDefaultDialerIntent(): Intent? {
        if (isDefaultDialer()) return null

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            createRoleManagerIntent()
        } else {
            createLegacyDialerIntent()
        }
    }

    /**
     * Convenience: launches the default-dialer prompt from the given Activity.
     * Returns false if already default or intent could not be created.
     */
    fun requestDefaultDialerRole(activity: Activity): Boolean {
        val intent = createSetDefaultDialerIntent() ?: return false
        activity.startActivityForResult(intent, REQUEST_CODE_SET_DEFAULT_DIALER)
        return true
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun createRoleManagerIntent(): Intent? {
        val roleManager = context.getSystemService(Context.ROLE_SERVICE) as RoleManager
        if (!roleManager.isRoleAvailable(RoleManager.ROLE_DIALER)) return null
        if (roleManager.isRoleHeld(RoleManager.ROLE_DIALER)) return null
        return roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
    }

    @Suppress("DEPRECATION")
    private fun createLegacyDialerIntent(): Intent {
        return Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER).apply {
            putExtra(
                TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME,
                context.packageName
            )
        }
    }
}
