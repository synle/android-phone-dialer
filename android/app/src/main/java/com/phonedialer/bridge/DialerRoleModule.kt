package com.phonedialer.bridge

import android.app.Activity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.phonedialer.telecom.DialerRoleManager

/**
 * React Native bridge module for default dialer role management.
 *
 * Exposes:
 * - isDefaultDialer(): Promise<Boolean>
 * - requestDefaultDialerRole(): Promise<Boolean>
 */
class DialerRoleModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val roleManager = DialerRoleManager(reactContext)
    private var pendingPromise: Promise? = null

    private val activityEventListener: ActivityEventListener =
        object : BaseActivityEventListener() {
            override fun onActivityResult(
                activity: Activity?,
                requestCode: Int,
                resultCode: Int,
                data: android.content.Intent?
            ) {
                if (requestCode == DialerRoleManager.REQUEST_CODE_SET_DEFAULT_DIALER) {
                    val isNowDefault = roleManager.isDefaultDialer()
                    pendingPromise?.resolve(isNowDefault)
                    pendingPromise = null
                }
            }
        }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "DialerRoleModule"

    @ReactMethod
    fun isDefaultDialer(promise: Promise) {
        promise.resolve(roleManager.isDefaultDialer())
    }

    @ReactMethod
    fun requestDefaultDialerRole(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No current activity")
            return
        }

        if (roleManager.isDefaultDialer()) {
            promise.resolve(true)
            return
        }

        pendingPromise = promise
        val requested = roleManager.requestDefaultDialerRole(activity)
        if (!requested) {
            pendingPromise = null
            promise.reject("ROLE_REQUEST_FAILED", "Could not create role request intent")
        }
    }
}
