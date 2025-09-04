'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

import type { StoreLocation, UserLocation, StoreSearchFilters } from '@/lib/database-types';
import StoreMap from '@/components/stores/StoreMap';
import StoreFilters from '@/components/stores/StoreFilters';
import StoreCard from '@/components/stores/StoreCard';
import ServiceBookingModal from '@/components/stores/ServiceBookingModal';
import WorkOrderModal from '@/components/stores/WorkOrderModal';

export default function StoreLocatorPage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [filters, setFilters] = useState<StoreSearchFilters>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStores();
    getUserLocation();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...stores];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply service filters
    if (filters.services && filters.services.length > 0) {
      filtered = filtered.filter(store =>
        filters.services!.some(service => store.services.includes(service))
      );
    }

    // Apply amenity filters
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(store =>
        filters.amenities!.some(amenity => store.amenities.includes(amenity))
      );
    }

    // Apply distance filter
    if (filters.maxDistance && userLocation) {
      filtered = filtered.filter(store => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.latitude,
          store.longitude
        );
        return distance <= filters.maxDistance!;
      });
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(store => store.rating >= filters.rating!);
    }

    // Apply open/closed filter
    if (filters.isOpen !== undefined) {
      filtered = filtered.filter(store => store.isOpen === filters.isOpen);
    }

    // Apply parking filter
    if (filters.hasParking !== undefined) {
      filtered = filtered.filter(store => store.parkingAvailable === filters.hasParking);
    }

    // Apply accessibility filter
    if (filters.isWheelchairAccessible !== undefined) {
      filtered = filtered.filter(store => store.wheelchairAccessible === filters.isWheelchairAccessible);
    }

    // Apply WiFi filter
    if (filters.hasWifi !== undefined) {
      filtered = filtered.filter(store => store.wifiAvailable === filters.hasWifi);
    }

    // Calculate distances and sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.map(store => ({
        ...store,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.latitude,
          store.longitude
        )
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredStores(filtered);
  }, [filters, stores, searchQuery, userLocation]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStoreSelect = (store: StoreLocation) => {
    setSelectedStore(store);
  };

  const handleServiceBooking = (store: StoreLocation) => {
    setSelectedStore(store);
    setShowServiceModal(true);
  };

  const handleWorkOrder = (store: StoreLocation) => {
    setSelectedStore(store);
    setShowWorkOrderModal(true);
  };

  const handleCallStore = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (store: StoreLocation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Store Locator</h1>
              <p className="text-gray-600 mt-2">Find stores near you and book services</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search stores by name, city, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
               
              <StoreFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={() => setFilters({})}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={getUserLocation}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location
              </button>
               
              {userLocation && (
                <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location Found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <StoreMap
                  stores={filteredStores}
                  userLocation={userLocation}
                  selectedStore={selectedStore}
                  onStoreSelect={handleStoreSelect}
                />
              </div>
            </div>

            {/* Store List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Stores ({filteredStores.length})
              </h3>
               
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    isSelected={selectedStore?.id === store.id}
                    onSelect={() => handleStoreSelect(store)}
                    onServiceBooking={() => handleServiceBooking(store)}
                    onWorkOrder={() => handleWorkOrder(store)}
                    onCall={() => handleCallStore(store.phone)}
                    onDirections={() => handleDirections(store)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Stores ({filteredStores.length})
              </h3>
               
              <div className="text-sm text-gray-600">
                {userLocation && (
                  <span>Sorted by distance from your location</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isSelected={selectedStore?.id === store.id}
                  onSelect={() => handleStoreSelect(store)}
                  onServiceBooking={() => handleServiceBooking(store)}
                  onWorkOrder={() => handleWorkOrder(store)}
                  onCall={() => handleCallStore(store.phone)}
                  onDirections={() => handleDirections(store)}
                  expanded
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showServiceModal && selectedStore && (
        <ServiceBookingModal
          store={selectedStore}
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
        />
      )}

      {showWorkOrderModal && selectedStore && (
        <WorkOrderModal
          store={selectedStore}
          isOpen={showWorkOrderModal}
          onClose={() => setShowWorkOrderModal(false)}
        />
      )}
    </div>
  );
}
