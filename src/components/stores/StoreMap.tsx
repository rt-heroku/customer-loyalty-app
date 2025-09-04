'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Star } from 'lucide-react';
import type { StoreLocation, UserLocation } from '@/lib/database-types';

interface StoreMapProps {
  stores: StoreLocation[];
  userLocation: UserLocation | null;
  selectedStore: StoreLocation | null;
  onStoreSelect: (store: StoreLocation) => void;
}

export default function StoreMap({ stores, userLocation, selectedStore, onStoreSelect }: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current && !mapLoaded) {
      initializeMap();
    }
  }, [mapRef, mapLoaded]);

  useEffect(() => {
    if (mapLoaded && stores.length > 0) {
      updateMapMarkers();
    }
  }, [stores, selectedStore, mapLoaded]);

  const initializeMap = () => {
    // For now, we'll create a simple map representation
    // In a real implementation, you would integrate with Google Maps or Mapbox
    setMapLoaded(true);
  };

  const updateMapMarkers = () => {
    // This would update map markers in a real map implementation
  };

  const getMapCenter = () => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    
    if (stores.length > 0) {
      const avgLat = stores.reduce((sum, store) => sum + store.latitude, 0) / stores.length;
      const avgLng = stores.reduce((sum, store) => sum + store.longitude, 0) / stores.length;
      return { lat: avgLat, lng: avgLng };
    }
    
    return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
  };

  const center = getMapCenter();

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
          `
        }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: '50%',
              top: '50%'
            }}
          >
            <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              You are here
            </div>
          </div>
        )}

        {/* Store Markers */}
        {stores.map((store) => {
          const isSelected = selectedStore?.id === store.id;
          const distance = store.distance;
          
          // Calculate position based on store coordinates relative to center
          const latDiff = store.latitude - center.lat;
          const lngDiff = store.longitude - center.lng;
          
          // Convert to pixel positions (simplified)
          const x = 50 + (lngDiff * 1000) % 80; // Keep within bounds
          const y = 50 + (latDiff * 1000) % 80;
          
          return (
            <div
              key={store.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 ${
                isSelected ? 'z-30' : ''
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`
              }}
              onClick={() => onStoreSelect(store)}
            >
              {/* Store Marker */}
              <div className={`w-8 h-8 rounded-full border-4 shadow-lg flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? 'bg-primary-600 border-white scale-125'
                  : 'bg-white border-primary-600 hover:scale-110'
              }`}>
                <MapPin className={`w-4 h-4 ${
                  isSelected ? 'text-white' : 'text-primary-600'
                }`} />
              </div>
              
              {/* Store Info Popup */}
              {isSelected && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-40">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {store.name}
                      </h3>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{store.address}</span>
                        </div>
                        
                        {distance && (
                          <div className="flex items-center">
                            <Navigation className="w-3 h-3 mr-1" />
                            <span>{distance.toFixed(1)} km away</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          <span>{store.rating} ({store.reviewCount} reviews)</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className={store.isOpen ? 'text-green-600' : 'text-red-600'}>
                            {store.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${store.phone}`;
                          }}
                          className="flex-1 bg-primary-600 text-white text-xs px-2 py-1 rounded hover:bg-primary-700 transition-colors"
                        >
                          <Phone className="w-3 h-3 inline mr-1" />
                          Call
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`,
                              '_blank'
                            );
                          }}
                          className="flex-1 bg-gray-600 text-white text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Navigation className="w-3 h-3 inline mr-1" />
                          Directions
                        </button>
                      </div>
                    </div>
                    
                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStoreSelect(store);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={() => {
              if (userLocation) {
                // Center map on user location
              }
            }}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Center on my location"
          >
            <Navigation className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => {
              // Zoom in
            }}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom in"
          >
            <span className="text-gray-600 font-bold text-lg">+</span>
          </button>
          
          <button
            onClick={() => {
              // Zoom out
            }}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom out"
          >
            <span className="text-gray-600 font-bold text-lg">−</span>
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
              <span>Your location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white rounded-full border-2 border-primary-600"></div>
              <span>Store</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-600 rounded-full border-2 border-white"></div>
              <span>Selected store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Integration Notice */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">Map Integration</h4>
            <p className="text-sm text-blue-700 mt-1">
              This is a simplified map view. For production use, integrate with Google Maps or Mapbox API 
              for full interactive mapping capabilities, real-time traffic, and turn-by-turn navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
