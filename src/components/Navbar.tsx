'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({
    name: '', role: '', avatar: '', email: '', searchAppearances: 871, recruiterActions: 50
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(savedUser);
      setProfile(prev => ({
        ...prev,
        name: parsedUser.name || '',
        role: parsedUser.role || 'CANDIDATE',
        email: parsedUser.email || ''
      }));

      fetch(`/api/profile?email=${parsedUser.email}`).then(res => res.json()).then(data => {
        if (data.email) {
          setProfile({
            name: data.name || parsedUser.name, 
            role: data.role || parsedUser.role || 'Candidate', 
            avatar: data.avatar || '', 
            email: data.email,
            searchAppearances: data.searchAppearances || 871, 
            recruiterActions: data.recruiterActions || 50
          });
        }
      }).catch(() => {});
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (showProfileDrawer && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setShowProfileDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDrawer]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <div className="absolute top-0 left-0 right-0 w-full z-[999999] pointer-events-none">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-6 md:px-8 pointer-events-auto">
        <nav className="flex justify-between items-center w-full relative" ref={navRef}>
          
          {/* LOGO */}
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white hover:opacity-80 transition-opacity">
            ROLEMATCH<span className="text-pink-500">.</span>
          </Link>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6">
            <Link href="/jobs" className="text-[13px] font-bold text-slate-300 hover:text-white transition-colors tracking-wide">
              Jobs
            </Link>

            {isLoggedIn ? (
              <>
                {/* 1. NOTIFICATIONS BELL */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowNotifications(!showNotifications); setShowProfileDrawer(false); }} 
                    className="text-slate-400 hover:text-white relative p-2 cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[999999] overflow-hidden">
                      <div className="p-4 border-b border-slate-700/80 flex justify-between items-center bg-slate-800/50">
                        <span className="font-bold text-white">Notifications</span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        <div className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer">
                          <p className="text-sm text-slate-300 leading-relaxed"><span className="text-blue-400 font-bold">Job Recommendations:</span> 12 new matches based on your profile.</p>
                          <span className="text-xs text-slate-500 mt-2 block font-medium">Just now</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PROFILE PILL */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowProfileDrawer(true); setShowNotifications(false); }} 
                    className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-600 p-1.5 pl-3.5 rounded-full shadow-sm hover:border-slate-400 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                      {profile.avatar ? <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-xs text-white font-bold">{profile.name?.charAt(0) || 'U'}</span>}
                    </div>
                  </button>

                  {/* PROFILE DRAWER */}
                  {showProfileDrawer && (
                    <div className="fixed inset-0 z-[9999999] flex justify-end bg-slate-950/70 backdrop-blur-sm pointer-events-auto">
                      <div ref={drawerRef} className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-y-auto">
                        <div>
                          <div className="p-6 border-b border-slate-800 flex justify-end items-center bg-slate-800/40 sticky top-0 z-10 backdrop-blur-md">
                            <button onClick={() => setShowProfileDrawer(false)} className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                              ✕
                            </button>
                          </div>

                          <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-800/20">
                            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="30" fill="none" stroke="#1e293b" strokeWidth="3" />
                                <circle cx="32" cy="32" r="30" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="188" strokeDashoffset="0" />
                              </svg>
                              <div className="w-13 h-13 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                                {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-lg text-white font-bold">{profile.name?.charAt(0) || 'U'}</span>}
                              </div>
                              <span className="absolute -bottom-1 bg-white text-emerald-600 text-[9px] font-extrabold px-2 py-0.2 rounded-full shadow">100%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-extrabold text-white truncate">{profile.name}</h3>
                              <p className="text-sm font-bold text-slate-300 truncate mt-0.5">{profile.role || 'Candidate'}</p>
                              <Link href="/candidate/dashboard" onClick={() => setShowProfileDrawer(false)} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mt-2 inline-block">
                                View & Update Profile &rarr;
                              </Link>
                            </div>
                          </div>

                          {/* UPGRADE BANNER */}
                          <div className="mx-6 mt-6">
                            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">👑</div>
                                <div>
                                  <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">Upgrade to Rolematch Pro</h4>
                                  <p className="text-[11px] text-slate-400">Get highlighted to top recruiters</p>
                                </div>
                              </div>
                              <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                          </div>

                          {/* PROFILE PERFORMANCE */}
                          <div className="mx-6 mt-6 mb-6 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your profile performance</span>
                              <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 rounded">Last 90 days</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 relative">
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                                <div className="text-xl font-extrabold text-white">{profile.searchAppearances}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">Search Appearances</div>
                              </div>
                              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 relative">
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                                <div className="text-xl font-extrabold text-white">{profile.recruiterActions}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">Recruiter Actions</div>
                              </div>
                            </div>
                          </div>

                          {/* MENU LINKS */}
                          <div className="mx-6 space-y-2 mb-6">
                            <Link href="/about" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors">
                              Rolematch Blog
                            </Link>
                            <Link href="/settings" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors">
                              Settings
                            </Link>
                            <Link href="/faqs" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors">
                              FAQs
                            </Link>
                          </div>
                        </div>

                        {/* LOGOUT BUTTON */}
                        <div className="p-6 border-t border-slate-800 bg-slate-900/80 sticky bottom-0">
                          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-colors font-bold border border-red-500/30 cursor-pointer">
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* LOGGED OUT */
              <div className="flex items-center gap-5 pl-5 border-l border-slate-700">
                <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</Link>
                <Link href="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full shadow-md">Register</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}