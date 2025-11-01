/**
 * Advanced Search Bar with Autocomplete
 * 
 * Provides real-time search suggestions and advanced filtering.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, BookOpen, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchSuggestion {
  text: string;
  type: 'course' | 'teacher' | 'category';
  count: number;
}

interface SearchBarProps {
  locale: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  locale,
  placeholder = 'Search courses, teachers, categories...',
  onSearch,
  showSuggestions = true,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch suggestions with debounce
  const fetchSuggestions = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('[Search] Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (showSuggestions) {
      setIsOpen(true);
      fetchSuggestions(value);
    }
  };

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsOpen(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/${locale}/student/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [locale, router, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'teacher':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'category':
        return <Tag className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="
            w-full h-12 pl-12 pr-12 
            bg-white border-2 border-gray-200 
            rounded-xl
            text-[#17224D] placeholder-gray-400
            focus:outline-none focus:border-[#007FFF] focus:ring-4 focus:ring-[#007FFF]/10
            transition-all duration-200
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-4 
              flex items-center
              text-gray-400 hover:text-gray-600
              transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-12 flex items-center pr-4">
            <div className="w-4 h-4 border-2 border-[#007FFF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="
              absolute top-full left-0 right-0 mt-2
              bg-white border border-gray-200 rounded-xl shadow-lg
              overflow-hidden z-50
            "
          >
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3
                    text-left transition-colors
                    ${
                      index === selectedIndex
                        ? 'bg-[#007FFF]/10'
                        : 'hover:bg-gray-50'
                    }
                  `}
                >
                  {getSuggestionIcon(suggestion.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#17224D] truncate">
                      {suggestion.text}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {suggestion.type}
                    </p>
                  </div>

                  {suggestion.count > 1 && (
                    <span className="text-xs text-gray-400">
                      {suggestion.count} results
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
