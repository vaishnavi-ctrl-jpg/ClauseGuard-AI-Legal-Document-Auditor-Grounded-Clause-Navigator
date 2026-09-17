import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClauseGuard | AI Legal Document Auditor & Clause Navigator',
  description:
    'AI-powered contract risk auditor, legalese-to-plain-English translator, and counter-proposal drafter with deterministic citation verification.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full flex flex-col antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
