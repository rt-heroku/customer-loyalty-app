'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Star,
  Gift,
  User,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate, getLoyaltyTierInfo } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  // Test function to manually toggle sidebar
  const testSidebarToggle = () => {
    console.log('Test button clicked');
    // This will be handled by the AppLayout
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      await fetchDashboardStats();
    };

    loadDashboardData();
  }, [fetchDashboardStats]);

  if (!user) return null;

  const tierInfo = getLoyaltyTierInfo(user.tier || 'Bronze');
  const nextTier = tierInfo.nextTier;
  const pointsToNextTier = nextTier ? tierInfo.pointsToNext : 0;

  return (
    <>
      {/* Test button for debugging */}
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <button 
          onClick={testSidebarToggle}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test Sidebar Toggle (Debug)
        </button>
        <p className="text-sm text-yellow-700 mt-2">
          Click this button to test if the sidebar toggle is working. Check the console for logs.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your loyalty account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Spent */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(parseFloat(stats.totalSpent)) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Visit Count */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Store Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? stats.visitCount : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatDate(stats.memberSince, { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Current Tier */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Tier</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.tier ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1) : 'Bronze'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loyalty Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Loyalty Status</h2>
              
              {/* Current Points */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Points</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {user.points || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, ((user.points || 0) / (tierInfo.pointsToNext + (user.points || 0))) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {pointsToNextTier > 0 
                    ? `${pointsToNextTier} points to reach ${nextTier} tier`
                    : 'You\'ve reached the highest tier!'
                  }
                </p>
              </div>

              {/* Tier Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Tier Benefits</h3>
                <div className="space-y-3">
                  {tierInfo.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/profile"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">View Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                </a>
                
                <a
                  href="/loyalty"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Redeem Rewards</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                </a>
                
                <a
                  href="/transactions"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">View Transactions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Welcome to the Loyalty Program!</p>
                    <p className="text-xs text-gray-500 mt-1">You've earned 100 bonus points for joining.</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New reward available!</p>
                    <p className="text-xs text-gray-500 mt-1">Redeem your points for a free coffee.</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
