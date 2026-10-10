import React from 'react';
import Link from 'next/link';

export default function EmployerDashboardPage() {
  const applicants = [
    { name: 'Alice Smith', role: 'Frontend Engineer', match: '98%', status: 'New', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Michael Chen', role: 'React Developer', match: '85%', status: 'In Review', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: 'Sarah Jones', role: 'UI/UX Designer', match: '72%', status: 'Interview', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-indigo-500">.</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 mr-8 uppercase">
              <Link href="/employer/dashboard" className="text-white border-b-2 border-indigo-500 pb-1">Dashboard</Link>
              <Link href="/employer/talent" className="hover:text-white transition pb-1">Talent Search</Link>
            </div>
            <Link href="/employer/jobs/new" className="px-6 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition mr-4">
              + Post Job
            </Link>
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold tracking-tighter">TC</div>
          </div>
        </nav>

        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-4 text-white">
            Recruiter HQ<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">TechCorp Inc.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Active Jobs</p>
              <p className="text-6xl font-extrabold tracking-tighter text-white">04</p>
              <Link href="/employer/jobs/new" className="text-indigo-400 text-sm mt-4 font-bold block hover:text-indigo-300">Manage Postings →</Link>
            </div>
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Total Applicants</p>
              <p className="text-5xl font-extrabold tracking-tighter text-white">128</p>
              <span className="inline-block mt-3 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-bold border border-emerald-400/20">+12 this week</span>
            </div>
          </aside>

          <main className="lg:col-span-9 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-lg font-bold tracking-tight text-white">Recent Applicants</h3>
                <Link href="/employer/jobs/123/applicants" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition">View All Pipeline ↗</Link>
              </div>
              
              <div className="flex flex-col gap-3">
                {applicants.map((app, idx) => (
                  <Link href="/employer/jobs/123/applicants" key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-700/30 border border-slate-700/50 hover:bg-slate-700/60 transition cursor-pointer group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-900 border border-slate-600 rounded-xl flex items-center justify-center font-bold text-lg text-slate-300">
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-tight group-hover:text-indigo-400 transition">{app.name}</h3>
                        <p className="text-sm text-slate-400 font-medium">Applied for: {app.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">AI Match</span>
                        <span className="text-sm font-black text-emerald-400">{app.match}</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${app.bg} ${app.color} border border-current/10 w-28 text-center`}>
                        {app.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}