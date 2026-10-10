import React from 'react';
import Link from 'next/link';

export default function ApplicantsPage() {
  const applicants = ['Alice Smith', 'Michael Chen', 'Sarah Jones', 'David Kim'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative pb-20">
      
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10 h-screen flex flex-col">
        <nav className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-6 shrink-0">
          <div>
            <Link href="/employer/dashboard" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition mb-2 block">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Applicants: Senior Frontend Engineer</h1>
          </div>
          <div className="flex gap-2 text-xs font-bold uppercase tracking-widest">
            <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full border border-slate-700">Total: 128</span>
            <span className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20">New: 12</span>
          </div>
        </nav>

        {/* ATS SPLIT VIEW */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Left: Applicant List */}
          <aside className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto pr-2">
            {applicants.map((name, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border cursor-pointer transition ${idx === 0 ? 'bg-slate-800 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{name}</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">98% Match</span>
                </div>
                <p className="text-xs text-slate-400 font-medium mb-3">Applied 2 hours ago</p>
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-900 px-2 py-1 rounded">React</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-900 px-2 py-1 rounded">Next.js</span>
                </div>
              </div>
            ))}
          </aside>

          {/* Right: Detailed Resume View */}
          <main className="lg:col-span-8 rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 flex flex-col overflow-y-auto relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10 border-b border-slate-700/50 pb-8">
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-2xl font-bold border border-slate-600">
                  AS
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-1">Alice Smith</h2>
                  <p className="text-slate-400 font-medium">Software Engineer @ FinTech Corp | Bengaluru</p>
                  <div className="flex gap-4 mt-3 text-xs font-bold uppercase tracking-widest text-indigo-400">
                    <a href="#" className="hover:text-indigo-300">View GitHub ↗</a>
                    <a href="#" className="hover:text-indigo-300">View LinkedIn ↗</a>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-slate-700 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-600 transition">Reject</button>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition">Shortlist</button>
              </div>
            </div>

            <div className="space-y-8 relative z-10 flex-1">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Summary</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Highly skilled frontend engineer with 5 years of experience specializing in React ecosystem. Passionate about building accessible, performant, and beautiful user interfaces.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Experience</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white">Frontend Engineer <span className="text-slate-500 font-normal">@ FinTech Corp</span></h4>
                    <p className="text-xs text-slate-400 mb-2">2021 - Present</p>
                    <p className="text-sm text-slate-300 leading-relaxed">Built and maintained the core customer dashboard serving 500k+ active users. Improved lighthouse performance score by 35%.</p>
                  </div>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}