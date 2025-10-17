'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';

interface SignInButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'gradient'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Sign in button component
 * Redirects to Cognito Hosted UI for authentication
 * Amplify handles redirect destination automatically
 */
export function SignInButton({
  variant = 'primary',
  size = 'default',
  className,
  children = 'Sign In',
}: SignInButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsRedirecting(true);
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isRedirecting}
      variant={variant}
      size={size}
      className={className}
      style={{
        padding: '8px 20px',
        height: '40px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        backgroundColor: '#1a73e8',
        color: '#ffffff',
        border: 'none',
        cursor: isRedirecting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isRedirecting ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isRedirecting) {
          e.currentTarget.style.backgroundColor = '#1557b0';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow =
            '0 4px 12px rgba(26, 115, 232, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1a73e8';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isRedirecting ? (
        <>
          <span
            style={{
              marginRight: '8px',
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          ></span>
          Redirecting...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
