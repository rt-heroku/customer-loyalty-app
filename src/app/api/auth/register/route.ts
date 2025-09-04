import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  marketingConsent: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone } = validation.data;
    const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown';

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    try {
      // Create user
      const userResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, marketing_consent, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, email, first_name, last_name, role`,
        [
          email,
          passwordHash,
          firstName,
          lastName,
          phone || null,
          'customer', // Default role for new registrations
          true,
          validation.data.marketingConsent,
        ]
      );

      const user = userResult.rows[0];

      // Create customer record
      await query(
        `INSERT INTO customers (user_id, name, email, phone, points, total_spent, visit_count, created_at, updated_at, marketing_consent, member_status, enrollment_date, member_type, customer_tier)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9, NOW(), $10, $11)`,
        [
          user.id,
          `${firstName} ${lastName}`,
          email,
          phone || null,
          0, // Starting points
          '0.00', // Starting total spent
          0, // Starting visit count
          validation.data.marketingConsent,
          'Active',
          'Individual',
          'Bronze', // Starting tier
        ]
      );

      // Log registration activity
      await query(
        `INSERT INTO user_activity_log (user_id, activity_type, description, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [user.id, 'registration', 'User registered successfully', clientIp]
      );

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
      });

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
