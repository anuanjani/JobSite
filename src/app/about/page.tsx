import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>
      
      <div className="max-w-[1200px] mx-auto p-6 md:p-8 relative z-10">
        <nav className="flex justify-between items-center mb-20 border-b border-slate-700/50 pb-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">
            Back to Home
          </Link>
        </nav>

        <header className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-white">
            Building the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-500">future of work.</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            Founded in 2026, RoleMatch was built on a simple premise: the hiring process is broken. We are using AI and intelligent matching to connect the world's best talent with the most innovative companies instantly.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-10">
            <div className="text-4xl mb-6">⚡️</div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Our Mission</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              To eliminate the friction in hiring by prioritizing skills, transparency, and meritocracy over traditional resume screening.
            </p>
          </div>
          <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-10">
            <div className="text-4xl mb-6">🤝</div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Our Core Values</h2>
            <ul className="text-slate-400 font-medium leading-relaxed space-y-2 list-disc pl-5">
              <li>Transparency in salaries and expectations.</li>
              <li>Merit-first algorithmic matching.</li>
              <li>Respecting the time of both candidates and recruiters.</li>
            </ul>
          </div>
        </div>
        
        <div className="rounded-[2rem] bg-gradient-to-br from-indigo-900/50 to-fuchsia-900/50 backdrop-blur-md border border-indigo-500/30 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Ready to transform your career?</h2>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/jobs" className="bg-white text-black px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition">Find a Job</Link>
            <Link href="/hire" className="bg-indigo-600 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition">Hire Talent</Link>
          </div>
        </div>
      </div>
    </div>
  );
}