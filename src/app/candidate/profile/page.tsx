'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CandidateProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Loading...');
  const [userInitials, setUserInitials] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserName(parsed.name);
      setUserInitials(parsed.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
    } else {
      setUserName('Guest User');
      setUserInitials('GU');
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1200px] mx-auto p-6 md:p-8 relative z-10">
        
        {/* DYNAMIC NAVBAR */}
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 uppercase">
            <Link href="/candidate/dashboard" className="hover:text-white transition pb-1">Dashboard</Link>
            <Link href="/jobs" className="hover:text-white transition pb-1">Jobs</Link>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 rounded-full bg-slate-800 border border-fuchsia-500 flex items-center justify-center text-xs font-bold tracking-tighter cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              {userInitials}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-800 border border-slate-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-bold text-white">{userName}</h3>
                </div>
                <div className="p-2 flex flex-col">
                  <Link href="/candidate/dashboard" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition">Dashboard</Link>
                  <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition text-left mt-1 border-t border-slate-700">Logout</button>
                </div>
              </div>
            )}
          </div>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[1.1] mb-2 text-white">Digital Portfolio</h1>
          <p className="text-slate-400 font-medium">Manage your resume data and platform presence.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 p-1 mb-6">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-slate-900">
                  {userInitials}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{userName}</h2>
              <p className="text-sm text-slate-400 mb-4 font-medium">Senior Frontend Engineer</p>
              
              <div className="w-full space-y-4 text-left border-t border-slate-700/50 pt-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm font-medium text-slate-300">Bengaluru, India</p>
                </div>
              </div>
            </div>
            <button className="w-full text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 rounded-full py-4 hover:bg-indigo-500 transition shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Upload New PDF Resume
            </button>
          </aside>

          <main className="lg:col-span-8 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold tracking-tight text-white">Professional Summary</h3>
                <button className="text-slate-400 hover:text-white transition">✎ Edit</button>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">Passionate Senior Engineer with 6+ years of experience building scalable applications.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}