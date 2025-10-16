/**
 * Vault page - placeholder for collection vault functionality
 * This will be implemented in a later task
 */
export default function VaultPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="text-center">
        <h1
          className="mb-4 text-4xl font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--foreground)',
          }}
        >
          Your Vault
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          This page is protected and requires authentication.
        </p>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Vault functionality will be implemented in a later task.
        </p>
      </div>
    </div>
  );
}
