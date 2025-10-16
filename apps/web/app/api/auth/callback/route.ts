import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/callback
 * Exchanges authorization code for tokens and sets HTTP-only cookies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, codeVerifier } = body;

    if (!code || !codeVerifier) {
      return NextResponse.json(
        { error: 'Missing code or code verifier' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const tokenEndpoint = `https://${env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
      code,
      redirect_uri: env.NEXT_PUBLIC_OAUTH_REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange failed:', error);

      // Parse error response
      let errorMessage = 'Failed to exchange authorization code';
      try {
        const errorData = JSON.parse(error);
        if (errorData.error === 'invalid_grant') {
          errorMessage =
            'Authorization code expired or invalid. Please try signing in again.';
        }
      } catch {
        // Use default error message
      }

      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    const tokens = await response.json();

    // Set tokens in HTTP-only cookies
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Access token (typically 1 hour)
    cookieStore.set('access_token', tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in || 3600,
    });

    // ID token (contains user info)
    cookieStore.set('id_token', tokens.id_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in || 3600,
    });

    // Refresh token (typically 30 days)
    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
