import React from 'react';
import Navbar from '../../components/Navbar';

export default function StaticPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      
      {/* ALIGNED NAVBAR */}
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20">
        <Navbar />
      </div>
      
      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-[1000px] mx-auto w-full p-6 md:p-12 mt-10 mb-20">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-6 relative z-10">
            Careers
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
      
      {/* Note: Footer component was intentionally removed here to stop it from rendering twice. */}
    </div>
  );
}
