'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FAQsPage() {
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        
        {/* DYNAMIC NAVBAR */}
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
          {/* FIXED: Logo now correctly links to Home ("/") */}
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 mr-8 uppercase">
              <Link href="/candidate/dashboard" className="hover:text-white transition pb-1">Dashboard</Link>
              <Link href="/jobs" className="hover:text-white transition pb-1">Jobs</Link>
            </div>
            
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
                  <div className="p-4 flex flex-col gap-1">
                    <Link href="/settings" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                      <span>⚙️</span> Settings
                    </Link>
                    <Link href="/faqs" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                      <span>❓</span> FAQs
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition flex items-center gap-3 text-left w-full mt-2 border-t border-slate-700 pt-4">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* HERO SEARCH SECTION */}
        <div className="text-center py-16 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-8">Hi, how can we help you?</h1>
          <div className="max-w-2xl mx-auto flex bg-white rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <input type="text" placeholder="Search by keyword" className="flex-1 px-8 py-4 text-black outline-none font-medium" />
            <button className="bg-slate-900 px-8 flex items-center justify-center hover:bg-slate-800 transition">
              <span className="text-white text-xl">🔍</span>
            </button>
          </div>
        </div>

        {/* QUICK SOLUTIONS TRENDING */}
        <div className="mb-20 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">🚀 Quick Solution</h2>
          <p className="text-xs text-slate-500 mb-8">as per the recent search trend</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-slate-700/50 rounded-2xl overflow-hidden max-w-5xl mx-auto border border-slate-700/50">
            {[
              "How can I delete my RoleMatch account?",
              "How can I deactivate my account?",
              "How can I update/edit my Profile?",
              "I do not want my current employer to have access. How can I block a recruiter?"
            ].map((q, i) => (
              <div key={i} className="bg-slate-900/80 p-6 flex flex-col justify-center hover:bg-slate-800 transition cursor-pointer text-sm font-medium text-slate-300 min-h-[120px]">
                <span className="text-fuchsia-400 mb-2">Q.</span>
                {q}
              </div>
            ))}
          </div>
        </div>

        {/* BROWSE BY TOPIC */}
        <div className="mb-20 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">Browse by Topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {[
               { icon: '👤', title: 'Create Profile' },
               { icon: '🔍', title: 'Search' },
               { icon: '📄', title: 'Apply' },
               { icon: '🧭', title: 'Getting around' },
               { icon: '⚙️', title: 'Settings' },
               { icon: '🛡️', title: 'Security Advice' },
             ].map((topic, i) => (
               <div key={i} className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-800 transition cursor-pointer aspect-square">
                 <span className="text-4xl mb-4">{topic.icon}</span>
                 <span className="text-xs font-bold text-slate-300">{topic.title}</span>
               </div>
             ))}
          </div>
        </div>

        {/* FOOTER SUPPORT FORM */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-[2rem] p-8 md:p-12 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✉️</span>
              <h2 className="text-2xl font-bold text-white">RoleMatch FastForward Services</h2>
            </div>
            
            <div className="space-y-6 text-sm">
              <div>
                <p className="text-slate-400 font-bold mb-1">Toll Free Number: <span className="text-white">1800-102-5557 , 1800-572-5557</span></p>
                <p className="text-slate-400">Work Timings: <span className="text-slate-300">9.30 AM to 6.30 PM</span></p>
                <p className="text-slate-400">Working Days: <span className="text-slate-300">(Monday to Saturday)</span></p>
              </div>
              <div>
                <p className="text-slate-400 font-bold">Email Id: <span className="text-fuchsia-400 hover:underline cursor-pointer">service@rolematch.com</span></p>
              </div>
              <div>
                <p className="text-slate-400">International clients: <span className="text-white font-bold">+91 120 4021100 (9.30 AM to 6.00 PM IST)</span></p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Report a problem/need assistance</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Enter your name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
              <input type="email" placeholder="Enter your registered email ID" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
              <input type="tel" placeholder="Enter your contact number" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
              
              <select defaultValue="" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none focus:border-fuchsia-500 transition-colors appearance-none">
                <option value="" disabled>Select area of concern</option>
                <option value="profile">Profile Issues</option>
                <option value="jobs">Job Applications</option>
                <option value="billing">Billing/Premium</option>
              </select>

              <textarea placeholder="Enter your feedback" rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors resize-none"></textarea>
              <button type="button" className="bg-fuchsia-600 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-fuchsia-500 transition shadow-[0_0_20px_rgba(192,38,211,0.3)]">
                Submit
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}