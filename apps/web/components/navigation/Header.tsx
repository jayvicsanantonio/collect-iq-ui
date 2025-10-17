'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  /**
   * Content to display on the right side of the header
   * (e.g., sign in button, user menu, etc.)
   */
  rightContent?: React.ReactNode;
  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * Floating header with Apple's liquid glass aesthetic
 * Used across both public and protected routes
 */
export function Header({ rightContent, className = '' }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center p-4 ${className}`}
    >
      <nav className="w-full rounded-2xl max-w-[1280px] backdrop-blur-[20px] text-[var(--foreground)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_88%,transparent)] dark:bg-[color-mix(in_srgb,var(--card)_70%,transparent)] shadow-[0_4px_24px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5),_0_1px_3px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center text-xl font-semibold tracking-[-0.02em] transition-all duration-200 hover:scale-[1.02] font-display text-[var(--foreground)]"
          >
            <span>Collect</span>
            <span className="relative ml-0.5 bg-gradient-to-tr from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
              IQ
            </span>
          </Link>

          {/* Right Content */}
          <div className="flex items-center gap-3">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
