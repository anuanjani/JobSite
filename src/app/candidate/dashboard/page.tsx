'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobItem {
  id: string | number;
  title: string;
  company_name?: string;
  company?: string;
  location: string;
  work_mode?: string;
  salary?: string;
  experience?: string;
  created_at?: string;
}

export default function CandidateDashboardPage() {
  const [profile, setProfile] = useState({
    name: '',
    role: 'Candidate',
    headline: '',
    company: '',
    location: '',
    experience: '',
    avatar: '',
    email: '',
    searchAppearances: 0,
    recruiterActions: 0,
  });

  const [activeSideNav, setActiveSideNav] = useState<
    'home' | 'jobs' | 'companies' | 'blogs'
  >('home');
  const [activeJobTab, setActiveJobTab] = useState<
    'handpicked' | 'applies' | 'preferences' | 'might_like'
  >('handpicked');

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || '',
          role: parsed.role || 'Candidate',
          email: parsed.email || '',
        }));

        if (parsed.email) {
          fetch(`/api/profile?email=${encodeURIComponent(parsed.email)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data && data.email) {
                setProfile({
                  name: data.name || parsed.name || '',
                  role: data.role || parsed.role || 'Candidate',
                  headline: data.headline || data.designation || '',
                  company: data.company || data.current_company || '',
                  location: data.location || data.city || '',
                  experience: data.experience || '',
                  avatar: data.avatar || '',
                  email: data.email,
                  searchAppearances: data.searchAppearances ?? 0,
                  recruiterActions: data.recruiterActions ?? 0,
                });
              }
            })
            .catch(() => {});
        }
      } catch {}
    }

    // Fetch live jobs from Neon DB
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else if (data?.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-8 px-4 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================
            LEFT STICKY SIDEBAR (Matches Naukri Candidate Profile Card)
           ============================================================ */}
        <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:sticky lg:top-24 shadow-xl">
          {/* Avatar + 100% Ring */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-20 h-20 flex items-center justify-center mb-3">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="226"
                  strokeDashoffset="0"
                />
              </svg>
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-white">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 bg-slate-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                100%
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-white mt-1">
              {profile.name || 'Candidate Profile'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 line-clamp-2">
              {profile.headline
                ? `${profile.headline}${
                    profile.company ? ` @ ${profile.company}` : ''
                  }`
                : profile.role}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Last updated today
            </p>

            <button
              onClick={() => setShowProfileModal(true)}
              className="mt-4 px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md cursor-pointer"
            >
              View profile
            </button>
          </div>

          {/* Profile Performance Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-white">
                Profile performance
              </span>
              <span
                className="text-xs text-slate-400 cursor-help"
                title="Appearances and recruiter actions over the last 90 days"
              >
                ⓘ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 pb-3 border-b border-slate-700/60">
              <div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Search
                  <br />
                  appearances
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-base font-extrabold text-blue-400">
                  <span>{profile.searchAppearances}</span>
                  <span className="text-xs">&rsaquo;</span>
                </div>
              </div>

              <div className="border-l border-slate-700/60 pl-3">
                <p className="text-[11px] text-slate-400 leading-tight">
                  Recruiter
                  <br />
                  actions
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-base font-extrabold text-blue-400">
                  <span>{profile.recruiterActions}</span>
                  <span className="text-xs">&rsaquo;</span>
                </div>
              </div>
            </div>

            <Link
              href="/credits"
              className="mt-3 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/70 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">⚡</span>
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white leading-tight">
                  Upto 3X boost to your profile performance
                </span>
              </div>
              <span className="text-slate-400 text-xs">&rsaquo;</span>
            </Link>
          </div>

          {/* Left Vertical Navigation Menu */}
          <nav className="mt-6 space-y-1.5">
            <button
              onClick={() => setActiveSideNav('home')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-colors cursor-pointer ${
                activeSideNav === 'home'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span>🏠</span>
              <span>My home</span>
            </button>

            <Link
              href="/jobs"
              onClick={() => setActiveSideNav('jobs')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                activeSideNav === 'jobs'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span>💼</span>
              <span>Jobs</span>
            </Link>

            <Link
              href="/hire"
              onClick={() => setActiveSideNav('companies')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                activeSideNav === 'companies'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span>🏢</span>
              <span>Companies</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setActiveSideNav('blogs')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                activeSideNav === 'blogs'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span>📖</span>
              <span>Blogs</span>
            </Link>
          </nav>
        </aside>

        {/* ============================================================
            CENTER MAIN FEED (Matches Screenshots 3.20.30, 3.20.59, 3.21.10)
           ============================================================ */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. PRO BANNER */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div>
              <p className="text-xs font-bold text-slate-300">With</p>
              <div className="flex items-center gap-2 my-1">
                <span className="text-3xl font-extrabold tracking-tight text-amber-400">
                  PRO
                </span>
                <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                  👑
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mb-4">
                you get hired faster
              </p>
              <Link
                href="/credits"
                className="inline-block px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-md"
              >
                Become a Pro
              </Link>
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <div className="grid grid-cols-12 text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                <div className="col-span-7 text-white">What you will get</div>
                <div className="col-span-2 text-center">You</div>
                <div className="col-span-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold">
                    PRO 👑
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 text-xs mt-1">
                {[
                  'Hidden job invitations',
                  'AI-enhanced profile',
                  'Auto-Apply on Rolematch',
                ].map((item) => (
                  <div
                    key={item}
                    className="grid grid-cols-12 py-2.5 items-center"
                  >
                    <div className="col-span-7 text-slate-200 font-medium flex items-center gap-2">
                      <span className="text-amber-400">✦</span> {item}
                    </div>
                    <div className="col-span-2 text-center text-slate-500">
                      —
                    </div>
                    <div className="col-span-3 text-center text-amber-400 font-bold">
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. RECOMMENDED JOBS FOR YOU */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-white">
                Recommended jobs for you
              </h3>
              <Link
                href="/jobs"
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-800 text-xs font-bold overflow-x-auto">
              {[
                {
                  id: 'handpicked',
                  label: `Handpicked for you (${jobs.length})`,
                },
                { id: 'applies', label: 'Applies (0)' },
                { id: 'preferences', label: 'Preferences' },
                { id: 'might_like', label: 'You might like' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveJobTab(t.id as any)}
                  className={`pb-3 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeJobTab === t.id
                      ? 'border-white text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Job Cards Row */}
            <div className="mt-5">
              {loadingJobs ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Loading recommended jobs from database...
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobs.slice(0, 4).map((job) => {
                    const companyName =
                      job.company_name || job.company || 'Company';
                    return (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-extrabold text-sm text-white">
                              {companyName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Active
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white line-clamp-1">
                            {job.title}
                          </h4>
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            {companyName}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>📍 {job.location || 'Remote / India'}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-800 text-center">
                  <p className="text-sm font-bold text-slate-300">
                    No active jobs posted in the database yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Once employers post roles, personalized recommendations will
                    appear here automatically.
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-block px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-blue-400 transition"
                  >
                    Browse Jobs Directory &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 3. EARLY ACCESS ROLES FROM TOP COMPANIES */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Early access roles from top companies
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    See what recruiters are searching for, even before they post
                    a job
                  </p>
                </div>
              </div>
              <Link
                href="/jobs"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 shrink-0"
              >
                View all
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Keep your profile skills and headline updated to receive early
                access recruiter searches.
              </span>
              <Link
                href="/jobs"
                className="text-blue-400 font-bold hover:underline shrink-0 ml-4"
              >
                Explore &rarr;
              </Link>
            </div>
          </div>

          {/* 4. NVITES: INVITATION TO APPLY (Screenshot 3.20.59 PM) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-slate-800 pb-4 sm:pb-0 sm:pr-4">
              <div className="text-3xl mb-2">✉️</div>
              <h3 className="text-base font-extrabold text-white leading-snug">
                NVites: Invitation to apply
              </h3>
              <Link
                href="/messages"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                View all
              </Link>
            </div>

            <div className="sm:col-span-8">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
                When recruiters send you direct NVite job invitations from
                Resdex, they will appear here.
              </div>
            </div>
          </div>

          {/* 5. AI RESUME BANNER (Screenshot 3.20.59 PM) */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-500/15 border border-amber-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-extrabold text-white max-w-md leading-snug">
                Apply with an AI resume tailored to every job and stand out from
                other applicants
              </h3>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href="/credits"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                >
                  ↗ Get Rolematch Pro
                </Link>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Part of Rolematch 360
                </span>
              </div>
            </div>
            <div className="text-4xl">📄✨</div>
          </div>

          {/* 6. HOW YOUR APPLIES MATCHED YOUR PROFILE IN LAST 7 DAYS? (Screenshot 3.21.10 PM) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-white">
                How your applies matched your profile in last 7 days?
              </h3>
              <Link
                href="/jobs"
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-red-500/30 flex items-center justify-center text-xs font-extrabold text-red-400 mb-3">
                  LOW
                </div>
                <p className="text-xs font-bold text-slate-200">
                  Recent applies match score
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full border-4 border-blue-500/40 flex items-center justify-center text-lg mb-3">
                  💼
                </div>
                <p className="text-xs font-extrabold text-white">
                  Work Experience
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {profile.experience || 'Add experience'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/40 flex items-center justify-center text-lg mb-3">
                  📍
                </div>
                <p className="text-xs font-extrabold text-white">Location</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {profile.location || 'Add preferred city'}
                </p>
              </div>
            </div>
          </div>

          {/* 7. TOP COMPANIES & BLOGS (Screenshot 3.21.10 PM) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Top companies
                </h3>
                <p className="text-xs text-slate-400">
                  Explore verified employers actively hiring on Rolematch
                </p>
              </div>
              <Link
                href="/hire"
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Discover companies hiring across your skill domain.</span>
              <Link
                href="/hire"
                className="text-blue-400 font-bold hover:underline"
              >
                View companies &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-white">
                Stay updated with our blogs
              </h3>
              <Link
                href="/about"
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Read interview preparation guides, resume tips, and hiring
                insights.
              </span>
              <Link
                href="/about"
                className="text-blue-400 font-bold hover:underline"
              >
                Read blogs &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT STICKY SIDEBAR (Matches MINIs & Fraud Alert Cards)
           ============================================================ */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
          {/* 1. MINIs Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <div className="text-xl font-extrabold tracking-tight text-white">
              mini<span className="text-amber-400">s</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Explore top career content
            </p>

            <div className="h-44 rounded-2xl bg-gradient-to-br from-indigo-600/30 via-slate-800 to-pink-600/20 border border-slate-700/70 flex flex-col items-center justify-center p-4 mb-5">
              <span className="text-3xl mb-2">🎯</span>
              <p className="text-xs font-bold text-slate-200">
                Bite-sized tech &amp; career updates
              </p>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md"
            >
              <span>▷ Explore MINIs</span>
            </Link>
          </div>

          {/* 2. Fraud Alert Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xl mb-4">
              🛡️
            </div>
            <h4 className="text-sm font-extrabold text-white mb-2">
              Never pay anyone to get a job
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Fraudsters may ask you to invest money either to earn more OR to
              get you a job. Never make such payments.
            </p>
            <Link
              href="/fraud-alert"
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Learn more
            </Link>
          </div>

          {/* 3. Workplace Insights Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-sm font-extrabold text-white mb-2 leading-snug">
              Mental health conversations gain ground at work
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Explore how modern engineering and enterprise teams support
              employee wellness.
            </p>
            <Link
              href="/trust"
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Know more
            </Link>
          </div>
        </aside>
      </div>

      {/* Quick Profile Modal when clicking "View profile" */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white">
                Profile Summary
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="py-5 space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Full Name</span>
                <span className="font-bold text-white">
                  {profile.name || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Email</span>
                <span className="font-bold text-white">
                  {profile.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Role</span>
                <span className="font-bold text-white">{profile.role}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/settings"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
              >
                Edit in Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}