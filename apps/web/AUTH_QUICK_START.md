# Authentication Quick Start Guide

## Setup

1. **Configure Environment Variables**

Copy `.env.example` to `.env.local` and fill in your Cognito details:

```env
NEXT_PUBLIC_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_DOMAIN=collectiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_OAUTH_LOGOUT_URI=http://localhost:3000
NEXT_PUBLIC_API_BASE=https://api.collectiq.com
```

2. **Configure Cognito User Pool**

In AWS Console:

- Create a User Pool with Hosted UI enabled
- Add app client with OAuth 2.0 flows
- Enable "Authorization code grant" flow
- Add callback URL: `http://localhost:3000/auth/callback`
- Add sign-out URL: `http://localhost:3000`
- Enable PKCE (required for public clients)

## Usage

### Protecting Routes

Routes in `app/(protected)/` are automatically protected by `AuthGuard`:

```tsx
// app/(protected)/my-page/page.tsx
export default function MyProtectedPage() {
  return <div>This page requires authentication</div>;
}
```

### Using Auth Components

**Sign In Button:**

```tsx
import { SignInButton } from '@/components/auth';

<SignInButton destination="/vault" />;
```

**Sign Out Button:**

```tsx
import { SignOutButton } from '@/components/auth';

<SignOutButton variant="outline" />;
```

**Auth Guard (manual usage):**

```tsx
import { AuthGuard } from '@/components/auth';

<AuthGuard>
  <ProtectedContent />
</AuthGuard>;
```

### Using Auth Functions

**Check if user is authenticated:**

```tsx
import { getSession } from '@/lib/auth';

const session = await getSession();
if (session) {
  console.log('User:', session.email);
}
```

**Programmatic sign in:**

```tsx
import { signIn } from '@/lib/auth';

await signIn('/dashboard'); // Redirects to Cognito Hosted UI
```

**Programmatic sign out:**

```tsx
import { signOut } from '@/lib/auth';

await signOut(); // Clears session and redirects to Cognito logout
```

## Authentication Flow

1. User clicks "Sign In" → Redirects to Cognito Hosted UI
2. User authenticates → Cognito redirects to `/auth/callback`
3. Callback exchanges code for tokens → Stores in HTTP-only cookies
4. User redirected to intended destination

## Security Notes

- ✅ Tokens stored in HTTP-only cookies (not accessible to JavaScript)
- ✅ PKCE prevents authorization code interception
- ✅ State parameter prevents CSRF attacks
- ✅ Automatic token refresh before expiration
- ✅ Server-side middleware protects routes

## Troubleshooting

**"Invalid state parameter" error:**

- Clear browser cookies and sessionStorage
- Ensure callback URL matches Cognito configuration

**"Missing code verifier" error:**

- Don't open auth callback URL directly
- Always initiate sign in through SignInButton or signIn()

**Redirect loop:**

- Check that middleware.ts is not blocking public routes
- Verify environment variables are correct

**Session not persisting:**

- Check that cookies are enabled
- Verify cookie domain matches your app domain
- Check browser console for cookie errors

## Testing

**Manual Test:**

```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000
# Click "Sign In"
# Should redirect to Cognito Hosted UI
# Sign in with test user
# Should redirect back to app
```

**Check Session:**

```bash
# In browser console:
fetch('/api/auth/session', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

## API Routes

- `GET /api/auth/session` - Get current session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/signout` - Clear session
- `POST /api/auth/callback` - Exchange code for tokens

## Next Steps

1. Integrate with backend API (add Authorization header)
2. Implement user profile page
3. Add error handling and toast notifications
4. Write unit and E2E tests
5. Add analytics for auth events
