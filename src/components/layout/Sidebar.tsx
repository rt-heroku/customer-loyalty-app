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
  Tag
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
      return item.submenu.some(subItem => subItem.href && pathname === subItem.href);
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

  const filteredMainMenu = navigationConfig.mainMenu.filter(item =>
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
            "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 group",
            "hover:bg-primary-50 hover:text-primary-700",
            isActive && "bg-primary-100 text-primary-700 border border-primary-200",
            level > 0 && "ml-4 text-sm",
            !item.href && hasSubmenu && "cursor-pointer"
          )}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0",
              isActive ? "text-primary-600" : "text-gray-500 group-hover:text-primary-600"
            )} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500 truncate hidden lg:block">
                  {item.description}
                </div>
              )}
            </div>
          </div>
          
          {hasSubmenu && (
            <ChevronDown className={cn(
              "w-4 h-4 flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0",
              isActive ? "text-primary-600" : "text-gray-400"
            )} />
          )}
          
          {item.badge && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          border: isOpen ? '2px solid green' : '2px solid red' // Debug border
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Loyalty App</h1>
              <p className="text-sm text-gray-500">Customer Portal</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
              className="w-5 h-5"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6L18 18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-500 truncate">{user.email}</div>
              {user.tier && (
                <div className="text-xs text-primary-600 font-medium">
                  {user.tier} Member
                </div>
              )}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </div>
            {filteredMainMenu.map(item => renderMenuItem(item))}
          </nav>

          <nav className="p-4 space-y-2 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              More
            </div>
            {filteredBottomMenu.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
