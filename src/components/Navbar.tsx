'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Allows us to know which page we are currently on!
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  
  // Dropdown States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isEmployerDropdownOpen, setIsEmployerDropdownOpen] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const employerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUserName(parsed.name);
      setUserInitials(parsed.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
    }

    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (employerDropdownRef.current && !employerDropdownRef.current.contains(event.target as Node)) {
        setIsEmployerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
      <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
        ROLEMATCH<span className="text-fuchsia-500">.</span>
      </Link>
      
      <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 uppercase items-center">
        {/* Dynamic Highlight: Only shows the fuchsia border if we are exactly on the /jobs page */}
        <Link href="/jobs" className={`transition ${pathname === '/jobs' ? 'text-white border-b-2 border-fuchsia-500 pb-1' : 'hover:text-white'}`}>
          Find Jobs
        </Link>
        
        {/* FOR EMPLOYERS DROPDOWN */}
        <div 
          className="relative py-2 group" 
          ref={employerDropdownRef} 
          onMouseEnter={() => setIsEmployerDropdownOpen(true)} 
          onMouseLeave={() => setIsEmployerDropdownOpen(false)}
        >
          <button 
            onClick={() => setIsEmployerDropdownOpen(!isEmployerDropdownOpen)} 
            className={`flex items-center gap-1.5 transition ${isEmployerDropdownOpen ? 'text-white' : 'hover:text-white'}`}
          >
            For Employers
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-200 ${isEmployerDropdownOpen ? 'rotate-180' : ''}`}><path d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {isEmployerDropdownOpen && (
            <div className="absolute top-full left-0 pt-2 w-56 z-50">
              <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden py-2">
                <Link href="/hire" className="block px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-fuchsia-400 transition">Hire Talent (Overview)</Link>
                <Link href="/employer/talent" className="block px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-fuchsia-400 transition">Search Candidates</Link>
                <div className="border-t border-slate-700 my-1"></div>
                <Link href="/employer/dashboard" className="block px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition">Employer Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
          <div className="flex items-center gap-4 relative" ref={profileDropdownRef}>
            <Link href="/candidate/dashboard" className="hidden md:block text-xs font-bold uppercase tracking-widest text-white hover:text-fuchsia-400 transition mr-2">Go to Dashboard →</Link>
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold tracking-tighter hover:border-fuchsia-500 transition cursor-pointer">
              {userInitials}
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-12 w-64 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-slate-700"><h3 className="font-bold text-white">{userName}</h3></div>
                <div className="p-2 flex flex-col">
                  <Link href="/candidate/dashboard" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition">Dashboard</Link>
                  <Link href="/candidate/profile" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition">Profile</Link>
                  <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition text-left mt-1 border-t border-slate-700">Logout</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition">Log In</Link>
            <Link href="/register" className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}