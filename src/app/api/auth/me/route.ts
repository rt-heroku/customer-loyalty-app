import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      // Verify JWT token
      const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as any;
      
      // Get user data from database
      const userResult = await query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name as role_name
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id 
         WHERE u.id = $1 AND u.is_active = true`,
        [payload.userId]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = userResult.rows[0];
      
      // Get customer tier if user is a customer
      let tier = 'Bronze';
      if (user.role_name === 'customer') {
        try {
          const customerResult = await query(
            'SELECT customer_tier FROM customers WHERE user_id = $1',
            [user.id]
          );
          if (customerResult.rows.length > 0) {
            tier = customerResult.rows[0].customer_tier || 'Bronze';
          }
        } catch (error) {
          console.log('Customer tier lookup failed:', error);
        }
      }

      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role_name || 'customer',
        tier: tier,
        isAuthenticated: true,
      };

      return NextResponse.json({ user: userData });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
