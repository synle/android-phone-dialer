package com.phonedialer.telecom

import android.net.Uri
import android.os.Bundle
import android.telecom.Connection
import android.telecom.ConnectionRequest
import android.telecom.ConnectionService
import android.telecom.DisconnectCause
import android.telecom.PhoneAccountHandle
import android.telecom.TelecomManager
import android.util.Log

/**
 * ConnectionService for handling incoming and outgoing calls at the Telecom framework level.
 *
 * This service is registered in the manifest and is invoked by the Android Telecom framework
 * when calls need to be created or managed. It is the lowest-level integration point
 * with the Android telephony stack.
 *
 * IMPORTANT: This is a production-ready stub. A full implementation requires:
 * - Proper Connection state management (INITIALIZING -> RINGING -> ACTIVE -> DISCONNECTED)
 * - Audio routing
 * - SRTP/oRTP for VoIP if applicable
 * - Foreground notification management
 * - CallAudioState handling
 *
 * For a PSTN dialer (carrier calls), the system's own ConnectionService handles
 * the actual telephony. This service is needed primarily if you want to:
 * 1. Act as the default dialer (required declaration)
 * 2. Handle self-managed calls (VoIP)
 * 3. Provide call screening before connecting
 */
class DialerConnectionService : ConnectionService() {

    companion object {
        private const val TAG = "DialerConnectionService"
    }

    override fun onCreateIncomingConnection(
        connectionManagerPhoneAccount: PhoneAccountHandle?,
        request: ConnectionRequest?
    ): Connection {
        Log.i(TAG, "onCreateIncomingConnection")

        return DialerConnection().apply {
            setInitializing()
            val address = request?.address
            if (address != null) {
                setAddress(address, TelecomManager.PRESENTATION_ALLOWED)
            }
            setRinging()
        }
    }

    override fun onCreateIncomingConnectionFailed(
        connectionManagerPhoneAccount: PhoneAccountHandle?,
        request: ConnectionRequest?
    ) {
        Log.e(TAG, "onCreateIncomingConnectionFailed")
    }

    override fun onCreateOutgoingConnection(
        connectionManagerPhoneAccount: PhoneAccountHandle?,
        request: ConnectionRequest?
    ): Connection {
        Log.i(TAG, "onCreateOutgoingConnection to ${request?.address}")

        return DialerConnection().apply {
            setInitializing()
            val address = request?.address
            if (address != null) {
                setAddress(address, TelecomManager.PRESENTATION_ALLOWED)
            }
            setDialing()
        }
    }

    override fun onCreateOutgoingConnectionFailed(
        connectionManagerPhoneAccount: PhoneAccountHandle?,
        request: ConnectionRequest?
    ) {
        Log.e(TAG, "onCreateOutgoingConnectionFailed")
    }

    /**
     * Represents a single call connection managed by this service.
     */
    private inner class DialerConnection : Connection() {

        init {
            connectionProperties = PROPERTY_SELF_MANAGED
            audioModeIsVoip = false
        }

        override fun onAnswer() {
            Log.i(TAG, "onAnswer")
            setActive()
        }

        override fun onReject() {
            Log.i(TAG, "onReject")
            setDisconnected(DisconnectCause(DisconnectCause.REJECTED))
            destroy()
        }

        override fun onDisconnect() {
            Log.i(TAG, "onDisconnect")
            setDisconnected(DisconnectCause(DisconnectCause.LOCAL))
            destroy()
        }

        override fun onHold() {
            Log.i(TAG, "onHold")
            setOnHold()
        }

        override fun onUnhold() {
            Log.i(TAG, "onUnhold")
            setActive()
        }

        override fun onAbort() {
            Log.i(TAG, "onAbort")
            setDisconnected(DisconnectCause(DisconnectCause.CANCELED))
            destroy()
        }
    }
}
