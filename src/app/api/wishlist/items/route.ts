import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wishlistId, productId, notes } = await request.json();

    if (!wishlistId || !productId) {
      return NextResponse.json(
        { error: 'Wishlist ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Verify wishlist belongs to user
    const wishlistQuery = `
      SELECT id FROM wishlists 
      WHERE id = $1 AND user_id = $2
    `;
    const wishlistResult = await query(wishlistQuery, [wishlistId, user.id]);

    if (wishlistResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found or access denied' },
        { status: 404 }
      );
    }

    // Check if product already exists in wishlist
    const existingQuery = `
      SELECT id FROM wishlist_items 
      WHERE wishlist_id = $1 AND product_id = $2
    `;
    const existingResult = await query(existingQuery, [wishlistId, productId]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Product already exists in wishlist' },
        { status: 400 }
      );
    }

    // Add product to wishlist
    const addQuery = `
      INSERT INTO wishlist_items (wishlist_id, product_id, notes, added_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, added_at
    `;

    const result = await query(addQuery, [
      wishlistId,
      productId,
      notes || null,
    ]);

    // Update wishlist updated_at timestamp
    await query('UPDATE wishlists SET updated_at = NOW() WHERE id = $1', [
      wishlistId,
    ]);

    return NextResponse.json({
      id: result.rows[0].id,
      wishlistId,
      productId,
      notes: notes || null,
      addedAt: result.rows[0].added_at,
    });
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add product to wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wishlistId = searchParams.get('wishlistId');
    const productId = searchParams.get('productId');

    if (!wishlistId || !productId) {
      return NextResponse.json(
        { error: 'Wishlist ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Verify wishlist belongs to user
    const wishlistQuery = `
      SELECT id FROM wishlists 
      WHERE id = $1 AND user_id = $2
    `;
    const wishlistResult = await query(wishlistQuery, [wishlistId, user.id]);

    if (wishlistResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found or access denied' },
        { status: 404 }
      );
    }

    // Remove product from wishlist
    const deleteQuery = `
      DELETE FROM wishlist_items 
      WHERE wishlist_id = $1 AND product_id = $2
    `;

    await query(deleteQuery, [wishlistId, productId]);

    // Update wishlist updated_at timestamp
    await query('UPDATE wishlists SET updated_at = NOW() WHERE id = $1', [
      wishlistId,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove product from wishlist' },
      { status: 500 }
    );
  }
}
