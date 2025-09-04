'use client';

import { MapPin, Clock, Phone, Mail, Globe, Star, Navigation, Calendar, Wrench, Car, Wifi, Accessibility } from 'lucide-react';
import type { StoreLocation } from '@/lib/database-types';

interface StoreCardProps {
  store: StoreLocation;
  isSelected?: boolean;
  expanded?: boolean;
  onSelect: () => void;
  onServiceBooking: () => void;
  onWorkOrder: () => void;
  onCall: () => void;
  onDirections: () => void;
}

export default function StoreCard({
  store,
  isSelected = false,
  expanded = false,
  onSelect,
  onServiceBooking,
  onWorkOrder,
  onCall,
  onDirections
}: StoreCardProps) {
  const getCurrentDayHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return store.hours[today as keyof typeof store.hours];
  };

  const currentHours = getCurrentDayHours();
  const isOpen = store.isOpen && !currentHours.isClosed;

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-primary-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
              {store.name}
            </h3>
            
            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{store.city}, {store.state}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-900">{store.rating}</span>
            <span className="text-xs text-gray-500">({store.reviewCount})</span>
          </div>
        </div>

        {/* Status and Distance */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isOpen ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-xs font-medium ${
              isOpen ? 'text-green-600' : 'text-red-600'
            }`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          
          {store.distance && (
            <span className="text-xs text-gray-600">
              {store.distance.toFixed(1)} km away
            </span>
          )}
        </div>

        {/* Hours */}
        <div className="flex items-center space-x-2 mb-3 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          <span>
            {currentHours.isClosed ? 'Closed today' : `${currentHours.open} - ${currentHours.close}`}
          </span>
        </div>

        {/* Services Preview */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {store.services.slice(0, 3).map((service) => (
              <span
                key={service}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {service}
              </span>
            ))}
            {store.services.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{store.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Amenities Icons */}
        <div className="flex items-center space-x-3 mb-4 text-xs text-gray-600">
          {store.parkingAvailable && (
            <div className="flex items-center space-x-1">
              <Car className="w-3 h-3" />
              <span>Parking</span>
            </div>
          )}
          
          {store.wifiAvailable && (
            <div className="flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span>WiFi</span>
            </div>
          )}
          
          {store.wheelchairAccessible && (
            <div className="flex items-center space-x-1">
                              <Accessibility className="w-3 h-3" />
              <span>Accessible</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onServiceBooking();
            }}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Calendar className="w-3 h-3" />
            <span>Book Service</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWorkOrder();
            }}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Wrench className="w-3 h-3" />
            <span>Work Order</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCall();
            }}
            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirections();
            }}
            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
          >
            <Navigation className="w-3 h-3" />
            <span>Directions</span>
          </button>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {/* Full Address */}
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Address:</div>
              <div>{store.address}</div>
              <div>{store.city}, {store.state} {store.zipCode}</div>
            </div>

            {/* Contact Info */}
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Contact:</div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3" />
                <span>{store.phone}</span>
              </div>
              {store.email && (
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="w-3 h-3" />
                  <span>{store.email}</span>
                </div>
              )}
              {store.website && (
                <div className="flex items-center space-x-2 mt-1">
                  <Globe className="w-3 h-3" />
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    {store.website}
                  </span>
                </div>
              )}
            </div>

            {/* All Services */}
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Services:</div>
              <div className="flex flex-wrap gap-1">
                {store.services.map((service) => (
                  <span
                    key={service}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* All Amenities */}
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Amenities:</div>
              <div className="flex flex-wrap gap-1">
                {store.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Store Description */}
            {store.description && (
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-1">About:</div>
                <p>{store.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
