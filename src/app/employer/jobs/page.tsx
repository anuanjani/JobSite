'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface EmployerJob {
  id: number;
  title: string;
  company_name?: string;
  location?: string;
  work_mode?: string;
  salary?: string;
  experience?: string;
  openings?: number;
  posted_date?: string;
  notice_period?: string;
  skills?: string;
  description?: string;
  status?: 'ACTIVE' | 'CLOSED' | 'EXPIRED' | string;
  created_at?: string;
}

export default function ManageJobsAndResponsesPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete Confirmation Modal States
  const [jobToDelete, setJobToDelete] = useState<EmployerJob | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Top-right "Post job" dropdown state
  const [showPostJobMenu, setShowPostJobMenu] = useState(false);
  const postJobMenuRef = useRef<HTMLDivElement>(null);

  // Left Sidebar Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusAccordionOpen, setStatusAccordionOpen] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<{
    ACTIVE: boolean;
    CLOSED: boolean;
    EXPIRED: boolean;
  }>({
    ACTIVE: false,
    CLOSED: false,
    EXPIRED: false,
  });

  // Close "Post job" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        postJobMenuRef.current &&
        !postJobMenuRef.current.contains(e.target as Node)
      ) {
        setShowPostJobMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch employer's jobs from Neon DB
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    let email = '';
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        email = parsed.email || '';
      } catch {}
    }

    const query = email
      ? `?employerEmail=${encodeURIComponent(email)}`
      : '';

    fetch(`/api/jobs${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          setJobs(
            data.jobs.map((j: EmployerJob) => ({
              ...j,
              status: (j.status || 'ACTIVE').toUpperCase(),
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to fetch employer jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  // Handle dropdown selection (Active / Closed / Expired / Delete)
  const handleDropdownAction = async (
    job: EmployerJob,
    selectedValue: string
  ) => {
    if (selectedValue === 'DELETE') {
      // Open Yes / No confirmation modal without changing current status
      setJobToDelete(job);
      return;
    }

    const newStatus = selectedValue as 'ACTIVE' | 'CLOSED' | 'EXPIRED';
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );

    try {
      await fetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job.id, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  // Confirm "Yes" to delete the job from Neon DB and revert to screen
  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/jobs?id=${encodeURIComponent(jobToDelete.id)}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
    } finally {
      setDeleting(false);
      setJobToDelete(null);
    }
  };

  // Counts by Job Status
  const activeCount = jobs.filter(
    (j) => (j.status || 'ACTIVE').toUpperCase() === 'ACTIVE'
  ).length;
  const closedCount = jobs.filter(
    (j) => (j.status || '').toUpperCase() === 'CLOSED'
  ).length;
  const expiredCount = jobs.filter(
    (j) => (j.status || '').toUpperCase() === 'EXPIRED'
  ).length;

  // Apply search & checkbox filters
  const anyStatusSelected =
    selectedStatuses.ACTIVE ||
    selectedStatuses.CLOSED ||
    selectedStatuses.EXPIRED;

  const filteredJobs = jobs.filter((job) => {
    const normalizedStatus = (job.status || 'ACTIVE').toUpperCase() as
      | 'ACTIVE'
      | 'CLOSED'
      | 'EXPIRED';

    if (anyStatusSelected && !selectedStatuses[normalizedStatus]) {
      return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const matchesTitle = job.title?.toLowerCase().includes(q);
    const matchesId =
      String(job.id).includes(q) || `rm-${job.id}`.includes(q);
    const matchesLocation = job.location?.toLowerCase().includes(q);

    return matchesTitle || matchesId || matchesLocation;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-6 md:px-12">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* ================================================================
            TOP HEADER ROW: TITLE + "POST JOB" DROPDOWN BUTTON
           ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manage Jobs and Responses
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Responses to your jobs and NVites will appear here
            </p>
          </div>

          {/* Post job Dropdown Button */}
          <div className="relative self-start sm:self-auto" ref={postJobMenuRef}>
            <button
              type="button"
              onClick={() => setShowPostJobMenu((prev) => !prev)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2.5 shadow-lg transition cursor-pointer"
            >
              <span>Post job</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showPostJobMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showPostJobMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <Link
                  href="/employer/jobs/new?type=hot"
                  onClick={() => setShowPostJobMenu(false)}
                  className="block px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-blue-600/20 hover:text-white transition-colors"
                >
                  Hot Vacancy
                </Link>
                <Link
                  href="/employer/jobs/new?type=smb"
                  onClick={() => setShowPostJobMenu(false)}
                  className="block px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-blue-600/20 hover:text-white transition-colors"
                >
                  SMB Job
                </Link>
                <Link
                  href="/employer/jobs/new?type=internship"
                  onClick={() => setShowPostJobMenu(false)}
                  className="block px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-blue-600/20 hover:text-white transition-colors"
                >
                  Internship
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================
            MAIN 2-COLUMN LAYOUT: LEFT FILTERS + RIGHT JOBS & RESPONSES AREA
           ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Filters Heading */}
            <div className="pb-3 border-b border-slate-800 flex items-center gap-2 text-sm font-bold text-slate-200">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4h18M6 12h12M10 20h4"
                />
              </svg>
              <span>Filters</span>
            </div>

            {/* Search by Title/Ref Code/Job ID */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Title/Ref Code/Job ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
              <svg
                className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Job status Collapsible Filter */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStatusAccordionOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-slate-200 mb-3 cursor-pointer"
              >
                <span>Job status</span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    statusAccordionOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {statusAccordionOpen && (
                <div className="space-y-3 text-xs text-slate-300">
                  <label className="flex items-center justify-between cursor-pointer hover:text-white">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.ACTIVE}
                        onChange={(e) =>
                          setSelectedStatuses({
                            ...selectedStatuses,
                            ACTIVE: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                      />
                      <span>Active Jobs</span>
                    </div>
                    <span className="text-slate-400 font-semibold">
                      {activeCount}
                    </span>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer hover:text-white">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.CLOSED}
                        onChange={(e) =>
                          setSelectedStatuses({
                            ...selectedStatuses,
                            CLOSED: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                      />
                      <span>Closed Jobs</span>
                    </div>
                    <span className="text-slate-400 font-semibold">
                      {closedCount}
                    </span>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer hover:text-white">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.EXPIRED}
                        onChange={(e) =>
                          setSelectedStatuses({
                            ...selectedStatuses,
                            EXPIRED: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                      />
                      <span>Expired Jobs</span>
                    </div>
                    <span className="text-slate-400 font-semibold">
                      {expiredCount}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT MAIN PANEL: "ALL JOBS" TAB + CONTENT */}
          <div className="lg:col-span-9">
            {/* Top Tab Bar (Only "All Jobs") */}
            <div className="border-b border-slate-800 mb-6 flex items-center">
              <div className="pb-3 border-b-2 border-rose-500 text-xs font-extrabold text-white">
                All Jobs {filteredJobs.length}
              </div>
            </div>

            {loading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-xs text-slate-400">
                Loading your job postings...
              </div>
            ) : filteredJobs.length === 0 ? (
              /* EMPTY STATE */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 px-6 text-center shadow-xl">
                <div className="w-44 h-40 mx-auto mb-6 rounded-full bg-slate-800/50 border border-slate-800 flex flex-col items-center justify-center relative">
                  <svg
                    className="w-24 h-24 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.4"
                      d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                    />
                  </svg>
                  <span className="text-[11px] font-bold text-slate-500 mt-1">
                    No Active Listings
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Oops! You have no jobs right now
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 mb-6">
                  Once you start posting jobs, you can track them all here
                </p>

                <Link
                  href="/employer/jobs/new"
                  className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md"
                >
                  Post Jobs
                </Link>
              </div>
            ) : (
              /* POPULATED JOB LISTINGS & RESPONSES */
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const status = (job.status || 'ACTIVE').toUpperCase();
                  return (
                    <div
                      key={job.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/employer/jobs/${job.id}/applicants`}
                            className="text-base font-extrabold text-white hover:text-blue-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Ref ID: RM-{job.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : status === 'CLOSED'
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          {job.location && <span>📍 {job.location}</span>}
                          {job.work_mode && <span>🏢 {job.work_mode}</span>}
                          {job.experience && <span>💼 {job.experience}</span>}
                          {job.openings && (
                            <span>👥 {job.openings} Openings</span>
                          )}
                          {job.notice_period && (
                            <span>🗓️ Notice: {job.notice_period}</span>
                          )}
                          {job.posted_date && (
                            <span>Posted: {job.posted_date}</span>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: Status & Delete Dropdown + View Responses */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleDropdownAction(job, e.target.value)
                          }
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="CLOSED">Closed</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="DELETE" className="text-red-400">
                            Delete
                          </option>
                        </select>

                        <Link
                          href={`/employer/jobs/${job.id}/applicants`}
                          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-xs font-extrabold text-blue-300 hover:text-white transition"
                        >
                          View Responses &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================
          DELETE JOB CONFIRMATION MODAL (YES / NO)
         ================================================================ */}
      {jobToDelete && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!deleting) setJobToDelete(null);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-7 sm:p-8 shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4">
              🗑️
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Delete Job Posting?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-white">{jobToDelete.title}</strong> (Ref
              ID: RM-{jobToDelete.id})?
            </p>

            <div className="mt-7 flex items-center justify-center gap-3.5">
              {/* NO BUTTON: Reverts to screen without deleting */}
              <button
                type="button"
                disabled={deleting}
                onClick={() => setJobToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold uppercase tracking-wider text-slate-200 hover:text-white transition cursor-pointer"
              >
                No
              </button>

              {/* YES BUTTON: Deletes job from DB and reverts to screen */}
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDeleteJob}
                className="relative overflow-hidden flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-600/60 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/25 transition cursor-pointer"
              >
                {deleting && (
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                    style={{ animation: 'shimmer 1.5s infinite' }}
                  />
                )}
                <span className="relative z-10">
                  {deleting ? 'Deleting...' : 'Yes'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}