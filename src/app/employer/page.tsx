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
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <span className="text-fuchsia-400 font-bold tracking-widest text-sm uppercase mb-6 bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-500/20 shadow-sm">
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
