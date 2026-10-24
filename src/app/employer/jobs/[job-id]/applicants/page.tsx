'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ApplicantRecord {
  id: number;
  job_id: number;
  candidate_id?: number;
  candidate_name?: string;
  profile_name?: string;
  candidate_email?: string;
  user_email?: string;
  candidate_phone?: string;
  profile_phone?: string;
  experience?: string;
  profile_experience?: string;
  salary?: string;
  profile_salary?: string;
  notice_period?: string;
  profile_notice_period?: string;
  skills?: string;
  profile_skills?: string;
  resume_url?: string;
  profile_resume_url?: string;
  candidate_resume_name?: string;
  status?: string;
  applied_at?: string;
  current_role?: string;
  current_company?: string;
  candidate_location?: string;
  candidate_headline?: string;
  candidate_bio?: string;
  candidate_education?: string;
  candidate_college?: string;
  candidate_avatar?: string;
  candidate_profile_data?: any;
}

function safeText(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback;
}

function formatAppliedAgo(rawDate?: string): string {
  if (!rawDate) return 'Applied recently';
  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) return `Applied on ${rawDate}`;

  const diffMs = Date.now() - parsed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Applied just now';
  if (diffMins < 60) return `Applied ${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Applied ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Applied ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function parseSkillsArray(rawSkills?: string, fallbackSkills?: string): string[] {
  const combined = rawSkills || fallbackSkills || '';
  if (!combined) return [];
  try {
    const parsed = JSON.parse(combined);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => safeText(s)).filter(Boolean);
    }
  } catch {}
  return String(combined)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseProfileData(raw: any): Record<string, any> {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

export default function JobApplicantsSplitViewPage() {
  const params = useParams();
  const jobId = (params?.['job-id'] || params?.id) as string;

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(
      `/api/jobs?id=${encodeURIComponent(jobId)}&includeApplicants=true`,
      { cache: 'no-store' }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.job) {
          setJob(data.job);
        }
        if (data && Array.isArray(data.applicants)) {
          setApplicants(data.applicants);
          if (data.applicants.length > 0) {
            setSelectedApplicant(data.applicants[0]);
          }
        } else {
          setApplicants([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch applicants:', err);
        setApplicants([]);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleUpdateStage = async (
    app: ApplicantRecord,
    newStatus: 'SHORTLISTED' | 'REJECTED' | 'INTERVIEW'
  ) => {
    setUpdatingStatus(true);
    const email = safeText(app.candidate_email || app.user_email);
    try {
      const res = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateApplicationStatus',
          applicationId: app.id,
          jobId: Number(jobId),
          candidateEmail: email,
          jobTitle: safeText(job?.title, 'Open Role'),
          companyName: safeText(job?.company_name, 'Hiring Team'),
          status: newStatus,
        }),
      });

      if (res.ok) {
        const updatedList = applicants.map((item) =>
          item.id === app.id ? { ...item, status: newStatus } : item
        );
        setApplicants(updatedList);
        if (selectedApplicant?.id === app.id) {
          setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        }
        showToast(
          `${safeText(app.profile_name || app.candidate_name, 'Candidate')} marked as ${newStatus}!`
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const newApplicantsCount = applicants.filter(
    (a) => String(a.status || 'APPLIED').toUpperCase() === 'APPLIED'
  ).length;

  // Compute selected candidate fields from DB
  const selectedExtra = selectedApplicant
    ? parseProfileData(selectedApplicant.candidate_profile_data)
    : {};
  const selectedName = selectedApplicant
    ? safeText(
        selectedApplicant.profile_name ||
          selectedApplicant.candidate_name ||
          selectedExtra.name,
        'Candidate'
      )
    : '';
  const selectedEmail = selectedApplicant
    ? safeText(selectedApplicant.candidate_email || selectedApplicant.user_email)
    : '';
  const selectedPhone = selectedApplicant
    ? safeText(
        selectedApplicant.profile_phone ||
          selectedApplicant.candidate_phone ||
          selectedExtra.phone,
        'Not provided'
      )
    : '';
  const selectedRole = selectedApplicant
    ? safeText(
        selectedApplicant.current_role ||
          selectedExtra.designation ||
          selectedExtra.employmentList?.[0]?.designation,
        'Software Professional'
      )
    : '';
  const selectedCompany = selectedApplicant
    ? safeText(
        selectedApplicant.current_company ||
          selectedExtra.company ||
          selectedExtra.employmentList?.[0]?.company,
        ''
      )
    : '';
  const selectedLocation = selectedApplicant
    ? safeText(
        selectedApplicant.candidate_location || selectedExtra.location,
        'India'
      )
    : '';
  const selectedExp = selectedApplicant
    ? safeText(
        selectedApplicant.profile_experience ||
          selectedApplicant.experience ||
          selectedExtra.experience,
        'Experienced'
      )
    : '';
  const selectedSalary = selectedApplicant
    ? safeText(
        selectedApplicant.profile_salary ||
          selectedApplicant.salary ||
          selectedExtra.salary,
        'Not disclosed'
      )
    : '';
  const selectedNotice = selectedApplicant
    ? safeText(
        selectedApplicant.profile_notice_period ||
          selectedApplicant.notice_period ||
          selectedExtra.noticePeriod,
        'Immediate'
      )
    : '';
  const selectedHeadline = selectedApplicant
    ? safeText(selectedApplicant.candidate_headline || selectedExtra.headline)
    : '';
  const selectedBio = selectedApplicant
    ? safeText(
        selectedApplicant.candidate_bio || selectedExtra.profileSummary
      )
    : '';
  const selectedResumeUrl = selectedApplicant
    ? safeText(
        selectedApplicant.profile_resume_url || selectedApplicant.resume_url
      )
    : '';
  const selectedSkills = selectedApplicant
    ? parseSkillsArray(
        selectedApplicant.profile_skills,
        selectedApplicant.skills
      )
    : [];
  const selectedEmploymentList: any[] = Array.isArray(
    selectedExtra.employmentList
  )
    ? selectedExtra.employmentList
    : [];
  const selectedEducationList: any[] = Array.isArray(
    selectedExtra.educationList
  )
    ? selectedExtra.educationList
    : [];
  const selectedOnlineProfiles: any[] = Array.isArray(
    selectedExtra.accomplishments?.onlineProfiles
  )
    ? selectedExtra.accomplishments.onlineProfiles
    : [];
  const selectedStatus = String(
    selectedApplicant?.status || 'APPLIED'
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-4 sm:px-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/employer/jobs"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition"
            >
              ← Manage Jobs &amp; Responses
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
              Applicants:{' '}
              {loading
                ? 'Loading...'
                : safeText(job?.title, `Job #${jobId}`)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Total: {applicants.length}
            </span>
            <span className="px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-extrabold uppercase tracking-wider text-indigo-300">
              New: {newApplicantsCount}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-sm text-slate-400">
            Loading applicants from Neon database...
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-14 text-center space-y-3">
            <h2 className="text-lg font-extrabold text-white">
              No candidates have applied to this job yet
            </h2>
            <p className="text-xs text-slate-400">
              As soon as a candidate clicks Apply Now on this job, their profile
              and CV will appear here in real time.
            </p>
          </div>
        ) : (
          /* 2-COLUMN SPLIT-PANE LAYOUT (Matches Screenshot 5.24.55 PM) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: LIST OF REAL DATABASE APPLICANTS */}
            <div className="lg:col-span-4 space-y-4">
              {applicants.map((app) => {
                const isSelected = selectedApplicant?.id === app.id;
                const candName = safeText(
                  app.profile_name || app.candidate_name,
                  'Candidate'
                );
                const skills = parseSkillsArray(app.profile_skills, app.skills);
                const appStatus = String(app.status || 'APPLIED').toUpperCase();

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApplicant(app)}
                    className={`w-full text-left rounded-3xl p-5 border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-extrabold text-white">
                          {candName}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatAppliedAgo(app.applied_at)}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
                          appStatus === 'SHORTLISTED'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : appStatus === 'REJECTED'
                            ? 'bg-red-500/15 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {appStatus === 'APPLIED' ? 'Profile Match' : appStatus}
                      </span>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* RIGHT COLUMN: SELECTED CANDIDATE FULL PROFILE PANE */}
            {selectedApplicant && (
              <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-7">
                {/* Candidate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-extrabold text-white shrink-0">
                      {selectedApplicant.candidate_avatar ? (
                        <img
                          src={selectedApplicant.candidate_avatar}
                          alt={selectedName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {selectedName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-2xl font-extrabold text-white">
                          {selectedName}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            selectedStatus === 'REJECTED'
                              ? 'bg-red-500/15 border-red-500/30 text-red-400'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          {selectedStatus}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        {selectedRole}
                        {selectedCompany ? ` @ ${selectedCompany}` : ''} |{' '}
                        {selectedLocation}
                      </p>

                      {/* Action Links (Resume Download & Online Profiles) */}
                      <div className="flex flex-wrap items-center gap-4 mt-2.5">
                        {selectedResumeUrl && (
                          <a
                            href={selectedResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 hover:text-indigo-300"
                          >
                            Download Resume ↗
                          </a>
                        )}
                        {selectedOnlineProfiles.map((prof: any, idx: number) =>
                          prof?.url ? (
                            <a
                              key={idx}
                              href={
                                /^https?:\/\//i.test(prof.url)
                                  ? prof.url
                                  : `https://${prof.url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 hover:text-indigo-300"
                            >
                              View {safeText(prof.title, 'Profile')} ↗
                            </a>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reject / Shortlist Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() =>
                        handleUpdateStage(selectedApplicant, 'REJECTED')
                      }
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition cursor-pointer ${
                        selectedStatus === 'REJECTED'
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-slate-800 hover:bg-red-600/20 border-slate-700 text-slate-200 hover:text-red-300'
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() =>
                        handleUpdateStage(selectedApplicant, 'SHORTLISTED')
                      }
                      className={`px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-lg ${
                        selectedStatus === 'SHORTLISTED'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {selectedStatus === 'SHORTLISTED'
                        ? '✓ Shortlisted'
                        : 'Shortlist'}
                    </button>
                  </div>
                </div>

                {/* Unmasked Contact & Compensation Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedEmail}`}
                      className="font-extrabold text-emerald-400 hover:underline break-all"
                    >
                      {selectedEmail || 'Not provided'}
                    </a>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Mobile Number
                    </span>
                    <a
                      href={`tel:${selectedPhone}`}
                      className="font-extrabold text-emerald-400 hover:underline"
                    >
                      {selectedPhone}
                    </a>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Experience &amp; Notice
                    </span>
                    <span className="font-extrabold text-white">
                      {selectedExp} • {selectedNotice}
                    </span>
                  </div>
                </div>

                {/* SUMMARY */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                    Summary
                  </h3>
                  {selectedHeadline && (
                    <p className="text-xs font-bold text-slate-200 mb-2 leading-relaxed">
                      {selectedHeadline}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedBio ||
                      'Candidate has not added a profile summary yet.'}
                  </p>
                </div>

                {/* EXPERIENCE */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Experience
                  </h3>
                  {selectedEmploymentList.length > 0 ? (
                    <div className="space-y-4">
                      {selectedEmploymentList.map((emp: any, idx: number) => (
                        <div key={emp?.id || idx} className="space-y-1">
                          <h4 className="text-sm font-extrabold text-white">
                            {safeText(emp?.designation, selectedRole)}{' '}
                            {emp?.company && (
                              <span className="text-slate-400 font-semibold">
                                @ {safeText(emp.company)}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {safeText(emp?.startDate || emp?.joiningYear, '')}
                            {emp?.endDate
                              ? ` - ${safeText(emp.endDate)}`
                              : emp?.isCurrentEmployment === 'Yes'
                              ? ' - Present'
                              : ''}
                          </p>
                          {emp?.description && (
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                              {safeText(emp.description)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-white">
                        {selectedRole}{' '}
                        {selectedCompany && (
                          <span className="text-slate-400 font-semibold">
                            @ {selectedCompany}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Total Experience: {selectedExp} • Current CTC:{' '}
                        {selectedSalary}
                      </p>
                    </div>
                  )}
                </div>

                {/* KEY SKILLS */}
                {selectedSkills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                      Key Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* EDUCATION */}
                {selectedEducationList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                      Education
                    </h3>
                    <div className="space-y-2.5">
                      {selectedEducationList.map((edu: any, idx: number) => (
                        <div key={edu?.id || idx} className="text-xs">
                          <p className="font-extrabold text-white">
                            {safeText(
                              edu?.degree ||
                                `${safeText(edu?.course)} ${safeText(
                                  edu?.specialization
                                )}`
                            )}
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            {safeText(edu?.institute)}{' '}
                            {edu?.yearRange ? `(${safeText(edu.yearRange)})` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}