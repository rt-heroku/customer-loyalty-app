'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Gift, 
  Star, 
  TrendingUp, 
  Calendar, 
  Search, 
  Crown,
  Award,
  Users,
  Copy,
  Check,
  X,
  AlertCircle,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { cn, formatCurrency, formatDate, getLoyaltyTierInfo } from '@/lib/utils';

interface PointsData {
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalTransactions: number;
  tier: string;
  memberStatus: string;
  enrollmentDate: string;
  history: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Reward {
  id: number;
  reward_name: string;
  reward_type: string;
  points_required: number;
  discount_percentage?: number;
  discount_amount?: number;
  description: string;
  terms_conditions: string;
  valid_from: string;
  valid_until?: string;
  max_redemptions?: number;
  current_redemptions: number;
  tier_restriction?: string;
  is_active: boolean;
  isAvailable: boolean;
  remainingRedemptions?: number;
}

interface RewardsData {
  rewards: Reward[];
  redeemedRewards: any[];
  customerTier: string;
}

export default function LoyaltyPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemQuantity, setRedeemQuantity] = useState(1);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch points data
      const pointsResponse = await fetch('/api/loyalty/points');
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setPointsData(pointsData);
      }

      // Fetch rewards data
      const rewardsResponse = await fetch('/api/loyalty/rewards');
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewardsData(rewardsData);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedReward) return;

    try {
      setIsRedeeming(true);
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          quantity: redeemQuantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Reward redeemed successfully!');
        setShowRedeemModal(false);
        setSelectedReward(null);
        setRedeemQuantity(1);
        await refreshUser();
        fetchLoyaltyData(); // Refresh data
      } else {
        showToast('error', data.error || 'Failed to redeem reward');
      }
    } catch (error) {
      showToast('error', 'Network error occurred');
    } finally {
      setIsRedeeming(false);
    }
  };

  const copyReferralCode = () => {
    const referralCode = `LOY${user?.id?.toString().padStart(3, '0')}`;
    navigator.clipboard.writeText(referralCode);
    showToast('success', 'Referral code copied to clipboard!');
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const filteredRewards = rewardsData?.rewards.filter(reward =>
    reward.reward_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loyalty program...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tierInfo = getLoyaltyTierInfo(pointsData?.tier || 'Bronze');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'referrals', label: 'Referrals', icon: Users },
  ];

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Program</h1>
          <p className="text-gray-600">Manage your points, rewards, and tier status</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Points Overview Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Balance */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {pointsData?.currentBalance?.toLocaleString() || 0}
              </div>
              <p className="text-gray-600">Current Points</p>
            </div>

            {/* Total Earned */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {pointsData?.totalEarned?.toLocaleString() || 0}
              </div>
              <p className="text-gray-600">Total Earned</p>
            </div>

            {/* Total Redeemed */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {pointsData?.totalRedeemed?.toLocaleString() || 0}
              </div>
              <p className="text-gray-600">Total Redeemed</p>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{pointsData?.tier || 'Bronze'} Member</h3>
                  <p className="text-sm text-gray-600">Progress to {tierInfo.nextTier}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {tierInfo.pointsToNext} points to go
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(tierInfo.progressToNext)}% complete
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${tierInfo.progressToNext}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Loyalty Overview</h2>
              
              {/* Tier Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your {pointsData?.tier || 'Bronze'} Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tierInfo.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{pointsData?.totalTransactions || 0}</div>
                  <p className="text-sm text-blue-700">Total Transactions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-900">
                    {formatDate(pointsData?.enrollmentDate || new Date().toISOString(), { month: 'short', year: 'numeric' })}
                  </div>
                  <p className="text-sm text-green-700">Member Since</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-900">{pointsData?.tier || 'Bronze'}</div>
                  <p className="text-sm text-purple-700">Current Tier</p>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Available Rewards</h2>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rewards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => (
                  <div key={reward.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {reward.reward_type === 'discount' ? (
                          <Percent className="w-6 h-6 text-primary-600" />
                        ) : (
                          <Gift className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">{reward.points_required}</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{reward.reward_name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                    {reward.reward_type === 'discount' && (
                      <div className="mb-4">
                        {reward.discount_percentage ? (
                          <div className="text-lg font-bold text-green-600">
                            {reward.discount_percentage}% OFF
                          </div>
                        ) : reward.discount_amount ? (
                          <div className="text-lg font-bold text-green-600">
                            ${reward.discount_amount} OFF
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {reward.remainingRedemptions !== null && (
                          <span>{reward.remainingRedemptions} left</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowRedeemModal(true);
                        }}
                        disabled={!reward.isAvailable}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          reward.isAvailable
                            ? "bg-primary-600 text-white hover:bg-primary-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        {reward.isAvailable ? 'Redeem' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRewards.length === 0 && (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No rewards found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Points History</h2>
              
              <div className="space-y-4">
                {pointsData?.history?.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.description}</p>
                        <p className="text-sm text-gray-600">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.points_earned > 0 && (
                        <div className="text-green-600 font-medium">+{entry.points_earned}</div>
                      )}
                      {entry.points_redeemed > 0 && (
                        <div className="text-red-600 font-medium">-{entry.points_redeemed}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatCurrency(parseFloat(entry.total))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pointsData?.history?.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No points history yet</p>
                  <p className="text-sm text-gray-400">Your points activity will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
              
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Earn Points for Referrals</h3>
                    <p className="text-primary-100 mb-4">
                      Share your referral code with friends and earn 500 points for each successful referral!
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-lg px-4 py-2">
                        <span className="font-mono text-lg">LOY{user.id?.toString().padStart(3, '0')}</span>
                      </div>
                      <button
                        onClick={copyReferralCode}
                        className="flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">500</div>
                    <div className="text-primary-100">points per referral</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">How it Works</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">1</span>
                      </div>
                      <span className="text-sm text-gray-700">Share your referral code</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">2</span>
                      </div>
                      <span className="text-sm text-gray-700">Friend signs up using your code</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">3</span>
                      </div>
                      <span className="text-sm text-gray-700">Both of you earn 500 points!</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Referrals</h3>
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No referrals yet</p>
                    <p className="text-sm text-gray-400">Start sharing your code to earn points!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Redeem Reward</h3>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{selectedReward.reward_name}</h4>
                <p className="text-sm text-gray-600">{selectedReward.description}</p>
                <div className="mt-2 text-lg font-bold text-primary-600">
                  {selectedReward.points_required} points
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={redeemQuantity}
                  onChange={(e) => setRedeemQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-semibold">{selectedReward.points_required * redeemQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-semibold">{pointsData?.currentBalance}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={isRedeeming || (pointsData?.currentBalance || 0) < (selectedReward.points_required * redeemQuantity)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-white transition-colors",
                    isRedeeming || (pointsData?.currentBalance || 0) < (selectedReward.points_required * redeemQuantity)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  )}
                >
                  {isRedeeming ? 'Redeeming...' : 'Confirm Redemption'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={cn(
            "flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg max-w-sm",
            toast.type === 'success' 
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          )}>
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>
  );
}
