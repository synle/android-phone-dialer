package com.phonedialer.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.phonedialer.calllogs.CallLogRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * React Native bridge module for call log access.
 *
 * Exposes:
 * - getCallLogs(offset, limit, typeFilter?): Promise<Array>
 *
 * typeFilter values: "INCOMING", "OUTGOING", "MISSED", "REJECTED", "BLOCKED", or null for all.
 */
class CallLogModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val repository = CallLogRepository(reactContext)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    override fun getName(): String = "CallLogModule"

    override fun invalidate() {
        scope.cancel()
        super.invalidate()
    }

    @ReactMethod
    fun getCallLogs(offset: Int, limit: Int, typeFilter: String?, promise: Promise) {
        scope.launch {
            try {
                val filter = typeFilter?.let {
                    try {
                        CallLogRepository.CallType.valueOf(it)
                    } catch (e: IllegalArgumentException) {
                        null
                    }
                }

                val logs = repository.getCallLogs(offset, limit, filter)
                val result = Arguments.createArray()

                for (entry in logs) {
                    val map = Arguments.createMap().apply {
                        putString("id", entry.id)
                        putString("number", entry.number)
                        putString("name", entry.name)
                        putString("type", entry.type.name)
                        putDouble("date", entry.date.toDouble())
                        putDouble("duration", entry.duration.toDouble())
                        putString("photoUri", entry.photoUri)
                    }
                    result.pushMap(map)
                }

                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("CALL_LOG_ERROR", e.message, e)
            }
        }
    }
}
