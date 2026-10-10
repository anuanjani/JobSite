import React from 'react';
import Link from 'next/link';

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1000px] mx-auto p-6 md:p-8 relative z-10">
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-indigo-500">.</span>
          </Link>
          <Link href="/employer/dashboard" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">
            Cancel & Return
          </Link>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-2">Create Job Posting</h1>
          <p className="text-slate-400 font-medium">Reach thousands of targeted candidates instantly.</p>
        </header>

        <form className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 md:p-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Job Title</label>
              <input type="text" placeholder="e.g. Senior Backend Engineer" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Work Mode</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:border-indigo-500 transition-colors appearance-none">
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location</label>
              <input type="text" placeholder="e.g. Bengaluru, India" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Salary Range (LPA)</label>
              <input type="text" placeholder="e.g. 15-25" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Required Skills (Comma separated)</label>
            <input type="text" placeholder="React, Node.js, AWS, TypeScript" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Job Description</label>
            <textarea rows={6} placeholder="Describe the responsibilities and requirements..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <Link href="/employer/dashboard" className="bg-indigo-600 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Publish Job
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}