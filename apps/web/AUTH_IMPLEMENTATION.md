# Authentication Implementation Summary

This document summarizes the authentication infrastructure implemented for CollectIQ.

## Overview

The authentication system uses Amazon Cognito Hosted UI with OAuth 2.0 authorization code flow with PKCE (Proof Key for Code Exchange) for enhanced security. All tokens are stored in secure HTTP-only cookies.

## Implemented Components

### 1. Core Authentication Utilities (`lib/auth.ts`)

**PKCE Functions:**

- `generateCodeVerifier()` - Creates cryptographically secure random string
- `generateCodeChallenge()` - Generates SHA-256 hash of code verifier
- `base64URLEncode()` - Encodes bytes to Base64URL format

**OAuth Flow Functions:**

- `buildHostedUIUrl()` - Constructs Cognito authorization URL with PKCE
- `buildLogoutUrl()` - Constructs Cognito logout URL
- `generateState()` - Creates state parameter with intended destination
- `parseState()` - Validates and parses state parameter

**JWT Functions:**

- `parseJWT()` - Parses JWT token payload (client-side only)
- `isTokenExpired()` - Checks if token is expired with 60s buffer

**Session Management:**

- `getSession()` - Retrieves current session from HTTP-only cookies
- `refreshSession()` - Refreshes access token using refresh token
- `clearSession()` - Clears all authentication cookies

**User Actions:**

- `signIn()` - Initiates OAuth flow with Cognito Hosted UI
- `signOut()` - Signs out user and redirects to Cognito logout

**Storage Helpers:**

- `getStoredCodeVerifier()` - Retrieves PKCE verifier from sessionStorage
- `getStoredState()` - Retrieves OAuth state from sessionStorage
- `clearStoredPKCE()` - Clears PKCE parameters after successful auth

### 2. API Routes

**`/api/auth/session` (GET)**

- Returns current user session from HTTP-only cookies
- Validates token expiration
- Returns 401 if not authenticated or token expired

**`/api/auth/refresh` (POST)**

- Exchanges refresh token for new access token
- Updates HTTP-only cookies with new tokens
- Returns updated session

**`/api/auth/signout` (POST)**

- Clears all authentication cookies
- Returns success status

**`/api/auth/callback` (POST)**

- Exchanges authorization code for tokens
- Validates code verifier (PKCE)
- Sets tokens in HTTP-only cookies
- Handles OAuth errors (invalid_grant, etc.)

### 3. OAuth Callback Page (`app/(public)/auth/callback/page.tsx`)

- Handles OAuth redirect from Cognito Hosted UI
- Validates state parameter (CSRF protection)
- Exchanges authorization code for tokens via API
- Redirects to intended destination
- Displays user-friendly error messages for OAuth errors

### 4. React Components

**`AuthGuard`**

- Wraps protected routes
- Checks session validity on mount and periodically (every 5 minutes)
- Attempts token refresh if session expired
- Redirects to Cognito Hosted UI if unauthenticated
- Shows loading spinner during auth check
- Preserves intended destination in state parameter

**`SessionExpiredModal`**

- Displays when user session expires
- Provides re-authentication option (redirects to Hosted UI)
- Provides sign out option
- Cannot be dismissed without user action
- Shows loading states for actions

**`SignInButton`**

- Initiates sign in flow
- Redirects to Cognito Hosted UI
- Accepts optional destination parameter
- Shows loading state during redirect

**`SignOutButton`**

- Signs out user
- Clears session cookies
- Redirects to Cognito logout
- Shows loading state during sign out

### 5. Middleware (`middleware.ts`)

- Server-side authentication check
- Protects routes: `/upload`, `/vault`, `/cards/*`
- Checks for access token in cookies
- Redirects to home if no token (client-side AuthGuard handles sign in)
- Allows public routes to pass through

### 6. Route Groups

**`(public)` Layout**

- Contains unauthenticated routes
- `/auth/callback` - OAuth callback handler

**`(protected)` Layout**

- Wraps all authenticated routes with `AuthGuard`
- `/upload` - Card upload page (placeholder)
- `/vault` - Collection vault page (placeholder)
- `/cards/[id]` - Card detail page (to be implemented)

## Security Features

1. **PKCE (Proof Key for Code Exchange)**
   - Prevents authorization code interception attacks
   - Code verifier stored in sessionStorage
   - Code challenge sent to Cognito

2. **State Parameter Validation**
   - Prevents CSRF attacks
   - Contains nonce and intended destination
   - Validated on callback

3. **HTTP-Only Cookies**
   - Tokens never accessible to JavaScript
   - SameSite=Lax prevents CSRF
   - Secure flag in production

4. **Token Expiration Handling**
   - Automatic refresh using refresh token
   - 60-second buffer for clock skew
   - Session expired modal for user action

5. **Server-Side Validation**
   - Middleware checks for token presence
   - API routes validate token expiration
   - Backend validates JWT signature (to be implemented)

## Environment Variables Required

```env
NEXT_PUBLIC_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_DOMAIN=collectiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_OAUTH_LOGOUT_URI=http://localhost:3000
NEXT_PUBLIC_API_BASE=https://api.collectiq.com
```

## Authentication Flow

### Sign In Flow

1. User clicks "Sign In" button
2. `signIn()` generates PKCE parameters (verifier + challenge)
3. State parameter created with intended destination
4. PKCE verifier and state stored in sessionStorage
5. User redirected to Cognito Hosted UI with challenge
6. User authenticates via Hosted UI
7. Cognito redirects to `/auth/callback?code=...&state=...`
8. Callback page validates state parameter
9. Callback page retrieves code verifier from sessionStorage
10. Authorization code + verifier sent to `/api/auth/callback`
11. API exchanges code for tokens with Cognito
12. Tokens stored in HTTP-only cookies
13. User redirected to intended destination

### Protected Route Access

1. User navigates to protected route (e.g., `/vault`)
2. Middleware checks for access token cookie
3. If no token, redirects to home
4. `AuthGuard` component checks session validity
5. If session valid, renders protected content
6. If session invalid, attempts refresh
7. If refresh fails, redirects to Cognito Hosted UI

### Sign Out Flow

1. User clicks "Sign Out" button
2. `signOut()` calls `/api/auth/signout`
3. API clears all authentication cookies
4. sessionStorage cleared
5. User redirected to Cognito logout endpoint
6. Cognito invalidates session
7. User redirected to home page

## Testing the Implementation

### Manual Testing Steps

1. **Sign In Flow:**
   - Visit home page
   - Click "Sign In" button
   - Should redirect to Cognito Hosted UI
   - Sign in with test credentials
   - Should redirect back to intended destination
   - Should see user email in header

2. **Protected Route Access:**
   - Visit `/vault` or `/upload` without authentication
   - Should redirect to Cognito Hosted UI
   - After sign in, should land on intended page

3. **Session Persistence:**
   - Sign in
   - Refresh page
   - Should remain authenticated

4. **Sign Out:**
   - Click "Sign Out" button
   - Should redirect to Cognito logout
   - Should redirect back to home page
   - Should no longer be authenticated

5. **Session Expiry:**
   - Sign in
   - Wait for token to expire (or manually delete cookies)
   - Try to access protected route
   - Should show session expired modal

## Next Steps

1. **Backend Integration:**
   - Implement JWT validation in backend API
   - Add user ID to API requests
   - Implement user-scoped data access

2. **Error Handling:**
   - Add toast notifications for auth errors
   - Implement retry logic for network failures
   - Add logging for auth events

3. **Testing:**
   - Write unit tests for auth utilities
   - Write integration tests for OAuth flow
   - Write E2E tests for authentication

4. **Enhancements:**
   - Add "Remember Me" functionality
   - Implement social sign-in (Google, Apple)
   - Add MFA support
   - Implement account management features

## Files Created

```
apps/web/
├── lib/
│   └── auth.ts                                    # Core auth utilities
├── app/
│   ├── (public)/
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx                       # OAuth callback handler
│   ├── (protected)/
│   │   ├── layout.tsx                             # Protected layout with AuthGuard
│   │   ├── upload/
│   │   │   └── page.tsx                           # Upload page (placeholder)
│   │   └── vault/
│   │       └── page.tsx                           # Vault page (placeholder)
│   └── api/
│       └── auth/
│           ├── session/
│           │   └── route.ts                       # Get session API
│           ├── refresh/
│           │   └── route.ts                       # Refresh token API
│           ├── signout/
│           │   └── route.ts                       # Sign out API
│           └── callback/
│               └── route.ts                       # Token exchange API
├── components/
│   └── auth/
│       ├── AuthGuard.tsx                          # Route protection component
│       ├── SessionExpiredModal.tsx                # Session expiry modal
│       ├── SignInButton.tsx                       # Sign in button
│       ├── SignOutButton.tsx                      # Sign out button
│       └── index.ts                               # Barrel export
└── middleware.ts                                  # Server-side auth middleware
```

## Requirements Satisfied

✅ **1.2** - User authenticates via Amazon Cognito Hosted UI with OAuth 2.0 + PKCE
✅ **1.8** - OAuth callback validates state parameter for CSRF protection
✅ **1.9** - JWT tokens stored in secure HTTP-only cookies
✅ **1.1** - Unauthenticated users redirected to Cognito Hosted UI
✅ **1.5** - Protected routes require authentication
✅ **1.4** - Sign out clears cookies and redirects to Cognito logout
✅ **12.1** - Secure token storage in HTTP-only cookies

## Conclusion

The authentication infrastructure is now complete and ready for integration with the backend API. All core authentication flows are implemented with security best practices including PKCE, state validation, HTTP-only cookies, and automatic token refresh.
