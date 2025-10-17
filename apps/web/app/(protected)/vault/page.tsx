'use client';

import * as React from 'react';
import { EmptyVault } from '@/components/vault/EmptyVault';
import { api } from '@/lib/api';

/**
 * Vault page - displays user's card collection
 * Shows empty state for first-run users
 */
export default function VaultPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasCards, setHasCards] = React.useState(false);

  React.useEffect(() => {
    // Check if user has any cards
    const checkCards = async () => {
      try {
        const response = await api.getCards({ limit: 1 });
        setHasCards(response.items.length > 0);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
        // Show empty state on error
        setHasCards(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCards();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--holo-cyan)] mx-auto" />
          <p className="text-[var(--muted-foreground)]">
            Loading your vault...
          </p>
        </div>
      </div>
    );
  }

  // Show empty state for first-run users
  if (!hasCards) {
    return <EmptyVault />;
  }

  // Placeholder for vault with cards (will be implemented in a later task)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-4xl font-bold font-display">Your Vault</h1>
      <p className="text-[var(--muted-foreground)]">
        Card collection display will be implemented in a later task.
      </p>
    </div>
  );
}
