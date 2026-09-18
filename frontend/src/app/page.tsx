import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>LegalEase-AI</h1>
      <p>AI-powered legal document understanding assistant.</p>
      <Link href="/dashboard">Go to Dashboard</Link>
    </main>
  );
}
