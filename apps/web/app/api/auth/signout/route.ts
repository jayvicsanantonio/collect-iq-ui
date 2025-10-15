import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signout
 * Clears authentication cookies
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    cookieStore.delete('access_token');
    cookieStore.delete('id_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
