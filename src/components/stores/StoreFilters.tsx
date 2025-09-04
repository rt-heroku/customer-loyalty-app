'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { StoreSearchFilters } from '@/lib/database-types';

interface StoreFiltersProps {
  filters: StoreSearchFilters;
  onFiltersChange: (filters: StoreSearchFilters) => void;
  onClearFilters: () => void;
}

export default function StoreFilters({ filters, onFiltersChange, onClearFilters }: StoreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const serviceOptions = [
    'Repair',
    'Maintenance',
    'Installation',
    'Consultation',
    'Training',
    'Parts',
    'Warranty'
  ];

  const amenityOptions = [
    'Parking',
    'Wheelchair Accessible',
    'WiFi',
    'Restroom',
    'Waiting Area',
    'Coffee/Refreshments',
    'Child Care',
    'ATM'
  ];

  const distanceOptions = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' }
  ];

  const ratingOptions = [
    { value: 4.5, label: '4.5+ stars' },
    { value: 4.0, label: '4.0+ stars' },
    { value: 3.5, label: '3.5+ stars' },
    { value: 3.0, label: '3.0+ stars' }
  ];

  const updateFilter = <K extends keyof StoreSearchFilters>(
    key: K,
    value: StoreSearchFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

        const toggleArrayFilter = (
        key: 'services' | 'amenities',
        value: string
      ) => {
        const currentValues = (filters[key] as string[]) || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        updateFilter(key, newValues);
      };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : value !== '')
  );

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          hasActiveFilters
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-white text-primary-600 rounded-full text-xs flex items-center justify-center font-bold">
            {Object.values(filters).filter(v => 
              v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')
            ).length}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Services */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Services</h4>
              <div className="space-y-2">
                {serviceOptions.map((service) => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.services || []).includes(service)}
                      onChange={() => toggleArrayFilter('services', service)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
              <div className="space-y-2">
                {amenityOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.amenities || []).includes(amenity)}
                      onChange={() => toggleArrayFilter('amenities', amenity)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Maximum Distance</h4>
              <select
                value={filters.maxDistance || ''}
                onChange={(e) => updateFilter('maxDistance', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">No limit</option>
                {distanceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
              <select
                value={filters.rating || ''}
                onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any rating</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filters */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Status</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isOpen === true}
                    onChange={(e) => updateFilter('isOpen', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Open now</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasParking === true}
                    onChange={(e) => updateFilter('hasParking', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has parking</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isWheelchairAccessible === true}
                    onChange={(e) => updateFilter('isWheelchairAccessible', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Wheelchair accessible</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasWifi === true}
                    onChange={(e) => updateFilter('hasWifi', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has WiFi</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClearFilters}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
