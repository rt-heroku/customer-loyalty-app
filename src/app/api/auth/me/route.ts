import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In a real application, you would:
    // 1. Verify the session token
    // 2. Get user data from database
    // 3. Return user information
    
    // For now, return a mock user response
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      role: 'customer',
      tier: 'Gold',
      isAuthenticated: true
    };

    return NextResponse.json({ user: mockUser });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}