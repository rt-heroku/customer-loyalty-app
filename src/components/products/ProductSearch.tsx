'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductSearchProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export default function ProductSearch({ value, onChange, placeholder = "Search products..." }: ProductSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent and trending searches
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        // Load recent searches from localStorage
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent.slice(0, 5));

        // Load trending searches
        const trendingResponse = await fetch('/api/products/trending-searches');
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrendingSearches(trendingData.trendingSearches);
        }
      } catch (error) {
        console.error('Error loading search data:', error);
      }
    };

    loadSearchData();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          } else if (value.trim()) {
            handleSearch(value.trim());
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, value]);

  // Search suggestions
  const searchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products/search-suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value) {
        searchSuggestions(value);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSuggestionSelect = (product: Product) => {
    onChange(product.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    addToRecentSearches(product.name);
    inputRef.current?.blur();
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      onChange(query.trim());
      addToRecentSearches(query.trim());
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleRecentSearchSelect = (search: string) => {
    onChange(search);
    setIsOpen(false);
    setSelectedIndex(-1);
    addToRecentSearches(search);
    inputRef.current?.blur();
  };

  const handleTrendingSearchSelect = (search: string) => {
    onChange(search);
    setIsOpen(false);
    setSelectedIndex(-1);
    addToRecentSearches(search);
    inputRef.current?.blur();
  };

  const addToRecentSearches = (search: string) => {
    const recent = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const clearSearch = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>');
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                Products
              </div>
              {suggestions.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionSelect(product)}
                  className={cn(
                    "w-full flex items-center space-x-3 p-2 rounded-md text-left hover:bg-gray-50 transition-colors",
                    selectedIndex === index && "bg-primary-50 border-primary-200"
                  )}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0">
                    {product.images[0] && (
                      <img
                        src={product.images[0].thumbnailUrl}
                        alt={product.images[0].alt}
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(product.name, value)
                      }}
                    />
                    <div className="text-xs text-gray-500 truncate">
                      {product.brand} • {product.category}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${product.price}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchSelect(search)}
                  className="w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-gray-50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {trendingSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                Trending
              </div>
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingSearchSelect(search)}
                  className="w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && suggestions.length === 0 && value && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No products found for "{value}"</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories</p>
            </div>
          )}

          {/* Search Button */}
          {value && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => handleSearch(value)}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Search for "{value}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
