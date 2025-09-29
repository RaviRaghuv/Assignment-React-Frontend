import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchInput = ({ 
  value = '', 
  onChange, 
  placeholder = 'Search...', 
  debounceMs = 300,
  className = '',
  showClearButton = true,
  loading = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced onChange effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        setIsSearching(true);
        onChange(localValue);
        // Reset searching state after a short delay
        setTimeout(() => setIsSearching(false), 200);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs, value]);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  const handleInputChange = useCallback((e) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon 
            className={`h-5 w-5 ${
              isSearching || loading 
                ? 'text-primary-500 animate-pulse' 
                : 'text-gray-400'
            }`} 
          />
        </div>
        
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 sm:text-sm"
        />
        
        {showClearButton && localValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Loading indicator */}
      {(isSearching || loading) && (
        <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
