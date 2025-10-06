'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

interface TopNavProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export default function TopNav({ onMenuToggle, isMenuOpen }: TopNavProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('TopNav isMenuOpen state:', isMenuOpen);
  }, [isMenuOpen]);

  if (!user) return null;

  const handleMenuToggle = () => {
    console.log('TopNav: Menu toggle clicked, current state:', isMenuOpen);
    onMenuToggle();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button and search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenuToggle}
            className={cn(
              'rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
              isMenuOpen && 'bg-primary-50 text-primary-600'
            )}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-200 px-4 py-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="cursor-pointer px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-primary-500"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          Welcome to the Loyalty Program!
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          You've earned 100 bonus points for joining.
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="cursor-pointer px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          New reward available!
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Redeem your points for a free coffee.
                        </p>
                        <p className="mt-1 text-xs text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-2">
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-bold text-white">
                {getInitials(`${user.firstName} ${user.lastName}`)}
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.tier && (
                    <div className="mt-1 text-xs font-medium text-primary-600">
                      {user.tier} Member
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      /* Navigate to profile */
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      /* Navigate to settings */
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      /* Navigate to help */
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={logout}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search - shown when menu is closed */}
      {!isMenuOpen && (
        <div className="px-4 pb-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
    </header>
  );
}
