import { env } from './env';

/**
 * User session interface representing authenticated user data
 */
export interface UserSession {
  sub: string; // Cognito user ID
  email: string;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number; // Unix timestamp
}

/**
 * OAuth state parameter containing intended destination
 */
export interface OAuthState {
  destination?: string;
  nonce: string;
}

/**
 * Generate a cryptographically secure random code verifier for PKCE
 * @returns Base64URL-encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from code verifier using SHA-256
 * @param verifier - The code verifier string
 * @returns Base64URL-encoded SHA-256 hash of the verifier
 */
export async function generateCodeChallenge(
  verifier: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64URL encode a byte array (without padding)
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Build the Cognito Hosted UI authorization URL with PKCE
 * @param options - Configuration options
 * @returns Complete authorization URL
 */
export async function buildHostedUIUrl(options: {
  codeChallenge: string;
  state: string;
  destination?: string;
}): Promise<string> {
  const { codeChallenge, state } = options;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
    redirect_uri: env.NEXT_PUBLIC_OAUTH_REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid email profile',
  });

  return `https://${env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
}

/**
 * Build the Cognito logout URL
 * @returns Complete logout URL
 */
export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
    logout_uri: env.NEXT_PUBLIC_OAUTH_LOGOUT_URI,
  });

  return `https://${env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?${params.toString()}`;
}

/**
 * Generate a random state parameter for OAuth flow
 * @param destination - Optional intended destination after auth
 * @returns Base64URL-encoded state string
 */
export function generateState(destination?: string): string {
  const state: OAuthState = {
    destination,
    nonce: generateCodeVerifier(),
  };
  return btoa(JSON.stringify(state));
}

/**
 * Parse and validate OAuth state parameter
 * @param stateParam - The state parameter from OAuth callback
 * @returns Parsed state object or null if invalid
 */
export function parseState(stateParam: string): OAuthState | null {
  try {
    const decoded = atob(stateParam);
    const state = JSON.parse(decoded) as OAuthState;
    if (!state.nonce) return null;
    return state;
  } catch {
    return null;
  }
}

/**
 * Parse JWT token without verification (verification happens server-side)
 * @param token - JWT token string
 * @returns Decoded token payload
 */
export function parseJWT(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    throw new Error('Failed to parse JWT token');
  }
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns True if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token);
    const exp = payload.exp as number;
    if (!exp) return true;
    
    // Add 60 second buffer to account for clock skew
    return Date.now() >= (exp * 1000) - 60000;
  } catch {
    return true;
  }
}

/**
 * Get current user session from cookies (client-side)
 * Note: Actual token validation happens server-side
 * @returns User session or null if not authenticated
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    // Call API route to get session from HTTP-only cookies
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });

    // 401 is expected when not authenticated - not an error
    if (!response.ok) return null;

    const session = await response.json();
    return session as UserSession;
  } catch {
    // Network errors or other issues - silently return null
    return null;
  }
}

/**
 * Refresh the user session using refresh token
 * @returns New session or null if refresh failed
 */
export async function refreshSession(): Promise<UserSession | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return null;

    const session = await response.json();
    return session as UserSession;
  } catch {
    return null;
  }
}

/**
 * Clear the user session (sign out)
 * @returns True if successful
 */
export async function clearSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Initiate sign in flow by redirecting to Cognito Hosted UI
 * @param destination - Optional path to redirect to after authentication
 */
export async function signIn(destination?: string): Promise<void> {
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState(destination);

  // Store code verifier in sessionStorage for callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);
  }

  // Build and redirect to Hosted UI
  const authUrl = await buildHostedUIUrl({
    codeChallenge,
    state,
    destination,
  });

  window.location.href = authUrl;
}

/**
 * Sign out the user and redirect to Cognito logout
 */
export async function signOut(): Promise<void> {
  // Clear session on backend
  await clearSession();

  // Clear any client-side storage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
  }

  // Redirect to Cognito logout
  const logoutUrl = buildLogoutUrl();
  window.location.href = logoutUrl;
}

/**
 * Get the stored code verifier from sessionStorage
 * @returns Code verifier or null if not found
 */
export function getStoredCodeVerifier(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('pkce_code_verifier');
}

/**
 * Get the stored OAuth state from sessionStorage
 * @returns OAuth state or null if not found
 */
export function getStoredState(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('oauth_state');
}

/**
 * Clear stored PKCE parameters from sessionStorage
 */
export function clearStoredPKCE(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
}
