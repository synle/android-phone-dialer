package com.phonedialer.contacts

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.database.Cursor
import android.provider.ContactsContract
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Repository for querying device contacts via ContactsContract.
 *
 * All queries run on Dispatchers.IO to avoid blocking the main thread.
 * Supports paginated fetching to handle devices with thousands of contacts
 * without loading everything into memory.
 *
 * Performance notes:
 * - Uses projection to limit columns fetched
 * - Sorts on the DB side, not in-memory
 * - Supports offset/limit pagination
 * - Closes cursors in finally blocks to prevent leaks
 */
class ContactsRepository(private val context: Context) {

    data class Contact(
        val id: String,
        val displayName: String,
        val phoneNumber: String?,
        val photoUri: String?,
        val starred: Boolean
    )

    companion object {
        private val CONTACTS_PROJECTION = arrayOf(
            ContactsContract.CommonDataKinds.Phone._ID,
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY,
            ContactsContract.CommonDataKinds.Phone.NUMBER,
            ContactsContract.CommonDataKinds.Phone.PHOTO_URI,
            ContactsContract.CommonDataKinds.Phone.STARRED
        )
    }

    /**
     * Fetches contacts with pagination.
     *
     * @param offset Number of contacts to skip
     * @param limit Maximum number of contacts to return
     * @param searchQuery Optional search filter applied to display name
     * @return List of contacts, sorted alphabetically by display name
     */
    suspend fun getContacts(
        offset: Int = 0,
        limit: Int = 50,
        searchQuery: String? = null
    ): List<Contact> = withContext(Dispatchers.IO) {
        if (!hasContactsPermission()) {
            return@withContext emptyList()
        }

        val contacts = mutableListOf<Contact>()
        var cursor: Cursor? = null

        try {
            val selection: String?
            val selectionArgs: Array<String>?

            if (!searchQuery.isNullOrBlank()) {
                selection = "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY} LIKE ?"
                selectionArgs = arrayOf("%${searchQuery}%")
            } else {
                selection = null
                selectionArgs = null
            }

            val sortOrder = "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY} ASC" +
                    " LIMIT $limit OFFSET $offset"

            cursor = context.contentResolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                CONTACTS_PROJECTION,
                selection,
                selectionArgs,
                sortOrder
            )

            cursor?.let { c ->
                val idIdx = c.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone._ID)
                val nameIdx = c.getColumnIndexOrThrow(
                    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY
                )
                val numberIdx = c.getColumnIndexOrThrow(
                    ContactsContract.CommonDataKinds.Phone.NUMBER
                )
                val photoIdx = c.getColumnIndexOrThrow(
                    ContactsContract.CommonDataKinds.Phone.PHOTO_URI
                )
                val starredIdx = c.getColumnIndexOrThrow(
                    ContactsContract.CommonDataKinds.Phone.STARRED
                )

                while (c.moveToNext()) {
                    contacts.add(
                        Contact(
                            id = c.getString(idIdx),
                            displayName = c.getString(nameIdx) ?: "",
                            phoneNumber = c.getString(numberIdx),
                            photoUri = c.getString(photoIdx),
                            starred = c.getInt(starredIdx) == 1
                        )
                    )
                }
            }
        } finally {
            cursor?.close()
        }

        contacts
    }

    /**
     * Returns the total count of contacts (optionally filtered).
     * Useful for UI pagination indicators.
     */
    suspend fun getContactsCount(searchQuery: String? = null): Int =
        withContext(Dispatchers.IO) {
            if (!hasContactsPermission()) return@withContext 0

            var cursor: Cursor? = null
            try {
                val selection: String?
                val selectionArgs: Array<String>?

                if (!searchQuery.isNullOrBlank()) {
                    selection =
                        "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY} LIKE ?"
                    selectionArgs = arrayOf("%${searchQuery}%")
                } else {
                    selection = null
                    selectionArgs = null
                }

                cursor = context.contentResolver.query(
                    ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                    arrayOf(ContactsContract.CommonDataKinds.Phone._ID),
                    selection,
                    selectionArgs,
                    null
                )
                cursor?.count ?: 0
            } finally {
                cursor?.close()
            }
        }

    private fun hasContactsPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED
    }
}
