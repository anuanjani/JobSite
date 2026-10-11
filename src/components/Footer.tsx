import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0b1120] border-t border-slate-800 pt-16 pb-8 text-slate-400 font-sans mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b border-slate-800 pb-16">
          
          <div className="md:col-span-4">
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white inline-block mb-6">
              ROLEMATCH<span className="text-fuchsia-500">.</span>
            </Link>
            <p className="text-sm font-bold text-white mb-4">Connect with us</p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" title="Follow RoleMatch on Facebook" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300 shadow-md">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </a>
              {/* Instagram */}
              <a href="#" title="Follow RoleMatch on Instagram" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white flex items-center justify-center transition-all duration-300 shadow-md">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              {/* X (Formerly Twitter) - Updated Logo */}
              <a href="#" title="Follow RoleMatch on X" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 shadow-md border hover:border-slate-700">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" title="Follow RoleMatch on LinkedIn" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-all duration-300 shadow-md">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 lg:grid-cols-3 gap-6 text-sm font-medium mt-2">
            <div className="flex flex-col gap-4">
              <Link href="/about" className="hover:text-fuchsia-400 transition-colors">About us</Link>
              <Link href="/careers" className="hover:text-fuchsia-400 transition-colors">Careers</Link>
              <Link href="/employer" className="hover:text-fuchsia-400 transition-colors">Employer home</Link>
              <Link href="/sitemap" className="hover:text-fuchsia-400 transition-colors">Sitemap</Link>
              <Link href="/credits" className="hover:text-fuchsia-400 transition-colors">Credits</Link>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/help" className="hover:text-fuchsia-400 transition-colors">Help center</Link>
              <Link href="/summons" className="hover:text-fuchsia-400 transition-colors">Summons/Notices</Link>
              <Link href="/grievances" className="hover:text-fuchsia-400 transition-colors">Grievances</Link>
              <Link href="/report" className="hover:text-fuchsia-400 transition-colors">Report issue</Link>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/privacy" className="hover:text-fuchsia-400 transition-colors">Privacy policy</Link>
              <Link href="/terms" className="hover:text-fuchsia-400 transition-colors">Terms & conditions</Link>
              <Link href="/fraud-alert" className="hover:text-fuchsia-400 transition-colors">Fraud alert</Link>
              <Link href="/trust" className="hover:text-fuchsia-400 transition-colors">Trust & safety</Link>
            </div>
          </div>

          <div className="md:col-span-3 border border-slate-800 rounded-2xl p-6 bg-slate-900/50 shadow-lg">
            <p className="text-white font-bold mb-2">Apply on the go</p>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Get real-time job updates on our App</p>
            
            <div className="flex flex-col gap-4">
              <button className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors rounded-xl p-3 w-full group">
                <svg className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-tight">Get it on</p>
                  <p className="text-sm font-bold text-white leading-tight">Google Play</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors rounded-xl p-3 w-full group">
                <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-tight">Download on the</p>
                  <p className="text-sm font-bold text-white leading-tight">App Store</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-xs font-medium">
          <div className="mb-4 md:mb-0">
            <p>All trademarks are the property of their respective owners.</p>
            <p>All rights reserved © 2026 ROLEMATCH.</p>
          </div>
          <div className="flex gap-6 items-center uppercase tracking-widest font-bold">
            <span className="text-slate-500">Our Businesses</span>
            <span className="text-white">IIMJOBS</span>
            <span className="text-orange-400">HIRIST</span>
            <span className="text-emerald-400">JOBHAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}