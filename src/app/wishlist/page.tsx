'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Wishlist } from '@/types/product';
import { Heart, Share2, Trash2, ShoppingCart, Eye, Users, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [activeWishlist, setActiveWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  // Load user's wishlists
  useEffect(() => {
    if (user) {
      loadWishlists();
    }
  }, [user]);

  const loadWishlists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlists(data.wishlists);
        if (data.wishlists.length > 0 && !activeWishlist) {
          setActiveWishlist(data.wishlists[0]);
        }
      }
    } catch (error) {
      console.error('Error loading wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWishlist = async () => {
    if (!newWishlistName.trim()) return;

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWishlistName }),
      });

      if (response.ok) {
        const newWishlist = await response.json();
        setWishlists(prev => [...prev, newWishlist]);
        setActiveWishlist(newWishlist);
        setNewWishlistName('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating wishlist:', error);
    }
  };

  const deleteWishlist = async (wishlistId: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlists(prev => prev.filter(w => w.id !== wishlistId));
        if (activeWishlist?.id === wishlistId) {
          setActiveWishlist(wishlists[0] || null);
        }
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  };

  const removeFromWishlist = async (wishlistId: string, productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}/items/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlists(prev => prev.map(w => {
          if (w.id === wishlistId) {
            return {
              ...w,
              items: w.items.filter(item => item.productId !== productId)
            };
          }
          return w;
        }));

        if (activeWishlist?.id === wishlistId) {
          setActiveWishlist(prev => prev ? {
            ...prev,
            items: prev.items.filter(item => item.productId !== productId)
          } : null);
        }
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const toggleWishlistPrivacy = async (wishlistId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      });

      if (response.ok) {
        setWishlists(prev => prev.map(w => {
          if (w.id === wishlistId) {
            return { ...w, isPublic };
          }
          return w;
        }));

        if (activeWishlist?.id === wishlistId) {
          setActiveWishlist(prev => prev ? { ...prev, isPublic } : null);
        }
      }
    } catch (error) {
      console.error('Error updating wishlist privacy:', error);
    }
  };

  const shareWishlist = async () => {
    if (!activeWishlist || !shareEmail.trim()) return;

    try {
      const response = await fetch(`/api/wishlist/${activeWishlist.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail,
          message: shareMessage
        }),
      });

      if (response.ok) {
        setShareEmail('');
        setShareMessage('');
        setShowShareModal(false);
        // You could add a success toast here
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'pre_order':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'pre_order':
        return 'Pre-Order';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wishlists...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlists</h1>
                <p className="mt-2 text-gray-600">
                  Save and organize products you love
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  disabled={!activeWishlist}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  New Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Wishlists Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlists</h3>
                
                {wishlists.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No wishlists yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
                    >
                      Create your first wishlist
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wishlists.map((wishlist) => (
                      <button
                        key={wishlist.id}
                        onClick={() => setActiveWishlist(wishlist)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-50 transition-colors",
                          activeWishlist?.id === wishlist.id && "bg-primary-50 border border-primary-200"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <Heart className={cn(
                              "w-4 h-4 mr-2",
                              activeWishlist?.id === wishlist.id ? "text-primary-600 fill-current" : "text-gray-400"
                            )} />
                            <span className={cn(
                              "font-medium truncate",
                              activeWishlist?.id === wishlist.id ? "text-primary-900" : "text-gray-900"
                            )}>
                              {wishlist.name}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            {wishlist.isPublic ? (
                              <Users className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <Lock className="w-3 h-3 text-gray-500 mr-1" />
                            )}
                            <span className="text-xs text-gray-500">
                              {wishlist.items.length} items
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlistPrivacy(wishlist.id, !wishlist.isPublic);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title={wishlist.isPublic ? 'Make private' : 'Make public'}
                          >
                            {wishlist.isPublic ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWishlist(wishlist.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete wishlist"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeWishlist ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Wishlist Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{activeWishlist.name}</h2>
                        <div className="flex items-center mt-2">
                          {activeWishlist.isPublic ? (
                            <Users className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-500">
                            {activeWishlist.isPublic ? 'Public' : 'Private'} • {activeWishlist.items.length} items
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </button>
                        
                        <button
                          onClick={() => toggleWishlistPrivacy(activeWishlist.id, !activeWishlist.isPublic)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {activeWishlist.isPublic ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4 mr-2" />
                              Make Public
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Wishlist Items */}
                  {activeWishlist.items.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeWishlist.items.map((item) => (
                          <div
                            key={item.id}
                            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Product Image */}
                            <div className="relative aspect-square bg-gray-100">
                              {item.product.images[0] ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.images[0].alt}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}

                              {/* Stock Status Badge */}
                              <div className="absolute top-2 left-2">
                                <span className={cn(
                                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                  getStockStatusColor(item.product.stockStatus)
                                )}>
                                  {getStockStatusText(item.product.stockStatus)}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => removeFromWishlist(activeWishlist.id, item.productId)}
                                  className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-red-500 hover:bg-red-50"
                                  title="Remove from wishlist"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                {item.product.name}
                              </h3>
                              
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(item.product.price, item.product.currency)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {item.product.brand}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <button
                                  disabled={item.product.stockStatus === 'out_of_stock'}
                                  className={cn(
                                    "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    item.product.stockStatus === 'out_of_stock'
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-primary-600 text-white hover:bg-primary-700"
                                  )}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  {item.product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                
                                <a
                                  href={`/products/${item.product.id}`}
                                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              </div>

                              {/* Added Date */}
                              <div className="mt-3 text-xs text-gray-500">
                                Added {new Date(item.addedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">This wishlist is empty</h3>
                      <p className="text-gray-500 mb-6">
                        Start adding products to your wishlist while browsing
                      </p>
                      <a
                        href="/products"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Browse Products
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist selected</h3>
                  <p className="text-gray-500 mb-6">
                        Select a wishlist from the sidebar or create a new one to get started
                      </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Create Wishlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Wishlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Wishlist</h3>
              
              <div className="mb-4">
                <label htmlFor="wishlist-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Wishlist Name
                </label>
                <input
                  type="text"
                  id="wishlist-name"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="Enter wishlist name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createWishlist}
                  disabled={!newWishlistName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Wishlist Modal */}
        {showShareModal && activeWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Wishlist</h3>
              
              <div className="mb-4">
                <label htmlFor="share-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="share-email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="share-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="share-message"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a personal message"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={shareWishlist}
                  disabled={!shareEmail.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
