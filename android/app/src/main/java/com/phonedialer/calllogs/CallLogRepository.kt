package com.phonedialer.calllogs

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.database.Cursor
import android.provider.CallLog
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Repository for querying the device call log via CallLog.Calls.
 *
 * Provides paginated access to call history with type classification
 * (incoming, outgoing, missed, rejected, blocked).
 *
 * All queries execute on Dispatchers.IO.
 */
class CallLogRepository(private val context: Context) {

    data class CallLogEntry(
        val id: String,
        val number: String,
        val name: String?,
        val type: CallType,
        val date: Long,
        val duration: Long,
        val photoUri: String?
    )

    enum class CallType {
        INCOMING,
        OUTGOING,
        MISSED,
        REJECTED,
        BLOCKED,
        UNKNOWN;

        companion object {
            fun fromAndroidType(type: Int): CallType = when (type) {
                CallLog.Calls.INCOMING_TYPE -> INCOMING
                CallLog.Calls.OUTGOING_TYPE -> OUTGOING
                CallLog.Calls.MISSED_TYPE -> MISSED
                CallLog.Calls.REJECTED_TYPE -> REJECTED
                CallLog.Calls.BLOCKED_TYPE -> BLOCKED
                else -> UNKNOWN
            }
        }
    }

    companion object {
        private val CALL_LOG_PROJECTION = arrayOf(
            CallLog.Calls._ID,
            CallLog.Calls.NUMBER,
            CallLog.Calls.CACHED_NAME,
            CallLog.Calls.TYPE,
            CallLog.Calls.DATE,
            CallLog.Calls.DURATION,
            CallLog.Calls.CACHED_PHOTO_URI
        )
    }

    /**
     * Fetches call log entries, most recent first.
     *
     * @param offset Number of entries to skip
     * @param limit Maximum number of entries to return
     * @param typeFilter Optional filter for a specific call type
     */
    suspend fun getCallLogs(
        offset: Int = 0,
        limit: Int = 50,
        typeFilter: CallType? = null
    ): List<CallLogEntry> = withContext(Dispatchers.IO) {
        if (!hasCallLogPermission()) {
            return@withContext emptyList()
        }

        val entries = mutableListOf<CallLogEntry>()
        var cursor: Cursor? = null

        try {
            val selection: String?
            val selectionArgs: Array<String>?

            if (typeFilter != null) {
                selection = "${CallLog.Calls.TYPE} = ?"
                selectionArgs = arrayOf(typeFilter.toAndroidType().toString())
            } else {
                selection = null
                selectionArgs = null
            }

            val sortOrder = "${CallLog.Calls.DATE} DESC LIMIT $limit OFFSET $offset"

            cursor = context.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                CALL_LOG_PROJECTION,
                selection,
                selectionArgs,
                sortOrder
            )

            cursor?.let { c ->
                val idIdx = c.getColumnIndexOrThrow(CallLog.Calls._ID)
                val numberIdx = c.getColumnIndexOrThrow(CallLog.Calls.NUMBER)
                val nameIdx = c.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME)
                val typeIdx = c.getColumnIndexOrThrow(CallLog.Calls.TYPE)
                val dateIdx = c.getColumnIndexOrThrow(CallLog.Calls.DATE)
                val durationIdx = c.getColumnIndexOrThrow(CallLog.Calls.DURATION)
                val photoIdx = c.getColumnIndexOrThrow(CallLog.Calls.CACHED_PHOTO_URI)

                while (c.moveToNext()) {
                    entries.add(
                        CallLogEntry(
                            id = c.getString(idIdx),
                            number = c.getString(numberIdx) ?: "",
                            name = c.getString(nameIdx),
                            type = CallType.fromAndroidType(c.getInt(typeIdx)),
                            date = c.getLong(dateIdx),
                            duration = c.getLong(durationIdx),
                            photoUri = c.getString(photoIdx)
                        )
                    )
                }
            }
        } finally {
            cursor?.close()
        }

        entries
    }

    private fun hasCallLogPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_CALL_LOG
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun CallType.toAndroidType(): Int = when (this) {
        CallType.INCOMING -> CallLog.Calls.INCOMING_TYPE
        CallType.OUTGOING -> CallLog.Calls.OUTGOING_TYPE
        CallType.MISSED -> CallLog.Calls.MISSED_TYPE
        CallType.REJECTED -> CallLog.Calls.REJECTED_TYPE
        CallType.BLOCKED -> CallLog.Calls.BLOCKED_TYPE
        CallType.UNKNOWN -> -1
    }
}
