'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton } from '@/components/auth/SignInButton';
import { Sparkles, Shield, TrendingUp } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { Header } from '@/components/navigation';

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
        router.replace('/upload');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  }

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
      {/* Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'linear-gradient(135deg, rgb(56, 189, 248) 0%, rgb(52, 211, 153) 25%, rgb(250, 204, 21) 50%, rgb(251, 146, 60) 75%, rgb(167, 139, 250) 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'linear-gradient(135deg, rgba(147, 197, 253, 0.08) 0%, rgba(167, 243, 208, 0.06) 25%, rgba(253, 224, 71, 0.05) 50%, rgba(251, 146, 60, 0.06) 75%, rgba(196, 181, 253, 0.08) 100%)',
          }}
        />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(14, 165, 233, 0.6) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.55) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.5) 0%, transparent 45%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(34, 197, 94, 0.04) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(251, 146, 60, 0.03) 0%, transparent 35%)',
          }}
        />
      </div>

      <Header
        rightContent={<SignInButton variant="primary" size="default" />}
      />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="min-h-[85vh] flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl w-full flex flex-col items-center">
            <div className="space-y-12 w-full flex flex-col items-center">
              <div className="space-y-8 w-full flex flex-col items-center">
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center"
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1',
                  }}
                >
                  Know the Truth Behind
                  <br />
                  <span
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-holo-cyan), var(--color-emerald-glow), var(--color-vault-blue))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Every Card You Own
                  </span>
                </h1>

                <p
                  className="text-xl sm:text-2xl md:text-3xl max-w-4xl leading-relaxed text-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  AI-powered authenticity verification and real-time
                  multi-source valuations for Pokémon TCG collectors
                </p>
              </div>

              <div className="flex flex-col items-center gap-5 pt-4">
                <SignInButton
                  variant="gradient"
                  size="lg"
                  className="text-xl px-12 py-8 shadow-2xl"
                >
                  Start Scanning Free
                </SignInButton>
                <p
                  className="text-base text-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 flex items-center justify-center">
          <div className="max-w-7xl w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 px-4">
              <div className="text-center space-y-5">
                <p
                  className="text-5xl lg:text-7xl font-bold"
                  style={{ color: 'var(--color-holo-cyan)' }}
                >
                  $400B+
                </p>
                <p
                  className="text-base lg:text-lg font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Collectibles Market
                </p>
              </div>
              <div className="text-center space-y-5">
                <p
                  className="text-5xl lg:text-7xl font-bold"
                  style={{ color: 'var(--color-emerald-glow)' }}
                >
                  3,821%
                </p>
                <p
                  className="text-base lg:text-lg font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Pokémon ROI
                </p>
              </div>
              <div className="text-center space-y-5">
                <p
                  className="text-5xl lg:text-7xl font-bold"
                  style={{ color: 'var(--color-vault-blue)' }}
                >
                  100M+
                </p>
                <p
                  className="text-base lg:text-lg font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  TCG Downloads
                </p>
              </div>
              <div className="text-center space-y-5">
                <p
                  className="text-5xl lg:text-7xl font-bold"
                  style={{ color: 'var(--color-holo-cyan)' }}
                >
                  13%
                </p>
                <p
                  className="text-base lg:text-lg font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Annual Growth
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-48"></div>

        {/* Features Section */}
        <section className="py-20 px-6 flex items-center justify-center">
          <div className="max-w-7xl w-full">
            <div className="grid md:grid-cols-3 gap-12 lg:gap-16 px-4">
              {/* Feature 1 */}
              <div
                className="group relative p-12 lg:p-16 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center backdrop-blur-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    'var(--color-emerald-glow)';
                  e.currentTarget.style.boxShadow =
                    '0 20px 60px rgba(16, 185, 129, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-center w-full flex flex-col items-center">
                  <div
                    className="mb-12"
                    style={{ paddingTop: '2rem', paddingBottom: '1rem' }}
                  >
                    <Shield
                      className="w-16 h-16"
                      style={{ color: 'var(--color-emerald-glow)' }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3
                    className="text-2xl lg:text-3xl font-bold mb-8"
                    style={{
                      fontFamily: 'var(--font-display)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                    }}
                  >
                    Clear Authenticity
                  </h3>
                  <p
                    className="text-base lg:text-lg leading-relaxed"
                    style={{
                      color: 'var(--muted-foreground)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '1rem',
                      paddingBottom: '2rem',
                    }}
                  >
                    Multi-agent AI analyzes holographic patterns and visual
                    features with transparent reasoning
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                className="group relative p-12 lg:p-16 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center backdrop-blur-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-vault-blue)';
                  e.currentTarget.style.boxShadow =
                    '0 20px 60px rgba(59, 130, 246, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="space-y-6 text-center w-full flex flex-col items-center">
                  <div
                    className="mb-12"
                    style={{ paddingTop: '2rem', paddingBottom: '1rem' }}
                  >
                    <TrendingUp
                      className="w-16 h-16"
                      style={{ color: 'var(--color-vault-blue)' }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3
                    className="text-2xl lg:text-3xl font-bold mb-8"
                    style={{
                      fontFamily: 'var(--font-display)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                    }}
                  >
                    Multi-Source Valuation
                  </h3>
                  <p
                    className="text-base lg:text-lg leading-relaxed"
                    style={{
                      color: 'var(--muted-foreground)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '1rem',
                      paddingBottom: '2rem',
                    }}
                  >
                    Real-time pricing from eBay, TCGPlayer, and PriceCharting
                    for accurate market value
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div
                className="group relative p-12 lg:p-16 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center backdrop-blur-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-holo-cyan)';
                  e.currentTarget.style.boxShadow =
                    '0 20px 60px rgba(6, 182, 212, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="space-y-8 text-center w-full flex flex-col items-center">
                  <div
                    className="mb-12"
                    style={{ paddingTop: '2rem', paddingBottom: '1rem' }}
                  >
                    <Sparkles
                      className="w-16 h-16"
                      style={{ color: 'var(--color-holo-cyan)' }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3
                    className="text-2xl lg:text-3xl font-bold mb-8"
                    style={{
                      fontFamily: 'var(--font-display)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                    }}
                  >
                    Instant Recognition
                  </h3>
                  <p
                    className="text-base lg:text-lg leading-relaxed"
                    style={{
                      color: 'var(--muted-foreground)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '1rem',
                      paddingBottom: '2rem',
                    }}
                  >
                    Snap a photo for instant card identification, set, rarity,
                    and variant detection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-96"></div>

        {/* Value Prop Section */}
        <section className="px-6 flex items-center justify-center">
          <div className="max-w-6xl w-full text-center space-y-10 px-4">
            <p
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Other apps show you a price.
              <br />
              <span
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-holo-cyan), var(--color-emerald-glow))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CollectIQ shows you the truth.
              </span>
            </p>
            <p
              className="text-xl md:text-2xl lg:text-3xl"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Authentic, explainable, and reliable.
            </p>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-96"></div>
      </main>

      <footer
        className="py-8 relative z-10 border-t"
        style={{
          borderColor: 'var(--border)',
          paddingTop: '1rem',
          paddingBottom: '1rem',
        }}
      >
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
