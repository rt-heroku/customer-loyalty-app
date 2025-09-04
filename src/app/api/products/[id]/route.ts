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
        p.short_description,
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
      WHERE p.id = $1
    `;
    
    const productResult = await query(productQuery, [id]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
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

    // Get product variants
    const variantsQuery = `
      SELECT 
        id,
        name,
        value,
        price,
        stock_quantity as "stockQuantity"
      FROM product_variants 
      WHERE product_id = $1 
      ORDER BY name, value
    `;
    const variantsResult = await query(variantsQuery, [id]);

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
      shortDescription: row.short_description || row.description.substring(0, 100),
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      currency: row.currency || 'USD',
      images: imagesResult.rows.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || row.name,
        isPrimary: img.isPrimary || false,
        thumbnailUrl: img.thumbnailUrl || img.url
      })),
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
      variants: variantsResult.rows.map((variant: any) => ({
        id: variant.id,
        name: variant.name,
        value: variant.value,
        price: variant.price ? parseFloat(variant.price) : undefined,
        stockQuantity: parseInt(variant.stockQuantity || '0')
      })),
      isOnSale: row.is_on_sale || false,
      salePercentage: row.sale_percentage ? parseFloat(row.sale_percentage) : undefined,
      isNew: row.is_new || false,
      isFeatured: row.is_featured || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    // Add related products
    const relatedProducts = relatedResult.rows.map((rel: any) => ({
      id: rel.id,
      name: rel.name,
      price: parseFloat(rel.price),
      rating: parseFloat(rel.rating || '0'),
      stockStatus: rel.stockStatus || 'out_of_stock'
    }));

    return NextResponse.json({
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
