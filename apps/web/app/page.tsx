// CollectIQ Home Page - Demonstrating brand tokens and components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Header */}
        <header className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[var(--color-vault-blue)] to-[var(--color-holo-cyan)] bg-clip-text text-transparent font-[var(--font-display)]">
            CollectIQ
          </h1>
          <p className="text-xl text-[var(--muted-foreground)]">
            Your vault just leveled up
          </p>
        </header>

        {/* Button Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All button styles using CollectIQ brand tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="gradient">Gradient Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="error">Error</Button>
            </div>
          </CardContent>
        </Card>

        {/* Card/Panel Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:scale-[1.02] transition-transform">
            <CardHeader>
              <div className="inline-flex items-center justify-center rounded-full bg-[var(--color-vault-blue)] p-3 mb-4 w-12 h-12">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Vault Blue</CardTitle>
              <CardDescription>Reliability and clarity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">
                Main action color for buttons and highlights. Expresses trust and intelligence.
              </p>
            </CardContent>
            <CardFooter>
              <code className="text-xs font-[var(--font-mono)] text-[var(--color-vault-blue)]">#1A73E8</code>
            </CardFooter>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform">
            <CardHeader>
              <div className="inline-flex items-center justify-center rounded-full bg-[var(--color-holo-cyan)] p-3 mb-4 w-12 h-12">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Holo Cyan</CardTitle>
              <CardDescription>Vibrant energy and modernity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">
                Used for gradients and accents. Brings a tech-forward aesthetic.
              </p>
            </CardContent>
            <CardFooter>
              <code className="text-xs font-[var(--font-mono)] text-[var(--color-holo-cyan)]">#00C6FF</code>
            </CardFooter>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform">
            <CardHeader>
              <div className="inline-flex items-center justify-center rounded-full bg-[var(--color-emerald-glow)] p-3 mb-4 w-12 h-12">
                <svg className="w-6 h-6 text-[var(--color-carbon-gray)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-xl">Emerald Glow</CardTitle>
              <CardDescription>Success and positive signals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">
                Indicates price increases and successful actions throughout the app.
              </p>
            </CardContent>
            <CardFooter>
              <code className="text-xs font-[var(--font-mono)] text-[var(--color-emerald-glow)]">#00E676</code>
            </CardFooter>
          </Card>
        </div>

        {/* Gradient Demo */}
        <Card className="gradient-primary text-white overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-white">Gradient Card</CardTitle>
            <CardDescription className="text-white/80">
              45° gradient from Vault Blue to Holo Cyan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/90">
              This card demonstrates the primary gradient used for CTAs and important UI elements.
              The gradient creates visual interest while maintaining brand consistency.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--color-vault-blue)]">
              Learn More
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-[var(--muted-foreground)]">
          <p>CollectIQ Design System • No purple, no indigo • Only clean, modern blues</p>
        </footer>
      </div>
    </main>
  );
}
