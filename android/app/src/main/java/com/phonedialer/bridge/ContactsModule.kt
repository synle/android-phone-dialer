package com.phonedialer.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.phonedialer.contacts.ContactsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * React Native bridge module for contacts access.
 *
 * Exposes:
 * - getContacts(offset, limit, searchQuery?): Promise<Array>
 * - getContactsCount(searchQuery?): Promise<Int>
 *
 * All queries are dispatched to IO via coroutines.
 * The coroutine scope is cancelled when the catalyst instance is destroyed.
 */
class ContactsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val repository = ContactsRepository(reactContext)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    override fun getName(): String = "ContactsModule"

    override fun invalidate() {
        scope.cancel()
        super.invalidate()
    }

    @ReactMethod
    fun getContacts(offset: Int, limit: Int, searchQuery: String?, promise: Promise) {
        scope.launch {
            try {
                val contacts = repository.getContacts(offset, limit, searchQuery)
                val result = Arguments.createArray()

                for (contact in contacts) {
                    val map = Arguments.createMap().apply {
                        putString("id", contact.id)
                        putString("displayName", contact.displayName)
                        putString("phoneNumber", contact.phoneNumber)
                        putString("photoUri", contact.photoUri)
                        putBoolean("starred", contact.starred)
                    }
                    result.pushMap(map)
                }

                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("CONTACTS_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getContactsCount(searchQuery: String?, promise: Promise) {
        scope.launch {
            try {
                val count = repository.getContactsCount(searchQuery)
                promise.resolve(count)
            } catch (e: Exception) {
                promise.reject("CONTACTS_COUNT_ERROR", e.message, e)
            }
        }
    }
}
