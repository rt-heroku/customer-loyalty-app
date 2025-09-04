'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Eye, ShoppingCart, Share2 } from 'lucide-react';
import { Product } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {products.map((product) => {
        const isInWishlist = wishlistItems.has(product.id);
        const isLoading = loadingStates.has(product.id);
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

        return (
          <div
            key={product.id}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {primaryImage ? (
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </Link>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
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

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  disabled={isLoading}
                  className={cn(
                    "p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200",
                    isInWishlist ? "text-red-500" : "text-gray-600 hover:text-red-500",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                </button>
                
                <button
                  onClick={() => shareProduct(product)}
                  className="p-2 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-primary-600 hover:shadow-md transition-all duration-200"
                  title="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quick View Button */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center px-3 py-2 rounded-full bg-white shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:text-primary-600 hover:shadow-md transition-all duration-200"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Quick View
                </Link>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Category and Brand */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{product.category}</span>
                <span>{product.brand}</span>
              </div>

              {/* Product Name */}
              <Link href={`/products/${product.id}`}>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-2">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              <div className="flex items-center mb-2">
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
                <span className="text-xs text-gray-500 ml-1">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.originalPrice, product.currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                disabled={product.stockStatus === 'out_of_stock'}
                className={cn(
                  "w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
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
        );
      })}
    </div>
  );
}
