import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer ID
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

    // Get all vouchers for the customer
    const vouchersResult = await query(
      `SELECT 
        cv.id,
        cv.voucher_code,
        cv.name,
        cv.description,
        cv.voucher_type,
        cv.face_value,
        cv.discount_percent,
        cv.remaining_value,
        cv.redeemed_value,
        cv.reserved_value,
        cv.status,
        cv.created_date,
        cv.expiration_date,
        cv.use_date,
        cv.image_url,
        cv.is_active,
        cv.effective_date,
        p.name as product_name,
        p.price as product_price,
        p.image_url as product_image_url
      FROM customer_vouchers cv
      LEFT JOIN products p ON cv.product_id = p.id
      WHERE cv.customer_id = $1
      ORDER BY 
        CASE cv.status 
          WHEN 'Issued' THEN 1 
          WHEN 'Redeemed' THEN 2 
          WHEN 'Expired' THEN 3 
          ELSE 4 
        END,
        cv.created_date DESC`,
      [customerId]
    );

    const vouchers = vouchersResult.rows;

    // Group vouchers by status
    const groupedVouchers = {
      issued: vouchers.filter(v => v.status === 'Issued'),
      redeemed: vouchers.filter(v => v.status === 'Redeemed'),
      expired: vouchers.filter(v => v.status === 'Expired'),
    };

    return NextResponse.json({
      success: true,
      vouchers,
      groupedVouchers,
      total: vouchers.length,
    });
  } catch (error) {
    console.error('Error fetching customer vouchers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
