import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SENTINEL — Digital Safety & Threat Intelligence Platform',
    template: '%s | SENTINEL',
  },
  description:
    'SENTINEL helps people — particularly women — recognize digital threats, detect early warning signs and escalating patterns, reduce personal-information exposure, organize incidents, and access official reporting resources. Track 03: The Human Attack Surface.',
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-indigo-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
