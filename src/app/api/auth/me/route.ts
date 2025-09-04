import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session is still valid in database
    const sessionResult = await query(
      `SELECT us.is_active, us.expires_at, u.id, u.email, u.first_name, u.last_name, u.role, u.is_active as user_active
       FROM user_sessions us
       JOIN users u ON us.user_id = u.id
       WHERE us.token_hash = $1 AND us.is_active = true AND us.expires_at > NOW()`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    const session = sessionResult.rows[0];

    if (!session.user_active) {
      return NextResponse.json(
        { error: 'User account is deactivated' },
        { status: 403 }
      );
    }

    // Get additional user data based on role
    let additionalData = {};

    if (session.role === 'customer') {
      // Get customer loyalty data
      const customerResult = await query(
        `SELECT c.points, c.total_spent, c.visit_count, c.customer_tier, c.member_status, c.enrollment_date
         FROM customers c
         WHERE c.user_id = $1`,
        [session.id]
      );

      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        additionalData = {
          points: customer.points,
          totalSpent: customer.total_spent,
          visitCount: customer.visit_count,
          tier: customer.customer_tier,
          memberStatus: customer.member_status,
          enrollmentDate: customer.enrollment_date,
        };
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        firstName: session.first_name,
        lastName: session.last_name,
        role: session.role,
        ...additionalData,
      },
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
