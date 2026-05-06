import { useCallback, useEffect, useRef } from 'react';
import { useCallLogStore } from '../core/store';
import { NativeCallLog } from '../services/NativeCallLog';
import { checkPermission } from '../services/PermissionsService';
import type { CallType } from '../core/types';

const PAGE_SIZE = 50;

/**
 * Hook for paginated call log fetching.
 *
 * - Fetches initial page on mount
 * - Provides loadMore() for infinite scroll
 * - Provides refresh() for pull-to-refresh
 * - Supports type filtering
 */
export function useCallLogs(typeFilter?: CallType) {
  const { entries, isLoading, hasMore, setEntries, appendEntries, setLoading, setHasMore, reset } =
    useCallLogStore();

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchLogs = useCallback(
    async (offset: number, isAppend: boolean) => {
      const hasPermission = await checkPermission('READ_CALL_LOG');
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await NativeCallLog.getCallLogs(offset, PAGE_SIZE, typeFilter ?? null);

        if (!isMountedRef.current) return;

        if (isAppend) {
          appendEntries(results);
        } else {
          setEntries(results);
        }
        setHasMore(results.length === PAGE_SIZE);
      } catch (error) {
        console.error('Failed to fetch call logs:', error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [typeFilter, setEntries, appendEntries, setLoading, setHasMore],
  );

  const loadInitial = useCallback(() => {
    reset();
    fetchLogs(0, false);
  }, [fetchLogs, reset]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchLogs(entries.length, true);
  }, [isLoading, hasMore, entries.length, fetchLogs]);

  useEffect(() => {
    loadInitial();
  }, [typeFilter]);

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    refresh: loadInitial,
  };
}
