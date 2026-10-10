import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700/50 pt-16 pb-8 relative z-50">
      <div className="max-w-[1400px] mx-auto p-6 md:p-8">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white block mb-6">
              ROLEMATCH<span className="text-fuchsia-500">.</span>
            </Link>
            <p className="text-sm font-bold text-slate-400 mb-4">Connect with us</p>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <div key={social} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-fuchsia-500 hover:border-fuchsia-500 hover:text-white text-slate-400 transition cursor-pointer">
                  <span className="text-xs font-bold">{social[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="lg:col-span-1">
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><Link href="#" className="hover:text-fuchsia-400 transition">About us</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Careers</Link></li>
              <li><Link href="/hire" className="hover:text-fuchsia-400 transition">Employer home</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Sitemap</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Credits</Link></li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div className="lg:col-span-1">
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><Link href="/faqs" className="hover:text-fuchsia-400 transition">Help center</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Summons/Notices</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Grievances</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Report issue</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div className="lg:col-span-1">
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Privacy policy</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Terms & conditions</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Fraud alert</Link></li>
              <li><Link href="#" className="hover:text-fuchsia-400 transition">Trust & safety</Link></li>
            </ul>
          </div>

          {/* Column 5: App Download */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-white font-bold mb-2">Apply on the go</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Get real-time job updates on our App</p>
              <div className="flex flex-col gap-3">
                <button className="bg-slate-900 border border-slate-600 hover:border-slate-400 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition w-full">
                  <span className="text-lg">🤖</span>
                  <div className="text-left">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">Get it on</div>
                    <div className="text-xs font-bold leading-none">Google Play</div>
                  </div>
                </button>
                <button className="bg-slate-900 border border-slate-600 hover:border-slate-400 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition w-full">
                  <span className="text-lg">🍎</span>
                  <div className="text-left">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">Download on the</div>
                    <div className="text-xs font-bold leading-none">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright - UPDATED to remove infoedge and claim ROLEMATCH */}
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            <p>All trademarks are the property of their respective owners.</p>
            <p>All rights reserved © 2026 ROLEMATCH.</p>
          </div>

          {/* Partner Brands */}
          <div className="flex items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span className="hidden md:block">Our businesses</span>
            <div className="flex gap-6 items-center">
              <span className="hover:text-white transition cursor-pointer">IIMJOBS</span>
              <span className="hover:text-white transition cursor-pointer text-orange-400">HIRIST</span>
              <span className="hover:text-white transition cursor-pointer text-emerald-400">JOBHAI</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}