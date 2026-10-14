'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Check if a user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="w-full flex items-center justify-between py-6">
      <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
        ROLEMATCH<span className="text-fuchsia-500">.</span>
      </Link>
      
      <div className="flex items-center gap-8">
        <Link href="/jobs" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
          FIND JOBS
        </Link>
        
        {!user ? (
          // GUEST NAVIGATION
          <>
            <Link href="/employer" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              For Employers
            </Link>
            <Link href="/login" className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-full transition-colors border border-slate-700 shadow-md">
              SIGN IN
            </Link>
          </>
        ) : (
          // CANDIDATE NAVIGATION (For Employers and Dashboard button removed)
          <>
            <Link href="/candidate/dashboard" className={`text-sm font-bold transition-colors ${pathname?.includes('dashboard') ? 'text-fuchsia-400' : 'text-slate-300 hover:text-white'}`}>
              PROFILE
            </Link>
            <button onClick={handleLogout} className="text-sm font-bold text-slate-400 hover:text-red-400 transition-colors">
              LOGOUT
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-fuchsia-500/20 uppercase">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}