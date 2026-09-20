import '../styles/global.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: 'LegalEase-AI — AI-Powered Legal Document Assistant',
  description:
    'Upload and understand your legal documents with AI-powered analysis. LegalEase-AI reads contracts, leases, and agreements, then explains them in plain language.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <div className="app-layout">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
