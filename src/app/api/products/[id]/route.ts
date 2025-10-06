import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Product } from '@/types/product';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get product details
    const productQuery = `
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
        p.laptop_size,
        p.collection,
        p.material,
        p.gender,
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
      WHERE p.id = $1
    `;

    const productResult = await query(productQuery, [id]);

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const row = productResult.rows[0];

    // Get product images
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
    const imagesResult = await query(imagesQuery, [id]);

    // Product variants not available in current schema

    // Get related products
    const relatedQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.rating,
        p.stock_status as "stockStatus"
      FROM products p
      WHERE p.category = $1 
        AND p.id != $2 
        AND p.stock_status != 'out_of_stock'
      ORDER BY p.rating DESC, p.created_at DESC
      LIMIT 4
    `;
    const relatedResult = await query(relatedQuery, [row.category, id]);

    // Transform to Product interface
    const product: Product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      images: imagesResult.rows.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || row.name,
        isPrimary: img.isPrimary || false,
        thumbnailUrl: img.thumbnailUrl || img.url,
      })),
      category: row.category,
      brand: row.brand,
      sku: row.sku,
      stockQuantity: parseInt(row.stock || '0'),
      stockStatus: 'in_stock', // Default status
      productType: row.product_type || '',
      laptopSize: row.laptop_size || '',
      collection: row.collection || '',
      material: row.material || '',
      gender: row.gender || '',
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
    };

    // Add related products
    const relatedProducts = relatedResult.rows.map((rel: any) => ({
      id: rel.id,
      name: rel.name,
      price: parseFloat(rel.price),
      rating: parseFloat(rel.rating || '0'),
      stockStatus: rel.stockStatus || 'out_of_stock',
    }));

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
