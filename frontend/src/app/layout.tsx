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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <div className="app-layout" id="main-content" role="main">
            {children}
          </div>
          <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
        </AuthProvider>
      </body>
    </html>
  );
}
