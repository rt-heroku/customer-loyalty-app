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
    // Removed rating, onSale, and isNew filters as these fields don't exist in the database
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

    // Remove rating, onSale, and isNew filters as these fields don't exist

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
      case 'createdAt':
        orderByClause += `p.created_at ${sortDirection.toUpperCase()}`;
        break;
      case 'category':
        orderByClause += `p.category ${sortDirection.toUpperCase()}`;
        break;
      case 'brand':
        orderByClause += `p.brand ${sortDirection.toUpperCase()}`;
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
        p.category,
        p.brand,
        p.sku,
        p.stock,
        p.product_type,
        p.collection,
        p.material,
        p.color,
        p.dimensions,
        p.weight,
        p.warranty_info,
        p.care_instructions,
        p.main_image_url,
        p.is_active,
        p.featured,
        p.sort_order,
        p.sf_id,
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
      images: [], // Will be populated separately
      category: row.category,
      brand: row.brand,
      sku: row.sku,
      stockQuantity: parseInt(row.stock || '0'),
      stockStatus: 'in_stock', // Default status
      productType: row.product_type || '',
      collection: row.collection || '',
      material: row.material || '',
      color: row.color || '',
      dimensions: row.dimensions || '',
      weight: parseFloat(row.weight || '0'),
      warrantyInfo: row.warranty_info || '',
      careInstructions: row.care_instructions || '',
      mainImageUrl: row.main_image_url || '',
      isActive: row.is_active || false,
      isFeatured: row.featured || false,
      sortOrder: parseInt(row.sort_order || '0'),
      sfId: row.sf_id || '',
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
