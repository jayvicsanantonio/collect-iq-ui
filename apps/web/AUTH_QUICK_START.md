# Authentication Quick Start Guide

## Setup

1. **Configure Environment Variables**

Copy `.env.example` to `.env.local` and fill in your Cognito details:

```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_DOMAIN=collectiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/
NEXT_PUBLIC_OAUTH_LOGOUT_URI=http://localhost:3000
NEXT_PUBLIC_API_BASE=https://api.collectiq.com
```

2. **Configure Cognito User Pool**

In AWS Console:

- Create a User Pool with Hosted UI enabled
- Add app client with OAuth 2.0 flows
- Enable "Authorization code grant" flow
- Add callback URL: `http://localhost:3000/` (root URL with trailing slash)
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
2. User authenticates → Cognito redirects to root URL (/)
3. AWS Amplify automatically exchanges code for tokens and stores them securely
4. Application checks authentication status and displays user info

## Security Notes

- ✅ Tokens managed securely by AWS Amplify
- ✅ PKCE prevents authorization code interception (handled by Amplify)
- ✅ State parameter prevents CSRF attacks (handled by Amplify)
- ✅ Automatic token refresh before expiration (handled by Amplify)
- ✅ Client-side AuthGuard protects routes

## Troubleshooting

**"Invalid redirect_uri" error:**

- Ensure callback URL in Cognito matches `NEXT_PUBLIC_OAUTH_REDIRECT_URI` exactly
- Verify the URL ends with a trailing slash (/)
- Check that the URL is added to "Allowed callback URLs" in Cognito

**Authentication not working:**

- Clear browser storage and try again
- Verify all environment variables are set correctly
- Check browser console for Amplify errors

**Session not persisting:**

- Check browser console for Amplify errors
- Verify Cognito User Pool and App Client IDs are correct
- Ensure OAuth domain is correct

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
import { isAuthenticated, getCurrentUserInfo } from '@/lib/auth';
const authenticated = await isAuthenticated();
const userInfo = await getCurrentUserInfo();
console.log({ authenticated, userInfo });
```

## Auth Functions

- `signIn()` - Redirect to Cognito Hosted UI
- `signOut()` - Sign out and clear session
- `isAuthenticated()` - Check if user is authenticated
- `getAccessToken()` - Get current access token
- `getCurrentUserInfo()` - Get current user information

## Next Steps

1. Integrate with backend API (add Authorization header)
2. Implement user profile page
3. Add error handling and toast notifications
4. Write unit and E2E tests
5. Add analytics for auth events
