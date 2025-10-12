import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Collect IQ</h1>
      <p>Next.js 14 App Router is running.</p>
      <ul>
        <li>
          Health check: <Link href="/health">/health</Link>
        </li>
      </ul>
    </main>
  );
}
