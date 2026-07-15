import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

/**
 * Drives server-side pagination for a list/table screen.
 *
 * You pass a `fetchPage` callback that receives { page, pageSize, search, ordering }
 * and resolves to { results: [...], count: <total> }. The hook owns the page
 * number, a debounced search box, and column sort, and re-fetches whenever any
 * of them change. Stale responses are ignored (last request wins), so fast
 * typing / clicking never shows out-of-order data.
 *
 * Loading is kept local (inline) rather than the global overlay so flipping
 * pages feels instant instead of flashing a full-screen spinner.
 *
 * Usage:
 *   const fetchPage = useCallback(({ page, pageSize, search, ordering }) =>
 *     getBuyerCodes({ page, page_size: pageSize, search, ordering })
 *       .then((r) => ({ results: extractItems(r).map(normalize), count: r.count })),
 *   []);
 *   const p = useServerPagination(fetchPage, { pageSize: 10 });
 */
export function useServerPagination(fetchPage, { pageSize = 10, initialOrdering = null } = {}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState(initialOrdering);
  const [rawItems, setRawItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Keep the latest fetchPage without making it a fetch dependency (callers
  // don't have to memoize perfectly to avoid request loops).
  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    fetchRef.current = fetchPage;
  });

  const reqId = useRef(0);

  // Debounce the search box; a new term always returns to page 1. Batching
  // both state updates keeps it to a single re-fetch.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let alive = true;
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    Promise.resolve(fetchRef.current({ page, pageSize, search, ordering }))
      .then((res) => {
        if (!alive || id !== reqId.current) return;
        setRawItems(Array.isArray(res?.results) ? res.results : []);
        setCount(Number.isFinite(res?.count) ? res.count : res?.results?.length || 0);
      })
      .catch((e) => {
        if (!alive || id !== reqId.current) return;
        console.warn('Pagination fetch failed:', e);
        setError(e);
        setRawItems([]);
        setCount(0);
      })
      .finally(() => {
        if (alive && id === reqId.current) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, pageSize, search, ordering, refreshKey]);

  // Safety net: if the backend ignored ?page_size (e.g. an older deployment
  // without the custom pagination class) and returned the whole result set,
  // slice it to the current page on the client so the table still shows only
  // `pageSize` rows. When the server paginates correctly, results already fit
  // in one page and this is a no-op.
  const items = useMemo(() => {
    if (rawItems.length > pageSize) {
      const start = (page - 1) * pageSize;
      return rawItems.slice(start, start + pageSize);
    }
    return rawItems;
  }, [rawItems, page, pageSize]);

  // Toggle ascending/descending on a backend field name and reset to page 1.
  const toggleSort = useCallback((field) => {
    setOrdering((prev) => (prev === field ? `-${field}` : field));
    setPage(1);
  }, []);

  // Force a re-fetch of the current page (e.g. after a delete).
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    items,
    count,
    page,
    setPage,
    pageSize,
    loading,
    error,
    searchInput,
    setSearchInput,
    ordering,
    toggleSort,
    setOrdering,
    refresh,
  };
}

export default useServerPagination;