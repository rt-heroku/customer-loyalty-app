import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, notes } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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

    // Check if product already exists in customer's wishlist
    const existingQuery = `
      SELECT id FROM customer_wishlists 
      WHERE customer_id = $1 AND product_id = $2
    `;
    const existingResult = await query(existingQuery, [customerId, productId]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Product already exists in wishlist' },
        { status: 400 }
      );
    }

    // Add product to customer's wishlist
    const addQuery = `
      INSERT INTO customer_wishlists (customer_id, product_id, notes, added_at, priority)
      VALUES ($1, $2, $3, NOW(), 1)
      RETURNING id, added_at
    `;

    const result = await query(addQuery, [
      customerId,
      productId,
      notes || null,
    ]);

    return NextResponse.json({
      id: result.rows[0].id,
      customerId,
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
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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

    // Remove product from customer's wishlist
    const deleteQuery = `
      DELETE FROM customer_wishlists 
      WHERE customer_id = $1 AND product_id = $2
    `;

    const result = await query(deleteQuery, [customerId, productId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found in wishlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove product from wishlist' },
      { status: 500 }
    );
  }
}
