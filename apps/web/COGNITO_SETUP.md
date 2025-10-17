# Cognito Setup Guide

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (optional but recommended)

## Step 1: Create Cognito User Pool

### Via AWS Console

1. **Navigate to Amazon Cognito**
   - Go to AWS Console → Services → Cognito
   - Click "Create user pool"

2. **Configure Sign-in Experience**
   - Sign-in options: Select "Email"
   - User name requirements: Keep defaults
   - Click "Next"

3. **Configure Security Requirements**
   - Password policy: Choose "Cognito defaults" or customize
   - Multi-factor authentication: Optional (recommended for production)
   - User account recovery: Select "Email only"
   - Click "Next"

4. **Configure Sign-up Experience**
   - Self-service sign-up: Enable
   - Attribute verification: Select "Send email message, verify email address"
   - Required attributes: Select "email"
   - Click "Next"

5. **Configure Message Delivery**
   - Email provider: Select "Send email with Cognito"
   - For production, configure SES for better deliverability
   - Click "Next"

6. **Integrate Your App**
   - User pool name: `collectiq-users` (or your preferred name)
   - Hosted UI: Check "Use the Cognito Hosted UI"
   - Domain: Choose "Use a Cognito domain"
   - Cognito domain prefix: `collectiq` (must be unique)
   - Click "Next"

7. **Configure App Client**
   - App client name: `collectiq-web`
   - Client secret: Select "Don't generate a client secret" (public client)
   - Authentication flows: Select "ALLOW_USER_PASSWORD_AUTH" and "ALLOW_REFRESH_TOKEN_AUTH"
   - Click "Next"

8. **Review and Create**
   - Review all settings
   - Click "Create user pool"

## Step 2: Configure App Client

After creating the user pool:

1. **Navigate to App Integration**
   - Click on your user pool
   - Go to "App integration" tab
   - Click on your app client name

2. **Configure OAuth 2.0 Settings**
   - Allowed callback URLs: Add `http://localhost:3000/` (root URL with trailing slash)
   - Allowed sign-out URLs: Add `http://localhost:3000`
   - Identity providers: Select "Cognito user pool"
   - OAuth 2.0 grant types: Select "Authorization code grant"
   - OpenID Connect scopes: Select "openid", "email", "profile"
   - Advanced settings:
     - Enable "Proof Key for Code Exchange (PKCE)"
   - Click "Save changes"

## Step 3: Get Configuration Values

1. **User Pool ID**
   - Go to User Pool → General settings
   - Copy "User pool ID" (format: `us-east-1_XXXXXXXXX`)

2. **App Client ID**
   - Go to User Pool → App integration → App clients
   - Copy "Client ID" (format: `XXXXXXXXXXXXXXXXXXXXXXXXXX`)

3. **Cognito Domain**
   - Go to User Pool → App integration → Domain
   - Copy the domain (format: `collectiq.auth.us-east-1.amazoncognito.com`)

## Step 4: Update Environment Variables

Update `apps/web/.env.local` with your values:

```env
NEXT_PUBLIC_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_DOMAIN=collectiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/
NEXT_PUBLIC_OAUTH_LOGOUT_URI=http://localhost:3000
NEXT_PUBLIC_API_BASE=https://api.collectiq.com
```

## Step 5: Create Test User

1. **Via AWS Console**
   - Go to User Pool → Users
   - Click "Create user"
   - Username: Your email address
   - Email: Same as username
   - Temporary password: Create a secure password
   - Uncheck "Send an email invitation"
   - Click "Create user"

2. **Via AWS CLI**

   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username test@example.com \
     --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true \
     --temporary-password TempPassword123! \
     --message-action SUPPRESS
   ```

3. **Set Permanent Password**
   ```bash
   aws cognito-idp admin-set-user-password \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username test@example.com \
     --password YourSecurePassword123! \
     --permanent
   ```

## Step 6: Test Authentication

1. **Start Development Server**

   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Test Sign In Flow**
   - Visit http://localhost:3000
   - Click "Sign In" button
   - Should redirect to Cognito Hosted UI
   - Sign in with test user credentials
   - Should redirect back to app

3. **Verify Session**
   - Open browser console
   - Run: `fetch('/api/auth/session', { credentials: 'include' }).then(r => r.json()).then(console.log)`
   - Should see user session data

## Production Configuration

### For Production Deployment

1. **Update Callback URLs**
   - Add production URLs to Cognito app client
   - Example: `https://app.collectiq.com/` (root URL with trailing slash)

2. **Update Environment Variables**

   ```env
   NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://app.collectiq.com/
   NEXT_PUBLIC_OAUTH_LOGOUT_URI=https://app.collectiq.com
   ```

3. **Configure Custom Domain (Optional)**
   - Go to User Pool → App integration → Domain
   - Click "Actions" → "Create custom domain"
   - Enter your domain (e.g., `auth.collectiq.com`)
   - Add required DNS records
   - Update `NEXT_PUBLIC_COGNITO_DOMAIN` in environment variables

4. **Configure SES for Email**
   - Go to Amazon SES
   - Verify your domain
   - Request production access
   - Update Cognito to use SES

5. **Enable MFA (Recommended)**
   - Go to User Pool → Sign-in experience → MFA
   - Select "Optional" or "Required"
   - Choose MFA methods (SMS, TOTP, etc.)

## Troubleshooting

### "Invalid redirect_uri" Error

- Verify callback URL in Cognito matches exactly (including protocol and port)
- Ensure the URL ends with a trailing slash (/)
- Ensure URL is added to "Allowed callback URLs"

### "Invalid client_id" Error

- Verify Client ID is correct
- Ensure app client exists and is enabled

### "Invalid domain" Error

- Verify Cognito domain is correct
- Check domain format (should not include https://)

### Email Not Sending

- Check email configuration in Cognito
- Verify email address is not in SES sandbox
- Check CloudWatch logs for errors

### PKCE Error

- Ensure PKCE is enabled in app client settings
- Verify code_challenge_method is S256

## Security Best Practices

1. **Enable MFA** for production users
2. **Use custom domain** for better branding and security
3. **Configure SES** for reliable email delivery
4. **Enable CloudWatch logging** for audit trail
5. **Set up CloudWatch alarms** for suspicious activity
6. **Use AWS WAF** to protect Cognito endpoints
7. **Regularly rotate secrets** and credentials
8. **Enable advanced security features** (adaptive authentication, compromised credentials check)

## Additional Resources

- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OAuth 2.0 with PKCE](https://oauth.net/2/pkce/)
- [Cognito Hosted UI Customization](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-ui-customization.html)
- [Cognito Security Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-security.html)
