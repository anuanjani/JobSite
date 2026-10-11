#!/bin/bash

echo "🚀 Adding Close (X) buttons to all footer pages..."

# ==========================================
# 1. UPDATE ALL 11 STATIC PAGES
# ==========================================
pages=(
  "about|About Us"
  "careers|Careers"
  "sitemap|Sitemap"
  "credits|Credits"
  "help|Help Center"
  "summons|Summons & Notices"
  "grievances|Grievances"
  "privacy|Privacy Policy"
  "terms|Terms & Conditions"
  "fraud-alert|Fraud Alert"
  "trust|Trust & Safety"
)

for item in "${pages[@]}"; do
  route="${item%%|*}"
  title="${item##*|}"
  
  cat << EOF > "src/app/$route/page.tsx"
import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function StaticPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20">
        <Navbar />
      </div>
      
      <main className="flex-grow max-w-[1000px] mx-auto w-full p-6 md:p-12 mt-10 mb-20 relative z-10">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
          
          {/* CLOSE (X) BUTTON */}
          <Link href="/" className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 text-slate-500 hover:text-fuchsia-400 transition-all duration-300 z-50 shadow-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </Link>

          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-6 relative z-10 pr-12">
            $title
          </h1>
          
          <div className="w-20 h-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full mb-10 relative z-10"></div>
          
          <div className="space-y-6 text-slate-300 leading-relaxed relative z-10">
            <p className="text-lg font-medium text-white">Welcome to the RoleMatch information portal.</p>
            <p>This is a placeholder for your actual page content. You can replace this text with your company's official policies, terms, career listings, or contact information.</p>
            <p>Our platform is dedicated to connecting top talent with industry-leading employers seamlessly. All terms and policies outlined across our platform are designed to ensure a safe, secure, and highly productive environment for all users.</p>
            
            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Core Principles</h2>
            <ul className="list-disc list-inside space-y-3 ml-2 border-l-2 border-slate-700 pl-4">
              <li>Absolute commitment to user privacy and data security.</li>
              <li>Transparent processes for reporting grievances and issues.</li>
              <li>Strict, zero-tolerance enforcement against fraud and policy violations.</li>
            </ul>
            
            <div className="mt-12 pt-8 border-t border-slate-700/50">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Last updated: October 2026</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
EOF
done
echo "✅ Added Close buttons to 11 static pages"

# ==========================================
# 2. UPDATE REPORT ISSUE PAGE
# ==========================================
cat << 'EOF' > src/app/report/page.tsx
import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function ReportIssuePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20">
        <Navbar />
      </div>
      
      <main className="flex-grow max-w-[1200px] mx-auto w-full p-6 md:p-8 mb-20 relative z-10">
        
        {/* CLOSE (X) BUTTON */}
        <Link href="/" className="absolute top-0 right-6 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 text-slate-500 hover:text-fuchsia-400 transition-all duration-300 z-50 shadow-lg">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Link>

        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-12 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">Report an Issue</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">We take your concerns seriously. Whether it's a platform bug, a suspicious listing, or a security vulnerability, let us know.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-xl mb-4 border border-slate-700">📞</div>
              <h3 className="text-lg font-bold text-white mb-1">Phone Support</h3>
              <p className="text-sm text-slate-400 mb-4">Available Mon-Fri, 9AM-6PM IST</p>
              <p className="text-fuchsia-400 font-bold tracking-wider">1-800-ROLEMATCH</p>
              <p className="text-fuchsia-400 font-bold tracking-wider">+91 80 1234 5678</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-xl mb-4 border border-slate-700">✉️</div>
              <h3 className="text-lg font-bold text-white mb-1">Email Support</h3>
              <p className="text-sm text-slate-400 mb-4">We typically reply within 24 hours.</p>
              <p className="text-slate-300 text-sm mb-2"><span className="font-bold text-white">General:</span> support@rolematch.com</p>
              <p className="text-slate-300 text-sm mb-2"><span className="font-bold text-white">Security:</span> security@rolematch.com</p>
              <p className="text-slate-300 text-sm"><span className="font-bold text-white">Legal:</span> legal@rolematch.com</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Submit a Ticket</h2>
            
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">I am a...</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors appearance-none">
                    <option>Candidate / Job Seeker</option>
                    <option>Employer / Recruiter</option>
                    <option>Security Researcher (Bug Bounty)</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Issue Type</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors appearance-none">
                    <option>Report a fraudulent job / user</option>
                    <option>Technical Bug / Glitch</option>
                    <option>Bug Bounty Vulnerability</option>
                    <option>Billing Issue</option>
                    <option>General Concern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                <input type="email" placeholder="So we can get back to you" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                <textarea rows="5" placeholder="Please describe the issue..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors resize-none"></textarea>
              </div>

              <button type="button" className="w-full bg-fuchsia-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-fuchsia-500 transition-colors shadow-lg mt-4">
                Submit Report
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
EOF
echo "✅ Updated Report Issue page"

# ==========================================
# 3. UPDATE EMPLOYER HOME PAGE
# ==========================================
cat << 'EOF' > src/app/employer/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function EmployerHome() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20">
        <Navbar />
      </div>
      
      <main className="flex-grow max-w-[1200px] mx-auto w-full p-6 md:p-12 mt-10 mb-20 relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* CLOSE (X) BUTTON */}
        <Link href="/" className="absolute top-0 right-6 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 text-slate-500 hover:text-fuchsia-400 transition-all duration-300 z-50 shadow-lg">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Link>

        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <span className="text-fuchsia-400 font-bold tracking-widest text-sm uppercase mb-6 bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-500/20 shadow-sm mt-8">
          Employer Portal
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-[1.1]">
          Hire the best <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">talent instantly.</span>
        </h1>
        <p className="text-lg text-slate-400 mb-12 max-w-2xl">
          Access thousands of pre-vetted candidates, post your jobs in seconds, and track applications seamlessly with our advanced employer tools.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/employer/dashboard" className="px-8 py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center">
            Go to Dashboard
          </Link>
          <Link href="/employer/jobs/new" className="px-8 py-4 rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-700 hover:border-slate-500 transition-colors shadow-lg text-center">
            Post a New Job
          </Link>
        </div>
      </main>
    </div>
  );
}
EOF
echo "✅ Updated Employer Home page"
echo "🎉 All close buttons successfully added!"