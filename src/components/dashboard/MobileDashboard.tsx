'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Gift, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Bell,
  ChevronRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { pwaManager } from '@/lib/pwa';
import { useSwipeGesture } from '@/components/layout/MobileBottomNav';
import { getLoyaltyTierInfo } from '@/lib/utils';

interface MobileDashboardProps {
  stats: any;
  recentTransactions: any[];
  recentActivity: any[];
}

export default function MobileDashboard({ stats, recentTransactions, recentActivity }: MobileDashboardProps) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showQuickActions, setShowQuickActions] = useState(false);

  const tierInfo = getLoyaltyTierInfo(user?.tier || 'bronze');

  // Swipe gesture handlers
  const { handleTouchStart, handleTouchEnd } = useSwipeGesture(
    () => setShowQuickActions(true), // Swipe up
    () => setShowQuickActions(false) // Swipe down
  );

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    pwaManager.hapticFeedback('medium');
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload data here
    window.location.reload();
    setIsRefreshing(false);
  };

  // Toggle card expansion
  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
    pwaManager.hapticFeedback('light');
  };

  // Quick action handlers
  const quickActions = [
    {
      id: 'scan',
      label: 'Scan QR',
      icon: Plus,
      action: () => {
        pwaManager.hapticFeedback('medium');
        // Navigate to scan page
      },
      color: 'bg-blue-500'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => {
        pwaManager.hapticFeedback('medium');
        // Navigate to notifications
      },
      color: 'bg-orange-500'
    },
    {
      id: 'stores',
      label: 'Find Store',
      icon: MapPin,
      action: () => {
        pwaManager.hapticFeedback('medium');
        // Navigate to stores
      },
      color: 'bg-green-500'
    }
  ];

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-20 md:hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with pull-to-refresh */}
      <motion.div
        className="sticky top-0 z-30 bg-white shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'Member'}!
              </h1>
              <p className="text-gray-600 text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <motion.button
              onClick={handleRefresh}
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              <RefreshCw size={20} className="text-gray-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 space-y-4">
        {/* Loyalty Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Loyalty Status</h2>
              <p className="text-blue-100 text-sm">{user?.tier || 'Bronze'} Member</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{user?.points || 0}</div>
              <div className="text-blue-100 text-sm">Points</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Current Tier</span>
              <span>{tierInfo.pointsToNext} to next tier</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3">
              <motion.div
                className="bg-white h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((user?.points || 0) / (tierInfo.pointsToNext + (user?.points || 0))) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <button className="flex-1 bg-white bg-opacity-20 rounded-xl py-2 px-4 text-sm font-medium hover:bg-opacity-30 transition-all">
              View Rewards
            </button>
            <button className="flex-1 bg-white bg-opacity-20 rounded-xl py-2 px-4 text-sm font-medium hover:bg-opacity-30 transition-all">
              Earn More
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${stats?.totalSpent || 0}
                </div>
                <div className="text-gray-600 text-sm">Total Spent</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Star size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.visitCount || 0}
                </div>
                <div className="text-gray-600 text-sm">Store Visits</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button 
                onClick={() => toggleCard('transactions')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <motion.div
                  animate={{ rotate: expandedCards.has('transactions') ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </motion.div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {expandedCards.has('transactions') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {recentTransactions.slice(0, 3).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          +{transaction.points} pts
                        </div>
                        <div className="text-sm text-gray-600">
                          ${transaction.amount}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button 
                onClick={() => toggleCard('activity')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <motion.div
                  animate={{ rotate: expandedCards.has('activity') ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </motion.div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {expandedCards.has('activity') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Gift size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {activity.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Actions FAB */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-24 right-4 z-50 space-y-3"
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className={`${action.color} w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <action.icon size={24} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
