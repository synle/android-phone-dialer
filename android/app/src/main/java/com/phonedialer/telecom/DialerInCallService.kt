package com.phonedialer.telecom

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.InCallService
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * InCallService that receives call state updates from the Android Telecom framework.
 *
 * When this app is the default dialer, the system binds to this service and delivers
 * Call objects representing active, ringing, and held calls. This service bridges
 * those events to React Native via RCTDeviceEventEmitter.
 *
 * CRITICAL: This service is ONLY bound when the app is the default dialer.
 * If the app is not default dialer, this service is never started.
 *
 * Android 15 (API 35) notes:
 * - Foreground service must specify FOREGROUND_SERVICE_TYPE_PHONE_CALL
 * - Must call startForeground() with the type when a call is active
 * - Notification channel is required for Android 8+ (already enforced by minSdk 26)
 */
class DialerInCallService : InCallService() {

    companion object {
        private const val TAG = "DialerInCallService"
        private const val NOTIFICATION_CHANNEL_ID = "dialer_incall_channel"
        private const val NOTIFICATION_ID = 1001

        @Volatile
        var instance: DialerInCallService? = null
            private set
    }

    private val activeCalls = mutableListOf<Call>()
    private var isForeground = false

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {
            Log.i(TAG, "Call state changed: ${stateToString(state)}")
            emitCallStateToReactNative(call, state)
        }

        override fun onDetailsChanged(call: Call, details: Call.Details) {
            Log.d(TAG, "Call details changed: ${details.handle}")
        }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
        Log.i(TAG, "InCallService created")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        activeCalls.forEach { it.unregisterCallback(callCallback) }
        activeCalls.clear()
        if (isForeground) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            isForeground = false
        }
        Log.i(TAG, "InCallService destroyed")
    }

    override fun onCallAdded(call: Call) {
        Log.i(TAG, "Call added: ${call.details?.handle}")
        activeCalls.add(call)
        call.registerCallback(callCallback)
        emitCallStateToReactNative(call, call.state)
        promoteToForegroundIfNeeded()
    }

    override fun onCallRemoved(call: Call) {
        Log.i(TAG, "Call removed: ${call.details?.handle}")
        call.unregisterCallback(callCallback)
        activeCalls.remove(call)
        emitCallRemovedToReactNative(call)

        if (activeCalls.isEmpty() && isForeground) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            isForeground = false
        }
    }

    override fun onCallAudioStateChanged(audioState: CallAudioState?) {
        Log.d(TAG, "Audio state changed: route=${audioState?.route}, muted=${audioState?.isMuted}")
    }

    // ---- Foreground service management (required for API 35) ----

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            "Ongoing Call",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Shown during an active phone call"
            setShowBadge(false)
        }
        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(channel)
    }

    private fun buildOngoingCallNotification(): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.sym_call_outgoing)
            .setContentTitle("Phone Dialer")
            .setContentText("Call in progress")
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun promoteToForegroundIfNeeded() {
        if (isForeground) return
        try {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                buildOngoingCallNotification(),
                ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL
            )
            isForeground = true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start foreground service: ${e.message}")
        }
    }

    // ---- Public API for the React Native bridge ----

    fun answerCall(callIndex: Int = 0) {
        activeCalls.getOrNull(callIndex)?.answer(0)
    }

    fun rejectCall(callIndex: Int = 0) {
        activeCalls.getOrNull(callIndex)?.reject(false, null)
    }

    fun disconnectCall(callIndex: Int = 0) {
        activeCalls.getOrNull(callIndex)?.disconnect()
    }

    fun holdCall(callIndex: Int = 0) {
        activeCalls.getOrNull(callIndex)?.hold()
    }

    fun unholdCall(callIndex: Int = 0) {
        activeCalls.getOrNull(callIndex)?.unhold()
    }

    fun toggleMute() {
        val current = callAudioState?.isMuted ?: false
        setMuted(!current)
    }

    fun setSpeaker(on: Boolean) {
        setAudioRoute(if (on) CallAudioState.ROUTE_SPEAKER else CallAudioState.ROUTE_EARPIECE)
    }

    fun getActiveCallCount(): Int = activeCalls.size

    // ---- React Native event emission ----

    private fun emitCallStateToReactNative(call: Call, state: Int) {
        val params = Arguments.createMap().apply {
            putString("phoneNumber", call.details?.handle?.schemeSpecificPart ?: "Unknown")
            putString("state", stateToString(state))
            putInt("callIndex", activeCalls.indexOf(call))
        }
        emitEvent("onCallStateChanged", params)
    }

    private fun emitCallRemovedToReactNative(call: Call) {
        val params = Arguments.createMap().apply {
            putString("phoneNumber", call.details?.handle?.schemeSpecificPart ?: "Unknown")
            putString("state", "DISCONNECTED")
        }
        emitEvent("onCallRemoved", params)
    }

    private fun emitEvent(eventName: String, params: com.facebook.react.bridge.WritableMap) {
        try {
            val reactContext = (application as? ReactApplication)
                ?.reactNativeHost
                ?.reactInstanceManager
                ?.currentReactContext
            reactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to emit event to RN: ${e.message}")
        }
    }

    @Suppress("DEPRECATION")
    private fun stateToString(state: Int): String = when (state) {
        Call.STATE_NEW -> "NEW"
        Call.STATE_DIALING -> "DIALING"
        Call.STATE_RINGING -> "RINGING"
        Call.STATE_HOLDING -> "HOLDING"
        Call.STATE_ACTIVE -> "ACTIVE"
        Call.STATE_DISCONNECTED -> "DISCONNECTED"
        Call.STATE_CONNECTING -> "CONNECTING"
        Call.STATE_DISCONNECTING -> "DISCONNECTING"
        Call.STATE_SELECT_PHONE_ACCOUNT -> "SELECT_PHONE_ACCOUNT"
        Call.STATE_PULLING_CALL -> "PULLING_CALL"
        else -> "UNKNOWN($state)"
    }
}
