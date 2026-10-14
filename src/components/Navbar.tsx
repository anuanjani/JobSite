'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [profile, setProfile] = useState({
    name: 'Anu Anjani',
    role: 'Principal Consultant',
    avatar: '',
    email: '',
    searchAppearances: 887,
    recruiterActions: 49
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Fetch real profile data and calculate dynamic notification badge count
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      fetch(`/api/profile?email=${parsedUser.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            const currentSearch = data.searchAppearances || 887;
            const currentActions = data.recruiterActions || 49;

            setProfile({
              name: data.name || parsedUser.name,
              role: data.role || data.resumeHeadline || 'Principal Consultant',
              avatar: data.avatar || '',
              email: data.email,
              searchAppearances: currentSearch,
              recruiterActions: currentActions
            });

            // Compare with last saved stats in localStorage to calculate dynamic badge (1 or 2)
            const lastSearch = localStorage.getItem('last_search_appearances');
            const lastActions = localStorage.getItem('last_recruiter_actions');

            let changes = 0;
            if (lastSearch && parseInt(lastSearch) !== currentSearch) changes++;
            if (lastActions && parseInt(lastActions) !== currentActions) changes++;

            // If first time visiting, simulate 2 changes
            if (!lastSearch || !lastActions) {
              changes = 2;
              localStorage.setItem('last_search_appearances', currentSearch.toString());
              localStorage.setItem('last_recruiter_actions', currentActions.toString());
            }

            setBadgeCount(changes);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Close dropdowns if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When user opens the drawer, clear the notification badge as they have now seen it
  const handleOpenDrawer = () => {
    setShowProfileDrawer(true);
    setShowNotifications(false);
    setBadgeCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="flex justify-between items-center w-full" ref={navRef}>
      {/* ================= LOGO ================= */}
      <Link href="/candidate/dashboard" className="text-2xl font-extrabold tracking-tighter text-white hover:opacity-80 transition-opacity">
        ROLE<span className="text-blue-500">MATCH.</span>
      </Link>

      {/* ================= RIGHT ACTIONS ================= */}
      <div className="flex items-center gap-6">
        
        <Link href="/jobs" className="text-[13px] font-bold text-slate-300 hover:text-white transition-colors tracking-wide">
          Jobs
        </Link>

        {/* 1. NOTIFICATIONS BELL */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileDrawer(false); }} 
            className="text-slate-400 hover:text-white transition-colors relative flex items-center justify-center p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-slate-900"></span>
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-700/80 flex justify-between items-center bg-slate-800/50">
                <span className="font-bold text-white">Notifications</span>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">4 New</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                <div className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                  <p className="text-sm text-slate-300 leading-relaxed"><span className="text-blue-400 font-bold">Job Recommendations:</span> 12 new matches based on your role and location.</p>
                  <span className="text-xs text-slate-500 mt-2 block font-medium">Just now</span>
                </div>
                <div className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                  <p className="text-sm text-slate-300 leading-relaxed"><span className="text-emerald-400 font-bold">Profile Viewed:</span> Viewed by 3 recruiters today.</p>
                  <span className="text-xs text-slate-500 mt-2 block font-medium">2 hours ago</span>
                </div>
                <div className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                  <p className="text-sm text-slate-300 leading-relaxed"><span className="text-purple-400 font-bold">Resume Downloaded:</span> Tech Corp downloaded your resume.</p>
                  <span className="text-xs text-slate-500 mt-2 block font-medium">5 hours ago</span>
                </div>
                <div className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer">
                  <p className="text-sm text-slate-300 leading-relaxed"><span className="text-yellow-400 font-bold">Profile Shortlisted 🎉:</span> You have been shortlisted for a position.</p>
                  <span className="text-xs text-slate-500 mt-2 block font-medium">1 day ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. PROFILE PILL (Hamburger + Avatar) */}
        <div className="relative">
          <button 
            onClick={handleOpenDrawer} 
            className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-600 hover:border-slate-400 p-1.5 pl-3.5 rounded-full transition-all shadow-sm group cursor-pointer relative"
          >
            {/* 3 Lines (Hamburger) */}
            <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border-2 border-transparent group-hover:border-blue-500 transition-all flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs">👤</span>
              )}
            </div>

            {/* Dynamic Badge (shows 1 or 2 based on metric updates) */}
            {badgeCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-slate-900 shadow-md animate-pulse">
                {badgeCount}
              </div>
            )}
          </button>

          {/* ================= FULL-LENGTH SLIDE-OUT DRAWER ================= */}
          {showProfileDrawer && (
            <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
              
              {/* Drawer Container (Full Height) */}
              <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
                
                <div>
                  {/* Drawer Header with Close Button */}
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40 sticky top-0 z-10 backdrop-blur-md">
                    <span className="font-extrabold text-white text-base tracking-wider uppercase">Candidate Profile</span>
                    <button 
                      onClick={() => setShowProfileDrawer(false)}
                      className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Top User Info Section */}
                  <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-800/20">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="30" fill="none" stroke="#1e293b" strokeWidth="3" />
                        <circle cx="32" cy="32" r="30" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="188" strokeDashoffset="0" />
                      </svg>
                      <div className="w-13 h-13 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                        {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-lg">👤</span>}
                      </div>
                      <span className="absolute -bottom-1 bg-white text-emerald-600 text-[9px] font-extrabold px-2 py-0.2 rounded-full shadow">100%</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate">{profile.name}</h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{profile.role}</p>
                      <Link href="/candidate/dashboard" onClick={() => setShowProfileDrawer(false)} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mt-2 inline-block">
                        View & Update Profile &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Pro Upgrade Banner */}
                  <div className="p-4 mx-6 my-6 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-lg">👑</div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-300">Upgrade to RoleMatch Pro</h4>
                        <p className="text-[11px] text-slate-400">Get highlighted to top recruiters</p>
                      </div>
                    </div>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform font-bold">&rsaquo;</span>
                  </div>

                  {/* Profile Performance Metrics Box (Wired to Recruiter Stats) */}
                  <div className="mx-6 mb-6 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your profile performance</span>
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 rounded">Last 90 days</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                        <div className="text-xl font-extrabold text-white">{profile.searchAppearances}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Search Appearances</div>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                        <div className="text-xl font-extrabold text-white">{profile.recruiterActions}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Recruiter Actions</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="px-6 space-y-2 pb-8">
                    <Link href="/candidate/dashboard" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                      <span>⚙️</span> Settings & Preferences
                    </Link>
                    <Link href="/faqs" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                      <span>❓</span> Help & FAQs
                    </Link>
                  </div>
                </div>

                {/* Bottom Logout Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/80 sticky bottom-0">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-bold border border-red-500/20">
                    <span>🚪</span> Logout
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
