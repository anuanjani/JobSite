import React from 'react';
import Link from 'next/link';

export default function HireLandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        <nav className="flex justify-between items-center mb-20 border-b border-slate-700/50 pb-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-indigo-500">.</span> <span className="text-xs text-slate-500 font-bold ml-2 uppercase tracking-widest">For Employers</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition mr-4">
              For Candidates
            </Link>
            <Link href="/login" className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition">
              Employer Login
            </Link>
          </div>
        </nav>

        <header className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl md:text-[5rem] font-extrabold tracking-tighter leading-[1.1] mb-8 text-white">
            Hire the top 1% of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">tech talent.</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium mb-10 max-w-2xl mx-auto">
            Stop sorting through irrelevant resumes. Our AI-driven matching engine connects you directly with pre-vetted candidates who fit your exact technical requirements.
          </p>
          <Link href="/employer/jobs/new" className="bg-indigo-600 text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-indigo-500 transition shadow-[0_0_40px_rgba(79,70,229,0.4)]">
            Post Your First Job
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { title: 'AI Matching', desc: 'Our algorithm reads between the lines to find candidates who truly match your stack.', icon: '🧠' },
            { title: 'Verified Profiles', desc: 'Every candidate profile is enriched with GitHub and portfolio analytics.', icon: '⚡️' },
            { title: 'Instant ATS', desc: 'Manage your pipeline, message candidates, and schedule interviews in one place.', icon: '📊' },
          ].map((feature, idx) => (
            <div key={idx} className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 text-center hover:bg-slate-800/60 transition">
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="font-bold text-xl text-white tracking-tight mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}