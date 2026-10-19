'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CandidateProfile {
  id: number | string;
  userId?: number | string;
  name: string;
  email: string;
  phone: string;
  location: string;
  workStatus: 'fresher' | 'experienced';
  workStatusLabel: 'Fresher' | 'Experienced';
  role: string;
  company: string;
  experience: string;
  experienceYears: number;
  education: string;
  college: string;
  salary: string;
  noticePeriod: string;
  bio: string;
  avatar: string;
  resumeUrl: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  openToWork: boolean;
}

export default function EmployerTalentPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected candidate for "View Profile" modal
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateProfile | null>(null);

  // Search & Filter states
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [onlyOpenToWork, setOnlyOpenToWork] = useState(true);
  const [workStatusFilter, setWorkStatusFilter] = useState<
    'all' | 'experienced' | 'fresher'
  >('all');
  const [maxExperience, setMaxExperience] = useState<number>(20);

  useEffect(() => {
    fetch('/api/employer/talent')
      .then((res) => res.json())
      .then((data) => {
        if (data?.candidates && Array.isArray(data.candidates)) {
          setCandidates(data.candidates);
        }
      })
      .catch((err) => {
        console.error('Failed to load candidates:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const filteredCandidates = candidates.filter((c) => {
    if (onlyOpenToWork && !c.openToWork) {
      return false;
    }

    if (workStatusFilter !== 'all' && c.workStatus !== workStatusFilter) {
      return false;
    }

    if (c.experienceYears > maxExperience) {
      return false;
    }

    const query = (appliedSearch || searchInput).trim().toLowerCase();
    if (!query) return true;

    const matchesName = c.name?.toLowerCase().includes(query);
    const matchesRole = c.role?.toLowerCase().includes(query);
    const matchesLocation = c.location?.toLowerCase().includes(query);
    const matchesWorkStatus = c.workStatusLabel?.toLowerCase().includes(query);
    const matchesSkills = c.skills?.some((skill) =>
      skill.toLowerCase().includes(query)
    );

    return (
      matchesName ||
      matchesRole ||
      matchesLocation ||
      matchesWorkStatus ||
      matchesSkills
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans py-10 px-6 md:px-12 relative overflow-hidden">
      {/* Subtle Ambient Background Glow */}
      <div className="absolute bottom-[5%] left-[5%] w-[500px] h-[500px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* ==========================================================
            LEFT SIDEBAR: CANDIDATE FILTERS
           ========================================================== */}
        <aside className="lg:col-span-3 bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-7 shadow-xl">
          <h2 className="text-lg font-extrabold text-white mb-6">
            Candidate Filters
          </h2>

          {/* Availability Filter */}
          <div className="mb-7">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              Availability
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-200">
              <input
                type="checkbox"
                checked={onlyOpenToWork}
                onChange={(e) => setOnlyOpenToWork(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span>Open to Work</span>
            </label>
          </div>

          {/* Work Status Filter (Fresher / Experienced) */}
          <div className="mb-7">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              Work Status
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/70">
              {[
                { id: 'all', label: 'All' },
                { id: 'experienced', label: 'Experienced' },
                { id: 'fresher', label: 'Fresher' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWorkStatusFilter(tab.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    workStatusFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Experience
              </label>
              <span className="text-xs font-bold text-indigo-400">
                Up to {maxExperience} yrs
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={maxExperience}
              onChange={(e) => setMaxExperience(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </aside>

        {/* ==========================================================
            RIGHT MAIN CONTENT: SEARCH BAR & LIVE CANDIDATE CARDS
           ========================================================== */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/70 rounded-full p-2 pl-6 flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search talents by skill, title, or keyword..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value === '') setAppliedSearch('');
                }}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest transition cursor-pointer shadow-md shrink-0"
            >
              Search
            </button>
          </form>

          {/* Candidate Cards Grid */}
          {loading ? (
            <div className="p-12 rounded-3xl bg-slate-800/30 border border-slate-800 text-center text-sm text-slate-400">
              Loading candidate profiles from database...
            </div>
          ) : filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-7 rounded-3xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Candidate Header: Avatar + Name + Work Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-extrabold text-base text-white shrink-0 overflow-hidden">
                          {candidate.avatar ? (
                            <img
                              src={candidate.avatar}
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            candidate.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-extrabold text-white truncate">
                            {candidate.name}
                          </h3>
                          <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                            {candidate.role} • {candidate.location}
                          </p>
                        </div>
                      </div>

                      {/* Fresher / Experienced Badge */}
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          candidate.workStatus === 'fresher'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {candidate.workStatus === 'fresher'
                          ? '🎓 Fresher'
                          : '💼 Experienced'}
                      </span>
                    </div>

                    {/* Skills Pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        candidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Verified Profile
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Availability + View Profile & Message Buttons */}
                  <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                      {candidate.openToWork ? 'OPEN TO WORK' : 'EMPLOYED'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(candidate)}
                        className="px-4 py-2 rounded-full bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 hover:text-white transition cursor-pointer"
                      >
                        View Profile
                      </button>

                      <Link
                        href={`/messages?candidate=${encodeURIComponent(
                          candidate.name
                        )}`}
                        className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-700 border border-slate-700 text-[10px] font-extrabold uppercase tracking-widest text-white transition"
                      >
                        Message
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-800/30 border border-slate-800 text-center">
              <p className="text-base font-extrabold text-white">
                No candidate profiles found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {candidates.length === 0
                  ? 'No candidates have registered in candidate_profiles yet.'
                  : 'Try clearing your search keyword or adjusting the filters.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          FULL CANDIDATE PROFILE MODAL (Shows all candidate details from DB)
         ===================================================================== */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 md:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
            >
              ✕
            </button>

            {/* Top Candidate Identity Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-800 pr-10">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/40 flex items-center justify-center font-extrabold text-2xl text-white shrink-0 overflow-hidden">
                {selectedCandidate.avatar ? (
                  <img
                    src={selectedCandidate.avatar}
                    alt={selectedCandidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedCandidate.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-white">
                    {selectedCandidate.name}
                  </h2>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      selectedCandidate.workStatus === 'fresher'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {selectedCandidate.workStatus === 'fresher'
                      ? '🎓 Fresher'
                      : '💼 Experienced'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    {selectedCandidate.openToWork ? 'Open to Work' : 'Employed'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-300 mt-1">
                  {selectedCandidate.role}
                  {selectedCandidate.company
                    ? ` @ ${selectedCandidate.company}`
                    : ''}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  📍 {selectedCandidate.location || 'India'}
                </p>
              </div>
            </div>

            {/* Contact & Core Details Grid */}
            <div className="py-6 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Email Address
                </span>
                <span className="font-bold text-white break-all">
                  {selectedCandidate.email || 'Not provided'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Mobile Number
                </span>
                <span className="font-bold text-white">
                  {selectedCandidate.phone
                    ? `+91 ${selectedCandidate.phone}`
                    : 'Not provided'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Work Status
                </span>
                <span className="font-bold text-white">
                  {selectedCandidate.workStatusLabel}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Experience
                </span>
                <span className="font-bold text-white">
                  {selectedCandidate.experience ||
                    (selectedCandidate.workStatus === 'fresher'
                      ? 'Fresher (0 Years)'
                      : 'Experienced')}
                </span>
              </div>

              {selectedCandidate.education && (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Education
                  </span>
                  <span className="font-bold text-white">
                    {selectedCandidate.education}
                    {selectedCandidate.college
                      ? ` • ${selectedCandidate.college}`
                      : ''}
                  </span>
                </div>
              )}

              {selectedCandidate.salary && (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Compensation / CTC
                  </span>
                  <span className="font-bold text-white">
                    {selectedCandidate.salary}
                  </span>
                </div>
              )}

              {selectedCandidate.noticePeriod && (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Notice Period
                  </span>
                  <span className="font-bold text-white">
                    {selectedCandidate.noticePeriod}
                  </span>
                </div>
              )}
            </div>

            {/* Bio / Profile Summary */}
            <div className="py-5 border-b border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Profile Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCandidate.bio ||
                  'No additional profile summary added by the candidate yet.'}
              </p>
            </div>

            {/* Key Skills */}
            <div className="py-5 border-b border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Key Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills &&
                selectedCandidate.skills.length > 0 ? (
                  selectedCandidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">
                    No specific skills listed yet.
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer: Resume / CV & Message Actions */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {selectedCandidate.resumeUrl ? (
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-400 transition"
                  >
                    <span>📄 View / Download CV</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">
                    CV / Resume not uploaded yet
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/messages?candidate=${encodeURIComponent(
                    selectedCandidate.name
                  )}`}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold uppercase tracking-wider text-white transition shadow-lg"
                >
                  Message Candidate
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}