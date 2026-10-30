'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface JobDetail {
  id: number;
  title: string;
  company_name?: string;
  companyName?: string;
  location?: string;
  work_mode?: string;
  workMode?: string;
  salary?: string;
  experience?: string;
  openings?: number;
  posted_date?: string;
  postedDate?: string;
  notice_period?: string;
  noticePeriod?: string;
  skills?: string;
  description?: string;
  status?: string;
}

/**
 * Extracts any external Source URL from the job description text.
 */
function extractSourceUrl(description = ''): string | null {
  if (!description) return null;
  const match = description.match(
    /(?:Source(?: Application)? URL|Apply URL|Apply online at)\s*:\s*(https?:\/\/[^\s]+)/i
  );
  return match && match[1] ? match[1].trim() : null;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.['job-id'] as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [toast, setToast] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Disclaimer modal state for external job redirection
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    let candidateEmail = '';
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        candidateEmail = parsed.email || '';
      }
    } catch {}

    const url = `/api/jobs?id=${encodeURIComponent(jobId)}${
      candidateEmail
        ? `&candidateEmail=${encodeURIComponent(candidateEmail)}`
        : ''
    }`;

    fetch(url, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.job) {
          setJob(data.job);
          setHasApplied(Boolean(data.hasApplied));
          setApplicationStatus(data.applicationStatus || null);
        } else {
          setJob(null);
        }
      })
      .catch((err) => {
        console.error('Error loading job details:', err);
        setJob(null);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const sourceUrl = extractSourceUrl(job?.description || '');

  /**
   * Submits the internal application record and, if an external Source URL exists,
   * redirects the candidate to the official career page after they click OK.
   */
  const executeApplicationAndRedirect = async (externalUrl?: string | null) => {
    setErrorMsg('');
    setShowRedirectModal(false);

    const saved = localStorage.getItem('user');
    if (!saved) {
      if (externalUrl) {
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      router.push('/login');
      return;
    }

    let userEmail = '';
    let userName = '';
    let userRole = 'CANDIDATE';

    try {
      const parsed = JSON.parse(saved);
      userEmail = parsed.email || '';
      userName = parsed.name || '';
      userRole = String(parsed.role || 'CANDIDATE').toUpperCase();
    } catch {}

    if (userRole === 'EMPLOYER') {
      setErrorMsg('Employer accounts cannot apply to jobs.');
      return;
    }

    // Open external career page in a new tab immediately on user click if externalUrl exists
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }

    if (!userEmail) {
      if (!externalUrl) router.push('/login');
      return;
    }

    setApplying(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          jobId: Number(jobId),
          candidateEmail: userEmail,
          candidateName: userName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasApplied(true);
        setApplicationStatus(data.applicationStatus || 'APPLIED');
        setToast(
          externalUrl
            ? 'Redirected to official job page & marked as Applied!'
            : data.alreadyApplied
            ? 'You have already applied for this role.'
            : `Application submitted for ${job?.title || 'this role'}!`
        );
        setTimeout(() => setToast(''), 3500);
      } else {
        setErrorMsg(data.error || 'Failed to submit application.');
      }
    } catch {
      setErrorMsg('Network error while submitting application.');
    } finally {
      setApplying(false);
    }
  };

  /**
   * Triggered when the candidate clicks "APPLY NOW".
   * Always shows the Terms & Conditions confirmation popup before proceeding.
   */
  const handleApplyButtonClick = () => {
    setErrorMsg('');
    setShowRedirectModal(true);
  };

  const handleWithdrawApplication = async () => {
    setErrorMsg('');
    const saved = localStorage.getItem('user');
    if (!saved) {
      router.push('/login');
      return;
    }

    let userEmail = '';
    try {
      const parsed = JSON.parse(saved);
      userEmail = parsed.email || '';
    } catch {}

    if (!userEmail) {
      router.push('/login');
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          jobId: Number(jobId),
          candidateEmail: userEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasApplied(false);
        setApplicationStatus(null);
        setToast('Application withdrawn. You can now re-apply!');
        setTimeout(() => setToast(''), 3500);
      } else {
        setErrorMsg(data.error || 'Failed to withdraw application.');
      }
    } catch {
      setErrorMsg('Network error while withdrawing application.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl px-8 py-6 text-sm font-bold text-slate-300 shadow-2xl">
          Loading job details...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-md w-full space-y-4 shadow-2xl">
          <h1 className="text-xl font-extrabold text-white">Job Not Found</h1>
          <p className="text-xs text-slate-400">
            This job posting may have been removed or closed by the employer.
          </p>
          <Link
            href="/jobs"
            className="inline-block px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white transition"
          >
            ← Browse Active Jobs
          </Link>
        </div>
      </div>
    );
  }

  const companyName = job.company_name || job.companyName || 'Hiring Company';
  const workMode = job.work_mode || job.workMode || 'On-site';
  const postedDate = job.posted_date || job.postedDate || 'Recently';
  const noticePeriod = job.notice_period || job.noticePeriod || 'Immediate';
  const status = String(job.status || 'ACTIVE').toUpperCase();
  const currentAppStage = String(applicationStatus || 'APPLIED').toUpperCase();
  const skillsList = job.skills
    ? String(job.skills)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Strip the raw "Source URL: ..." line from the plain text block so we can render it as a clean interactive link at the bottom
  const cleanDescription = String(job.description || '')
    .replace(
      /\n*\s*(?:Source(?: Application)? URL|Apply URL|Apply online at)\s*:\s*https?:\/\/[^\s]+/gi,
      ''
    )
    .trim();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-4 sm:px-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2.5">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-white transition"
          >
            <span>←</span>
            <span>Back to all jobs</span>
          </Link>
        </div>

        {/* TOP JOB HEADER BANNER */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-extrabold text-blue-400 shrink-0">
              {companyName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {status}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  {workMode}
                </span>
                {postedDate && (
                  <span className="text-[11px] text-slate-400">
                    Posted on {postedDate}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {job.title}
              </h1>
              <p className="text-sm font-semibold text-slate-400 mt-1">
                {companyName}
                {job.location ? ` • ${job.location}` : ''}
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2 shrink-0">
            {hasApplied ? (
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-6 py-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                    currentAppStage === 'REJECTED'
                      ? 'bg-red-500/15 border-red-500/40 text-red-400'
                      : 'bg-emerald-600/25 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {currentAppStage === 'REJECTED'
                    ? '✕ Rejected'
                    : `✓ ${currentAppStage}`}
                </span>

                {sourceUrl && (
                  <button
                    type="button"
                    onClick={() => setShowRedirectModal(true)}
                    className="px-5 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-lg"
                  >
                    Visit Job Page ↗
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleWithdrawApplication}
                  disabled={withdrawing}
                  className="px-6 py-3.5 rounded-full bg-red-500/15 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white disabled:opacity-50 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-lg"
                  title="Withdraw your application so you can re-apply"
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            ) : status !== 'ACTIVE' ? (
              <button
                type="button"
                disabled
                className="px-8 py-3.5 rounded-full bg-slate-800 text-slate-500 text-xs font-extrabold uppercase tracking-wider cursor-not-allowed"
              >
                Job {status}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyButtonClick}
                disabled={applying}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-200 disabled:bg-slate-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition shadow-xl cursor-pointer"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            )}
            {errorMsg && (
              <span className="text-[11px] font-bold text-red-400">
                {errorMsg}
              </span>
            )}
          </div>
        </div>

        {/* MAIN 2-COLUMN DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: JOB DESCRIPTION */}
          <div className="lg:col-span-8 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-base font-extrabold text-white">
              Job Description
            </h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {cleanDescription || 'No description provided by the employer.'}
            </div>

            {/* Source URL kept at the bottom of the job post */}
            {sourceUrl && (
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-xs text-slate-400 break-all">
                <span className="font-bold text-slate-300">Source URL: </span>
                <button
                  type="button"
                  onClick={() => setShowRedirectModal(true)}
                  className="text-blue-400 hover:text-blue-300 hover:underline text-left cursor-pointer"
                >
                  {sourceUrl}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: JOB OVERVIEW */}
          <div className="lg:col-span-4 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Job Overview
            </h3>

            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Salary Range
              </span>
              <span className="text-sm font-extrabold text-emerald-400">
                {job.salary ? `${job.salary}` : 'Not Disclosed'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Experience
              </span>
              <span className="text-xs font-extrabold text-white">
                {job.experience || 'Not specified'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Openings &amp; Notice Period
              </span>
              <span className="text-xs font-extrabold text-white">
                {job.openings ?? 1} Opening(s) • Notice: {noticePeriod}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Location &amp; Mode
              </span>
              <span className="text-xs font-extrabold text-white">
                {job.location || 'India'} ({workMode})
              </span>
            </div>

            {skillsList.length > 0 && (
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                  Required Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          TERMS & CONDITIONS / EXTERNAL REDIRECT DISCLAIMER POPUP MODAL
         ===================================================================== */}
      {showRedirectModal && (
        <div
          className="fixed inset-0 z-[9999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRedirectModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Moving to Job Posting Page
                </h3>
                <p className="text-[11px] text-slate-400">
                  Please review before proceeding
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                You are moving to the job posted page. By clicking{' '}
                <strong className="text-white">&quot;OK&quot;</strong>, you are
                agreeing to our{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link
                  href="/fraud-alert"
                  target="_blank"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Fraud Alert Policy
                </Link>
                .
              </p>
              <p className="text-[11px] text-slate-400">
                Never pay any money or security deposit for job interviews or
                offer letters. Rolematch is not responsible for third-party
                websites or external recruitment communications.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRedirectModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeApplicationAndRedirect(sourceUrl)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold uppercase tracking-wider text-white transition shadow-lg cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}