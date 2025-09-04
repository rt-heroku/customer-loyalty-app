'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Eye, ShoppingCart, Share2, Clock, MapPin } from 'lucide-react';
import { Product } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  const toggleWishlist = async (productId: string) => {
    if (!user) return;

    setLoadingStates(prev => new Set(prev).add(productId));
    
    try {
      const isInWishlist = wishlistItems.has(productId);
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          if (isInWishlist) {
            newSet.delete(productId);
          } else {
            newSet.add(productId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoadingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const shareProduct = async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: `${window.location.origin}/products/${product.id}`,
        });
      } catch (error) {
        console.error('Error sharing product:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/products/${product.id}`;
      try {
        await navigator.clipboard.writeText(url);
        // You could add a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
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

  return (
    <div className="space-y-4 p-6">
      {products.map((product) => {
        const isInWishlist = wishlistItems.has(product.id);
        const isLoading = loadingStates.has(product.id);
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

        return (
          <div
            key={product.id}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="flex">
              {/* Product Image */}
              <div className="w-48 h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                {primaryImage ? (
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.isNew && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      {product.isOnSale && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {product.salePercentage}% OFF
                        </span>
                      )}
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getStockStatusColor(product.stockStatus)
                      )}>
                        {getStockStatusText(product.stockStatus)}
                      </span>
                    </div>

                    {/* Category and Brand */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span>{product.brand}</span>
                      <span>•</span>
                      <span>SKU: {product.sku}</span>
                    </div>

                    {/* Product Name */}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.shortDescription}
                    </p>

                    {/* Rating and Reviews */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Tags */}
                    {product.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Tags:</span>
                        {product.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{product.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col items-end space-y-4 ml-6">
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(product.price, product.currency)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.originalPrice, product.currency)}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                          isInWishlist
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={cn("w-4 h-4 mr-2", isInWishlist && "fill-current")} />
                        {isInWishlist ? 'Saved' : 'Save'}
                      </button>
                      
                      <button
                        onClick={() => shareProduct(product)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                        title="Share product"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Available in {product.stockQuantity} locations</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                    
                    <button
                      disabled={product.stockStatus === 'out_of_stock'}
                      className={cn(
                        "inline-flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                        product.stockStatus === 'out_of_stock'
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                      )}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
