'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Crown,
  Receipt,
  User,
  MessageCircle,
  ShoppingBag,
  Settings,
  HelpCircle,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  Truck,
  Ticket,
  Heart,
  Tag,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import navigationConfig from '@/config/navigation.json';
import { NavigationItem, SidebarProps } from '@/types/navigation';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Home,
  Crown,
  Receipt,
  User,
  MessageCircle,
  ShoppingBag,
  Settings,
  HelpCircle,
  Truck,
  Ticket,
  Heart,
  Tag,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some(
        subItem => subItem.href && pathname === subItem.href
      );
    }
    return false;
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.submenu) {
      toggleExpanded(item.id);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const filteredMainMenu = navigationConfig.mainMenu.filter(
    item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submenu?.some(subItem =>
        subItem.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredBottomMenu = navigationConfig.bottomMenu.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMenuItem = (item: NavigationItem, level: number = 0) => {
    const Icon = iconMap[item.icon] || Home;
    const isActive = isItemActive(item);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={cn(
            'group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all duration-200',
            'hover:bg-primary-50 hover:text-primary-700',
            isActive &&
              'border border-primary-200 bg-primary-100 text-primary-700',
            level > 0 && 'ml-4 text-sm',
            !item.href && hasSubmenu && 'cursor-pointer'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center space-x-3">
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 group-hover:text-primary-600'
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{item.label}</div>
              {item.description && (
                <div className="hidden truncate text-xs text-gray-500 lg:block">
                  {item.description}
                </div>
              )}
            </div>
          </div>

          {hasSubmenu && (
            <ChevronDown
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                isExpanded ? 'rotate-180' : 'rotate-0',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            />
          )}

          {item.badge && (
            <span className="ml-2 rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
              {item.badge}
            </span>
          )}
        </button>

        {hasSubmenu && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.submenu!.map(subItem => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          border: isOpen ? '2px solid green' : '2px solid red', // Debug border
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Loyalty App</h1>
              <p className="text-sm text-gray-500">Customer Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6L18 18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* User Profile */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-lg font-bold text-white">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="truncate text-sm text-gray-500">{user.email}</div>
              {user.tier && (
                <div className="text-xs font-medium text-primary-600">
                  {user.tier} Member
                </div>
              )}
            </div>
            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Main Menu
            </div>
            {filteredMainMenu.map(item => renderMenuItem(item))}
          </nav>

          <nav className="space-y-2 border-t border-gray-200 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              More
            </div>
            {filteredBottomMenu.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
