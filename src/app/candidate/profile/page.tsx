'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmploymentItem {
  id: string;
  designation: string;
  company: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  noticePeriod: string;
  description: string;
  topSkills: string;
}

interface EducationItem {
  id: string;
  degree: string;
  institute: string;
  yearRange: string;
  courseType: string;
}

interface ItSkillItem {
  id: string;
  skill: string;
  version: string;
  lastUsed: string;
  experience: string;
}

interface ProjectItem {
  id: string;
  title: string;
  client: string;
  status: string;
  duration: string;
  details: string;
}

interface AccomplishmentEntry {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  validity: string;
}

interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

const INPUT_CLASS =
  'w-full bg-slate-950/90 border border-slate-700/90 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

const LABEL_CLASS =
  'block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5';

// Format any date or ISO string to local system time: YYYY-MM-DD HH:mm
function formatLocalTimestamp(raw?: string): string {
  const date = raw && raw !== 'Today' ? new Date(raw) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const day = String(validDate.getDate()).padStart(2, '0');
  const hours = String(validDate.getHours()).padStart(2, '0');
  const minutes = String(validDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('resume');

  // Core Profile State (No hardcoded location or company values)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    workStatus: 'experienced',
    designation: '',
    company: '',
    experience: '',
    salary: '',
    noticePeriod: '',
    headline: '',
    bio: '',
    skills: [] as string[],
    avatar: '',
    resumeUrl: '',
    resumeName: '',
    resumeUpdatedAt: '',
    updatedAt: '',
    employmentList: [] as EmploymentItem[],
    educationList: [] as EducationItem[],
    itSkills: [] as ItSkillItem[],
    projects: [] as ProjectItem[],
    accomplishments: {
      onlineProfiles: [] as AccomplishmentEntry[],
      workSamples: [] as AccomplishmentEntry[],
      publications: [] as AccomplishmentEntry[],
      presentations: [] as AccomplishmentEntry[],
      patents: [] as AccomplishmentEntry[],
      certifications: [] as AccomplishmentEntry[],
    },
    careerProfile: {
      currentIndustry: '',
      department: '',
      roleCategory: '',
      jobRole: '',
      desiredJobType: 'Permanent',
      desiredEmploymentType: 'Full Time',
      preferredJobRole: '',
      preferredLocations: '',
      preferredSalary: '',
      preferredShift: 'Day',
    },
    personalDetails: {
      gender: '',
      maritalStatus: '',
      dateOfBirth: '',
      category: '',
      workPermit: 'India',
      address: '',
      pincode: '',
    },
    languages: [] as LanguageItem[],
    diversity: {
      disabilityStatus: 'Do not have disability',
      militaryExperience: 'Never served',
      careerBreak: 'Have not taken',
    },
  });

  // Active Modal Editor State
  const [activeModal, setActiveModal] = useState<
    | null
    | 'basic'
    | 'headline'
    | 'skills'
    | 'employment'
    | 'education'
    | 'itSkill'
    | 'project'
    | 'summary'
    | 'accomplishment'
    | 'career'
    | 'personal'
    | 'language'
    | 'diversity'
  >(null);

  // Temporary Drafts for Modals
  const [basicDraft, setBasicDraft] = useState({
    name: '',
    designation: '',
    company: '',
    location: '',
    experience: '',
    salary: '',
    phone: '',
    noticePeriod: '',
    workStatus: 'experienced',
  });
  const [headlineDraft, setHeadlineDraft] = useState('');
  const [summaryDraft, setSummaryDraft] = useState('');
  const [skillsDraft, setSkillsDraft] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [empDraft, setEmpDraft] = useState<EmploymentItem>({
    id: '',
    designation: '',
    company: '',
    employmentType: 'Full-time',
    startDate: '',
    endDate: '',
    noticePeriod: '',
    description: '',
    topSkills: '',
  });

  const [eduDraft, setEduDraft] = useState<EducationItem>({
    id: '',
    degree: '',
    institute: '',
    yearRange: '',
    courseType: 'Full Time',
  });

  const [itSkillDraft, setItSkillDraft] = useState<ItSkillItem>({
    id: '',
    skill: '',
    version: '',
    lastUsed: '',
    experience: '',
  });

  const [projectDraft, setProjectDraft] = useState<ProjectItem>({
    id: '',
    title: '',
    client: '',
    status: 'Finished',
    duration: '',
    details: '',
  });

  const [accompCategory, setAccompCategory] = useState<
    | 'onlineProfiles'
    | 'workSamples'
    | 'publications'
    | 'presentations'
    | 'patents'
    | 'certifications'
  >('certifications');
  const [accompDraft, setAccompDraft] = useState<AccomplishmentEntry>({
    id: '',
    title: '',
    subtitle: '',
    url: '',
    validity: '',
  });

  const [careerDraft, setCareerDraft] = useState(profile.careerProfile);
  const [personalDraft, setPersonalDraft] = useState(profile.personalDetails);
  const [languageDraft, setLanguageDraft] = useState<LanguageItem>({
    id: '',
    language: '',
    proficiency: 'Expert',
    read: true,
    write: true,
    speak: true,
  });
  const [diversityDraft, setDiversityDraft] = useState(profile.diversity);

  // Sync changes immediately with Header & Side Drawer
  const broadcastProfileUpdate = (updated: {
    name?: string;
    avatar?: string;
    headline?: string;
    phone?: string;
  }) => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const merged = {
          ...parsed,
          name: updated.name ?? parsed.name,
          avatar: updated.avatar ?? parsed.avatar,
          headline: updated.headline ?? parsed.headline,
          phone: updated.phone ?? parsed.phone,
        };
        localStorage.setItem('user', JSON.stringify(merged));
      }
      window.dispatchEvent(
        new CustomEvent('profile-updated', { detail: updated })
      );
    } catch {}
  };

  // Load Candidate Profile from Neon DB
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      const email = parsed.email || '';
      if (!email) {
        setLoading(false);
        return;
      }

      fetch(`/api/profile?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile((prev) => ({
              ...prev,
              name: data.name || parsed.name || '',
              email: data.email || email,
              phone: data.phone || '',
              location: data.location || '',
              workStatus: data.workStatus || 'experienced',
              designation: data.designation || '',
              company: data.company || '',
              experience: data.experience || '',
              salary: data.salary || '',
              noticePeriod: data.noticePeriod || '',
              headline: data.headline || '',
              bio: data.bio || '',
              skills: Array.isArray(data.skills) ? data.skills : [],
              avatar: data.avatar || '',
              resumeUrl: data.resumeUrl || '',
              resumeName: data.resumeName || '',
              resumeUpdatedAt: data.resumeUpdatedAt || '',
              updatedAt: formatLocalTimestamp(data.updatedAt),
              employmentList: Array.isArray(data.employmentList)
                ? data.employmentList
                : [],
              educationList: Array.isArray(data.educationList)
                ? data.educationList
                : [],
              itSkills: Array.isArray(data.itSkills) ? data.itSkills : [],
              projects: Array.isArray(data.projects) ? data.projects : [],
              accomplishments: {
                onlineProfiles:
                  data.accomplishments?.onlineProfiles || [],
                workSamples: data.accomplishments?.workSamples || [],
                publications: data.accomplishments?.publications || [],
                presentations: data.accomplishments?.presentations || [],
                patents: data.accomplishments?.patents || [],
                certifications:
                  data.accomplishments?.certifications || [],
              },
              careerProfile: {
                ...prev.careerProfile,
                ...(data.careerProfile || {}),
              },
              personalDetails: {
                ...prev.personalDetails,
                ...(data.personalDetails || {}),
              },
              languages: Array.isArray(data.languages) ? data.languages : [],
              diversity: {
                ...prev.diversity,
                ...(data.diversity || {}),
              },
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  const showSuccessToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Generic Save Helper to Persist to Neon DB & UploadThing
  const saveToDatabase = async (
    updatedState: typeof profile,
    extraPayload: Record<string, any> = {},
    toastMessage = 'Profile updated successfully'
  ) => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedState,
          ...extraPayload,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const finalAvatar = data.avatar || updatedState.avatar;
        const nextState = {
          ...updatedState,
          avatar: finalAvatar,
          resumeUrl: data.resumeUrl ?? updatedState.resumeUrl,
          resumeName: data.resumeName ?? updatedState.resumeName,
          resumeUpdatedAt:
            data.resumeUpdatedAt ?? updatedState.resumeUpdatedAt,
          updatedAt: formatLocalTimestamp(data.updatedAt),
        };
        setProfile(nextState);

        // Immediately sync Header pill & Side Drawer
        broadcastProfileUpdate({
          name: nextState.name,
          avatar: finalAvatar,
          headline: nextState.designation || nextState.headline,
          phone: nextState.phone,
        });

        setActiveModal(null);
        showSuccessToast(toastMessage);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // File Upload Handlers (Resume & Avatar)
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('Resume file size must be under 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        saveToDatabase(
          profile,
          {
            resumeBase64: reader.result,
            resumeFileName: file.name,
          },
          'Resume uploaded to UploadThing & saved!'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteResume = () => {
    saveToDatabase(
      { ...profile, resumeUrl: '', resumeName: '', resumeUpdatedAt: '' },
      { deleteResume: true },
      'Resume deleted.'
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const previewDataUrl = reader.result;

        // 1. Instant UI reflection on Profile card, Top-Right Header, and Side Drawer
        const optimisticState = {
          ...profile,
          avatar: previewDataUrl,
          updatedAt: formatLocalTimestamp(),
        };
        setProfile(optimisticState);
        broadcastProfileUpdate({
          name: profile.name,
          avatar: previewDataUrl,
          headline: profile.designation || profile.headline,
        });

        // 2. Persist to UploadThing & Neon DB in background
        saveToDatabase(
          optimisticState,
          {
            avatarBase64: previewDataUrl,
            avatarFileName: file.name,
          },
          'Profile photo updated!'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const quickLinks = [
    {
      id: 'resume',
      label: 'Resume',
      actionLabel: 'Update',
      onAction: () => document.getElementById('resume-upload-input')?.click(),
    },
    { id: 'headline', label: 'Resume headline' },
    { id: 'key-skills', label: 'Key skills' },
    {
      id: 'employment',
      label: 'Employment',
      actionLabel: 'Add',
      onAction: () => {
        setEmpDraft({
          id: '',
          designation: '',
          company: '',
          employmentType: 'Full-time',
          startDate: '',
          endDate: '',
          noticePeriod: '',
          description: '',
          topSkills: '',
        });
        setActiveModal('employment');
      },
    },
    {
      id: 'education',
      label: 'Education',
      actionLabel: 'Add',
      onAction: () => {
        setEduDraft({
          id: '',
          degree: '',
          institute: '',
          yearRange: '',
          courseType: 'Full Time',
        });
        setActiveModal('education');
      },
    },
    { id: 'it-skills', label: 'IT skills' },
    {
      id: 'projects',
      label: 'Projects',
      actionLabel: 'Add',
      onAction: () => {
        setProjectDraft({
          id: '',
          title: '',
          client: '',
          status: 'Finished',
          duration: '',
          details: '',
        });
        setActiveModal('project');
      },
    },
    { id: 'profile-summary', label: 'Profile summary' },
    { id: 'accomplishments', label: 'Accomplishments' },
    { id: 'career-profile', label: 'Career profile' },
    { id: 'personal-details', label: 'Personal details' },
  ];

  // Reusable Modal Action Footer (Only Save button; top-right ✕ closes popup)
  const renderModalFooter = (saveLabel = 'Save') => (
    <div className="pt-6 mt-8 border-t border-slate-800/90 flex items-center justify-end">
      <button
        type="submit"
        disabled={saving}
        className="relative overflow-hidden px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 text-xs font-extrabold text-white transition shadow-lg shadow-blue-600/25 cursor-pointer"
      >
        {saving && (
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            style={{ animation: 'shimmer 1.5s infinite' }}
          />
        )}
        <span className="relative z-10">
          {saving ? 'Saving...' : saveLabel}
        </span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-8 px-4 sm:px-8 md:px-12">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPopIn {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(18px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Floating Save Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[9999999] bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2.5"
          style={{
            animation: 'modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* ================================================================
            TOP CANDIDATE HEADER CARD
           ================================================================ */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            {/* Left Circular Avatar with Green 100% Ring & Photo Upload */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center mx-auto md:mx-0 group">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 112 112"
              >
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeDasharray="314"
                  strokeDashoffset="0"
                />
              </svg>

              <label
                className="w-23 h-23 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer relative"
                title="Click to update profile photo"
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-white">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-extrabold text-white transition-opacity">
                  📷 Photo
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

              <span className="absolute -bottom-1 bg-slate-950 border border-emerald-500/40 text-emerald-400 text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow">
                100%
              </span>
            </div>

            {/* Right Identity & 2-Column Info Grid */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold text-white">
                      {loading ? 'Loading...' : profile.name || 'Candidate Name'}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setBasicDraft({
                          name: profile.name,
                          designation: profile.designation,
                          company: profile.company,
                          location: profile.location,
                          experience: profile.experience,
                          salary: profile.salary,
                          phone: profile.phone,
                          noticePeriod: profile.noticePeriod,
                          workStatus: profile.workStatus,
                        });
                        setActiveModal('basic');
                      }}
                      className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer text-sm"
                      title="Edit Basic Details"
                    >
                      ✎
                    </button>
                  </div>

                  <p className="text-sm font-bold text-slate-200 mt-1">
                    {profile.designation ||
                      (profile.workStatus === 'fresher'
                        ? 'Fresher Candidate'
                        : 'Add your current role / designation')}
                  </p>
                  {profile.company && (
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      at {profile.company}
                    </p>
                  )}
                </div>

                <span className="text-xs text-slate-400 shrink-0">
                  Profile last updated -{' '}
                  <strong className="text-slate-200">
                    {profile.updatedAt || formatLocalTimestamp()}
                  </strong>
                </span>
              </div>

              {/* 2-Column Metadata Grid */}
              <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">📍</span>
                    <span>{profile.location || 'Add location'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">💼</span>
                    <span>
                      {profile.experience ||
                        (profile.workStatus === 'fresher'
                          ? 'Fresher (0 Years)'
                          : 'Add total experience')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">₹</span>
                    <span>{profile.salary || 'Add annual salary'}</span>
                  </div>
                </div>

                <div className="space-y-2.5 sm:border-l sm:border-slate-800 sm:pl-6">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">📞</span>
                    <span>{profile.phone || 'Add mobile number'}</span>
                    {profile.phone && (
                      <span
                        className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold"
                        title="Verified"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">✉️</span>
                    <span className="truncate">{profile.email}</span>
                    {profile.email && (
                      <span
                        className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0"
                        title="Verified"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">🗓️</span>
                    <span>{profile.noticePeriod || 'Add notice period'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            MAIN 2-COLUMN BODY: LEFT QUICK LINKS + RIGHT SECTIONS
           ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT STICKY QUICK LINKS SIDEBAR */}
          <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:sticky lg:top-24 shadow-xl">
            <h2 className="text-base font-extrabold text-white mb-4 px-2">
              Quick links
            </h2>
            <ul className="space-y-1">
              {quickLinks.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                    activeSectionId === item.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="text-left flex-1 cursor-pointer"
                  >
                    {item.label}
                  </button>
                  {item.actionLabel && (
                    <button
                      type="button"
                      onClick={item.onAction}
                      className="text-blue-400 hover:text-blue-300 font-extrabold cursor-pointer ml-2"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT MAIN CONTENT CARDS */}
          <div className="lg:col-span-9 space-y-6">
            {/* PRO KEYWORD INSIGHTS BANNER */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-xl font-extrabold text-amber-400 flex items-center gap-1">
                  PRO 👑
                </span>
                <span className="h-5 w-px bg-slate-700 hidden sm:inline-block"></span>
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  Power up with keyword insights
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/credits"
                  className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow"
                >
                  Become a Pro
                </Link>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full">
                  25% off
                </span>
              </div>
            </div>

            {/* 1. RESUME SECTION */}
            <section
              id="resume"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <h3 className="text-base font-extrabold text-white mb-4">
                Resume
              </h3>

              {profile.resumeName ? (
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      {profile.resumeName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded on{' '}
                      {formatLocalTimestamp(profile.resumeUpdatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {profile.resumeUrl && (
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-blue-400 transition"
                        title="Download Resume"
                      >
                        ↓
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-red-500/20 border border-slate-700 flex items-center justify-center text-blue-400 hover:text-red-400 transition cursor-pointer"
                      title="Delete Resume"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-4">
                  Your resume is the first impression you make on potential
                  employers. Upload your latest CV to get noticed faster.
                </p>
              )}

              <div className="border-2 border-dashed border-slate-700/80 rounded-2xl p-6 text-center bg-slate-950/40">
                <label className="inline-block px-5 py-2 rounded-full border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold text-xs cursor-pointer transition">
                  <span>
                    {saving
                      ? 'Uploading...'
                      : profile.resumeName
                      ? 'Update resume'
                      : 'Upload resume'}
                  </span>
                  <input
                    id="resume-upload-input"
                    type="file"
                    accept=".doc,.docx,.rtf,.pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2.5">
                  Supported Formats: doc, docx, rtf, pdf, upto 2 MB
                </p>
              </div>
            </section>

            {/* 2. RESUME HEADLINE SECTION */}
            <section
              id="headline"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <h3 className="text-base font-extrabold text-white">
                  Resume headline
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setHeadlineDraft(profile.headline);
                    setActiveModal('headline');
                  }}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                  title="Edit Resume Headline"
                >
                  ✎
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {profile.headline ||
                  'Add a concise headline summarizing your role, years of experience, and core domain expertise.'}
              </p>
            </section>

            {/* 3. KEY SKILLS SECTION */}
            <section
              id="key-skills"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <h3 className="text-base font-extrabold text-white">
                  Key skills
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSkillsDraft([...profile.skills]);
                    setNewSkillInput('');
                    setActiveModal('skills');
                  }}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                  title="Edit Key Skills"
                >
                  ✎
                </button>
              </div>

              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Click the edit icon to add your key technical and functional
                  skills.
                </p>
              )}
            </section>

            {/* 4. EMPLOYMENT SECTION */}
            <section
              id="employment"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-extrabold text-white">
                  Employment
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEmpDraft({
                      id: '',
                      designation: '',
                      company: '',
                      employmentType: 'Full-time',
                      startDate: '',
                      endDate: '',
                      noticePeriod: '',
                      description: '',
                      topSkills: '',
                    });
                    setActiveModal('employment');
                  }}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Add employment
                </button>
              </div>

              {profile.employmentList.length > 0 ? (
                <div className="space-y-6 divide-y divide-slate-800">
                  {profile.employmentList.map((emp) => (
                    <div key={emp.id} className="pt-5 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">
                            {emp.designation}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setEmpDraft(emp);
                              setActiveModal('employment');
                            }}
                            className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                          >
                            ✎
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = profile.employmentList.filter(
                              (item) => item.id !== emp.id
                            );
                            saveToDatabase(
                              { ...profile, employmentList: filtered },
                              {},
                              'Employment entry removed'
                            );
                          }}
                          className="text-[11px] text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">
                        {emp.company}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {emp.employmentType}
                        {emp.startDate ? ` | ${emp.startDate}` : ''}
                        {emp.endDate ? ` to ${emp.endDate}` : ''}
                      </p>
                      {emp.noticePeriod && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {emp.noticePeriod}
                        </p>
                      )}
                      {emp.description && (
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {emp.description}
                        </p>
                      )}
                      {emp.topSkills && (
                        <p className="text-xs text-slate-300 mt-2">
                          <strong className="text-white">
                            Top 5 key skills:
                          </strong>{' '}
                          {emp.topSkills}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Add your work experience and roles so recruiters can match you
                  with relevant openings.
                </p>
              )}
            </section>

            {/* 5. EDUCATION SECTION */}
            <section
              id="education"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-extrabold text-white">
                  Education
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEduDraft({
                      id: '',
                      degree: '',
                      institute: '',
                      yearRange: '',
                      courseType: 'Full Time',
                    });
                    setActiveModal('education');
                  }}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Add education
                </button>
              </div>

              {profile.educationList.length > 0 ? (
                <div className="space-y-5">
                  {profile.educationList.map((edu) => (
                    <div
                      key={edu.id}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">
                            {edu.degree}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setEduDraft(edu);
                              setActiveModal('education');
                            }}
                            className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                          >
                            ✎
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 mt-0.5">
                          {edu.institute}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {edu.yearRange}
                          {edu.courseType ? ` | ${edu.courseType}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = profile.educationList.filter(
                            (e) => e.id !== edu.id
                          );
                          saveToDatabase(
                            { ...profile, educationList: filtered },
                            {},
                            'Education removed'
                          );
                        }}
                        className="text-[11px] text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-3">
                  Add your graduation, post-graduation, and school details.
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEduDraft({
                      id: '',
                      degree: '',
                      institute: '',
                      yearRange: '',
                      courseType: 'Full Time',
                    });
                    setActiveModal('education');
                  }}
                  className="text-xs font-extrabold text-blue-400 hover:underline cursor-pointer"
                >
                  Add doctorate/PhD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEduDraft({
                      id: '',
                      degree: '',
                      institute: '',
                      yearRange: '',
                      courseType: 'Full Time',
                    });
                    setActiveModal('education');
                  }}
                  className="text-xs font-extrabold text-blue-400 hover:underline cursor-pointer"
                >
                  Add masters/post-graduation
                </button>
              </div>
            </section>

            {/* 6. IT SKILLS SECTION */}
            <section
              id="it-skills"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-extrabold text-white">
                  IT skills
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setItSkillDraft({
                      id: '',
                      skill: '',
                      version: '',
                      lastUsed: '',
                      experience: '',
                    });
                    setActiveModal('itSkill');
                  }}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Add details
                </button>
              </div>

              {profile.itSkills.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 font-semibold">Skills</th>
                        <th className="py-2.5 font-semibold">Version</th>
                        <th className="py-2.5 font-semibold">Last used</th>
                        <th className="py-2.5 font-semibold">Experience</th>
                        <th className="py-2.5 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {profile.itSkills.map((item) => (
                        <tr key={item.id} className="text-slate-200">
                          <td className="py-3 font-bold pr-4">{item.skill}</td>
                          <td className="py-3 pr-4">{item.version || '-'}</td>
                          <td className="py-3 pr-4">{item.lastUsed || '-'}</td>
                          <td className="py-3 pr-4">
                            {item.experience || '-'}
                          </td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setItSkillDraft(item);
                                setActiveModal('itSkill');
                              }}
                              className="text-slate-400 hover:text-blue-400 mr-3 cursor-pointer"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = profile.itSkills.filter(
                                  (s) => s.id !== item.id
                                );
                                saveToDatabase(
                                  { ...profile, itSkills: filtered },
                                  {},
                                  'IT skill removed'
                                );
                              }}
                              className="text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Show your technical expertise by mentioning software, tools,
                  versions, and years of experience.
                </p>
              )}
            </section>

            {/* 7. PROJECTS SECTION */}
            <section
              id="projects"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-extrabold text-white">
                  Projects
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setProjectDraft({
                      id: '',
                      title: '',
                      client: '',
                      status: 'Finished',
                      duration: '',
                      details: '',
                    });
                    setActiveModal('project');
                  }}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Add project
                </button>
              </div>

              {profile.projects.length > 0 ? (
                <div className="space-y-4 mt-4 divide-y divide-slate-800">
                  {profile.projects.map((proj) => (
                    <div key={proj.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">
                            {proj.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setProjectDraft(proj);
                              setActiveModal('project');
                            }}
                            className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                          >
                            ✎
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = profile.projects.filter(
                              (p) => p.id !== proj.id
                            );
                            saveToDatabase(
                              { ...profile, projects: filtered },
                              {},
                              'Project removed'
                            );
                          }}
                          className="text-[11px] text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      {proj.client && (
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">
                          Client: {proj.client} ({proj.status})
                        </p>
                      )}
                      {proj.duration && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {proj.duration}
                        </p>
                      )}
                      {proj.details && (
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {proj.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Stand out to employers by adding details about projects that
                  you have done so far
                </p>
              )}
            </section>

            {/* 8. PROFILE SUMMARY SECTION */}
            <section
              id="profile-summary"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <h3 className="text-base font-extrabold text-white">
                  Profile summary
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSummaryDraft(profile.bio);
                    setActiveModal('summary');
                  }}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                  title="Edit Profile Summary"
                >
                  ✎
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {profile.bio ||
                  'Highlight your career achievements, domain expertise, leadership experience, and what kind of role you are looking for.'}
              </p>
            </section>

            {/* 9. ACCOMPLISHMENTS SECTION */}
            <section
              id="accomplishments"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <h3 className="text-base font-extrabold text-white mb-5">
                Accomplishments
              </h3>

              <div className="divide-y divide-slate-800 space-y-5">
                {(
                  [
                    {
                      key: 'onlineProfiles',
                      title: 'Online profile',
                      desc: 'Add link to online professional profiles',
                    },
                    {
                      key: 'workSamples',
                      title: 'Work sample',
                      desc: 'Link relevant work samples',
                    },
                    {
                      key: 'publications',
                      title:
                        'White paper / Research publication / Journal entry',
                      desc: 'Add links to your online publications',
                    },
                    {
                      key: 'presentations',
                      title: 'Presentation',
                      desc: 'Add links to your online presentations',
                    },
                    {
                      key: 'patents',
                      title: 'Patent',
                      desc: 'Add details of patents you have filed',
                    },
                    {
                      key: 'certifications',
                      title: 'Certification',
                      desc: 'Add details of certifications you have completed',
                    },
                  ] as const
                ).map((sec) => {
                  const entries = profile.accomplishments[sec.key] || [];
                  return (
                    <div key={sec.key} className="pt-5 first:pt-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">
                            {sec.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {sec.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAccompCategory(sec.key);
                            setAccompDraft({
                              id: '',
                              title: '',
                              subtitle: '',
                              url: '',
                              validity: '',
                            });
                            setActiveModal('accomplishment');
                          }}
                          className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>

                      {entries.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-start gap-3.5 bg-slate-800/40 border border-slate-800 p-3.5 rounded-2xl"
                            >
                              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                                {entry.title?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-extrabold text-white">
                                      {entry.title}
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAccompCategory(sec.key);
                                        setAccompDraft(entry);
                                        setActiveModal('accomplishment');
                                      }}
                                      className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                                    >
                                      ✎
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedList = entries.filter(
                                        (i) => i.id !== entry.id
                                      );
                                      saveToDatabase(
                                        {
                                          ...profile,
                                          accomplishments: {
                                            ...profile.accomplishments,
                                            [sec.key]: updatedList,
                                          },
                                        },
                                        {},
                                        'Removed accomplishment'
                                      );
                                    }}
                                    className="text-[10px] text-slate-500 hover:text-red-400 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                                {entry.subtitle && (
                                  <p className="text-xs text-slate-300 mt-0.5">
                                    {entry.subtitle}
                                  </p>
                                )}
                                {entry.url && (
                                  <a
                                    href={entry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:underline block truncate mt-0.5"
                                  >
                                    {entry.url}
                                  </a>
                                )}
                                {entry.validity && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {entry.validity}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 10. CAREER PROFILE SECTION */}
            <section
              id="career-profile"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <h3 className="text-base font-extrabold text-white">
                  Career profile
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setCareerDraft({ ...profile.careerProfile });
                    setActiveModal('career');
                  }}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                >
                  ✎
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">
                    Current industry
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.currentIndustry || 'Add industry'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Department</span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.department || 'Add department'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Role category
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.roleCategory || 'Add role category'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Job role</span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.jobRole || 'Add job role'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Desired job type
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.desiredJobType || 'Permanent'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Desired employment type
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.desiredEmploymentType || 'Full Time'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Preferred job role
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.preferredJobRole ||
                      'Add preferred job roles'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Preferred work location
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.preferredLocations ||
                      'Add preferred cities'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Preferred annual salary
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.preferredSalary || 'Add salary'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Preferred shift
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.careerProfile.preferredShift || 'Day'}
                  </span>
                </div>
              </div>
            </section>

            {/* 11. PERSONAL DETAILS & LANGUAGES SECTION */}
            <section
              id="personal-details"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl scroll-mt-24"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <h3 className="text-base font-extrabold text-white">
                  Personal details
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setPersonalDraft({ ...profile.personalDetails });
                    setActiveModal('personal');
                  }}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                >
                  ✎
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs pb-7 border-b border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-1">Personal</span>
                  <span className="font-extrabold text-white">
                    {[
                      profile.personalDetails.gender,
                      profile.personalDetails.maritalStatus,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Add gender & marital status'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Work permit</span>
                  <span className="font-extrabold text-white">
                    {profile.personalDetails.workPermit || 'India'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Date of birth
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.personalDetails.dateOfBirth || 'Add date of birth'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Address</span>
                  <span className="font-extrabold text-white leading-relaxed">
                    {profile.personalDetails.address || 'Add permanent address'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Category</span>
                  <span className="font-extrabold text-white">
                    {profile.personalDetails.category || 'Add category'}
                  </span>
                </div>
              </div>

              {/* Languages Sub-Section */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-extrabold text-white">
                    Languages
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguageDraft({
                        id: '',
                        language: '',
                        proficiency: 'Expert',
                        read: true,
                        write: true,
                        speak: true,
                      });
                      setActiveModal('language');
                    }}
                    className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Add languages
                  </button>
                </div>

                {profile.languages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 font-semibold">Languages</th>
                          <th className="py-2 font-semibold">Proficiency</th>
                          <th className="py-2 font-semibold text-center">
                            Read
                          </th>
                          <th className="py-2 font-semibold text-center">
                            Write
                          </th>
                          <th className="py-2 font-semibold text-center">
                            Speak
                          </th>
                          <th className="py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {profile.languages.map((lang) => (
                          <tr key={lang.id} className="text-slate-200">
                            <td className="py-3 font-bold">{lang.language}</td>
                            <td className="py-3 font-bold">
                              {lang.proficiency}
                            </td>
                            <td className="py-3 text-center text-emerald-400">
                              {lang.read ? '✓' : '—'}
                            </td>
                            <td className="py-3 text-center text-emerald-400">
                              {lang.write ? '✓' : '—'}
                            </td>
                            <td className="py-3 text-center text-emerald-400">
                              {lang.speak ? '✓' : '—'}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = profile.languages.filter(
                                    (l) => l.id !== lang.id
                                  );
                                  saveToDatabase(
                                    { ...profile, languages: filtered },
                                    {},
                                    'Language removed'
                                  );
                                }}
                                className="text-slate-500 hover:text-red-400 cursor-pointer"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Add languages you can read, write, or speak.
                  </p>
                )}
              </div>
            </section>

            {/* 12. DIVERSITY & INCLUSION SECTION */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
              <span className="absolute top-0 right-6 px-3 py-1 rounded-b-xl bg-indigo-500/20 border-x border-b border-indigo-500/30 text-[10px] font-extrabold text-indigo-300">
                New
              </span>

              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-base font-extrabold text-white">
                  Diversity &amp; inclusion
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setDiversityDraft({ ...profile.diversity });
                    setActiveModal('diversity');
                  }}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                >
                  ✎
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Share details to attract recruiters who value people from
                different backgrounds
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    Disability status
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.diversity.disabilityStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    Military experience
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.diversity.militaryExperience}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    Career break
                  </span>
                  <span className="font-extrabold text-white">
                    {profile.diversity.careerBreak}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SPACIOUS, ANIMATED EDIT MODALS (NO HARDCODED VALUES, NO BOTTOM CANCEL)
         ===================================================================== */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          style={{ animation: 'backdropFadeIn 0.2s ease-out forwards' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] relative"
            style={{
              animation:
                'modalPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Single Top-Right Close Button (✕) */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-7 right-7 w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-all"
            >
              ✕
            </button>

            {/* MODAL 1: BASIC DETAILS */}
            {activeModal === 'basic' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({
                    ...profile,
                    ...basicDraft,
                  });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Edit Basic Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Keep your primary contact and role details updated so
                    recruiters can reach you easily.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={LABEL_CLASS}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={basicDraft.name}
                      onChange={(e) =>
                        setBasicDraft({ ...basicDraft, name: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>
                      Current Role / Designation
                    </label>
                    <input
                      type="text"
                      placeholder="Enter current role or designation"
                      value={basicDraft.designation}
                      onChange={(e) =>
                        setBasicDraft({
                          ...basicDraft,
                          designation: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Current Company</label>
                    <input
                      type="text"
                      placeholder="Enter current company name"
                      value={basicDraft.company}
                      onChange={(e) =>
                        setBasicDraft({
                          ...basicDraft,
                          company: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Location</label>
                    <input
                      type="text"
                      placeholder="Enter city and country"
                      value={basicDraft.location}
                      onChange={(e) =>
                        setBasicDraft({
                          ...basicDraft,
                          location: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Total Experience</label>
                    <input
                      type="text"
                      placeholder="Enter total experience"
                      value={basicDraft.experience}
                      onChange={(e) =>
                        setBasicDraft({
                          ...basicDraft,
                          experience: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Annual Salary (CTC)</label>
                    <input
                      type="text"
                      placeholder="Enter annual salary"
                      value={basicDraft.salary}
                      onChange={(e) =>
                        setBasicDraft({ ...basicDraft, salary: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={basicDraft.phone}
                      onChange={(e) =>
                        setBasicDraft({ ...basicDraft, phone: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Notice Period</label>
                    <input
                      type="text"
                      placeholder="Enter notice period"
                      value={basicDraft.noticePeriod}
                      onChange={(e) =>
                        setBasicDraft({
                          ...basicDraft,
                          noticePeriod: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {renderModalFooter('Save Changes')}
              </form>
            )}

            {/* MODAL 2: RESUME HEADLINE */}
            {activeModal === 'headline' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({ ...profile, headline: headlineDraft });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Resume headline
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    It is the first thing recruiters notice in your profile.
                    Write a concise headline describing your expertise.
                  </p>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Headline *</label>
                  <textarea
                    rows={4}
                    required
                    value={headlineDraft}
                    onChange={(e) => setHeadlineDraft(e.target.value)}
                    placeholder="Write a brief headline summarizing your role and key skills"
                    className={`${INPUT_CLASS} leading-relaxed`}
                  />
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 3: KEY SKILLS */}
            {activeModal === 'skills' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({ ...profile, skills: skillsDraft });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Key skills
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Add skills that best define your expertise, software tools,
                    and domain specializations.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>Add a Skill</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter a skill and click Add"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newSkillInput.trim()) {
                              setSkillsDraft([
                                ...skillsDraft,
                                newSkillInput.trim(),
                              ]);
                              setNewSkillInput('');
                            }
                          }
                        }}
                        className={INPUT_CLASS}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSkillInput.trim()) {
                            setSkillsDraft([
                              ...skillsDraft,
                              newSkillInput.trim(),
                            ]);
                            setNewSkillInput('');
                          }
                        }}
                        className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-blue-400 cursor-pointer shrink-0 transition"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="min-h-[60px] p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap gap-2.5">
                    {skillsDraft.length > 0 ? (
                      skillsDraft.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center gap-2.5"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSkillsDraft(
                                skillsDraft.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-slate-400 hover:text-red-400 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No skills added yet. Type a skill above and click + Add.
                      </span>
                    )}
                  </div>
                </div>

                {renderModalFooter('Save Skills')}
              </form>
            )}

            {/* MODAL 4: EMPLOYMENT */}
            {activeModal === 'employment' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const entry = {
                    ...empDraft,
                    id: empDraft.id || String(Date.now()),
                  };
                  const exists = profile.employmentList.some(
                    (i) => i.id === entry.id
                  );
                  const nextList = exists
                    ? profile.employmentList.map((i) =>
                        i.id === entry.id ? entry : i
                      )
                    : [entry, ...profile.employmentList];

                  saveToDatabase({
                    ...profile,
                    designation: profile.designation || entry.designation,
                    company: profile.company || entry.company,
                    employmentList: nextList,
                  });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    {empDraft.id ? 'Edit Employment' : 'Add Employment'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Details like job title, company name, and key achievements
                    help recruiters understand your background.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>
                        Designation / Job Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter designation or job title"
                        value={empDraft.designation}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            designation: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Company Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter company name"
                        value={empDraft.company}
                        onChange={(e) =>
                          setEmpDraft({ ...empDraft, company: e.target.value })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Start Date</label>
                      <input
                        type="text"
                        placeholder="Enter start month and year"
                        value={empDraft.startDate}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            startDate: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>End Date</label>
                      <input
                        type="text"
                        placeholder="Enter end date or Present"
                        value={empDraft.endDate}
                        onChange={(e) =>
                          setEmpDraft({ ...empDraft, endDate: e.target.value })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Top 5 Key Skills Used</label>
                    <input
                      type="text"
                      placeholder="Enter key skills separated by commas"
                      value={empDraft.topSkills}
                      onChange={(e) =>
                        setEmpDraft({ ...empDraft, topSkills: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Job Profile / Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your responsibilities and key achievements"
                      value={empDraft.description}
                      onChange={(e) =>
                        setEmpDraft({
                          ...empDraft,
                          description: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} leading-relaxed`}
                    />
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 5: EDUCATION */}
            {activeModal === 'education' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const entry = {
                    ...eduDraft,
                    id: eduDraft.id || String(Date.now()),
                  };
                  const exists = profile.educationList.some(
                    (i) => i.id === entry.id
                  );
                  const nextList = exists
                    ? profile.educationList.map((i) =>
                        i.id === entry.id ? entry : i
                      )
                    : [...profile.educationList, entry];
                  saveToDatabase({ ...profile, educationList: nextList });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    {eduDraft.id ? 'Edit Education' : 'Add Education'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Add your academic qualifications, university, and course
                    details.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>
                      Degree / Specialization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter degree and specialization"
                      value={eduDraft.degree}
                      onChange={(e) =>
                        setEduDraft({ ...eduDraft, degree: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>
                      University / Institute *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter university or institute name"
                      value={eduDraft.institute}
                      onChange={(e) =>
                        setEduDraft({ ...eduDraft, institute: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>
                        Passing Year / Duration
                      </label>
                      <input
                        type="text"
                        placeholder="Enter passing year or duration"
                        value={eduDraft.yearRange}
                        onChange={(e) =>
                          setEduDraft({
                            ...eduDraft,
                            yearRange: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Course Type</label>
                      <select
                        value={eduDraft.courseType}
                        onChange={(e) =>
                          setEduDraft({
                            ...eduDraft,
                            courseType: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Distance">Distance</option>
                      </select>
                    </div>
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 6: IT SKILL */}
            {activeModal === 'itSkill' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const entry = {
                    ...itSkillDraft,
                    id: itSkillDraft.id || String(Date.now()),
                  };
                  const exists = profile.itSkills.some(
                    (i) => i.id === entry.id
                  );
                  const nextList = exists
                    ? profile.itSkills.map((i) =>
                        i.id === entry.id ? entry : i
                      )
                    : [...profile.itSkills, entry];
                  saveToDatabase({ ...profile, itSkills: nextList });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    {itSkillDraft.id ? 'Edit IT Skill' : 'Add IT Skill'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Specify technical tools, software versions, and hands-on
                    experience.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>
                      Skill / Software Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter skill or software name"
                      value={itSkillDraft.skill}
                      onChange={(e) =>
                        setItSkillDraft({
                          ...itSkillDraft,
                          skill: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>Version</label>
                      <input
                        type="text"
                        placeholder="Enter version"
                        value={itSkillDraft.version}
                        onChange={(e) =>
                          setItSkillDraft({
                            ...itSkillDraft,
                            version: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Last Used</label>
                      <input
                        type="text"
                        placeholder="Enter year last used"
                        value={itSkillDraft.lastUsed}
                        onChange={(e) =>
                          setItSkillDraft({
                            ...itSkillDraft,
                            lastUsed: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Experience</label>
                      <input
                        type="text"
                        placeholder="Enter experience duration"
                        value={itSkillDraft.experience}
                        onChange={(e) =>
                          setItSkillDraft({
                            ...itSkillDraft,
                            experience: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 7: PROJECT */}
            {activeModal === 'project' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const entry = {
                    ...projectDraft,
                    id: projectDraft.id || String(Date.now()),
                  };
                  const exists = profile.projects.some(
                    (i) => i.id === entry.id
                  );
                  const nextList = exists
                    ? profile.projects.map((i) =>
                        i.id === entry.id ? entry : i
                      )
                    : [...profile.projects, entry];
                  saveToDatabase({ ...profile, projects: nextList });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    {projectDraft.id ? 'Edit Project' : 'Add Project'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Showcase key projects, client engagements, and technical
                    deliverables.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter project title"
                      value={projectDraft.title}
                      onChange={(e) =>
                        setProjectDraft({
                          ...projectDraft,
                          title: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>
                        Client / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Enter client or organization"
                        value={projectDraft.client}
                        onChange={(e) =>
                          setProjectDraft({
                            ...projectDraft,
                            client: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Duration</label>
                      <input
                        type="text"
                        placeholder="Enter project duration"
                        value={projectDraft.duration}
                        onChange={(e) =>
                          setProjectDraft({
                            ...projectDraft,
                            duration: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Details of Project</label>
                    <textarea
                      rows={4}
                      placeholder="Outline your role, architecture, and impact"
                      value={projectDraft.details}
                      onChange={(e) =>
                        setProjectDraft({
                          ...projectDraft,
                          details: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} leading-relaxed`}
                    />
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 8: PROFILE SUMMARY */}
            {activeModal === 'summary' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({ ...profile, bio: summaryDraft });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Profile summary
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Highlight your career accomplishments, leadership
                    experience, and core strengths.
                  </p>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Summary *</label>
                  <textarea
                    rows={5}
                    required
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                    placeholder="Write a summary of your professional background and expertise"
                    className={`${INPUT_CLASS} leading-relaxed`}
                  />
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 9: ACCOMPLISHMENT */}
            {activeModal === 'accomplishment' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const entry = {
                    ...accompDraft,
                    id: accompDraft.id || String(Date.now()),
                  };
                  const currentList =
                    profile.accomplishments[accompCategory] || [];
                  const exists = currentList.some((i) => i.id === entry.id);
                  const nextList = exists
                    ? currentList.map((i) => (i.id === entry.id ? entry : i))
                    : [...currentList, entry];
                  saveToDatabase({
                    ...profile,
                    accomplishments: {
                      ...profile.accomplishments,
                      [accompCategory]: nextList,
                    },
                  });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Add / Edit Accomplishment
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Include certifications, online profiles, work samples,
                    publications, or patents.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>
                      Title / Certification / Profile Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter title or certification name"
                      value={accompDraft.title}
                      onChange={(e) =>
                        setAccompDraft({
                          ...accompDraft,
                          title: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>
                        Issuer / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Enter issuing organization"
                        value={accompDraft.subtitle}
                        onChange={(e) =>
                          setAccompDraft({
                            ...accompDraft,
                            subtitle: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Validity / Date</label>
                      <input
                        type="text"
                        placeholder="Enter validity period or date"
                        value={accompDraft.validity}
                        onChange={(e) =>
                          setAccompDraft({
                            ...accompDraft,
                            validity: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>
                      URL / Verification Link
                    </label>
                    <input
                      type="text"
                      placeholder="https://"
                      value={accompDraft.url}
                      onChange={(e) =>
                        setAccompDraft({ ...accompDraft, url: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 10: CAREER PROFILE */}
            {activeModal === 'career' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({ ...profile, careerProfile: careerDraft });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Edit Career Profile
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Specify your desired role, preferred locations, and
                    compensation expectations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={LABEL_CLASS}>Current Industry</label>
                    <input
                      type="text"
                      placeholder="Enter current industry"
                      value={careerDraft.currentIndustry}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          currentIndustry: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Department</label>
                    <input
                      type="text"
                      placeholder="Enter department"
                      value={careerDraft.department}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          department: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Role Category</label>
                    <input
                      type="text"
                      placeholder="Enter role category"
                      value={careerDraft.roleCategory}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          roleCategory: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Job Role</label>
                    <input
                      type="text"
                      placeholder="Enter job role"
                      value={careerDraft.jobRole}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          jobRole: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Preferred Job Roles</label>
                    <input
                      type="text"
                      placeholder="Enter preferred job roles"
                      value={careerDraft.preferredJobRole}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          preferredJobRole: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>
                      Preferred Work Locations
                    </label>
                    <input
                      type="text"
                      placeholder="Enter preferred cities"
                      value={careerDraft.preferredLocations}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          preferredLocations: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>
                      Preferred Annual Salary
                    </label>
                    <input
                      type="text"
                      placeholder="Enter expected salary"
                      value={careerDraft.preferredSalary}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          preferredSalary: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Preferred Shift</label>
                    <select
                      value={careerDraft.preferredShift}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          preferredShift: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 11: PERSONAL DETAILS */}
            {activeModal === 'personal' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({
                    ...profile,
                    personalDetails: personalDraft,
                  });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Edit Personal Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Update your personal and demographic information.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>Gender</label>
                      <input
                        type="text"
                        placeholder="Enter gender"
                        value={personalDraft.gender}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            gender: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Marital Status</label>
                      <input
                        type="text"
                        placeholder="Enter marital status"
                        value={personalDraft.maritalStatus}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            maritalStatus: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Date of Birth</label>
                      <input
                        type="text"
                        placeholder="DD MMM YYYY"
                        value={personalDraft.dateOfBirth}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Category</label>
                      <input
                        type="text"
                        placeholder="Enter category"
                        value={personalDraft.category}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            category: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Permanent Address</label>
                    <textarea
                      rows={3}
                      placeholder="Enter permanent address"
                      value={personalDraft.address}
                      onChange={(e) =>
                        setPersonalDraft({
                          ...personalDraft,
                          address: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} leading-relaxed`}
                    />
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 12: LANGUAGES */}
            {activeModal === 'language' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const entry = {
                    ...languageDraft,
                    id: String(Date.now()),
                  };
                  saveToDatabase({
                    ...profile,
                    languages: [...profile.languages, entry],
                  });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Add Language
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Add languages you know along with your reading, writing, and
                    speaking proficiency.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>Language *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter language"
                        value={languageDraft.language}
                        onChange={(e) =>
                          setLanguageDraft({
                            ...languageDraft,
                            language: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Proficiency</label>
                      <select
                        value={languageDraft.proficiency}
                        onChange={(e) =>
                          setLanguageDraft({
                            ...languageDraft,
                            proficiency: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Proficient">Proficient</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Skills</label>
                    <div className="flex items-center gap-8 pt-1 text-sm text-slate-200">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={languageDraft.read}
                          onChange={(e) =>
                            setLanguageDraft({
                              ...languageDraft,
                              read: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                        <span>Read</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={languageDraft.write}
                          onChange={(e) =>
                            setLanguageDraft({
                              ...languageDraft,
                              write: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                        <span>Write</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={languageDraft.speak}
                          onChange={(e) =>
                            setLanguageDraft({
                              ...languageDraft,
                              speak: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                        <span>Speak</span>
                      </label>
                    </div>
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}

            {/* MODAL 13: DIVERSITY & INCLUSION */}
            {activeModal === 'diversity' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({ ...profile, diversity: diversityDraft });
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Diversity &amp; Inclusion
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Share details to connect with inclusive employers.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>Disability Status</label>
                    <select
                      value={diversityDraft.disabilityStatus}
                      onChange={(e) =>
                        setDiversityDraft({
                          ...diversityDraft,
                          disabilityStatus: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Do not have disability">
                        Do not have disability
                      </option>
                      <option value="Have disability">Have disability</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Military Experience</label>
                    <select
                      value={diversityDraft.militaryExperience}
                      onChange={(e) =>
                        setDiversityDraft({
                          ...diversityDraft,
                          militaryExperience: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Never served">Never served</option>
                      <option value="Currently serving">
                        Currently serving
                      </option>
                      <option value="Veteran">Veteran</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Career Break</label>
                    <select
                      value={diversityDraft.careerBreak}
                      onChange={(e) =>
                        setDiversityDraft({
                          ...diversityDraft,
                          careerBreak: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Have not taken">Have not taken</option>
                      <option value="Have taken a career break">
                        Have taken a career break
                      </option>
                    </select>
                  </div>
                </div>

                {renderModalFooter()}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}