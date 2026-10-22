'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  accentColor?: 'pink' | 'indigo';
  isGlobal?: boolean;
}

export default function Header({ accentColor, isGlobal = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    avatar: '',
    email: '',
    phone: '',
    headline: '',
    searchAppearances: 0,
    recruiterActions: 0,
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);
  const [activeEmployerMenu, setActiveEmployerMenu] = useState<
    'jobs' | 'resdex' | 'reports' | null
  >(null);
  const [expandSettings, setExpandSettings] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isEmployerUser =
    profile.role?.toUpperCase() === 'EMPLOYER' ||
    pathname?.startsWith('/employer/dashboard') ||
    pathname?.startsWith('/employer/company-profile') ||
    pathname?.startsWith('/employer/jobs') ||
    pathname?.startsWith('/employer/talent') ||
    pathname?.startsWith('/employer/buy-online');

  const resolvedAccent = accentColor || (isEmployerUser ? 'indigo' : 'pink');
  const dotColor =
    resolvedAccent === 'indigo' ? 'text-indigo-500' : 'text-pink-500';

  // Load user session & profile details
  useEffect(() => {
    if (!isGlobal) return;

    const loadUserAndProfile = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setIsLoggedIn(true);
          setProfile((prev) => ({
            ...prev,
            name: parsedUser.name || prev.name || '',
            role: parsedUser.role || prev.role || 'CANDIDATE',
            avatar: parsedUser.avatar || prev.avatar || '',
            email: parsedUser.email || prev.email || '',
            phone: parsedUser.phone || parsedUser.mobile || prev.phone || '',
          }));

          if (parsedUser.email) {
            fetch(`/api/profile?email=${encodeURIComponent(parsedUser.email)}`)
              .then((res) => res.json())
              .then((data) => {
                if (data && data.email) {
                  setProfile({
                    name: data.name || parsedUser.name || '',
                    role: data.role || parsedUser.role || 'CANDIDATE',
                    avatar: data.avatar || parsedUser.avatar || '',
                    email: data.email || parsedUser.email || '',
                    phone: data.phone || data.mobile || parsedUser.phone || '',
                    headline: data.designation || data.headline || '',
                    searchAppearances: data.searchAppearances ?? 0,
                    recruiterActions: data.recruiterActions ?? 0,
                  });
                }
              })
              .catch(() => {});
          }
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    loadUserAndProfile();

    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setProfile((prev) => ({
          ...prev,
          name: customEvent.detail.name ?? prev.name,
          avatar: customEvent.detail.avatar ?? prev.avatar,
          headline: customEvent.detail.headline ?? prev.headline,
          phone: customEvent.detail.phone ?? prev.phone,
        }));
      } else {
        loadUserAndProfile();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdated);
    window.addEventListener('storage', loadUserAndProfile);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated);
      window.removeEventListener('storage', loadUserAndProfile);
    };
  }, [pathname, isGlobal]);

  // Hide duplicate inline ROLEMATCH. headers inside <main>
  useEffect(() => {
    if (!isGlobal) return;

    const hideDuplicateInlineHeaders = () => {
      const mainEl = document.querySelector('main');
      if (!mainEl) return;

      const elements = mainEl.querySelectorAll('a, span');
      elements.forEach((el) => {
        if (el.textContent?.trim() === 'ROLEMATCH.') {
          const wrapper = el.closest('header, nav, div') as HTMLElement | null;
          if (!wrapper) return;

          if (
            wrapper.classList.contains('absolute') &&
            wrapper.classList.contains('top-0') &&
            wrapper.textContent?.trim() === 'ROLEMATCH.'
          ) {
            wrapper.style.display = 'none';
            return;
          }

          const navContainer = el.closest('header, nav') as HTMLElement | null;
          if (navContainer && mainEl.contains(navContainer)) {
            const hasButtonsOrInputs =
              navContainer.querySelectorAll('button, input').length > 0;
            if (!hasButtonsOrInputs) {
              navContainer.style.display = 'none';
            } else {
              (el as HTMLElement).style.display = 'none';
            }
          }
        }
      });
    };

    hideDuplicateInlineHeaders();
    const observer = new MutationObserver(hideDuplicateInlineHeaders);
    const mainEl = document.querySelector('main');
    if (mainEl) {
      observer.observe(mainEl, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [pathname, isGlobal]);

  // Close menus on outside click
  useEffect(() => {
    if (!isGlobal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (
        showProfileDrawer &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setShowProfileDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDrawer, isGlobal]);

  if (!isGlobal) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowProfileDrawer(false);
    window.location.href = '/';
  };

  const handleHeaderJobSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = headerSearch.trim()
      ? `?title=${encodeURIComponent(headerSearch.trim())}`
      : '';
    router.push(`/jobs${query}`);
  };

  const dashboardHref = isEmployerUser
    ? '/employer/dashboard'
    : '/candidate/dashboard';

  return (
    <>
      <header className="w-full px-8 py-4 md:px-12 md:py-5 flex items-center justify-between z-[99999] bg-slate-900 border-b border-slate-800/80 relative">
        <nav
          className="flex justify-between items-center w-full relative gap-6"
          ref={navRef}
        >
          {/* LEFT: BRAND LOGO & CONTEXTUAL NAVIGATION */}
          <div className="flex items-center gap-10">
            <Link
              href={isLoggedIn ? dashboardHref : '/'}
              className="text-2xl font-extrabold tracking-tighter text-white hover:opacity-80 transition-opacity shrink-0"
            >
              ROLEMATCH<span className={dotColor}>.</span>
            </Link>

            {/* EMPLOYER NAVIGATION MENU */}
            {isLoggedIn && isEmployerUser && (
              <div className="hidden md:flex items-center gap-8">
                {/* 1. Jobs & Responses Dropdown */}
                <div
                  className="relative py-2"
                  onMouseEnter={() => setActiveEmployerMenu('jobs')}
                  onMouseLeave={() => setActiveEmployerMenu(null)}
                >
                  <button
                    className={`text-sm font-bold transition-colors pb-1 border-b-2 cursor-pointer ${
                      activeEmployerMenu === 'jobs' ||
                      pathname?.startsWith('/employer/jobs')
                        ? 'text-white border-pink-500'
                        : 'text-slate-300 hover:text-white border-transparent'
                    }`}
                  >
                    Jobs &amp; Responses
                  </button>

                  {activeEmployerMenu === 'jobs' && (
                    <div className="absolute left-0 top-full w-60 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[999999] py-2.5 overflow-hidden">
                      <Link
                        href="/employer/jobs/new?type=free"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Post a Free Job
                      </Link>
                      <Link
                        href="/employer/jobs/new?type=hot"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Post a Hot Vacancy
                      </Link>
                      <Link
                        href="/employer/jobs/new?type=smb"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Post a SMB Job
                      </Link>
                      <Link
                        href="/employer/jobs/new?type=internship"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Post an Internship
                      </Link>
                      <Link
                        href="/employer/jobs"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors border-t border-slate-700/60 mt-1 pt-2.5"
                      >
                        Manage Jobs &amp; Responses
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Resdex Dropdown */}
                <div
                  className="relative py-2"
                  onMouseEnter={() => setActiveEmployerMenu('resdex')}
                  onMouseLeave={() => setActiveEmployerMenu(null)}
                >
                  <button
                    className={`text-sm font-bold transition-colors pb-1 border-b-2 cursor-pointer ${
                      activeEmployerMenu === 'resdex' ||
                      pathname?.startsWith('/employer/talent')
                        ? 'text-white border-pink-500'
                        : 'text-slate-300 hover:text-white border-transparent'
                    }`}
                  >
                    Resdex
                  </button>

                  {activeEmployerMenu === 'resdex' && (
                    <div className="absolute left-0 top-full w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[999999] py-2.5 overflow-hidden">
                      <Link
                        href="/employer/talent"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Search Resumes
                      </Link>
                      <Link
                        href="/employer/talent?action=nvite"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Send NVite
                      </Link>
                      <Link
                        href="/employer/talent?tab=searches"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Manage Searches
                      </Link>
                      <Link
                        href="/employer/talent?tab=folders"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Folders
                      </Link>
                      <Link
                        href="/employer/talent?tab=requirements"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Resdex Requirements
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Reports Dropdown */}
                <div
                  className="relative py-2"
                  onMouseEnter={() => setActiveEmployerMenu('reports')}
                  onMouseLeave={() => setActiveEmployerMenu(null)}
                >
                  <button
                    className={`text-sm font-bold transition-colors pb-1 border-b-2 cursor-pointer ${
                      activeEmployerMenu === 'reports'
                        ? 'text-white border-pink-500'
                        : 'text-slate-300 hover:text-white border-transparent'
                    }`}
                  >
                    Reports
                  </button>

                  {activeEmployerMenu === 'reports' && (
                    <div className="absolute left-0 top-full w-44 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[999999] py-2.5 overflow-hidden">
                      <Link
                        href="/report?type=job-posting"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Job Posting
                      </Link>
                      <Link
                        href="/report?type=resdex"
                        onClick={() => setActiveEmployerMenu(null)}
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/70 hover:text-white transition-colors"
                      >
                        Resdex
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CANDIDATE / EMPLOYEE TOP NAVIGATION */}
            {isLoggedIn && !isEmployerUser && (
              <div className="hidden lg:flex items-center gap-7">
                <Link
                  href="/jobs"
                  className="text-sm font-bold text-slate-200 hover:text-white transition-colors"
                >
                  Jobs
                </Link>
                <Link
                  href="/hire"
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Companies
                </Link>
                <Link
                  href="/credits"
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Services
                </Link>

                <form
                  onSubmit={handleHeaderJobSearch}
                  className="flex items-center bg-slate-800/90 border border-slate-700 rounded-full pl-4 pr-1.5 py-1 w-72 focus-within:border-blue-500 transition-colors"
                >
                  <input
                    type="text"
                    placeholder="Search jobs here"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder:text-slate-400 outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center gap-5">
            {!isLoggedIn && (
              <Link
                href="/jobs"
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Jobs
              </Link>
            )}

            {isLoggedIn ? (
              <>
                {!isEmployerUser && (
                  <Link
                    href="/credits"
                    className="hidden sm:inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-blue-500/50 bg-blue-500/10 text-xs font-extrabold text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    rolematch <span className="text-emerald-400">360</span>
                  </Link>
                )}

                {isEmployerUser && (
                  <Link
                    href="/report"
                    className="text-slate-400 hover:text-white p-2 transition-colors"
                    title="Activity History"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </Link>
                )}

                {/* 1. NOTIFICATIONS BELL */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileDrawer(false);
                    }}
                    className="text-slate-400 hover:text-white relative p-2 cursor-pointer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      ></path>
                    </svg>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[999999] overflow-hidden">
                      <div className="p-4 border-b border-slate-700/80 flex justify-between items-center bg-slate-800/50">
                        <span className="font-bold text-white text-sm">
                          Notifications
                        </span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        <div className="p-4 text-sm text-slate-400">
                          No new notifications right now.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PROFILE PILL / AVATAR TRIGGER */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileDrawer(true);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-600 p-1.5 pl-3.5 rounded-full shadow-sm hover:border-slate-400 transition-all cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M4 6h16M4 12h16M4 18h16"
                      ></path>
                    </svg>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-white font-bold">
                          {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </>
            ) : (
              /* LOGGED OUT ACTIONS (Removed 'Register' button & 'Employer Login' dropdown item) */
              <div className="flex items-center gap-6 pl-5 border-l border-slate-700">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>

                <div
                  className="relative group py-2"
                  onMouseEnter={() => setShowEmployerDropdown(true)}
                  onMouseLeave={() => setShowEmployerDropdown(false)}
                >
                  <button className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                    For employers <span className="text-[10px]">▼</span>
                  </button>

                  {showEmployerDropdown && (
                    <div className="absolute right-0 top-full w-52 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[999999] overflow-hidden py-2 animate-in fade-in duration-150">
                      <Link
                        href="/employer/buy-online"
                        className="block px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        Buy online
                      </Link>
                      <Link
                        href="/employer/register"
                        className="block px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        Naukri Talent Cloud
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* =====================================================================
          FULL-LENGTH PROFILE DRAWER
         ===================================================================== */}
      {showProfileDrawer && (
        <div className="fixed inset-0 w-screen h-screen z-[9999999] flex justify-end bg-slate-950/70 backdrop-blur-sm pointer-events-auto">
          <div
            ref={drawerRef}
            className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            {isEmployerUser ? (
              /* EMPLOYER SIDE DRAWER */
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="px-6 pt-5 pb-2 flex justify-end">
                    <button
                      onClick={() => setShowProfileDrawer(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  {/* User Identity Block */}
                  <div className="px-6 pb-6 border-b border-slate-800 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-extrabold text-white truncate">
                        {profile.name || 'Employer Account'}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-bold text-indigo-300">
                        Superuser
                      </span>
                      {profile.email && (
                        <p className="text-xs text-slate-400 truncate mt-2">
                          {profile.email}
                        </p>
                      )}
                      {profile.phone && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {profile.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Employer Drawer Menu List */}
                  <div className="py-4 px-3 space-y-1 border-b border-slate-800">
                    <Link
                      href="/employer/company-profile"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                        />
                      </svg>
                      <span>Company Profile</span>
                    </Link>

                    <Link
                      href="/employer/buy-online"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      <span>My Subscriptions</span>
                    </Link>

                    <div>
                      <button
                        onClick={() => setExpandSettings(!expandSettings)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Settings</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {expandSettings ? '▲' : '▼'}
                        </span>
                      </button>

                      {expandSettings && (
                        <div className="pl-12 pr-4 py-1 space-y-1">
                          <Link
                            href="/settings"
                            onClick={() => setShowProfileDrawer(false)}
                            className="block py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                          >
                            Account &amp; Security Settings
                          </Link>
                          <Link
                            href="/employer/company-profile"
                            onClick={() => setShowProfileDrawer(false)}
                            className="block py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                          >
                            Edit Company &amp; KYC Details
                          </Link>
                        </div>
                      )}
                    </div>

                    <Link
                      href="/faqs"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
                      <span>Learning Center</span>
                    </Link>

                    <Link
                      href="/help"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>Give Feedback</span>
                    </Link>
                  </div>

                  {/* Logout Row */}
                  <div className="px-3 py-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-red-500/15 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout from Rolematch</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* CANDIDATE / EMPLOYEE SIDE DRAWER */
              <>
                <div>
                  <div className="p-6 border-b border-slate-800 flex justify-end items-center bg-slate-800/40 sticky top-0 z-10 backdrop-blur-md">
                    <button
                      onClick={() => setShowProfileDrawer(false)}
                      className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-800/20">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg
                        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                        viewBox="0 0 64 64"
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="30"
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="3"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="30"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray="188"
                          strokeDashoffset="0"
                        />
                      </svg>
                      <div className="w-13 h-13 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg text-white font-bold">
                            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="absolute -bottom-1 bg-white text-emerald-600 text-[9px] font-extrabold px-2 py-0.2 rounded-full shadow">
                        100%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-extrabold text-white truncate">
                        {profile.name}
                      </h3>
                      <p className="text-sm font-bold text-slate-300 truncate mt-0.5">
                        {profile.headline || profile.role || 'Candidate'}
                      </p>
                      <Link
                        href="/candidate/profile"
                        onClick={() => setShowProfileDrawer(false)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mt-2 inline-block"
                      >
                        View &amp; Update Profile &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* UPGRADE BANNER */}
                  <div className="mx-6 mt-6">
                    <Link
                      href="/credits"
                      onClick={() => setShowProfileDrawer(false)}
                      className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                          👑
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                            Upgrade to Rolematch Pro
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Get highlighted to top recruiters
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </div>

                  {/* PROFILE PERFORMANCE */}
                  <div className="mx-6 mt-6 mb-6 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Your profile performance
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 rounded">
                        Last 90 days
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 relative">
                        <div className="text-xl font-extrabold text-white">
                          {profile.searchAppearances}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Search Appearances
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 relative">
                        <div className="text-xl font-extrabold text-white">
                          {profile.recruiterActions}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Recruiter Actions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENU LINKS */}
                  <div className="mx-6 space-y-2 mb-6">
                    <Link
                      href="/about"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors"
                    >
                      Rolematch Blog
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/faqs"
                      onClick={() => setShowProfileDrawer(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-bold text-sm transition-colors"
                    >
                      FAQs
                    </Link>
                  </div>
                </div>

                {/* LOGOUT BUTTON */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/80 sticky bottom-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-colors font-bold border border-red-500/30 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}