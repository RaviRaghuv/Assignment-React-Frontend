import { useState, useEffect, useCallback } from 'react';

export const useSearch = (initialValue = '', debounceMs = 300) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search value
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchValue, debounceMs]);

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setDebouncedValue('');
  }, []);

  return {
    searchValue,
    debouncedValue,
    isSearching,
    handleSearchChange,
    clearSearch,
  };
};

export default useSearch;
