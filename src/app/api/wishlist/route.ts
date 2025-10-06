import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { Wishlist, WishlistItem } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wishlists
    const wishlistsQuery = `
      SELECT 
        w.id,
        w.name,
        w.is_public,
        w.share_token,
        w.created_at,
        w.updated_at,
        COUNT(wi.id) as item_count
      FROM wishlists w
      LEFT JOIN wishlist_items wi ON w.id = wi.wishlist_id
      WHERE w.user_id = $1
      GROUP BY w.id, w.name, w.is_public, w.share_token, w.created_at, w.updated_at
      ORDER BY w.updated_at DESC
    `;

    const wishlistsResult = await query(wishlistsQuery, [user.id]);

    const wishlists: Wishlist[] = await Promise.all(
      wishlistsResult.rows.map(async (wishlist: any) => {
        // Get items for this wishlist
        const itemsQuery = `
          SELECT 
            wi.id,
            wi.product_id,
            wi.added_at,
            wi.notes,
            p.name,
            p.description,
            p.price,
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
          FROM wishlist_items wi
          JOIN products p ON wi.product_id = p.id
          WHERE wi.wishlist_id = $1
          ORDER BY wi.added_at DESC
        `;

        const itemsResult = await query(itemsQuery, [wishlist.id]);

        const items: WishlistItem[] = itemsResult.rows.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          userId: user.id,
          addedAt: item.added_at,
          notes: item.notes,
          product: {
            id: item.product_id,
            name: item.name,
            description: item.description,
            shortDescription: item.description.substring(0, 100),
            price: parseFloat(item.price),
            images: [], // Will be populated separately
            category: '',
            brand: '',
            sku: '',
            stockQuantity: parseInt(item.stock || '0'),
            stockStatus: 'in_stock', // Default status
            productType: item.product_type || '',
            laptopSize: item.laptop_size || '',
            collection: item.collection || '',
            material: item.material || '',
            gender: item.gender || '',
            color: item.color || '',
            dimensions: item.dimensions || '',
            weight: parseFloat(item.weight || '0'),
            warrantyInfo: item.warranty_info || '',
            careInstructions: item.care_instructions || '',
            mainImageUrl: item.main_image_url || '',
            isActive: item.is_active || false,
            isFeatured: item.featured || false,
            sortOrder: parseInt(item.sort_order || '0'),
            sfId: item.sf_id || '',
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          },
        }));

        // Get product images for each item
        for (const item of items) {
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
            LIMIT 1
          `;
          const imagesResult = await query(imagesQuery, [item.productId]);
          if (imagesResult.rows.length > 0) {
            const img = imagesResult.rows[0];
            item.product.images = [
              {
                id: img.id,
                url: img.url,
                alt: img.alt || item.product.name,
                isPrimary: img.isPrimary || false,
                thumbnailUrl: img.thumbnailUrl || img.url,
              },
            ];
          }
        }

        return {
          id: wishlist.id,
          userId: user.id,
          name: wishlist.name,
          isPublic: wishlist.is_public,
          shareToken: wishlist.share_token,
          items,
          createdAt: wishlist.created_at,
          updatedAt: wishlist.updated_at,
        };
      })
    );

    return NextResponse.json({ wishlists });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, isPublic = false } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Wishlist name is required' },
        { status: 400 }
      );
    }

    // Create new wishlist
    const createQuery = `
      INSERT INTO wishlists (user_id, name, is_public, share_token)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, is_public, share_token, created_at, updated_at
    `;

    const shareToken = `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await query(createQuery, [
      user.id,
      name,
      isPublic,
      shareToken,
    ]);

    const wishlist = result.rows[0];

    return NextResponse.json({
      id: wishlist.id,
      userId: user.id,
      name: wishlist.name,
      isPublic: wishlist.is_public,
      shareToken: wishlist.share_token,
      items: [],
      createdAt: wishlist.created_at,
      updatedAt: wishlist.updated_at,
    });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to create wishlist' },
      { status: 500 }
    );
  }
}
