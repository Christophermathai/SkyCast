import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ClientBody } from '@/components/ClientBody';

const thunder = localFont({
  src: './fonts/Thunder-VF.ttf',
  variable: '--font-thunder',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

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
      <body className={`font-sans ${thunder.variable} ${instrumentSerif.variable} text-slate-100 min-h-screen flex overflow-x-hidden relative`}>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
