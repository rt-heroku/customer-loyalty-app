'use client';

import { useState } from 'react';
import { ChevronDown, ArrowUpDown, Star, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import type { ProductSort } from '@/types/product';

interface ProductSortProps {
  value: ProductSort;
  onChange: (sort: ProductSort) => void;
}

export default function ProductSort({ value, onChange }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    {
      field: 'name' as const,
      label: 'Name',
      icon: ArrowUpDown,
      description: 'Sort alphabetically'
    },
    {
      field: 'price' as const,
      label: 'Price',
      icon: DollarSign,
      description: 'Sort by price'
    },
    {
      field: 'rating' as const,
      label: 'Rating',
      icon: Star,
      description: 'Sort by customer rating'
    },
    {
      field: 'createdAt' as const,
      label: 'Newest',
      icon: Calendar,
      description: 'Sort by arrival date'
    },
    {
      field: 'popularity' as const,
      label: 'Popularity',
      icon: TrendingUp,
      description: 'Sort by popularity'
    }
  ];

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.field === value.field);
    return option ? option.label : 'Sort by';
  };

  const getCurrentSortIcon = () => {
    const option = sortOptions.find(opt => opt.field === value.field);
    return option ? option.icon : ArrowUpDown;
  };

  const handleSortChange = (field: ProductSort['field']) => {
    const newDirection = value.field === field && value.direction === 'asc' ? 'desc' : 'asc';
    onChange({ field, direction: newDirection });
    setIsOpen(false);
  };

  const toggleDirection = () => {
    onChange({ ...value, direction: value.direction === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="relative">
      <div className="flex">
        {/* Sort Field Selector */}
        <div className="relative flex-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <div className="flex items-center">
              {(() => {
                const Icon = getCurrentSortIcon();
                return <Icon className="w-4 h-4 mr-2 text-gray-400" />;
              })()}
              <span>{getCurrentSortLabel()}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {sortOptions.map((option) => (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field)}
                  className={`w-full flex items-center px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    value.field === option.field ? "bg-primary-50 text-primary-700" : ""
                  }`}
                >
                  {(() => {
                    const Icon = option.icon;
                    return <Icon className="w-4 h-4 mr-2 text-gray-400" />;
                  })()}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Direction Toggle */}
        <button
          onClick={toggleDirection}
          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          title={value.direction === 'asc' ? 'Ascending' : 'Descending'}
        >
          {value.direction === 'asc' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Active Sort Indicator */}
      <div className="mt-1 text-xs text-gray-500">
        {value.field === 'name' && (
          <span>Sorting by name {value.direction === 'asc' ? 'A to Z' : 'Z to A'}</span>
        )}
        {value.field === 'price' && (
          <span>Sorting by price {value.direction === 'asc' ? 'low to high' : 'high to low'}</span>
        )}
        {value.field === 'rating' && (
          <span>Sorting by rating {value.direction === 'asc' ? 'low to high' : 'high to low'}</span>
        )}
        {value.field === 'createdAt' && (
          <span>Sorting by date {value.direction === 'asc' ? 'oldest first' : 'newest first'}</span>
        )}
        {value.field === 'popularity' && (
          <span>Sorting by popularity {value.direction === 'asc' ? 'least popular' : 'most popular'}</span>
        )}
      </div>
    </div>
  );
}
