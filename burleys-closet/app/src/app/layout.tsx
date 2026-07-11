import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: "Burley's Closet",
  description: 'Vintage big & tall resale — intake to shipped',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#b45309',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-20">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-amber-800">
              Burley&apos;s Closet
            </Link>
            <nav className="flex gap-3 text-sm font-medium text-stone-600">
              <Link href="/items" className="hover:text-amber-800">Items</Link>
              <Link href="/items/new" className="hover:text-amber-800">+ Intake</Link>
              <Link href="/poshmark" className="hover:text-amber-800">Posh</Link>
              <Link href="/packing" className="hover:text-amber-800">Pack</Link>
              <Link href="/money" className="hover:text-amber-800">Money</Link>
              <Link href="/settings" className="hover:text-amber-800">⚙</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
