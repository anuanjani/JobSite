'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Loading...');
  const [userInitials, setUserInitials] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Communication and Privacy');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserName(parsed.name);
      setUserInitials(parsed.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
    } else {
      router.push('/login');
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const tabs = ['Communication and Privacy', 'Account', 'Job Preferences', 'Block Companies'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        
        {/* DYNAMIC NAVBAR */}
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 mr-8 uppercase">
              <Link href="/candidate/dashboard" className="hover:text-white transition pb-1">Dashboard</Link>
              <Link href="/jobs" className="hover:text-white transition pb-1">Jobs</Link>
              <Link href="/messages" className="hover:text-white transition pb-1">Messages</Link>
            </div>
            
            <button className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition backdrop-blur-md">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            
            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold tracking-tighter hover:border-fuchsia-500 transition cursor-pointer">
                {userInitials}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-800 border border-slate-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-bold text-white">{userName}</h3>
                    <Link href="/candidate/profile" className="text-[10px] font-bold text-fuchsia-400 hover:text-fuchsia-300">View Profile</Link>
                  </div>
                  <div className="p-2 flex flex-col">
                    <Link href="/candidate/dashboard" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition">Dashboard</Link>
                    <Link href="/settings" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition">Settings</Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition text-left mt-1 border-t border-slate-700">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[1.1] mb-2 text-white">Settings</h1>
          <p className="text-slate-400 font-medium max-w-3xl">Lets you easily control the communication you receive through RoleMatch, change your associated email or mobile number, deactivate your account and manage the job recommendations by specifying your desired career profile.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Navigation Tabs */}
          <aside className="lg:col-span-3 flex flex-col gap-2">
             {tabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left px-6 py-4 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab 
                    ? 'bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)]' 
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
          </aside>

          {/* RIGHT MAIN AREA: Settings Content */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            
            {activeTab === 'Communication and Privacy' && (
              <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white mb-2">Easily personalize your email, notification and privacy settings by telling us how urgently are you looking for a job</h2>
                  <p className="text-sm text-slate-400">Where are you in your job search?</p>
                </div>

                {/* Option 1: Immediately looking */}
                <div className="rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Immediately looking for a job</h3>
                        <p className="text-sm text-slate-400">Recommended for candidates who are actively looking for job opportunities.</p>
                      </div>
                      <button className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition">Customize</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-3">
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Job recommendations</p>
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Job status updates</p>
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Promotional mails</p>
                      </div>
                      <div className="space-y-3">
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Jobs & messages from recruiters</p>
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Who viewed my profile</p>
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Profile visible to all recruiters</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-fuchsia-600 px-6 py-3 flex items-center gap-3">
                     <div className="w-4 h-4 rounded-full bg-white border-4 border-fuchsia-600 ring-2 ring-white"></div>
                     <span className="text-white font-bold text-sm">Selected</span>
                  </div>
                </div>

                {/* Option 2: Not actively looking */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 hover:border-slate-500 transition cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Not actively looking but open for opportunities</h3>
                        <p className="text-sm text-slate-400">Recommended for candidates who are not looking for job opportunities right now but open to occasionally receiving relevant job opportunities from employer and RoleMatch.</p>
                      </div>
                      <button className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition">Customize</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-3">
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Job recommendations</p>
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Job status updates</p>
                      </div>
                      <div className="space-y-3">
                         <p className="text-sm text-slate-500 flex items-center gap-2"><span className="text-slate-600">✕</span> Jobs & messages from recruiters</p>
                         <p className="text-sm text-slate-300 flex items-center gap-2"><span className="text-emerald-500">✓</span> Who viewed my profile</p>
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab === 'Account' && (
              <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
                <div className="flex justify-between items-center cursor-pointer hover:bg-slate-700/30 p-4 rounded-xl transition">
                  <div>
                    <h3 className="text-lg font-bold text-white">Manage account</h3>
                    <p className="text-sm text-slate-400">Deactivate or permanently delete your RoleMatch account</p>
                  </div>
                  <span className="text-slate-400">▼</span>
                </div>
              </div>
            )}

             {activeTab === 'Job Preferences' && (
              <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
                 <h2 className="text-xl font-bold tracking-tight text-white mb-2">Job Preferences</h2>
                 <p className="text-sm text-slate-400">Configure your ideal job preferences.</p>
              </div>
            )}

            {activeTab === 'Block Companies' && (
              <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
                 <h2 className="text-xl font-bold tracking-tight text-white mb-2">Block Companies</h2>
                 <p className="text-sm text-slate-400">Manage companies you do not want to see your profile.</p>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}