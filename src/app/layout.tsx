import './globals.css';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col">
        {/* Universal Header across all pages */}
        <Header isGlobal />

        {/* Page content expands to fill the middle */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Universal Footer across all pages */}
        <Footer />

        {/* Tailwind CDN script */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </body>
    </html>
  );
}