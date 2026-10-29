"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to handle debounced search input with immediate loading indicator.
 */
export function useSearchInput(initialValue = "", delay = 300) {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (search.trim() !== debouncedSearch.trim()) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch, delay]);

  const clear = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setIsSearching(false);
  }, []);

  return {
    search,
    setSearch,
    debouncedSearch,
    isSearching,
    setIsSearching,
    clear,
  };
}
