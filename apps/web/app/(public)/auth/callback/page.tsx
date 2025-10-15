'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  parseState,
  getStoredCodeVerifier,
  getStoredState,
  clearStoredPKCE,
} from '@/lib/auth';

/**
 * OAuth callback page that handles the redirect from Cognito Hosted UI
 * Exchanges authorization code for tokens and redirects to intended destination
 */
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Check for OAuth errors
        const errorParam = searchParams.get('error');
        if (errorParam) {
          const errorDescription = searchParams.get('error_description');
          handleOAuthError(errorParam, errorDescription);
          return;
        }

        // Get authorization code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          setError('Missing authorization code or state parameter');
          return;
        }

        // Validate state parameter (CSRF protection)
        const storedState = getStoredState();
        if (!storedState || storedState !== state) {
          setError('Invalid state parameter. Possible CSRF attack.');
          return;
        }

        // Parse state to get intended destination
        const parsedState = parseState(state);
        if (!parsedState) {
          setError('Failed to parse state parameter');
          return;
        }

        // Get stored code verifier
        const codeVerifier = getStoredCodeVerifier();
        if (!codeVerifier) {
          setError('Missing code verifier. Please try signing in again.');
          return;
        }

        // Exchange authorization code for tokens
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            code,
            codeVerifier,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to exchange authorization code');
          return;
        }

        // Clear stored PKCE parameters
        clearStoredPKCE();

        // Redirect to intended destination or default to /vault
        const destination = parsedState.destination || '/vault';
        window.location.href = destination;
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred during authentication');
      }
    }

    handleCallback();
  }, [searchParams, router]);

  /**
   * Handle OAuth errors from Cognito
   */
  function handleOAuthError(error: string, description: string | null): void {
    const errorMessages: Record<string, string> = {
      access_denied: 'You denied access to the application',
      invalid_request: 'Invalid authentication request',
      unauthorized_client: 'Application is not authorized',
      unsupported_response_type: 'Unsupported response type',
      invalid_scope: 'Invalid scope requested',
      server_error: 'Authentication server error',
      temporarily_unavailable: 'Authentication service temporarily unavailable',
    };

    const message =
      errorMessages[error] || description || 'Authentication failed';
    setError(message);
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div
          className="w-full max-w-md rounded-lg p-8 shadow-md"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}
            >
              <svg
                className="h-6 w-6"
                style={{ color: 'var(--color-crimson-red)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              Authentication Error
            </h1>
          </div>

          <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {error}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-lg px-4 py-2 text-white transition-opacity"
              style={{ backgroundColor: 'var(--color-vault-blue)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-lg border px-4 py-2 transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="text-center">
        <div
          className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"
          style={{
            borderColor: 'var(--muted)',
            borderTopColor: 'var(--color-vault-blue)',
          }}
        ></div>
        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

/**
 * Wrapper component with Suspense boundary
 */
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="text-center">
            <div
              className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"
              style={{
                borderColor: 'var(--muted)',
                borderTopColor: 'var(--color-vault-blue)',
              }}
            ></div>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
