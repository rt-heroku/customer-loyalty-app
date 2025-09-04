'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  Star, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { pwaManager } from '@/lib/pwa';
import type { Product } from '@/types/product';

interface MobileProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isWishlisted?: boolean;
  showQuickActions?: boolean;
}

export default function MobileProductCard({ 
  product, 
  onWishlistToggle, 
  onQuickView, 
  onAddToCart,
  isWishlisted = false,
  showQuickActions = false
}: MobileProductCardProps) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [quantity, setQuantity] = useState(1);

  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle image swipe
  const handleImageSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentImageIndex < (product.images?.length || 1) - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'right' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Handle drag gesture for images
  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handleImageSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleImageSwipe('left');
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      // Show login prompt
      return;
    }

    pwaManager.hapticFeedback('light');
    
    try {
      if (onWishlistToggle) {
        onWishlistToggle(product.id);
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
    }
  };

  // Handle quick view
  const handleQuickView = () => {
    pwaManager.hapticFeedback('medium');
    if (onQuickView) {
      onQuickView(product);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    pwaManager.hapticFeedback('medium');
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(99, quantity + change));
    setQuantity(newQuantity);
    pwaManager.hapticFeedback('light');
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} - ${product.description}`,
          url: window.location.href,
        });
        pwaManager.hapticFeedback('light');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      pwaManager.hapticFeedback('light');
    }
  };

  // Auto-advance images for products with multiple images
  useEffect(() => {
    if (product.images && product.images.length > 1 && !isExpanded) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => 
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      }, 3000);
      
      return () => clearInterval(interval);
    }
    return undefined;
  }, [product.images, isExpanded]);

  return (
    <>
      {/* Main Product Card */}
      <motion.div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Image Section */}
        <div className="relative">
          <motion.div
            ref={imageContainerRef}
            className="relative h-48 bg-gray-100 overflow-hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.98 }}
          >
            {/* Product Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={product.images?.[currentImageIndex]?.url || '/images/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowImageGallery(true)}
                style={{ touchAction: 'manipulation' }}
              />
            </AnimatePresence>

            {/* Image Navigation Dots */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {product.images.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                    initial={false}
                    animate={{ scale: index === currentImageIndex ? 1.2 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions Overlay */}
            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex flex-col space-y-2"
                >
                  <motion.button
                    onClick={handleWishlistToggle}
                    className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Heart 
                      size={18} 
                      className={isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'} 
                    />
                  </motion.button>
                  
                  <motion.button
                    onClick={handleQuickView}
                    className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Eye size={18} className="text-gray-600" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sale Badge */}
            {product.isOnSale && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
              >
                SALE
              </motion.div>
            )}

            {/* Stock Status */}
            {product.stockQuantity === 0 && (
              <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                OUT OF STOCK
              </div>
            )}
          </motion.div>

          {/* Image Navigation Arrows */}
          {product.images && product.images.length > 1 && (
            <>
              <motion.button
                onClick={() => handleImageSwipe('right')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </motion.button>
              
              <motion.button
                onClick={() => handleImageSwipe('left')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronRight size={16} className="text-gray-600" />
              </motion.button>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Product Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
              {product.name}
            </h3>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 ml-1">
                  {product.rating || 0}
                </span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-600">
                {product.reviewCount || 0} reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.salePercentage && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  -{product.salePercentage}%
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <motion.button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={product.stockQuantity === 0}
              style={{ touchAction: 'manipulation' }}
            >
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>
            
            <motion.button
              onClick={handleWishlistToggle}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isWishlisted 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              <Heart 
                size={18} 
                className={isWishlisted ? 'fill-current' : ''} 
              />
            </motion.button>
          </div>

          {/* Expandable Details */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Minus size={14} />
                  </motion.button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <motion.button
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="flex space-x-2">
                <motion.button
                  onClick={handleShare}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-xl text-sm font-medium"
                  whileTap={{ scale: 0.95 }}
                  style={{ touchAction: 'manipulation' }}
                >
                  <Share2 size={16} className="inline mr-2" />
                  Share
                </motion.button>
                
                <motion.button
                  onClick={handleQuickView}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-xl text-sm font-medium"
                  whileTap={{ scale: 0.95 }}
                  style={{ touchAction: 'manipulation' }}
                >
                  <Eye size={16} className="inline mr-2" />
                  Quick View
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Expand/Collapse Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            whileTap={{ scale: 0.98 }}
            style={{ touchAction: 'manipulation' }}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </motion.button>
        </div>
      </motion.div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            onClick={() => setShowImageGallery(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setShowImageGallery(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white"
                style={{ touchAction: 'manipulation' }}
              >
                ×
              </button>

              {/* Image */}
              <motion.img
                key={currentImageIndex}
                src={product.images?.[currentImageIndex]?.url || '/images/placeholder.png'}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />

              {/* Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageSwipe('right');
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageSwipe('left');
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
