import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Product, ProductSearchResult } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const stockStatus = searchParams.get('stockStatus') || '';
    const rating = searchParams.get('rating');
    const onSale = searchParams.get('onSale');
    const isNew = searchParams.get('isNew');
    const sortField = searchParams.get('sortField') || 'name';
    const sortDirection = searchParams.get('sortDirection') || 'asc';

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.tags @> $${paramIndex + 1})`
      );
      queryParams.push(`%${search}%`, `[${search}]`);
      paramIndex += 2;
    }

    if (category) {
      whereConditions.push(`p.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (brand) {
      whereConditions.push(`p.brand = $${paramIndex}`);
      queryParams.push(brand);
      paramIndex++;
    }

    if (minPrice) {
      whereConditions.push(`p.price >= $${paramIndex}`);
      queryParams.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`p.price <= $${paramIndex}`);
      queryParams.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (stockStatus) {
      whereConditions.push(`p.stock_status = $${paramIndex}`);
      queryParams.push(stockStatus);
      paramIndex++;
    }

    if (rating) {
      whereConditions.push(`p.rating >= $${paramIndex}`);
      queryParams.push(parseFloat(rating));
      paramIndex++;
    }

    if (onSale === 'true') {
      whereConditions.push(`p.is_on_sale = true`);
    }

    if (isNew === 'true') {
      whereConditions.push(`p.is_new = true`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Build ORDER BY clause
    let orderByClause = 'ORDER BY ';
    switch (sortField) {
      case 'price':
        orderByClause += `p.price ${sortDirection.toUpperCase()}`;
        break;
      case 'rating':
        orderByClause += `p.rating ${sortDirection.toUpperCase()}`;
        break;
      case 'createdAt':
        orderByClause += `p.created_at ${sortDirection.toUpperCase()}`;
        break;
      case 'popularity':
        orderByClause += `p.review_count ${sortDirection.toUpperCase()}`;
        break;
      default:
        orderByClause += `p.name ${sortDirection.toUpperCase()}`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get products with pagination
    const offset = (page - 1) * limit;
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.currency,
        p.category,
        p.subcategory,
        p.brand,
        p.sku,
        p.stock_quantity,
        p.stock_status,
        p.rating,
        p.review_count,
        p.tags,
        p.specifications,
        p.is_on_sale,
        p.sale_percentage,
        p.is_new,
        p.is_featured,
        p.created_at,
        p.updated_at
      FROM products p
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const productsResult = await query(productsQuery, queryParams);

    // Transform products to match interface
    const products: Product[] = productsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      originalPrice: row.original_price
        ? parseFloat(row.original_price)
        : undefined,
      currency: row.currency || 'USD',
      images: [], // Will be populated separately
      category: row.category,
      subcategory: row.subcategory,
      brand: row.brand,
      sku: row.sku,
      stockQuantity: parseInt(row.stock_quantity || '0'),
      stockStatus: row.stock_status || 'out_of_stock',
      rating: parseFloat(row.rating || '0'),
      reviewCount: parseInt(row.review_count || '0'),
      tags: row.tags || [],
      specifications: row.specifications || {},
      variants: [], // Will be populated separately
      isOnSale: row.is_on_sale || false,
      salePercentage: row.sale_percentage
        ? parseFloat(row.sale_percentage)
        : undefined,
      isNew: row.is_new || false,
      isFeatured: row.is_featured || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // Get images for products
    for (const product of products) {
      const imagesQuery = `
        SELECT 
          id,
          url,
          alt_text as alt,
          is_primary as "isPrimary",
          thumbnail_url as "thumbnailUrl"
        FROM product_images 
        WHERE product_id = $1 
        ORDER BY is_primary DESC, id ASC
      `;
      const imagesResult = await query(imagesQuery, [product.id]);
      product.images = imagesResult.rows.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || product.name,
        isPrimary: img.isPrimary || false,
        thumbnailUrl: img.thumbnailUrl || img.url,
      }));
    }

    const result: ProductSearchResult = {
      products,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
