import { useCallback, useEffect, useRef } from 'react';
import { useContactsStore } from '../core/store';
import { NativeContacts } from '../services/NativeContacts';
import { checkPermission } from '../services/PermissionsService';

const PAGE_SIZE = 50;

/**
 * Hook for paginated contact fetching.
 *
 * - Fetches initial page on mount (if permission granted)
 * - Provides loadMore() for infinite scroll
 * - Provides refresh() for pull-to-refresh
 * - Debounces search queries
 */
export function useContacts() {
  const {
    contacts,
    sections,
    isLoading,
    searchQuery,
    hasMore,
    setContacts,
    appendContacts,
    setLoading,
    setSearchQuery,
    setHasMore,
    reset,
  } = useContactsStore();

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchContacts = useCallback(
    async (offset: number, query: string | null, isAppend: boolean) => {
      const hasPermission = await checkPermission('READ_CONTACTS');
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await NativeContacts.getContacts(offset, PAGE_SIZE, query || null);
        const count = await NativeContacts.getContactsCount(query || null);

        if (!isMountedRef.current) return;

        if (isAppend) {
          appendContacts(results);
        } else {
          setContacts(results, count);
        }
        setHasMore(offset + results.length < count);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [setContacts, appendContacts, setLoading, setHasMore],
  );

  const loadInitial = useCallback(() => {
    reset();
    fetchContacts(0, searchQuery || null, false);
  }, [fetchContacts, searchQuery, reset]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchContacts(contacts.length, searchQuery || null, true);
  }, [isLoading, hasMore, contacts.length, searchQuery, fetchContacts]);

  const search = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        reset();
        fetchContacts(0, query || null, false);
      }, 300);
    },
    [setSearchQuery, reset, fetchContacts],
  );

  useEffect(() => {
    loadInitial();
  }, []);

  return {
    contacts,
    sections,
    isLoading,
    hasMore,
    searchQuery,
    loadMore,
    refresh: loadInitial,
    search,
  };
}
