'use client';

import { X, Heart } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  onAddToWishlist: (wishlistId: number, productId: number) => void;
}

export default function WishlistModal({
  isOpen,
  onClose,
  productId,
  productName,
  onAddToWishlist,
}: WishlistModalProps) {
  const handleWishlistSelect = (wishlistId: number) => {
    onAddToWishlist(wishlistId, productId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Add to Wishlist
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Add "{productName}" to a wishlist
        </p>

        <div className="space-y-3">
          {/* Add to Default Wishlist */}
          <button
            onClick={() => handleWishlistSelect(1)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Heart className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">My Wishlist</p>
                <p className="text-sm text-gray-500">
                  Add to your personal wishlist
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
