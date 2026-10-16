'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Loading...');
  const [userRole, setUserRole] = useState('Candidate');
  const [userAvatar, setUserAvatar] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('Account');
  const [showManageDropdown, setShowManageDropdown] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserName(parsed.name);
      setUserEmail(parsed.email);
      setUserRole(parsed.role || 'CANDIDATE');

      // Fetch live profile details (like avatar) from Neon
      fetch(`/api/profile?email=${parsed.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            if (data.name) setUserName(data.name);
            if (data.role) setUserRole(data.role);
            if (data.avatar) setUserAvatar(data.avatar);
          }
        })
        .catch(() => {});
    } else {
      router.push('/login');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (showProfileDrawer && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setShowProfileDrawer(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router, showProfileDrawer]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!userEmail) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/user/delete?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        localStorage.removeItem('user');
        router.push('/');
      } else {
        alert('Failed to delete account. Please try again.');
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const tabs = ['Communication and Privacy', 'Account', 'Job Preferences', 'Block Companies'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10" ref={navRef}>
        
        {/* CLEAN NAVBAR (Matches Dashboard & Jobs) */}
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          
          <div className="flex gap-6 items-center">
            <Link href="/jobs" className="text-[13px] font-bold text-slate-300 hover:text-white transition-colors tracking-wide">
              Jobs
            </Link>

            {/* NOTIFICATIONS BELL */}
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

            {/* PROFILE PILL (Opens Rich Slide-out Drawer) */}
            <div className="relative">
              <button 
                onClick={() => { setShowProfileDrawer(true); setShowNotifications(false); }} 
                className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-600 p-1.5 pl-3.5 rounded-full shadow-sm hover:border-slate-400 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-white font-bold">{userName?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </button>

              {/* RICH PROFILE DRAWER */}
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
                            {userAvatar ? <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-lg text-white font-bold">{userName?.charAt(0) || 'U'}</span>}
                          </div>
                          <span className="absolute -bottom-1 bg-white text-emerald-600 text-[9px] font-extrabold px-2 py-0.2 rounded-full shadow">100%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-extrabold text-white truncate">{userName}</h3>
                          <p className="text-sm font-bold text-slate-300 truncate mt-0.5">{userRole}</p>
                          <Link href="/candidate/dashboard" onClick={() => setShowProfileDrawer(false)} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mt-2 inline-block">
                            View & Update Profile &rarr;
                          </Link>
                        </div>
                      </div>

                      {/* PRO UPGRADE BANNER */}
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

                      {/* PERFORMANCE */}
                      <div className="mx-6 mt-6 mb-6 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your profile performance</span>
                          <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 rounded">Last 90 days</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 relative">
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                            <div className="text-xl font-extrabold text-white">871</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Search Appearances</div>
                          </div>
                          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 relative">
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                            <div className="text-xl font-extrabold text-white">50</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Recruiter Actions</div>
                          </div>
                        </div>
                      </div>

                      {/* DRAWER MENU LINKS */}
                      <div className="mx-6 space-y-2 mb-6">
                        <Link href="/candidate/dashboard" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors">
                          📊 Dashboard
                        </Link>
                        <Link href="/settings" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors">
                          ⚙️ Settings
                        </Link>
                        <Link href="/faqs" onClick={() => setShowProfileDrawer(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors">
                          ❓ FAQs
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 border-t border-slate-800 bg-slate-900/80 sticky bottom-0">
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-colors font-bold border border-red-500/30 cursor-pointer">
                        🚪 Logout
                      </button>
                    </div>
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

                <div className="rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Immediately looking for a job</h3>
                        <p className="text-sm text-slate-400">Recommended for candidates who are actively looking for job opportunities.</p>
                      </div>
                      <button className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition">Customize</button>
                    </div>
                  </div>
                  <div className="bg-fuchsia-600 px-6 py-3 flex items-center gap-3">
                     <div className="w-4 h-4 rounded-full bg-white border-4 border-fuchsia-600 ring-2 ring-white"></div>
                     <span className="text-white font-bold text-sm">Selected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab with Manage & Delete Functionality */}
            {activeTab === 'Account' && (
              <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
                <div 
                  onClick={() => setShowManageDropdown(!showManageDropdown)} 
                  className="flex justify-between items-center cursor-pointer hover:bg-slate-700/30 p-4 rounded-xl transition"
                >
                  <div>
                    <h3 className="text-lg font-bold text-white">Manage account</h3>
                    <p className="text-sm text-slate-400">Deactivate or permanently delete your RoleMatch account</p>
                  </div>
                  <span className={`text-slate-400 transition-transform duration-300 ${showManageDropdown ? 'rotate-180' : ''}`}>▼</span>
                </div>

                {showManageDropdown && (
                  <div className="mt-6 pt-6 border-t border-slate-700/50 px-4 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">Permanently Delete Account</h4>
                        <p className="text-xs text-slate-400 mt-0.5">This action is irreversible and removes all your profile data.</p>
                      </div>
                      <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-3">Are you absolutely sure?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              This will permanently delete your account, resume, applications, and remove your data from Rolematch servers.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}