'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobListing {
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
  status?: string;
  created_at?: string;
}

export default function JobsDirectoryPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Search & Filter states
  const [keywordInput, setKeywordInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [selectedModes, setSelectedModes] = useState<{
    Remote: boolean;
    Hybrid: boolean;
    OnSite: boolean;
  }>({
    Remote: false,
    Hybrid: false,
    OnSite: false,
  });

  // Read optional URL query params (?title=... or ?company=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialTitle = params.get('title') || params.get('company') || '';
      const initialLocation = params.get('location') || '';
      if (initialTitle) setKeywordInput(initialTitle);
      if (initialLocation) setLocationInput(initialLocation);
    }

    fetch('/api/jobs?onlyActive=true', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else if (data?.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch((err) => console.error('Failed to load active jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  const clearFilters = () => {
    setKeywordInput('');
    setLocationInput('');
    setSelectedModes({ Remote: false, Hybrid: false, OnSite: false });
  };

  const anyModeSelected =
    selectedModes.Remote || selectedModes.Hybrid || selectedModes.OnSite;

  const filteredJobs = jobs.filter((job) => {
    // 1. Work Mode filter (Matches "On-site" and "In-Office")
    if (anyModeSelected) {
      const mode = (job.work_mode || '').toLowerCase();
      const isRemote = mode.includes('remote');
      const isHybrid = mode.includes('hybrid');
      const isOnSite =
        mode.includes('on-site') ||
        mode.includes('onsite') ||
        mode.includes('office');

      const matched =
        (selectedModes.Remote && isRemote) ||
        (selectedModes.Hybrid && isHybrid) ||
        (selectedModes.OnSite && isOnSite);

      if (!matched) return false;
    }

    // 2. Keyword filter (Title, Skills, Company)
    const kw = keywordInput.trim().toLowerCase();
    if (kw) {
      const inTitle = job.title?.toLowerCase().includes(kw);
      const inCompany = job.company_name?.toLowerCase().includes(kw);
      const inSkills = job.skills?.toLowerCase().includes(kw);
      if (!inTitle && !inCompany && !inSkills) return false;
    }

    // 3. Location filter
    const loc = locationInput.trim().toLowerCase();
    if (loc) {
      const inLocation = job.location?.toLowerCase().includes(loc);
      if (!inLocation) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-white mb-7">
          Find your next role.
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="max-w-3xl bg-slate-900/90 border border-slate-800 rounded-full p-2 pl-6 flex flex-col sm:flex-row items-center gap-3 mb-10 shadow-2xl"
        >
          <div className="flex items-center gap-3 flex-1 w-full">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Job title, skills, or company"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2.5 flex-1 w-full pl-2">
            <span className="text-rose-400 text-sm">📍</span>
            <input
              type="text"
              placeholder="Location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-xs uppercase tracking-widest transition cursor-pointer shrink-0"
          >
            SEARCH
          </button>
        </form>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                FILTERS
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-extrabold uppercase tracking-wider text-pink-500 hover:text-pink-400 cursor-pointer"
              >
                CLEAR
              </button>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3.5">
                WORK MODE
              </span>
              <div className="space-y-3 text-xs font-medium text-slate-300">
                <label className="flex items-center gap-3 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedModes.Remote}
                    onChange={(e) =>
                      setSelectedModes({
                        ...selectedModes,
                        Remote: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-pink-500 cursor-pointer"
                  />
                  <span>Remote</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedModes.Hybrid}
                    onChange={(e) =>
                      setSelectedModes({
                        ...selectedModes,
                        Hybrid: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-pink-500 cursor-pointer"
                  />
                  <span>Hybrid</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedModes.OnSite}
                    onChange={(e) =>
                      setSelectedModes({
                        ...selectedModes,
                        OnSite: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-pink-500 cursor-pointer"
                  />
                  <span>In-Office / On-site</span>
                </label>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN JOBS LIST */}
          <div className="lg:col-span-9">
            <p className="text-xs font-semibold text-slate-400 mb-4">
              Showing{' '}
              <strong className="text-white">{filteredJobs.length}</strong> real
              active {filteredJobs.length === 1 ? 'job' : 'jobs'} from Neon
              database
            </p>

            {loading ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center text-sm text-slate-400">
                Loading active jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl py-16 px-6 text-center shadow-xl">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="text-lg font-extrabold text-white">
                  No active jobs found
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Employers have not posted any active roles matching this
                  filter yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const skillsList = job.skills
                    ? job.skills
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [];

                  return (
                    <div
                      key={job.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-xl transition-all flex flex-col justify-between gap-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-lg text-white shrink-0">
                            {(job.company_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-lg font-extrabold text-white">
                              {job.title}
                            </h2>
                            <p className="text-xs font-bold text-slate-300 mt-0.5">
                              {job.company_name || 'Verified Employer'}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-3">
                              {job.location && <span>📍 {job.location}</span>}
                              {job.work_mode && <span>🏢 {job.work_mode}</span>}
                              {job.experience && (
                                <span>💼 {job.experience}</span>
                              )}
                              {job.salary && (
                                <span>₹ {job.salary} LPA</span>
                              )}
                              {job.openings && (
                                <span>👥 {job.openings} Openings</span>
                              )}
                              {job.notice_period && (
                                <span>🗓️ Notice: {job.notice_period}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="self-start px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 shrink-0">
                          Active
                        </span>
                      </div>

                      {skillsList.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500">
                          {job.posted_date
                            ? `Posted on ${job.posted_date}`
                            : 'Recently posted'}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedJob(job)}
                            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                          >
                            View Details
                          </button>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white transition shadow-md"
                          >
                            Apply Now &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="pr-10 pb-5 border-b border-slate-800">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold uppercase text-emerald-400">
                Active Role
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2">
                {selectedJob.title}
              </h2>
              <p className="text-sm font-bold text-slate-300 mt-1">
                {selectedJob.company_name || 'Verified Employer'}
              </p>
            </div>

            <div className="py-5 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Location</span>
                <span className="font-bold text-white">
                  {selectedJob.location || 'India'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Work Mode</span>
                <span className="font-bold text-white">
                  {selectedJob.work_mode || 'Hybrid'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Experience</span>
                <span className="font-bold text-white">
                  {selectedJob.experience || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Salary (LPA)</span>
                <span className="font-bold text-white">
                  {selectedJob.salary ? `₹ ${selectedJob.salary} LPA` : 'Not disclosed'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Openings</span>
                <span className="font-bold text-white">
                  {selectedJob.openings || 1}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Notice Period</span>
                <span className="font-bold text-white">
                  {selectedJob.notice_period || 'Flexible'}
                </span>
              </div>
            </div>

            <div className="py-5 border-b border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Job Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedJob.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-6 flex justify-end">
              <Link
                href={`/jobs/${selectedJob.id}`}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold uppercase tracking-wider text-white transition shadow-lg"
              >
                Proceed to Apply &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}