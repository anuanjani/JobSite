'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CandidateProfile {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  workStatus: string;
  openToWork: boolean;
  role: string;
  designation: string;
  company: string;
  experience: string;
  experienceYears: number;
  salary: string;
  noticePeriod: string;
  headline: string;
  bio: string;
  skills: string[];
  education: string;
  college: string;
  avatar: string;
  resumeUrl: string;
  resumeName: string;
  updatedAt: string;
  employmentList?: any[];
  educationList?: any[];
  itSkills?: any[];
  projects?: any[];
  languages?: any[];
}

function safeText(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback;
}

/**
 * Masks an email address as: an***j***@live.in
 */
function maskEmail(rawEmail: unknown): string {
  const email = safeText(rawEmail);
  if (!email || !email.includes('@')) return 'Not provided';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'Not provided';

  if (localPart.length >= 6) {
    const firstTwo = localPart.slice(0, 2);
    const midChar = localPart[Math.ceil(localPart.length / 2)];
    return `${firstTwo}***${midChar}***@${domain}`;
  }

  if (localPart.length > 2) {
    return `${localPart.slice(0, 2)}***@${domain}`;
  }

  return `${localPart.charAt(0)}***@${domain}`;
}

/**
 * Masks a phone number as: +91-******1873
 */
function maskPhone(rawPhone: unknown): string {
  const phone = safeText(rawPhone);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '+91-**********';

  const lastFour = digits.slice(-4);
  return `+91-******${lastFour}`;
}

export default function EmployerTalentSearchPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenToWork, setOnlyOpenToWork] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'experienced' | 'fresher'
  >('all');
  const [maxExperience, setMaxExperience] = useState<number>(20);

  // Active Modals
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateProfile | null>(null);
  const [messageTarget, setMessageTarget] = useState<CandidateProfile | null>(
    null
  );
  const [messageText, setMessageText] = useState('');
  const [toast, setToast] = useState('');

  const fetchCandidates = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `/api/employer/talent?q=${encodeURIComponent(query)}`
        : '/api/employer/talent';
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data && Array.isArray(data.candidates)) {
        setCandidates(data.candidates);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates(searchQuery);
  };

  const handleRedirectToBuyPlan = () => {
    router.push('/employer/dashboard');
  };

  const filteredCandidates = candidates.filter((cand) => {
    if (onlyOpenToWork && !cand.openToWork) return false;
    if (statusFilter !== 'all') {
      const candStatus = safeText(cand.workStatus, 'experienced').toLowerCase();
      if (candStatus !== statusFilter) return false;
    }
    const yrs =
      typeof cand.experienceYears === 'number' ? cand.experienceYears : 0;
    if (yrs > maxExperience) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = safeText(cand.name).toLowerCase().includes(q);
      const matchRole = safeText(cand.role).toLowerCase().includes(q);
      const matchLoc = safeText(cand.location).toLowerCase().includes(q);
      const matchSkills = Array.isArray(cand.skills)
        ? cand.skills.some((s) => safeText(s).toLowerCase().includes(q))
        : false;
      return matchName || matchRole || matchLoc || matchSkills;
    }

    return true;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTarget || !messageText.trim()) return;

    setSendingMsg(true);
    try {
      let senderEmail = '';
      let senderName = 'Recruiter';
      let senderCompany = '';

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          senderEmail = parsed.email || '';
          senderName = parsed.name || parsed.companyName || 'Recruiter';
          senderCompany = parsed.companyName || parsed.company || '';
        } catch {}
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail,
          senderName,
          senderCompany,
          receiverEmail: messageTarget.email,
          subject: `Job Opportunity from ${senderCompany || senderName}`,
          message: messageText.trim(),
        }),
      });

      if (res.ok) {
        setToast(`Message sent to ${safeText(messageTarget.name)}!`);
        setMessageText('');
        setMessageTarget(null);
        setTimeout(() => setToast(''), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-4 sm:px-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: CANDIDATE FILTERS */}
        <aside className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl lg:sticky lg:top-24">
          <h2 className="text-base font-extrabold text-white mb-6">
            Candidate Filters
          </h2>

          {/* Availability */}
          <div className="mb-6">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Availability
            </span>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOpenToWork}
                onChange={(e) => setOnlyOpenToWork(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <span>Open to Work</span>
            </label>
          </div>

          {/* Work Status */}
          <div className="mb-6">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Work Status
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
              {(['all', 'experienced', 'fresher'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`py-2 rounded-xl capitalize transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Experience
              </span>
              <span className="text-xs font-extrabold text-blue-400">
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

        {/* RIGHT CONTENT: SEARCH BAR & CANDIDATE CARDS */}
        <main className="lg:col-span-9 space-y-6">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-full p-2 pl-6 flex items-center gap-3 shadow-xl"
          >
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search talents by skill, title, or keyword..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold uppercase tracking-wider text-white transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-sm text-slate-400">
              Loading candidate profiles...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <h3 className="text-base font-extrabold text-white">
                No candidate profiles found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Try clearing your search keyword or adjusting the filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {cand.avatar ? (
                            <img
                              src={cand.avatar}
                              alt={safeText(cand.name)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-base font-extrabold text-white">
                              {safeText(cand.name, 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-white">
                            {safeText(cand.name, 'Candidate')}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {safeText(cand.role, 'Software Professional')} •{' '}
                            {safeText(cand.location, 'India')}
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 shrink-0">
                        💼 {safeText(cand.workStatus, 'EXPERIENCED')}
                      </span>
                    </div>

                    {Array.isArray(cand.skills) && cand.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5">
                        {cand.skills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-300"
                          >
                            {safeText(skill)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      Open to Work
                    </span>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(cand)}
                        className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-[11px] font-extrabold uppercase tracking-wider text-white transition cursor-pointer"
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageTarget(cand)}
                        className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-extrabold uppercase tracking-wider text-slate-200 transition cursor-pointer"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          VIEW CANDIDATE PROFILE MODAL
         ===================================================================== */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="group bg-slate-900 border border-slate-700/80 rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-all duration-200 z-50"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-800 pr-12">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-emerald-500/60 flex items-center justify-center shrink-0">
                {selectedCandidate.avatar ? (
                  <img
                    src={selectedCandidate.avatar}
                    alt={safeText(selectedCandidate.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-white">
                    {safeText(selectedCandidate.name, 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-extrabold text-white">
                    {safeText(selectedCandidate.name, 'Candidate')}
                  </h2>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold uppercase text-emerald-400">
                    Open to Work
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-200 mt-1">
                  {safeText(selectedCandidate.role, 'Software Professional')}
                  {selectedCandidate.company
                    ? ` at ${safeText(selectedCandidate.company)}`
                    : ''}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  📍 {safeText(selectedCandidate.location, 'India')} • Updated:{' '}
                  {safeText(selectedCandidate.updatedAt, 'Recently')}
                </p>
              </div>

              {selectedCandidate.resumeUrl && (
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white transition shadow-lg shrink-0 text-center"
                >
                  ↓ Download Resume
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-slate-800 text-xs">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                <span className="text-slate-400 block mb-1">Experience</span>
                <span className="font-extrabold text-white">
                  {safeText(selectedCandidate.experience, 'Experienced')}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                <span className="text-slate-400 block mb-1">Annual Salary</span>
                <span className="font-extrabold text-white">
                  {safeText(selectedCandidate.salary, 'Not disclosed')}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                <span className="text-slate-400 block mb-1">Notice Period</span>
                <span className="font-extrabold text-white">
                  {safeText(selectedCandidate.noticePeriod, 'Immediate')}
                </span>
              </div>

              {/* Masked Email Card */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-slate-400 block mb-1">Email</span>
                  <span className="font-extrabold text-white truncate block">
                    {maskEmail(selectedCandidate.email)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRedirectToBuyPlan}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-[11px] font-extrabold text-blue-300 hover:text-white transition shrink-0 cursor-pointer"
                  title="Buy a plan to view full email"
                >
                  View
                </button>
              </div>

              {/* Masked Phone Card */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-slate-400 block mb-1">Phone</span>
                  <span className="font-extrabold text-white truncate block">
                    {maskPhone(selectedCandidate.phone)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRedirectToBuyPlan}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-[11px] font-extrabold text-blue-300 hover:text-white transition shrink-0 cursor-pointer"
                  title="Buy a plan to view mobile number"
                >
                  View
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                <span className="text-slate-400 block mb-1">Education</span>
                <span className="font-extrabold text-white">
                  {safeText(selectedCandidate.education, 'Not specified')}
                </span>
              </div>
            </div>

            <div className="space-y-6 pt-6 text-xs">
              {(selectedCandidate.headline || selectedCandidate.bio) && (
                <div>
                  <h4 className="text-sm font-extrabold text-white mb-2">
                    Profile Summary
                  </h4>
                  {selectedCandidate.headline && (
                    <p className="font-bold text-slate-200 mb-1.5">
                      {safeText(selectedCandidate.headline)}
                    </p>
                  )}
                  {selectedCandidate.bio && (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {safeText(selectedCandidate.bio)}
                    </p>
                  )}
                </div>
              )}

              {Array.isArray(selectedCandidate.skills) &&
                selectedCandidate.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold text-white mb-2.5">
                      Key Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
                        >
                          {safeText(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {Array.isArray(selectedCandidate.employmentList) &&
                selectedCandidate.employmentList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold text-white mb-3">
                      Work Experience
                    </h4>
                    <div className="space-y-4">
                      {selectedCandidate.employmentList.map(
                        (emp: any, idx: number) => (
                          <div
                            key={emp?.id || idx}
                            className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4"
                          >
                            <p className="text-sm font-extrabold text-white">
                              {safeText(emp?.designation, 'Role')}
                            </p>
                            <p className="text-xs font-bold text-slate-300 mt-0.5">
                              {safeText(emp?.company)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {safeText(emp?.employmentType, 'Full-time')}
                              {emp?.startDate
                                ? ` | ${safeText(emp.startDate)} to ${safeText(
                                    emp.endDate,
                                    'Present'
                                  )}`
                                : ''}
                            </p>
                            {emp?.description && (
                              <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                                {safeText(emp.description)}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {Array.isArray(selectedCandidate.educationList) &&
                selectedCandidate.educationList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold text-white mb-3">
                      Education Details
                    </h4>
                    <div className="space-y-3">
                      {selectedCandidate.educationList.map(
                        (edu: any, idx: number) => (
                          <div
                            key={edu?.id || idx}
                            className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4"
                          >
                            <p className="text-sm font-extrabold text-white">
                              {safeText(
                                edu?.degree ||
                                  `${safeText(edu?.course)} ${safeText(
                                    edu?.specialization
                                  )}`,
                                'Degree'
                              )}
                            </p>
                            <p className="text-xs text-slate-300 mt-0.5">
                              {safeText(edu?.institute)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {safeText(edu?.yearRange)}
                              {edu?.courseType
                                ? ` | ${safeText(edu.courseType)}`
                                : ''}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {Array.isArray(selectedCandidate.itSkills) &&
                selectedCandidate.itSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold text-white mb-3">
                      IT Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.itSkills.map(
                        (item: any, idx: number) => (
                          <span
                            key={item?.id || idx}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                          >
                            <strong>{safeText(item?.skill)}</strong>
                            {item?.experience
                              ? ` (${safeText(item.experience)})`
                              : ''}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleRedirectToBuyPlan}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white transition shadow-lg shadow-blue-600/25 cursor-pointer"
              >
                🔒 View Email &amp; Mobile Number
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedCandidate;
                  setSelectedCandidate(null);
                  setMessageTarget(target);
                }}
                className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold text-white transition cursor-pointer"
              >
                Message Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DIRECT MESSAGE MODAL
         ===================================================================== */}
      {messageTarget && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMessageTarget(null)}
        >
          <div
            className="group bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-7 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMessageTarget(null)}
              className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-white pr-10">
              Message {safeText(messageTarget.name)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Send a direct recruitment invitation or interview request to{' '}
              {maskEmail(messageTarget.email)}.
            </p>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message or job opportunity details..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-xs font-extrabold text-white transition cursor-pointer"
                >
                  {sendingMsg ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}