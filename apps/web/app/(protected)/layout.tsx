import { AuthGuard } from '@/components/auth/AuthGuard';

/**
 * Protected layout that wraps all authenticated routes
 * Ensures user is authenticated before rendering children
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
