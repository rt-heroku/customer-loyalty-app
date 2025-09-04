export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number | undefined;
  currency: string;
  images: ProductImage[];
  category: string;
  subcategory: string | undefined;
  brand: string;
  sku: string;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  rating: number;
  reviewCount: number;
  tags: string[];
  specifications: Record<string, string>;
  variants: ProductVariant[] | undefined;
  isOnSale: boolean;
  salePercentage: number | undefined;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  thumbnailUrl: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number | undefined;
  stockQuantity: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  userId: number;
  addedAt: string;
  notes?: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: number;
  name: string;
  isPublic: boolean;
  shareToken?: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  category?: string | undefined;
  brand?: string | undefined;
  priceRange?: {
    min: number;
    max: number;
  } | undefined;
  stockStatus?: string[] | undefined;
  rating?: number | undefined;
  tags?: string[] | undefined;
  onSale?: boolean | undefined;
  isNew?: boolean | undefined;
}

export interface ProductSort {
  field: 'name' | 'price' | 'rating' | 'createdAt' | 'popularity';
  direction: 'asc' | 'desc';
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface RecentlyViewedProduct {
  productId: string;
  viewedAt: string;
  product: Product;
}

export interface ProductComparison {
  id: string;
  userId: number;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}
