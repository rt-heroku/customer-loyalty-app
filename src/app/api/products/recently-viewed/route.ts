import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { RecentlyViewedProduct } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get recently viewed products
    const recentQuery = `
      SELECT 
        pv.product_id,
        pv.viewed_at,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.currency,
        p.stock_quantity,
        p.stock_status,
        p.rating,
        p.review_count,
        p.is_on_sale,
        p.sale_percentage,
        p.is_new,
        p.is_featured
      FROM product_views pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.user_id = $1
      ORDER BY pv.viewed_at DESC
      LIMIT 12
    `;
    
    const recentResult = await query(recentQuery, [user.id]);
    
    const recentlyViewed: RecentlyViewedProduct[] = await Promise.all(
      recentResult.rows.map(async (row: any) => {
        // Get product image
        const imageQuery = `
          SELECT 
            id,
            url,
            alt_text as alt,
            is_primary as "isPrimary",
            thumbnail_url as "thumbnailUrl"
          FROM product_images 
          WHERE product_id = $1 
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
        `;
        const imageResult = await query(imageQuery, [row.product_id]);
        
        return {
          productId: row.product_id,
          viewedAt: row.viewed_at,
          product: {
            id: row.product_id,
            name: row.name,
            description: row.description,
            shortDescription: row.description.substring(0, 100),
            price: parseFloat(row.price),
            originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
            currency: row.currency || 'USD',
            images: imageResult.rows.length > 0 ? [{
              id: imageResult.rows[0].id,
              url: imageResult.rows[0].url,
              alt: imageResult.rows[0].alt || row.name,
              isPrimary: imageResult.rows[0].isPrimary || false,
              thumbnailUrl: imageResult.rows[0].thumbnailUrl || imageResult.rows[0].url
            }] : [],
            category: '',
            subcategory: undefined,
            brand: '',
            sku: '',
            stockQuantity: parseInt(row.stock_quantity || '0'),
            stockStatus: row.stock_status || 'out_of_stock',
            rating: parseFloat(row.rating || '0'),
            reviewCount: parseInt(row.review_count || '0'),
            tags: [],
            specifications: {},
            variants: [],
            isOnSale: row.is_on_sale || false,
            salePercentage: row.sale_percentage ? parseFloat(row.sale_percentage) : undefined,
            isNew: row.is_new || false,
            isFeatured: row.is_featured || false,
            createdAt: '',
            updatedAt: ''
          }
        };
      })
    );

    return NextResponse.json({ recentlyViewed });
  } catch (error) {
    console.error('Error fetching recently viewed products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recently viewed products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const productQuery = `
      SELECT id FROM products WHERE id = $1
    `;
    const productResult = await query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Insert or update product view
    const upsertQuery = `
      INSERT INTO product_views (user_id, product_id, viewed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET viewed_at = NOW()
    `;
    
    await query(upsertQuery, [user.id, productId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking product view:', error);
    return NextResponse.json(
      { error: 'Failed to track product view' },
      { status: 500 }
    );
  }
}
