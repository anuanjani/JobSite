import './globals.css';
import Script from 'next/script';
import Footer from '../components/Footer'; // 1. Import your Footer

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* 2. Added flex and min-h-screen so the footer pushes to the absolute bottom */}
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col">
        
        {/* 3. Your page content goes here and expands to fill the middle */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 4. The Universal Footer goes here */}
        <Footer />

        {/* 5. CRITICAL: The Tailwind CDN script that keeps all your styles working! */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </body>
    </html>
  );
}