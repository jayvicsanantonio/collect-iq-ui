'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { SignInButton } from '@/components/auth/SignInButton';
import { Sparkles, Shield, TrendingUp } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

/**
 * Public landing page for unauthenticated users
 * Redirects authenticated users to /upload
 */
export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  async function checkAuthAndRedirect() {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        // Redirect authenticated users to upload page
        router.replace('/upload');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--holo-cyan)] mx-auto" />
          <p className="text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* Gradient Background - Light Mode: SUPER VIBRANT Rainbow, Dark Mode: Dark Subtle */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Light Mode - SUPER VIBRANT Bright Rainbow */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'linear-gradient(135deg, rgb(56, 189, 248) 0%, rgb(52, 211, 153) 25%, rgb(250, 204, 21) 50%, rgb(251, 146, 60) 75%, rgb(167, 139, 250) 100%)',
          }}
        />
        {/* Dark Mode - Very Dark Subtle */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'linear-gradient(135deg, rgba(147, 197, 253, 0.08) 0%, rgba(167, 243, 208, 0.06) 25%, rgba(253, 224, 71, 0.05) 50%, rgba(251, 146, 60, 0.06) 75%, rgba(196, 181, 253, 0.08) 100%)',
          }}
        />
      </div>
      {/* Additional Radial Gradients for Depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Light Mode - VIBRANT Bright Radials */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(14, 165, 233, 0.6) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.55) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.5) 0%, transparent 45%)',
          }}
        />
        {/* Dark Mode - Very Subtle Radials */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(34, 197, 94, 0.04) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(251, 146, 60, 0.03) 0%, transparent 35%)',
          }}
        />
      </div>

      {/* Header */}
      <header
        className="w-full relative z-10"
        style={{
          paddingTop: '32px',
          paddingBottom: '32px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="text-2xl font-medium tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
              marginTop: '8px',
              marginLeft: '4px',
            }}
          >
            Collect
            <span
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              IQ
            </span>
          </div>
          <div
            className="flex items-center gap-4"
            style={{ marginTop: '8px', marginRight: '4px' }}
          >
            <SignInButton variant="primary" size="default" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-6 py-24 relative z-10">
        <div className="max-w-4xl w-full text-center">
          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <h1
              className="text-4xl md:text-5xl font-medium tracking-tight mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              AI-POWERED TRADING CARD INTELLIGENCE
            </h1>
            <p
              className="text-lg md:text-xl"
              style={{
                color: 'var(--muted-foreground)',
              }}
            >
              Identify, authenticate, and valuate your Pokémon TCG cards with
              real-time AI analysis
            </p>
          </div>

          {/* CTA Button */}
          <div style={{ marginBottom: '64px' }}>
            <SignInButton
              variant="gradient"
              size="lg"
              className="text-lg px-8 py-6"
            >
              Get Started
            </SignInButton>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* AI Identification */}
            <div className="flex flex-col items-center space-y-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
              >
                <Sparkles
                  className="w-8 h-8"
                  style={{ color: 'var(--color-holo-cyan)' }}
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                }}
              >
                AI Identification
              </h3>
              <p
                className="text-sm"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                Instantly identify any Pokémon card with advanced computer
                vision
              </p>
            </div>

            {/* Authenticity Check */}
            <div className="flex flex-col items-center space-y-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
              >
                <Shield
                  className="w-8 h-8"
                  style={{ color: 'var(--color-emerald-glow)' }}
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                }}
              >
                Authenticity Check
              </h3>
              <p
                className="text-sm"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                Detect counterfeits with AI-powered holographic pattern analysis
              </p>
            </div>

            {/* Real-Time Valuation */}
            <div className="flex flex-col items-center space-y-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
              >
                <TrendingUp
                  className="w-8 h-8"
                  style={{ color: 'var(--color-vault-blue)' }}
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                }}
              >
                Real-Time Valuation
              </h3>
              <p
                className="text-sm"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                Get accurate market prices from multiple trusted sources
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 relative z-10">
        <div className="w-full flex justify-center">
          <p
            className="text-xs tracking-wide text-center"
            style={{
              color: 'var(--muted-foreground)',
              letterSpacing: '0.05em',
            }}
          >
            POWERED BY AWS AI • COLLECTIQ 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
