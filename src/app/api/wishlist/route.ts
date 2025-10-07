import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import type { Wishlist, WishlistItem } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer ID for the user
    const customerResult = await query(
      'SELECT id FROM customers WHERE user_id = $1',
      [user.id]
    );

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customerId = customerResult.rows[0].id;

    // Get all unique wishlist names for this customer
    const wishlistNamesQuery = `
      SELECT DISTINCT wishlist_name
      FROM customer_wishlists
      WHERE customer_id = $1
      ORDER BY wishlist_name
    `;

    const wishlistNamesResult = await query(wishlistNamesQuery, [customerId]);

    const wishlists: Wishlist[] = await Promise.all(
      wishlistNamesResult.rows.map(async (wishlistNameRow: any) => {
        const wishlistName = wishlistNameRow.wishlist_name;

        // Get items for this wishlist
        const itemsQuery = `
          SELECT 
            cw.id,
            cw.product_id,
            cw.added_at,
            cw.notes,
            cw.priority,
            p.name,
            p.description,
            p.price,
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
          FROM customer_wishlists cw
          JOIN products p ON cw.product_id = p.id
          WHERE cw.customer_id = $1 AND cw.wishlist_name = $2
          ORDER BY cw.priority DESC, cw.added_at DESC
        `;

        const itemsResult = await query(itemsQuery, [customerId, wishlistName]);

        const items: WishlistItem[] = await Promise.all(
          itemsResult.rows.map(async (item: any) => {
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
              LIMIT 1
            `;
            const imagesResult = await query(imagesQuery, [item.product_id]);
            
            let images: any[] = [];
            if (imagesResult.rows.length > 0) {
              const img = imagesResult.rows[0];
              images = [
                {
                  id: img.id,
                  url: img.url,
                  alt: img.alt || item.name,
                  isPrimary: img.isPrimary || false,
                  thumbnailUrl: img.thumbnailUrl || img.url,
                },
              ];
            }

            return {
              id: item.id,
              productId: item.product_id,
              userId: user.id,
              addedAt: item.added_at,
              notes: item.notes,
              product: {
                id: item.product_id,
                name: item.name,
                description: item.description,
                shortDescription: item.description?.substring(0, 100) || '',
                price: parseFloat(item.price),
                images,
                category: '',
                brand: '',
                sku: '',
                stockQuantity: parseInt(item.stock || '0'),
                stockStatus: 'in_stock', // Default status
                productType: item.product_type || '',
                collection: item.collection || '',
                material: item.material || '',
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
            };
          })
        );

        return {
          id: wishlistName, // Use wishlist name as ID
          userId: user.id,
          name: wishlistName,
          isPublic: false,
          shareToken: '',
          items,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Wishlist name is required' },
        { status: 400 }
      );
    }

    // Get customer ID for the user
    const customerResult = await query(
      'SELECT id FROM customers WHERE user_id = $1',
      [user.id]
    );

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customerId = customerResult.rows[0].id;

    // Check if wishlist name already exists for this customer
    const existingQuery = `
      SELECT id FROM customer_wishlists 
      WHERE customer_id = $1 AND wishlist_name = $2
      LIMIT 1
    `;
    const existingResult = await query(existingQuery, [customerId, name]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Wishlist name already exists' },
        { status: 400 }
      );
    }

    // Since we're using customer_wishlists table, we just return the wishlist structure
    // The actual wishlist creation happens when items are added
    return NextResponse.json({
      id: name, // Use name as ID
      userId: user.id,
      name: name,
      isPublic: false,
      shareToken: '',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to create wishlist' },
      { status: 500 }
    );
  }
}
