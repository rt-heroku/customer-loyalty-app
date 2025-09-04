'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSearch from '@/components/products/ProductSearch';
import ProductSort from '@/components/products/ProductSort';
import { Product, ProductFilter, ProductSort as ProductSortType } from '@/types/product';
import { Grid3X3, List, Filter, X } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sort, setSort] = useState<ProductSortType>({ field: 'name', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Load products based on filters, sort, and search
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.stockStatus?.length) {
        filters.stockStatus.forEach(status => params.append('stockStatus', status));
      }
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.onSale) params.append('onSale', 'true');
      if (filters.isNew) params.append('isNew', 'true');
      
      // Add sort
      params.append('sortBy', sort.field);
      params.append('sortDir', sort.direction);
      
      // Add search
      if (searchQuery) params.append('search', searchQuery);
      
      // Add pagination
      params.append('page', currentPage.toString());
      params.append('limit', '24');

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalProducts(data.total);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, searchQuery, currentPage]);

  // Load products on mount and when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (searchQuery) params.append('search', searchQuery);
    if (sort.field !== 'name' || sort.direction !== 'asc') {
      params.append('sortBy', sort.field);
      params.append('sortDir', sort.direction);
    }
    
    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
    router.replace(newUrl);
  }, [filters, searchQuery, sort, router]);

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSort: ProductSortType) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSort({ field: 'name', direction: 'asc' });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery || (sort.field !== 'name' || sort.direction !== 'asc');

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
                <p className="mt-2 text-gray-600">
                  Discover our amazing products and find exactly what you're looking for
                </p>
              </div>
              
              {/* View mode toggle */}
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-80">
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
              
              <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Sort Bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <ProductSearch
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search products..."
                    />
                  </div>
                  <div className="sm:w-48">
                    <ProductSort
                      value={sort}
                      onChange={handleSortChange}
                    />
                  </div>
                </div>
                
                {/* Active filters display */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {filters.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Category: {filters.category}
                            <button
                              onClick={() => setFilters({ ...filters, category: undefined })}
                              className="ml-1.5 text-primary-600 hover:text-primary-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {filters.brand && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Brand: {filters.brand}
                            <button
                              onClick={() => setFilters({ ...filters, brand: undefined })}
                              className="ml-1.5 text-primary-600 hover:text-primary-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {searchQuery && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Search: "{searchQuery}"
                            <button
                              onClick={() => setSearchQuery('')}
                              className="ml-1.5 text-primary-600 hover:text-primary-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Display */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                  <div className="p-8">
                    <div className="animate-pulse">
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                              <div className="bg-gray-200 h-48 rounded-lg"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex space-x-4">
                              <div className="bg-gray-200 h-24 w-24 rounded-lg flex-shrink-0"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : products.length > 0 ? (
                  <>
                    {viewMode === 'grid' ? (
                      <ProductGrid products={products} />
                    ) : (
                      <ProductList products={products} />
                    )}
                    
                    {/* Pagination */}
                    {totalProducts > 24 && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">
                            Showing {((currentPage - 1) * 24) + 1} to {Math.min(currentPage * 24, totalProducts)} of {totalProducts} products
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                              Page {currentPage} of {Math.ceil(totalProducts / 24)}
                            </span>
                            <button
                              onClick={() => setCurrentPage(prev => prev + 1)}
                              disabled={currentPage >= Math.ceil(totalProducts / 24)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
