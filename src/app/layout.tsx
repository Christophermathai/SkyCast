import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Full Stack Weather App',
  description: 'A beautiful and dynamic weather application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen flex flex-col`}>
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              SkyCast
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link href="/history" className="hover:text-blue-400 transition-colors">History</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
