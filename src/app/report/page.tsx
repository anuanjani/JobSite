import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function ReportIssuePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20">
        <Navbar />
      </div>
      
      {/* ADDED 'group' TO MAIN TAG */}
      <main className="group flex-grow max-w-[1200px] mx-auto w-full p-6 md:p-8 mb-20 relative z-10">
        
        {/* CLOSE (X) BUTTON - NOW HAS opacity-0 group-hover:opacity-100 */}
        <Link href="/" className="absolute top-0 right-6 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 text-slate-500 hover:text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 shadow-lg">
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
