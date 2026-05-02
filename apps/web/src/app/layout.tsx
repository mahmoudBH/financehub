// ============================================
// Root Layout
// ============================================
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FinanceHub - Digital Banking Dashboard',
  description: 'Modern fintech dashboard simulator for managing virtual bank accounts, cards, transfers, and more.',
  keywords: ['fintech', 'banking', 'dashboard', 'finance', 'simulator'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
