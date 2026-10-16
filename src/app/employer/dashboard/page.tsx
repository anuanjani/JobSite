'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function EmployerDashboardPage() {
  const [companyName, setCompanyName] = useState('TechCorp Inc.');
  const [companyEmail, setCompanyEmail] = useState('');
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCompanyEmail(parsed.email);
      if (parsed.name) setCompanyName(parsed.name);

      // Fetch live employer stats and applicants from Neon database
      fetch(`/api/employer/dashboard?email=${encodeURIComponent(parsed.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setActiveJobsCount(data.activeJobsCount || 0);
            setTotalApplicantsCount(data.totalApplicantsCount || 0);
            setApplicants(data.applicants || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      window.location.href = '/login';
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const initials = companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        
        {/* NAVBAR */}
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-indigo-500">.</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 mr-8 uppercase">
              <Link href="/employer/talent" className="hover:text-white transition pb-1">Talent Search</Link>
            </div>
            
            <Link href="/employer/jobs/new" className="px-6 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition mr-4">
              + Post Job
            </Link>
            
            {/* CLICKABLE PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold tracking-tighter hover:border-indigo-500 transition cursor-pointer text-white"
              >
                {initials || 'TC'}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-800 border border-slate-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[99999]">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-bold text-white truncate">{companyName}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{companyEmail}</p>
                  </div>
                  <div className="p-2 flex flex-col">
                    <Link href="/settings" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition">Settings</Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition text-left mt-1 border-t border-slate-700 cursor-pointer">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-4 text-white">
            Recruiter HQ<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{companyName}</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Active Jobs</p>
              <p className="text-6xl font-extrabold tracking-tighter text-white">
                {String(activeJobsCount).padStart(2, '0')}
              </p>
              <Link href="/employer/jobs/new" className="text-indigo-400 text-sm mt-4 font-bold block hover:text-indigo-300">Manage Postings →</Link>
            </div>
            
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Total Applicants</p>
              <p className="text-5xl font-extrabold tracking-tighter text-white">{totalApplicantsCount}</p>
              <span className="inline-block mt-3 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-bold border border-emerald-400/25">Live pipeline</span>
            </div>
          </aside>

          <main className="lg:col-span-9 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-lg font-bold tracking-tight text-white">Recent Applicants</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Database Feed</span>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading applicants...</div>
              ) : applicants.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/30 rounded-2xl border border-slate-700/50">
                  No applicants have applied to your job postings yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {applicants.map((app, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-700/30 border border-slate-700/50 hover:bg-slate-700/60 transition cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-600 rounded-xl flex items-center justify-center font-bold text-lg text-slate-300">
                          {app.name ? app.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-white tracking-tight group-hover:text-indigo-400 transition">{app.name || 'Candidate'}</h3>
                          <p className="text-sm text-slate-400 font-medium">Applied for: {app.role || 'Job Posting'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Status</span>
                          <span className="text-sm font-black text-emerald-400">Active</span>
                        </div>
                        <div className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-28 text-center">
                          {app.status || 'Applied'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}