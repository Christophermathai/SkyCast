import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import Link from 'next/link';
import { CloudSun, Home, Clock } from 'lucide-react';

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
        {/* Looping Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-70"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        {/* Global Glass Overlay */}
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[-1]" />

        {/* Collapsible Sidebar */}
        <aside className="group/sidebar w-16 hover:w-56 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 h-screen flex flex-col py-8 px-2 transition-all duration-300 z-50 overflow-hidden shrink-0">
          <Link href="/" className="flex items-center w-full mb-10 overflow-hidden">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-emerald-400 p-2 rounded-xl transition-transform shadow-lg shadow-blue-500/20">
                <CloudSun className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="text-3xl tracking-wide font-display font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-3 transition-all duration-300 whitespace-nowrap overflow-hidden">
              SkyCast
            </span>
          </Link>

          <nav className="flex flex-col gap-2 w-full">
            <Link href="/" className="flex items-center w-full text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group overflow-hidden">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-3 transition-all duration-300 font-medium text-sm tracking-wide whitespace-nowrap overflow-hidden">Dashboard</span>
            </Link>
            <Link href="/history" className="flex items-center w-full text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group overflow-hidden">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-3 transition-all duration-300 font-medium text-sm tracking-wide whitespace-nowrap overflow-hidden">History</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="max-w-6xl mx-auto px-4 md:px-12 py-8 w-full min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
