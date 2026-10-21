'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateJobPostingPage() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Default Posted Date to today's local date (YYYY-MM-DD)
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    workMode: 'Hybrid',
    location: '',
    salary: '',
    minExperience: '',
    maxExperience: '',
    openings: '',
    postedDate: getTodayDateString(),
    noticePeriod: '',
    customNoticePeriod: '',
    skills: '',
    description: '',
  });

  const [employerInfo, setEmployerInfo] = useState({
    email: '',
    companyName: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setEmployerInfo({
          email: parsed.email || '',
          companyName: parsed.companyName || parsed.name || 'Company',
        });
      } catch {}
    }
  }, []);

  // Unified helper to open the native date picker from label, input, or calendar icon
  const openDatePicker = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const input = dateInputRef.current;
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate Mandatory Fields: Job Title, Experience Range, Notice Period, Job Description
    if (!formData.title.trim()) {
      setError('Please enter the Job Title.');
      return;
    }

    if (
      formData.minExperience.trim() === '' ||
      formData.maxExperience.trim() === ''
    ) {
      setError('Please enter both minimum and maximum Experience in years.');
      return;
    }

    if (Number(formData.maxExperience) < Number(formData.minExperience)) {
      setError('Maximum experience cannot be less than minimum experience.');
      return;
    }

    if (!formData.noticePeriod) {
      setError('Please select a Notice Period.');
      return;
    }

    if (
      formData.noticePeriod === 'Other' &&
      !formData.customNoticePeriod.trim()
    ) {
      setError('Please specify the notice period in days.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter the Job Description.');
      return;
    }

    setStatus('loading');

    const experienceRange = `${formData.minExperience.trim()} - ${formData.maxExperience.trim()} Yrs`;
    const resolvedNoticePeriod =
      formData.noticePeriod === 'Other'
        ? `${formData.customNoticePeriod.trim()} Days`
        : `${formData.noticePeriod} Days`;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          workMode: formData.workMode,
          location: formData.location.trim(),
          salary: formData.salary.trim(),
          experience: experienceRange,
          openings: formData.openings ? Number(formData.openings) : 1,
          postedDate: formData.postedDate,
          noticePeriod: resolvedNoticePeriod,
          skills: formData.skills.trim(),
          description: formData.description.trim(),
          employerEmail: employerInfo.email,
          companyName: employerInfo.companyName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to publish job posting.');
        setStatus('idle');
        return;
      }

      setStatus('success');
      router.push('/employer/dashboard');
    } catch {
      setError('Failed to connect to server. Please try again.');
      setStatus('idle');
    }
  };

  const LABEL_CLASS =
    'block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2';
  const INPUT_CLASS =
    'w-full bg-slate-900 border border-slate-700/90 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Shared Login-Style Shimmer Keyframes + Hide Native Date Icon so Custom Button Works in All Browsers */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Ambient Background Glow */}
      <div className="absolute top-[5%] left-[15%] w-[550px] h-[550px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white">
            Create Job Posting
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1.5">
            Reach thousands of targeted candidates instantly.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            {/* ROW 1: JOB TITLE (*) & WORK MODE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={LABEL_CLASS}>
                  JOB TITLE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter the title for this role"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>WORK MODE</label>
                <select
                  value={formData.workMode}
                  onChange={(e) =>
                    setFormData({ ...formData, workMode: e.target.value })
                  }
                  className={`${INPUT_CLASS} cursor-pointer`}
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            {/* ROW 2: LOCATION & SALARY RANGE (LPA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={LABEL_CLASS}>LOCATION</label>
                <input
                  type="text"
                  placeholder="Enter where this job will be located"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>SALARY RANGE (LPA)</label>
                <input
                  type="text"
                  placeholder="Enter annual compensation range in LPA"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* ROW 3: EXPERIENCE RANGE (*) & OPENINGS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={LABEL_CLASS}>
                  EXPERIENCE RANGE (YEARS){' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    placeholder="Min years"
                    value={formData.minExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minExperience: e.target.value,
                      })
                    }
                    className={INPUT_CLASS}
                  />
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    placeholder="Max years"
                    value={formData.maxExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxExperience: e.target.value,
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>OPENINGS</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Total number of openings for this role"
                  value={formData.openings}
                  onChange={(e) =>
                    setFormData({ ...formData, openings: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* ROW 4: POSTED DATE (CLICKABLE LABEL, INPUT & CALENDAR ICON) & NOTICE PERIOD (*) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="posted-date-input"
                  onClick={openDatePicker}
                  className={`${LABEL_CLASS} cursor-pointer hover:text-white transition-colors select-none`}
                >
                  POSTED DATE
                </label>
                <div className="relative">
                  <input
                    id="posted-date-input"
                    ref={dateInputRef}
                    type="date"
                    value={formData.postedDate}
                    onClick={openDatePicker}
                    onChange={(e) =>
                      setFormData({ ...formData, postedDate: e.target.value })
                    }
                    className={`${INPUT_CLASS} pr-12 cursor-pointer [color-scheme:dark]`}
                  />

                  {/* Dedicated Calendar Icon Button (Covers native icon so clicking symbol always opens calendar) */}
                  <button
                    type="button"
                    onClick={openDatePicker}
                    title="Open calendar"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 flex items-center justify-center cursor-pointer transition-colors z-10"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>
                  NOTICE PERIOD (IN DAYS){' '}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.noticePeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, noticePeriod: e.target.value })
                  }
                  className={`${INPUT_CLASS} cursor-pointer`}
                >
                  <option value="">Select acceptable notice period</option>
                  <option value="0">0 Days (Immediate Joiner)</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="Other">Other</option>
                </select>

                {formData.noticePeriod === 'Other' && (
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter custom notice period in days"
                    value={formData.customNoticePeriod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customNoticePeriod: e.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} mt-3`}
                  />
                )}
              </div>
            </div>

            {/* ROW 5: REQUIRED SKILLS */}
            <div>
              <label className={LABEL_CLASS}>
                REQUIRED SKILLS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                placeholder="Enter required skills separated by commas"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>

            {/* ROW 6: JOB DESCRIPTION (*) */}
            <div>
              <label className={LABEL_CLASS}>
                JOB DESCRIPTION <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Outline the key responsibilities, deliverables, and qualifications for this role..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`${INPUT_CLASS} leading-relaxed`}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </p>
            )}

            {/* Submit Button with Unified Enterprise Shimmer & Spinner */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`relative overflow-hidden flex h-14 px-10 items-center justify-center rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 ${
                  status === 'loading'
                    ? 'cursor-wait bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
                }`}
              >
                {status === 'loading' && (
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    style={{ animation: 'shimmer 1.5s infinite' }}
                  ></div>
                )}
                <div className="relative z-10 flex items-center gap-3">
                  {status === 'loading' ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      <span>PUBLISHING JOB...</span>
                    </>
                  ) : (
                    <span>PUBLISH JOB POSTING</span>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}