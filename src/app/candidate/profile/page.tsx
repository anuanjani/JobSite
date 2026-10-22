'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmploymentItem {
  id: string;
  isCurrentEmployment: 'Yes' | 'No';
  employmentType: 'Full-time' | 'Internship' | string;
  totalExpYears: string;
  totalExpMonths: string;
  company: string;
  designation: string;
  joiningYear: string;
  joiningMonth: string;
  workedTillYear?: string;
  workedTillMonth?: string;
  currency?: string;
  salary: string;
  skillsUsed: string;
  description: string;
  noticePeriod: string;
  startDate?: string;
  endDate?: string;
  topSkills?: string;
}

interface EducationItem {
  id: string;
  educationLevel?: string;
  institute: string;
  course?: string;
  specialization?: string;
  courseType: string;
  startYear?: string;
  endYear?: string;
  gradingSystem?: string;
  degree: string;
  yearRange: string;
}

interface ItSkillItem {
  id: string;
  skill: string;
  version: string;
  lastUsed: string;
  expYears?: string;
  expMonths?: string;
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
  url: string;
  description?: string;
  durationFromYear?: string;
  durationFromMonth?: string;
  durationToYear?: string;
  durationToMonth?: string;
  currentlyWorking?: boolean;
  publishedYear?: string;
  publishedMonth?: string;
  patentOffice?: string;
  patentStatus?: 'Patent issued' | 'Patent pending';
  applicationNumber?: string;
  issueYear?: string;
  issueMonth?: string;
  completionId?: string;
  validityFromMonth?: string;
  validityFromYear?: string;
  validityToMonth?: string;
  validityToYear?: string;
  doesNotExpire?: boolean;
  subtitle?: string;
  validity?: string;
}

interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

interface CareerProfileData {
  currentIndustry: string;
  department: string;
  roleCategory: string;
  jobRole: string;
  desiredJobTypes?: string[];
  desiredEmploymentTypes?: string[];
  desiredJobType: string;
  desiredEmploymentType: string;
  preferredJobRole: string;
  preferredLocations: string;
  preferredSalaryCurrency?: string;
  preferredSalary: string;
  preferredShift: string;
}

interface PersonalDetailsData {
  gender: string;
  moreInfo?: string[];
  maritalStatus: string;
  dobDay?: string;
  dobMonth?: string;
  dobYear?: string;
  dateOfBirth: string;
  category: string;
  workPermitUsa?: string;
  workPermitCountries?: string[];
  workPermit: string;
  address: string;
  hometown?: string;
  pincode: string;
}

const INPUT_CLASS =
  'w-full bg-slate-950/90 border border-slate-700/90 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

const LABEL_CLASS = 'block text-xs font-bold text-slate-200 mb-2';

const MONTHS_LIST = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_LIST = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);
const YEARS_LIST = Array.from({ length: 45 }, (_, i) => String(2026 - i));
const DOB_YEARS_LIST = Array.from({ length: 65 }, (_, i) => String(2008 - i));
const EDU_YEARS_LIST = Array.from({ length: 50 }, (_, i) => String(2030 - i));
const CERT_YEARS_LIST = Array.from({ length: 55 }, (_, i) => String(2035 - i));

const EDUCATION_LEVELS = [
  'Doctorate/PhD',
  'Masters/Post-Graduation',
  'Graduation/Diploma',
  '12th',
  '10th',
];

const COURSE_OPTIONS = [
  'B.Tech/B.E.',
  'BCA',
  'B.Sc',
  'B.Com',
  'B.A',
  'BBA/BMS',
  'M.Tech',
  'MCA',
  'MBA/PGDM',
  'M.Sc',
  'M.Com',
  'M.A',
  'Ph.D/Doctorate',
  'Diploma',
  'Class XII',
  'Class X',
  'Other',
];

const SPECIALIZATION_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics and Telecommunication',
  'Electrical',
  'Mechanical',
  'Civil',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Finance',
  'Marketing',
  'Human Resources',
  'Operations',
  'Science',
  'Commerce',
  'Arts',
  'Other',
];

const GRADING_SYSTEM_OPTIONS = [
  'Scale 10 Grading System',
  'Scale 4 Grading System',
  '% Marks of 100 Maximum',
  'Course Requires a Pass',
];

const INDUSTRY_OPTIONS = [
  'Software Product',
  'IT Services & Consulting',
  'Banking / Financial Services',
  'FinTech / Payments',
  'E-Commerce / Internet',
  'Telecom / ISP',
  'Healthcare & Life Sciences',
  'Education / EdTech',
  'Automobile / Manufacturing',
  'Other',
];

const DEPARTMENT_OPTIONS = [
  'Engineering - Software & QA',
  'Data Science & Analytics',
  'Product Management',
  'IT & Information Security',
  'Project & Program Management',
  'UX, Design & Architecture',
  'Customer Success, Service & Operations',
  'Sales & Business Development',
  'Human Resources',
  'Finance & Accounting',
  'Other',
];

const ROLE_CATEGORY_OPTIONS = [
  'Quality Assurance and Testing',
  'Software Development',
  'DevOps / Cloud Engineering',
  'DBA / Data Warehousing',
  'Business Intelligence & Analytics',
  'Engineering Management',
  'IT Support',
  'Other',
];

const JOB_ROLE_OPTIONS = [
  'QA Team Manager',
  'Test Lead',
  'Automation Test Engineer',
  'Quality Assurance / Quality Control Executive',
  'Software Developer / Engineer',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'DevOps Engineer',
  'Engineering Manager',
  'Project Manager - IT / Software',
  'Product Manager',
  'Other',
];

const COUNTRIES_LIST = [
  'India',
  'United States (USA)',
  'United Kingdom (UK)',
  'Singapore',
  'United Arab Emirates (UAE)',
  'Canada',
  'Australia',
  'Germany',
  'Saudi Arabia',
  'Japan',
  'Netherlands',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Odia',
  'Urdu',
  'French',
  'German',
  'Spanish',
  'Japanese',
];

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

  // Core Profile State
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
      desiredJobTypes: ['Permanent'],
      desiredEmploymentTypes: ['Full time'],
      desiredJobType: 'Permanent',
      desiredEmploymentType: 'Full Time',
      preferredJobRole: '',
      preferredLocations: '',
      preferredSalaryCurrency: '₹',
      preferredSalary: '0',
      preferredShift: 'Day',
    } as CareerProfileData,
    personalDetails: {
      gender: '',
      moreInfo: [],
      maritalStatus: '',
      dobDay: '',
      dobMonth: '',
      dobYear: '',
      dateOfBirth: '',
      category: '',
      workPermitUsa: '',
      workPermitCountries: ['India'],
      workPermit: 'India',
      address: '',
      hometown: '',
      pincode: '',
    } as PersonalDetailsData,
    languages: [] as LanguageItem[],
    diversity: {
      disabilityStatus: 'Do not have disability',
      militaryExperience: 'Never served',
      careerBreak: 'Have not taken',
    },
  });

  // Active Modal State
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
    | 'diversity'
  >(null);

  // Modal Drafts
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

  const createEmptyEmpDraft = (): EmploymentItem => ({
    id: '',
    isCurrentEmployment: 'Yes',
    employmentType: 'Full-time',
    totalExpYears: '',
    totalExpMonths: '',
    company: '',
    designation: '',
    joiningYear: '',
    joiningMonth: '',
    workedTillYear: '',
    workedTillMonth: '',
    currency: '₹',
    salary: '',
    skillsUsed: '',
    description: '',
    noticePeriod: '',
  });

  const [empDraft, setEmpDraft] = useState<EmploymentItem>(
    createEmptyEmpDraft()
  );
  const [empError, setEmpError] = useState('');

  const createEmptyEduDraft = (level = ''): EducationItem => ({
    id: '',
    educationLevel: level,
    institute: '',
    course: '',
    specialization: '',
    courseType: 'Full time',
    startYear: '',
    endYear: '',
    gradingSystem: '',
    degree: '',
    yearRange: '',
  });

  const [eduDraft, setEduDraft] = useState<EducationItem>(
    createEmptyEduDraft()
  );
  const [eduError, setEduError] = useState('');

  const createEmptyItSkillDraft = (): ItSkillItem => ({
    id: '',
    skill: '',
    version: '',
    lastUsed: '',
    expYears: '0 Year',
    expMonths: '0 Month',
    experience: '0 Year 0 Month',
  });

  const [itSkillDraft, setItSkillDraft] = useState<ItSkillItem>(
    createEmptyItSkillDraft()
  );
  const [itSkillError, setItSkillError] = useState('');

  const [projectDraft, setProjectDraft] = useState<ProjectItem>({
    id: '',
    title: '',
    client: '',
    status: 'Finished',
    duration: '',
    details: '',
  });

  // Accomplishment Category & Draft States
  const [accompCategory, setAccompCategory] = useState<
    | 'onlineProfiles'
    | 'workSamples'
    | 'publications'
    | 'presentations'
    | 'patents'
    | 'certifications'
  >('onlineProfiles');

  const createEmptyAccompDraft = (): AccomplishmentEntry => ({
    id: '',
    title: '',
    url: '',
    description: '',
    durationFromYear: '',
    durationFromMonth: '',
    durationToYear: '',
    durationToMonth: '',
    currentlyWorking: false,
    publishedYear: '',
    publishedMonth: '',
    patentOffice: '',
    patentStatus: 'Patent issued',
    applicationNumber: '',
    issueYear: '',
    issueMonth: '',
    completionId: '',
    validityFromMonth: '',
    validityFromYear: '',
    validityToMonth: '',
    validityToYear: '',
    doesNotExpire: false,
    subtitle: '',
    validity: '',
  });

  const [accompDraft, setAccompDraft] = useState<AccomplishmentEntry>(
    createEmptyAccompDraft()
  );
  const [accompError, setAccompError] = useState('');

  // Career Profile Draft State
  const [careerDraft, setCareerDraft] = useState<CareerProfileData>(
    profile.careerProfile
  );
  const [careerError, setCareerError] = useState('');

  // Personal Details + Language Proficiency Draft States
  const [personalDraft, setPersonalDraft] = useState<PersonalDetailsData>(
    profile.personalDetails
  );
  const [languagesDraft, setLanguagesDraft] = useState<LanguageItem[]>([]);

  // Diversity & Inclusion Draft State
  const [diversityDraft, setDiversityDraft] = useState(profile.diversity);

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
                onlineProfiles: data.accomplishments?.onlineProfiles || [],
                workSamples: data.accomplishments?.workSamples || [],
                publications: data.accomplishments?.publications || [],
                presentations: data.accomplishments?.presentations || [],
                patents: data.accomplishments?.patents || [],
                certifications: data.accomplishments?.certifications || [],
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

  // Employment Modal Openers
  const openAddEmploymentModal = () => {
    setEmpError('');
    setEmpDraft(createEmptyEmpDraft());
    setActiveModal('employment');
  };

  const openEditEmploymentModal = (emp: EmploymentItem) => {
    setEmpError('');
    setEmpDraft({
      id: emp.id,
      isCurrentEmployment: emp.isCurrentEmployment || 'Yes',
      employmentType: emp.employmentType || 'Full-time',
      totalExpYears: emp.totalExpYears || '',
      totalExpMonths: emp.totalExpMonths || '',
      company: emp.company || '',
      designation: emp.designation || '',
      joiningYear: emp.joiningYear || '',
      joiningMonth: emp.joiningMonth || '',
      workedTillYear: emp.workedTillYear || '',
      workedTillMonth: emp.workedTillMonth || '',
      currency: emp.currency || '₹',
      salary: emp.salary || '',
      skillsUsed: emp.skillsUsed || emp.topSkills || '',
      description: emp.description || '',
      noticePeriod: emp.noticePeriod || '',
    });
    setActiveModal('employment');
  };

  const handleWriteWithAi = () => {
    const role = empDraft.designation.trim() || 'Professional';
    const org = empDraft.company.trim() || 'the organization';
    const skills = empDraft.skillsUsed.trim();
    const generated = `Working as ${role} at ${org}. Responsible for end-to-end delivery, cross-functional collaboration, and driving measurable quality and performance improvements${
      skills ? ` utilizing ${skills}` : ''
    }.`;
    setEmpDraft((prev) => ({
      ...prev,
      description: generated.slice(0, 4000),
    }));
  };

  const handleSaveEmployment = (e: React.FormEvent) => {
    e.preventDefault();
    setEmpError('');

    if (
      empDraft.totalExpYears === '' ||
      empDraft.totalExpMonths === '' ||
      !empDraft.company.trim() ||
      !empDraft.designation.trim() ||
      !empDraft.joiningYear ||
      !empDraft.joiningMonth ||
      (empDraft.isCurrentEmployment === 'Yes' &&
        (!empDraft.salary.trim() ||
          !empDraft.skillsUsed.trim() ||
          !empDraft.noticePeriod))
    ) {
      setEmpError('Please fill in all mandatory (*) employment fields.');
      return;
    }

    const startDateStr = `${empDraft.joiningMonth} ${empDraft.joiningYear}`;
    const endDateStr =
      empDraft.isCurrentEmployment === 'Yes'
        ? 'Present'
        : empDraft.workedTillMonth && empDraft.workedTillYear
        ? `${empDraft.workedTillMonth} ${empDraft.workedTillYear}`
        : 'Past';

    const entry: EmploymentItem = {
      ...empDraft,
      id: empDraft.id || String(Date.now()),
      startDate: startDateStr,
      endDate: endDateStr,
      topSkills: empDraft.skillsUsed,
    };

    const exists = profile.employmentList.some((i) => i.id === entry.id);
    const nextList = exists
      ? profile.employmentList.map((i) => (i.id === entry.id ? entry : i))
      : [entry, ...profile.employmentList];

    const isCurrent = entry.isCurrentEmployment === 'Yes';
    const formattedExp = `${entry.totalExpYears} ${
      Number(entry.totalExpYears) === 1 ? 'Year' : 'Years'
    }${
      Number(entry.totalExpMonths) > 0
        ? ` ${entry.totalExpMonths} ${
            Number(entry.totalExpMonths) === 1 ? 'Month' : 'Months'
          }`
        : ''
    }`;

    saveToDatabase(
      {
        ...profile,
        designation: isCurrent
          ? entry.designation
          : profile.designation || entry.designation,
        company: isCurrent ? entry.company : profile.company || entry.company,
        experience: isCurrent
          ? formattedExp
          : profile.experience || formattedExp,
        salary:
          isCurrent && entry.salary
            ? `${entry.currency || '₹'} ${entry.salary}`
            : profile.salary,
        noticePeriod:
          isCurrent && entry.noticePeriod
            ? entry.noticePeriod
            : profile.noticePeriod,
        employmentList: nextList,
      },
      {},
      exists ? 'Employment updated!' : 'Employment added!'
    );
  };

  // Education Modal Openers & Save Handler
  const openAddEducationModal = (presetLevel = '') => {
    setEduError('');
    setEduDraft(createEmptyEduDraft(presetLevel));
    setActiveModal('education');
  };

  const openEditEducationModal = (edu: EducationItem) => {
    setEduError('');
    const [parsedStart = '', parsedEnd = ''] = (edu.yearRange || '').split('-');
    setEduDraft({
      id: edu.id,
      educationLevel: edu.educationLevel || 'Graduation/Diploma',
      institute: edu.institute || '',
      course: edu.course || edu.degree || '',
      specialization: edu.specialization || '',
      courseType: edu.courseType || 'Full time',
      startYear: edu.startYear || parsedStart.trim(),
      endYear: edu.endYear || parsedEnd.trim(),
      gradingSystem: edu.gradingSystem || '',
      degree: edu.degree || '',
      yearRange: edu.yearRange || '',
    });
    setActiveModal('education');
  };

  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    setEduError('');

    if (
      !eduDraft.educationLevel ||
      !eduDraft.institute.trim() ||
      !eduDraft.course ||
      !eduDraft.specialization ||
      !eduDraft.courseType ||
      !eduDraft.startYear ||
      !eduDraft.endYear
    ) {
      setEduError('Please fill in all mandatory (*) education fields.');
      return;
    }

    const computedDegree = `${eduDraft.course}${
      eduDraft.specialization ? ` ${eduDraft.specialization}` : ''
    }`;
    const computedYears = `${eduDraft.startYear}-${eduDraft.endYear}`;

    const entry: EducationItem = {
      ...eduDraft,
      id: eduDraft.id || String(Date.now()),
      degree: computedDegree,
      yearRange: computedYears,
    };

    const exists = profile.educationList.some((i) => i.id === entry.id);
    const nextList = exists
      ? profile.educationList.map((i) => (i.id === entry.id ? entry : i))
      : [...profile.educationList, entry];

    saveToDatabase(
      { ...profile, educationList: nextList },
      {},
      exists ? 'Education updated!' : 'Education added!'
    );
  };

  // IT Skills Modal Openers & Save Handler
  const openAddItSkillModal = () => {
    setItSkillError('');
    setItSkillDraft(createEmptyItSkillDraft());
    setActiveModal('itSkill');
  };

  const openEditItSkillModal = (item: ItSkillItem) => {
    setItSkillError('');
    let parsedYears = item.expYears || '0 Year';
    let parsedMonths = item.expMonths || '0 Month';

    if (!item.expYears && item.experience) {
      const yrMatch = item.experience.match(/(\d+\s*Years?)/i);
      const moMatch = item.experience.match(/(\d+\s*Months?)/i);
      if (yrMatch) parsedYears = yrMatch[1];
      if (moMatch) parsedMonths = moMatch[1];
    }

    setItSkillDraft({
      id: item.id,
      skill: item.skill || '',
      version: item.version === '-' ? '' : item.version || '',
      lastUsed: item.lastUsed === '-' ? '' : item.lastUsed || '',
      expYears: parsedYears,
      expMonths: parsedMonths,
      experience: item.experience || `${parsedYears} ${parsedMonths}`,
    });
    setActiveModal('itSkill');
  };

  const handleSaveItSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setItSkillError('');

    if (!itSkillDraft.skill.trim()) {
      setItSkillError('Please enter a Skill / software name.');
      return;
    }

    const yrs = itSkillDraft.expYears || '0 Year';
    const mos = itSkillDraft.expMonths || '0 Month';
    const combinedExp = `${yrs} ${mos}`;

    const entry: ItSkillItem = {
      id: itSkillDraft.id || String(Date.now()),
      skill: itSkillDraft.skill.trim(),
      version: itSkillDraft.version.trim() || '-',
      lastUsed: itSkillDraft.lastUsed || '-',
      expYears: yrs,
      expMonths: mos,
      experience: combinedExp,
    };

    const exists = profile.itSkills.some((i) => i.id === entry.id);
    const nextList = exists
      ? profile.itSkills.map((i) => (i.id === entry.id ? entry : i))
      : [...profile.itSkills, entry];

    saveToDatabase(
      { ...profile, itSkills: nextList },
      {},
      exists ? 'IT skill updated!' : 'IT skill added!'
    );
  };

  const handleDeleteCurrentItSkill = () => {
    if (!itSkillDraft.id) return;
    const filtered = profile.itSkills.filter((s) => s.id !== itSkillDraft.id);
    saveToDatabase({ ...profile, itSkills: filtered }, {}, 'IT skill deleted');
  };

  // Accomplishment Modal Openers & Save Handler
  const openAddAccomplishmentModal = (
    category:
      | 'onlineProfiles'
      | 'workSamples'
      | 'publications'
      | 'presentations'
      | 'patents'
      | 'certifications'
  ) => {
    setAccompError('');
    setAccompCategory(category);
    setAccompDraft(createEmptyAccompDraft());
    setActiveModal('accomplishment');
  };

  const openEditAccomplishmentModal = (
    category:
      | 'onlineProfiles'
      | 'workSamples'
      | 'publications'
      | 'presentations'
      | 'patents'
      | 'certifications',
    entry: AccomplishmentEntry
  ) => {
    setAccompError('');
    setAccompCategory(category);
    setAccompDraft({
      ...createEmptyAccompDraft(),
      ...entry,
      description: entry.description || entry.subtitle || '',
    });
    setActiveModal('accomplishment');
  };

  const handleSaveAccomplishment = (e: React.FormEvent) => {
    e.preventDefault();
    setAccompError('');

    const titleVal = accompDraft.title.trim();
    const urlVal = accompDraft.url.trim();

    if (accompCategory === 'onlineProfiles') {
      if (!titleVal || !urlVal) {
        setAccompError('Social profile and URL are mandatory.');
        return;
      }
    } else if (accompCategory === 'workSamples') {
      if (!titleVal || !urlVal) {
        setAccompError('Work title and URL are mandatory.');
        return;
      }
    } else if (accompCategory === 'publications') {
      if (!titleVal || !urlVal) {
        setAccompError('Title and URL are mandatory.');
        return;
      }
    } else if (accompCategory === 'presentations') {
      if (!titleVal || !urlVal) {
        setAccompError('Presentation title and URL are mandatory.');
        return;
      }
    } else if (accompCategory === 'patents') {
      if (!titleVal || !urlVal) {
        setAccompError('Patent title and URL are mandatory.');
        return;
      }
    } else if (accompCategory === 'certifications') {
      if (!titleVal) {
        setAccompError('Certification name is mandatory.');
        return;
      }
    }

    let computedValidity = '';
    let computedSubtitle = accompDraft.description?.trim() || '';

    if (accompCategory === 'workSamples') {
      const fromPart = [
        accompDraft.durationFromMonth,
        accompDraft.durationFromYear,
      ]
        .filter(Boolean)
        .join(' ');
      const toPart = accompDraft.currentlyWorking
        ? 'Present'
        : [accompDraft.durationToMonth, accompDraft.durationToYear]
            .filter(Boolean)
            .join(' ');
      if (fromPart || toPart) {
        computedValidity = `Duration: ${fromPart || '—'} to ${toPart || '—'}`;
      }
    } else if (accompCategory === 'publications') {
      const pubPart = [accompDraft.publishedMonth, accompDraft.publishedYear]
        .filter(Boolean)
        .join(' ');
      if (pubPart) {
        computedValidity = `Published on: ${pubPart}`;
      }
    } else if (accompCategory === 'patents') {
      const metaParts = [
        accompDraft.patentOffice
          ? `Office: ${accompDraft.patentOffice}`
          : '',
        accompDraft.applicationNumber
          ? `App No: ${accompDraft.applicationNumber}`
          : '',
        accompDraft.patentStatus || '',
      ].filter(Boolean);
      const issuePart = [accompDraft.issueMonth, accompDraft.issueYear]
        .filter(Boolean)
        .join(' ');
      if (issuePart) metaParts.push(`Issued: ${issuePart}`);
      computedValidity = metaParts.join(' | ');
    } else if (accompCategory === 'certifications') {
      if (accompDraft.completionId?.trim()) {
        computedSubtitle = `Completion ID: ${accompDraft.completionId.trim()}`;
      }
      const fromStr = [
        accompDraft.validityFromMonth,
        accompDraft.validityFromYear,
      ]
        .filter(Boolean)
        .join(' ');
      const toStr = [accompDraft.validityToMonth, accompDraft.validityToYear]
        .filter(Boolean)
        .join(' ');
      if (accompDraft.doesNotExpire) {
        computedValidity = fromStr
          ? `Valid from ${fromStr}. Does not expire.`
          : 'Does not expire.';
      } else if (fromStr || toStr) {
        computedValidity = `Validity: ${fromStr || '—'} to ${toStr || '—'}`;
      }
    }

    const entry: AccomplishmentEntry = {
      ...accompDraft,
      id: accompDraft.id || String(Date.now()),
      title: titleVal,
      url: urlVal,
      subtitle: computedSubtitle,
      validity: computedValidity,
    };

    const currentList = profile.accomplishments[accompCategory] || [];
    const exists = currentList.some((i) => i.id === entry.id);
    const nextList = exists
      ? currentList.map((i) => (i.id === entry.id ? entry : i))
      : [...currentList, entry];

    saveToDatabase(
      {
        ...profile,
        accomplishments: {
          ...profile.accomplishments,
          [accompCategory]: nextList,
        },
      },
      {},
      exists ? 'Accomplishment updated!' : 'Accomplishment added!'
    );
  };

  // Career Profile Modal Opener & Save Handler
  const openCareerModal = () => {
    setCareerError('');
    const cp = profile.careerProfile;
    const jobTypes = Array.isArray(cp.desiredJobTypes)
      ? cp.desiredJobTypes
      : cp.desiredJobType
      ? cp.desiredJobType.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Permanent'];
    const empTypes = Array.isArray(cp.desiredEmploymentTypes)
      ? cp.desiredEmploymentTypes
      : cp.desiredEmploymentType
      ? cp.desiredEmploymentType.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Full time'];

    const rawSalary = String(cp.preferredSalary || '0').replace(/^[₹$]\s*/, '');

    setCareerDraft({
      currentIndustry: cp.currentIndustry || '',
      department: cp.department || '',
      roleCategory: cp.roleCategory || '',
      jobRole: cp.jobRole || '',
      desiredJobTypes: jobTypes,
      desiredEmploymentTypes: empTypes,
      desiredJobType: jobTypes.join(', '),
      desiredEmploymentType: empTypes.join(', '),
      preferredJobRole: cp.preferredJobRole || '',
      preferredLocations: cp.preferredLocations || '',
      preferredSalaryCurrency: cp.preferredSalaryCurrency || '₹',
      preferredSalary: rawSalary,
      preferredShift: cp.preferredShift || 'Day',
    });
    setActiveModal('career');
  };

  const handleSaveCareerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCareerError('');

    if (
      !careerDraft.currentIndustry ||
      !careerDraft.department ||
      !careerDraft.roleCategory ||
      !careerDraft.jobRole
    ) {
      setCareerError(
        'Current industry, Department, Role category, and Job role are mandatory.'
      );
      return;
    }

    const curr = careerDraft.preferredSalaryCurrency || '₹';
    const rawSal = careerDraft.preferredSalary.trim() || '0';
    const formattedSalary =
      rawSal.startsWith('₹') || rawSal.startsWith('$')
        ? rawSal
        : `${curr}${rawSal}`;

    const updatedCareer: CareerProfileData = {
      ...careerDraft,
      desiredJobType: (careerDraft.desiredJobTypes || []).join(', ') || 'Permanent',
      desiredEmploymentType:
        (careerDraft.desiredEmploymentTypes || []).join(', ') || 'Full time',
      preferredSalary: formattedSalary,
    };

    saveToDatabase(
      { ...profile, careerProfile: updatedCareer },
      {},
      'Career profile updated!'
    );
  };

  // Personal Details + Language Proficiency Modal Opener & Save Handler
  const openPersonalModal = (addBlankLanguageRow = false) => {
    const pd = profile.personalDetails;
    let dDay = pd.dobDay || '';
    let dMonth = pd.dobMonth || '';
    let dYear = pd.dobYear || '';

    if ((!dDay || !dMonth || !dYear) && pd.dateOfBirth) {
      const parts = pd.dateOfBirth.trim().split(/\s+/);
      if (parts.length === 3) {
        dDay = parts[0];
        dMonth = parts[1];
        dYear = parts[2];
      }
    }

    const countries = Array.isArray(pd.workPermitCountries)
      ? pd.workPermitCountries
      : pd.workPermit
      ? pd.workPermit.split(',').map((s) => s.trim()).filter(Boolean)
      : ['India'];

    setPersonalDraft({
      gender: pd.gender || '',
      moreInfo: Array.isArray(pd.moreInfo) ? pd.moreInfo : [],
      maritalStatus: pd.maritalStatus || '',
      dobDay: dDay,
      dobMonth: dMonth,
      dobYear: dYear,
      dateOfBirth: pd.dateOfBirth || '',
      category: pd.category || '',
      workPermitUsa: pd.workPermitUsa || '',
      workPermitCountries: countries,
      workPermit: countries.join(', ') || 'India',
      address: pd.address || '',
      hometown: pd.hometown || '',
      pincode: pd.pincode || '',
    });

    const existingLangs =
      profile.languages.length > 0
        ? profile.languages.map((l) => ({ ...l }))
        : [
            {
              id: String(Date.now()),
              language: '',
              proficiency: '',
              read: false,
              write: false,
              speak: false,
            },
          ];

    if (addBlankLanguageRow && profile.languages.length > 0) {
      existingLangs.push({
        id: String(Date.now() + 1),
        language: '',
        proficiency: '',
        read: false,
        write: false,
        speak: false,
      });
    }

    setLanguagesDraft(existingLangs);
    setActiveModal('personal');
  };

  const handleSavePersonalDetails = (e: React.FormEvent) => {
    e.preventDefault();

    const dobFormatted =
      personalDraft.dobDay && personalDraft.dobMonth && personalDraft.dobYear
        ? `${personalDraft.dobDay} ${personalDraft.dobMonth} ${personalDraft.dobYear}`
        : personalDraft.dateOfBirth || '';

    const workPermitStr = [
      ...(personalDraft.workPermitCountries || []),
      personalDraft.workPermitUsa ? `USA (${personalDraft.workPermitUsa})` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const fullAddress = [
      personalDraft.address?.trim(),
      personalDraft.hometown?.trim(),
      personalDraft.pincode?.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    const validLanguages = languagesDraft
      .filter((l) => l.language.trim() !== '')
      .map((l) => ({
        ...l,
        proficiency: l.proficiency || 'Expert',
      }));

    saveToDatabase(
      {
        ...profile,
        personalDetails: {
          ...personalDraft,
          dateOfBirth: dobFormatted,
          workPermit: workPermitStr || 'India',
          address: personalDraft.address?.trim() || fullAddress,
        },
        languages: validLanguages,
      },
      {},
      'Personal details updated!'
    );
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
      onAction: openAddEmploymentModal,
    },
    {
      id: 'education',
      label: 'Education',
      actionLabel: 'Add',
      onAction: () => openAddEducationModal(),
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

  // Single Save button in footer (top-right ✕ closes popup when hovered)
  const renderModalFooter = (saveLabel = 'Save') => (
    <div className="pt-6 mt-8 border-t border-slate-800/90 flex items-center justify-end">
      <button
        type="submit"
        disabled={saving}
        className="relative overflow-hidden px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 text-xs font-extrabold text-white transition shadow-lg shadow-blue-600/25 cursor-pointer"
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

  // Reusable Pill Option Button
  const pillButtonClass = (selected: boolean) =>
    `px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
      selected
        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
        : 'bg-slate-950/80 border-slate-700/90 text-slate-300 hover:border-slate-500 hover:text-white'
    }`;

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
        {/* TOP CANDIDATE HEADER CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
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
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">✉️</span>
                    <span className="truncate">{profile.email}</span>
                    {profile.email && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
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

        {/* MAIN 2-COLUMN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

          <div className="lg:col-span-9 space-y-6">
            {/* PRO BANNER */}
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

            {/* 1. RESUME */}
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
                      Uploaded on {formatLocalTimestamp(profile.resumeUpdatedAt)}
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

            {/* 2. RESUME HEADLINE */}
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
                >
                  ✎
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {profile.headline ||
                  'Add a concise headline summarizing your role, years of experience, and core domain expertise.'}
              </p>
            </section>

            {/* 3. KEY SKILLS */}
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
                  onClick={openAddEmploymentModal}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Add employment
                </button>
              </div>

              {profile.employmentList.length > 0 ? (
                <div className="space-y-6 divide-y divide-slate-800">
                  {profile.employmentList.map((emp) => {
                    const startLabel =
                      emp.joiningMonth && emp.joiningYear
                        ? `${emp.joiningMonth} ${emp.joiningYear}`
                        : emp.startDate || '';
                    const endLabel =
                      emp.isCurrentEmployment === 'Yes'
                        ? 'Present'
                        : emp.workedTillMonth && emp.workedTillYear
                        ? `${emp.workedTillMonth} ${emp.workedTillYear}`
                        : emp.endDate || 'Present';
                    const durationLabel =
                      emp.totalExpYears !== undefined &&
                      emp.totalExpYears !== ''
                        ? `(${emp.totalExpYears} ${
                            Number(emp.totalExpYears) === 1 ? 'year' : 'years'
                          }${
                            emp.totalExpMonths && Number(emp.totalExpMonths) > 0
                              ? ` ${emp.totalExpMonths} ${
                                  Number(emp.totalExpMonths) === 1
                                    ? 'month'
                                    : 'months'
                                }`
                              : ''
                          })`
                        : '';
                    const skillsDisplay = emp.skillsUsed || emp.topSkills || '';

                    return (
                      <div key={emp.id} className="pt-5 first:pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white">
                              {emp.designation}
                            </h4>
                            <button
                              type="button"
                              onClick={() => openEditEmploymentModal(emp)}
                              className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                              title="Edit Employment"
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
                          {emp.employmentType || 'Full-time'}
                          {startLabel ? ` | ${startLabel} to ${endLabel}` : ''}
                          {durationLabel ? ` ${durationLabel}` : ''}
                        </p>
                        {emp.noticePeriod && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {emp.noticePeriod}
                          </p>
                        )}
                        {emp.description && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                            {emp.description}
                          </p>
                        )}
                        {skillsDisplay && (
                          <p className="text-xs text-slate-300 mt-2">
                            <strong className="text-white">
                              Top key skills:
                            </strong>{' '}
                            {skillsDisplay}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
                  onClick={() => openAddEducationModal()}
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
                            {edu.degree ||
                              `${edu.course || ''} ${edu.specialization || ''}`}
                          </h4>
                          <button
                            type="button"
                            onClick={() => openEditEducationModal(edu)}
                            className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                            title="Edit Education"
                          >
                            ✎
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 mt-0.5">
                          {edu.institute}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {edu.yearRange ||
                            (edu.startYear && edu.endYear
                              ? `${edu.startYear}-${edu.endYear}`
                              : '')}
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
                  onClick={() => openAddEducationModal('Doctorate/PhD')}
                  className="text-xs font-extrabold text-blue-400 hover:underline cursor-pointer"
                >
                  Add doctorate/PhD
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openAddEducationModal('Masters/Post-Graduation')
                  }
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
                  onClick={openAddItSkillModal}
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
                            {item.experience || '0 Year 0 Month'}
                          </td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditItSkillModal(item)}
                              className="text-slate-400 hover:text-blue-400 cursor-pointer"
                              title="Edit IT Skill"
                            >
                              ✎
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

            {/* 7. PROJECTS */}
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

            {/* 8. PROFILE SUMMARY */}
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
                      desc: 'Add link to online professional profiles (e.g. LinkedIn, etc.)',
                    },
                    {
                      key: 'workSamples',
                      title: 'Work sample',
                      desc: 'Link relevant work samples (e.g. Github, Behance)',
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
                      desc: 'Add links to your online presentations (e.g. Slide-share presentation links etc.)',
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
                          onClick={() => openAddAccomplishmentModal(sec.key)}
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
                                {entry.title?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-extrabold text-white">
                                      {entry.title}
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditAccomplishmentModal(
                                          sec.key,
                                          entry
                                        )
                                      }
                                      className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                                      title="Edit"
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
                                {(entry.description || entry.subtitle) && (
                                  <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                                    {entry.description || entry.subtitle}
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

            {/* 10. CAREER PROFILE */}
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
                  onClick={openCareerModal}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                  title="Edit Career Profile"
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
                    {profile.careerProfile.preferredSalary || '₹0'}
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

            {/* 11. PERSONAL DETAILS & LANGUAGES */}
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
                  onClick={() => openPersonalModal(false)}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm"
                  title="Edit Personal Details"
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
                      ...(profile.personalDetails.moreInfo || []),
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
                    {[
                      profile.personalDetails.address,
                      profile.personalDetails.hometown,
                      profile.personalDetails.pincode,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Add permanent address'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Category</span>
                  <span className="font-extrabold text-white">
                    {profile.personalDetails.category || 'Add category'}
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-extrabold text-white">
                    Languages
                  </h4>
                  <button
                    type="button"
                    onClick={() => openPersonalModal(true)}
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

            {/* 12. DIVERSITY & INCLUSION */}
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
                  title="Edit Diversity & Inclusion"
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
          ANIMATED POPUP MODALS (Top-Right ✕ Visible Only When Mouse Is Inside Card)
         ===================================================================== */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          style={{ animation: 'backdropFadeIn 0.2s ease-out forwards' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="group bg-slate-900 border border-slate-700/80 rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] relative"
            style={{
              animation:
                'modalPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top-Right Close Button (✕) — Hidden until cursor enters the modal card */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-7 right-7 w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-all duration-200 z-50"
            >
              ✕
            </button>

            {/* MODAL 1: BASIC DETAILS */}
            {activeModal === 'basic' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase({ ...profile, ...basicDraft });
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
                    Add skills that best define your expertise.
                  </p>
                </div>
                <div className="space-y-6">
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
                      className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-blue-400 cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
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
                        No skills added yet.
                      </span>
                    )}
                  </div>
                </div>
                {renderModalFooter('Save Skills')}
              </form>
            )}

            {/* MODAL 4: EMPLOYMENT FORM */}
            {activeModal === 'employment' && (
              <form noValidate onSubmit={handleSaveEmployment}>
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Employment
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Details like job title, company name, etc, help employers
                    understand your work
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>
                      Is this your current employment?
                    </label>
                    <div className="flex items-center gap-12 pt-1 text-xs font-bold text-slate-200">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isCurrentEmployment"
                          checked={empDraft.isCurrentEmployment === 'Yes'}
                          onChange={() =>
                            setEmpDraft({
                              ...empDraft,
                              isCurrentEmployment: 'Yes',
                            })
                          }
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isCurrentEmployment"
                          checked={empDraft.isCurrentEmployment === 'No'}
                          onChange={() =>
                            setEmpDraft({
                              ...empDraft,
                              isCurrentEmployment: 'No',
                            })
                          }
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Employment type</label>
                    <div className="flex items-center gap-12 pt-1 text-xs font-bold text-slate-200">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="employmentType"
                          checked={empDraft.employmentType === 'Full-time'}
                          onChange={() =>
                            setEmpDraft({
                              ...empDraft,
                              employmentType: 'Full-time',
                            })
                          }
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span>Full-time</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="employmentType"
                          checked={empDraft.employmentType === 'Internship'}
                          onChange={() =>
                            setEmpDraft({
                              ...empDraft,
                              employmentType: 'Internship',
                            })
                          }
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span>Internship</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Total experience <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        value={empDraft.totalExpYears}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            totalExpYears: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">Years</option>
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i} value={String(i)}>
                            {i} {i === 1 ? 'Year' : 'Years'}
                          </option>
                        ))}
                      </select>

                      <select
                        value={empDraft.totalExpMonths}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            totalExpMonths: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">Months</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={String(i)}>
                            {i} {i === 1 ? 'Month' : 'Months'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      {empDraft.isCurrentEmployment === 'Yes'
                        ? 'Current company name'
                        : 'Company name'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Type your organization"
                      value={empDraft.company}
                      onChange={(e) =>
                        setEmpDraft({ ...empDraft, company: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      {empDraft.isCurrentEmployment === 'Yes'
                        ? 'Current job title'
                        : 'Job title'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Type your designation"
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
                    <label className={LABEL_CLASS}>
                      Joining date <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        value={empDraft.joiningYear}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            joiningYear: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">Select Year</option>
                        {YEARS_LIST.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>

                      <select
                        value={empDraft.joiningMonth}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            joiningMonth: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">Select Month</option>
                        {MONTHS_LIST.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {empDraft.isCurrentEmployment === 'No' && (
                    <div>
                      <label className={LABEL_CLASS}>Worked till</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                          value={empDraft.workedTillYear || ''}
                          onChange={(e) =>
                            setEmpDraft({
                              ...empDraft,
                              workedTillYear: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} cursor-pointer`}
                        >
                          <option value="">Select Year</option>
                          {YEARS_LIST.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>

                        <select
                          value={empDraft.workedTillMonth || ''}
                          onChange={(e) =>
                            setEmpDraft({
                              ...empDraft,
                              workedTillMonth: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} cursor-pointer`}
                        >
                          <option value="">Select Month</option>
                          {MONTHS_LIST.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={LABEL_CLASS}>
                      Current salary{' '}
                      {empDraft.isCurrentEmployment === 'Yes' && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="flex gap-3">
                      <select
                        value={empDraft.currency || '₹'}
                        onChange={(e) =>
                          setEmpDraft({ ...empDraft, currency: e.target.value })
                        }
                        className="w-24 bg-slate-950/90 border border-slate-700/90 rounded-xl px-3.5 py-3.5 text-sm text-white outline-none focus:border-blue-500 cursor-pointer shrink-0"
                      >
                        <option value="₹">₹</option>
                        <option value="$">$</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Enter annual salary"
                        value={empDraft.salary}
                        onChange={(e) =>
                          setEmpDraft({ ...empDraft, salary: e.target.value })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Skills used{' '}
                      {empDraft.isCurrentEmployment === 'Yes' && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Add skills"
                      value={empDraft.skillsUsed}
                      onChange={(e) =>
                        setEmpDraft({ ...empDraft, skillsUsed: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Job profile</label>
                    <div className="rounded-2xl bg-slate-950/90 border border-slate-700/90 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center">
                        <button
                          type="button"
                          onClick={handleWriteWithAi}
                          className="px-3.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>👑</span>
                          <span>Write with AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        maxLength={4000}
                        placeholder="Type here..."
                        value={empDraft.description}
                        onChange={(e) =>
                          setEmpDraft({
                            ...empDraft,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-transparent p-4 text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed resize-y"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-right mt-1.5">
                      {4000 - (empDraft.description?.length || 0)} character(s)
                      left
                    </p>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Notice period{' '}
                      {empDraft.isCurrentEmployment === 'Yes' && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      value={empDraft.noticePeriod}
                      onChange={(e) =>
                        setEmpDraft({
                          ...empDraft,
                          noticePeriod: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select notice period</option>
                      <option value="15 Days or less">15 Days or less</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months">3 Months</option>
                      <option value="More than 3 Months">
                        More than 3 Months
                      </option>
                      <option value="Serving Notice Period">
                        Serving Notice Period
                      </option>
                    </select>
                  </div>

                  {empError && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                      {empError}
                    </p>
                  )}
                </div>

                {renderModalFooter('Save')}
              </form>
            )}

            {/* MODAL 5: EDUCATION FORM */}
            {activeModal === 'education' && (
              <form noValidate onSubmit={handleSaveEducation}>
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Education
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Details like course, university, and more, help recruiters
                    identify your educational background
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>
                      Education <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eduDraft.educationLevel || ''}
                      onChange={(e) =>
                        setEduDraft({
                          ...eduDraft,
                          educationLevel: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select education</option>
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      University/Institute{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Select university/institute"
                      value={eduDraft.institute}
                      onChange={(e) =>
                        setEduDraft({ ...eduDraft, institute: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eduDraft.course || ''}
                      onChange={(e) =>
                        setEduDraft({ ...eduDraft, course: e.target.value })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select course</option>
                      {COURSE_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eduDraft.specialization || ''}
                      onChange={(e) =>
                        setEduDraft({
                          ...eduDraft,
                          specialization: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select specialization</option>
                      {SPECIALIZATION_OPTIONS.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Course type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-8 sm:gap-12 pt-1 text-xs font-bold text-slate-200">
                      {(
                        [
                          'Full time',
                          'Part time',
                          'Correspondence/Distance learning',
                        ] as const
                      ).map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="eduCourseType"
                            checked={
                              (eduDraft.courseType || '').toLowerCase() ===
                              type.toLowerCase()
                            }
                            onChange={() =>
                              setEduDraft({ ...eduDraft, courseType: type })
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>
                      Course duration <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={eduDraft.startYear || ''}
                        onChange={(e) =>
                          setEduDraft({
                            ...eduDraft,
                            startYear: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer flex-1`}
                      >
                        <option value="">Starting year</option>
                        {EDU_YEARS_LIST.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>

                      <span className="text-xs font-bold text-slate-400 px-1 shrink-0">
                        To
                      </span>

                      <select
                        value={eduDraft.endYear || ''}
                        onChange={(e) =>
                          setEduDraft({ ...eduDraft, endYear: e.target.value })
                        }
                        className={`${INPUT_CLASS} cursor-pointer flex-1`}
                      >
                        <option value="">Ending year</option>
                        {EDU_YEARS_LIST.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Grading system</label>
                    <select
                      value={eduDraft.gradingSystem || ''}
                      onChange={(e) =>
                        setEduDraft({
                          ...eduDraft,
                          gradingSystem: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select grading system</option>
                      {GRADING_SYSTEM_OPTIONS.map((gs) => (
                        <option key={gs} value={gs}>
                          {gs}
                        </option>
                      ))}
                    </select>
                  </div>

                  {eduError && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                      {eduError}
                    </p>
                  )}
                </div>

                {renderModalFooter('Save')}
              </form>
            )}

            {/* MODAL 6: IT SKILLS FORM */}
            {activeModal === 'itSkill' && (
              <form noValidate onSubmit={handleSaveItSkill}>
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-white">
                      IT skills
                    </h3>
                    {itSkillDraft.id && (
                      <button
                        type="button"
                        onClick={handleDeleteCurrentItSkill}
                        className="text-xs font-extrabold text-blue-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Mention skills like programming languages (Java, Python),
                    softwares (Microsoft Word, Excel) and more, to show your
                    technical expertise.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={LABEL_CLASS}>
                      Skill / software name{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Skill / Software name"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLASS}>Software version</label>
                      <input
                        type="text"
                        placeholder="Software version"
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
                      <label className={LABEL_CLASS}>Last used</label>
                      <select
                        value={itSkillDraft.lastUsed}
                        onChange={(e) =>
                          setItSkillDraft({
                            ...itSkillDraft,
                            lastUsed: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">Select year</option>
                        {YEARS_LIST.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Experience</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        value={itSkillDraft.expYears || '0 Year'}
                        onChange={(e) =>
                          setItSkillDraft({
                            ...itSkillDraft,
                            expYears: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        {Array.from({ length: 31 }, (_, i) => {
                          const label = `${i} ${i <= 1 ? 'Year' : 'Years'}`;
                          return (
                            <option key={label} value={label}>
                              {label}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        value={itSkillDraft.expMonths || '0 Month'}
                        onChange={(e) =>
                          setItSkillDraft({
                            ...itSkillDraft,
                            expMonths: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const label = `${i} ${i <= 1 ? 'Month' : 'Months'}`;
                          return (
                            <option key={label} value={label}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {itSkillError && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                      {itSkillError}
                    </p>
                  )}
                </div>

                {renderModalFooter('Save')}
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

            {/* MODAL 9: 6 CATEGORY-SPECIFIC ACCOMPLISHMENT FORMS */}
            {activeModal === 'accomplishment' && (
              <form noValidate onSubmit={handleSaveAccomplishment}>
                {accompCategory === 'onlineProfiles' && (
                  <>
                    <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                      <h3 className="text-xl font-extrabold text-white">
                        Online profiles
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Add link to online professional profiles (e.g. LinkedIn,
                        etc.)
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Social profile <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter Social Profile Name"
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
                      <div>
                        <label className={LABEL_CLASS}>
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter Social Profile URL"
                          value={accompDraft.url}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              url: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Description</label>
                        <textarea
                          rows={4}
                          maxLength={500}
                          placeholder="Type here..."
                          value={accompDraft.description || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              description: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} leading-relaxed`}
                        />
                        <p className="text-[11px] text-slate-400 text-right mt-1.5">
                          {500 - (accompDraft.description?.length || 0)}{' '}
                          character(s) left
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {accompCategory === 'workSamples' && (
                  <>
                    <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                      <h3 className="text-xl font-extrabold text-white">
                        Work samples
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Link relevant work samples (e.g. Github, Behance)
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Work title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter work title"
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
                      <div>
                        <label className={LABEL_CLASS}>
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter URL here"
                          value={accompDraft.url}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              url: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Duration from</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <select
                            value={accompDraft.durationFromYear || ''}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                durationFromYear: e.target.value,
                              })
                            }
                            className={`${INPUT_CLASS} cursor-pointer`}
                          >
                            <option value="">Select year</option>
                            {YEARS_LIST.map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                          <select
                            value={accompDraft.durationFromMonth || ''}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                durationFromMonth: e.target.value,
                              })
                            }
                            className={`${INPUT_CLASS} cursor-pointer`}
                          >
                            <option value="">Select month</option>
                            {MONTHS_LIST.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {!accompDraft.currentlyWorking && (
                        <div>
                          <label className={LABEL_CLASS}>Duration to</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select
                              value={accompDraft.durationToYear || ''}
                              onChange={(e) =>
                                setAccompDraft({
                                  ...accompDraft,
                                  durationToYear: e.target.value,
                                })
                              }
                              className={`${INPUT_CLASS} cursor-pointer`}
                            >
                              <option value="">Select Year</option>
                              {YEARS_LIST.map((yr) => (
                                <option key={yr} value={yr}>
                                  {yr}
                                </option>
                              ))}
                            </select>
                            <select
                              value={accompDraft.durationToMonth || ''}
                              onChange={(e) =>
                                setAccompDraft({
                                  ...accompDraft,
                                  durationToMonth: e.target.value,
                                })
                              }
                              className={`${INPUT_CLASS} cursor-pointer`}
                            >
                              <option value="">Select month</option>
                              {MONTHS_LIST.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(accompDraft.currentlyWorking)}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                currentlyWorking: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                          <span>I am currently working on this</span>
                        </label>
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Description</label>
                        <textarea
                          rows={4}
                          maxLength={500}
                          placeholder="Type here..."
                          value={accompDraft.description || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              description: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} leading-relaxed`}
                        />
                        <p className="text-[11px] text-slate-400 text-right mt-1.5">
                          {500 - (accompDraft.description?.length || 0)}{' '}
                          Character(s) Left
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {accompCategory === 'publications' && (
                  <>
                    <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                      <h3 className="text-xl font-extrabold text-white">
                        White paper / Research publication / Journal entry
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Add links to your online publications
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter title"
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
                      <div>
                        <label className={LABEL_CLASS}>
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter URL here"
                          value={accompDraft.url}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              url: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Published on</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <select
                            value={accompDraft.publishedYear || ''}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                publishedYear: e.target.value,
                              })
                            }
                            className={`${INPUT_CLASS} cursor-pointer`}
                          >
                            <option value="">Select year</option>
                            {YEARS_LIST.map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                          <select
                            value={accompDraft.publishedMonth || ''}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                publishedMonth: e.target.value,
                              })
                            }
                            className={`${INPUT_CLASS} cursor-pointer`}
                          >
                            <option value="">Select month</option>
                            {MONTHS_LIST.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Description</label>
                        <textarea
                          rows={4}
                          maxLength={500}
                          placeholder="Type here..."
                          value={accompDraft.description || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              description: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} leading-relaxed`}
                        />
                        <p className="text-[11px] text-slate-400 text-right mt-1.5">
                          {500 - (accompDraft.description?.length || 0)}{' '}
                          Character(s) Left
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {accompCategory === 'presentations' && (
                  <>
                    <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                      <h3 className="text-xl font-extrabold text-white">
                        Presentation
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Add links to your online presentations (e.g. Slideshare
                        presentation links etc.).
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Presentation title{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter presentation title"
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
                      <div>
                        <label className={LABEL_CLASS}>
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter URL here"
                          value={accompDraft.url}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              url: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Description</label>
                        <textarea
                          rows={4}
                          maxLength={500}
                          placeholder="Type here..."
                          value={accompDraft.description || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              description: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} leading-relaxed`}
                        />
                        <p className="text-[11px] text-slate-400 text-right mt-1.5">
                          {500 - (accompDraft.description?.length || 0)}{' '}
                          Character(s) Left
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {accompCategory === 'patents' && (
                  <>
                    <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                      <h3 className="text-xl font-extrabold text-white">
                        Patent
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Add details of patents you have filed
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Patent title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter title"
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
                      <div>
                        <label className={LABEL_CLASS}>
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter patent URL here"
                          value={accompDraft.url}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              url: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Patent office</label>
                        <input
                          type="text"
                          placeholder="Enter patent office"
                          value={accompDraft.patentOffice || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              patentOffice: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Status</label>
                        <div className="flex items-center gap-10 pt-1 text-xs font-bold text-slate-200">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="radio"
                              name="patentStatus"
                              checked={
                                (accompDraft.patentStatus ||
                                  'Patent issued') === 'Patent issued'
                              }
                              onChange={() =>
                                setAccompDraft({
                                  ...accompDraft,
                                  patentStatus: 'Patent issued',
                                })
                              }
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <span>Patent issued</span>
                          </label>
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="radio"
                              name="patentStatus"
                              checked={
                                accompDraft.patentStatus === 'Patent pending'
                              }
                              onChange={() =>
                                setAccompDraft({
                                  ...accompDraft,
                                  patentStatus: 'Patent pending',
                                })
                              }
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <span>Patent pending</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>
                          Application number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter application number"
                          value={accompDraft.applicationNumber || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              applicationNumber: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Issue date</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <select
                            value={accompDraft.issueYear || ''}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                issueYear: e.target.value,
                              })
                            }
                            className={`${INPUT_CLASS} cursor-pointer`}
                          >
                            <option value="">Select year</option>
                            {YEARS_LIST.map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                          <select
                            value={accompDraft.issueMonth || ''}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                issueMonth: e.target.value,
                              })
                            }
                            className={`${INPUT_CLASS} cursor-pointer`}
                          >
                            <option value="">Select month</option>
                            {MONTHS_LIST.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Description</label>
                        <textarea
                          rows={4}
                          maxLength={500}
                          placeholder="Type here..."
                          value={accompDraft.description || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              description: e.target.value,
                            })
                          }
                          className={`${INPUT_CLASS} leading-relaxed`}
                        />
                        <p className="text-[11px] text-slate-400 text-right mt-1.5">
                          {500 - (accompDraft.description?.length || 0)}{' '}
                          Character(s) Left
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {accompCategory === 'certifications' && (
                  <>
                    <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                      <h3 className="text-xl font-extrabold text-white">
                        Certifications
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Add details of Certifications you have
                        achieved/completed
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Certification name{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Please enter your certification name"
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
                      <div>
                        <label className={LABEL_CLASS}>
                          Certification completion ID
                        </label>
                        <input
                          type="text"
                          placeholder="Please mention your course completion ID"
                          value={accompDraft.completionId || ''}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              completionId: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Certification URL</label>
                        <input
                          type="text"
                          placeholder="Please mention your completion URL"
                          value={accompDraft.url}
                          onChange={(e) =>
                            setAccompDraft({
                              ...accompDraft,
                              url: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>
                          Certification validity
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="grid grid-cols-2 gap-3 w-full flex-1">
                            <select
                              value={accompDraft.validityFromMonth || ''}
                              onChange={(e) =>
                                setAccompDraft({
                                  ...accompDraft,
                                  validityFromMonth: e.target.value,
                                })
                              }
                              className={`${INPUT_CLASS} cursor-pointer`}
                            >
                              <option value="">MM</option>
                              {MONTHS_LIST.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <select
                              value={accompDraft.validityFromYear || ''}
                              onChange={(e) =>
                                setAccompDraft({
                                  ...accompDraft,
                                  validityFromYear: e.target.value,
                                })
                              }
                              className={`${INPUT_CLASS} cursor-pointer`}
                            >
                              <option value="">YYYY</option>
                              {YEARS_LIST.map((yr) => (
                                <option key={yr} value={yr}>
                                  {yr}
                                </option>
                              ))}
                            </select>
                          </div>

                          {!accompDraft.doesNotExpire && (
                            <>
                              <span className="text-xs font-bold text-slate-400 px-1 shrink-0">
                                To
                              </span>
                              <div className="grid grid-cols-2 gap-3 w-full flex-1">
                                <select
                                  value={accompDraft.validityToMonth || ''}
                                  onChange={(e) =>
                                    setAccompDraft({
                                      ...accompDraft,
                                      validityToMonth: e.target.value,
                                    })
                                  }
                                  className={`${INPUT_CLASS} cursor-pointer`}
                                >
                                  <option value="">MM</option>
                                  {MONTHS_LIST.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={accompDraft.validityToYear || ''}
                                  onChange={(e) =>
                                    setAccompDraft({
                                      ...accompDraft,
                                      validityToYear: e.target.value,
                                    })
                                  }
                                  className={`${INPUT_CLASS} cursor-pointer`}
                                >
                                  <option value="">YYYY</option>
                                  {CERT_YEARS_LIST.map((yr) => (
                                    <option key={yr} value={yr}>
                                      {yr}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(accompDraft.doesNotExpire)}
                            onChange={(e) =>
                              setAccompDraft({
                                ...accompDraft,
                                doesNotExpire: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                          <span>This certification does not expire</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {accompError && (
                  <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 mt-5">
                    {accompError}
                  </p>
                )}

                {renderModalFooter('Save')}
              </form>
            )}

            {/* ================================================================
                MODAL 10: CAREER PROFILE FORM (Matches Screenshots 2.57.57 & 2.58.02 PM)
               ================================================================ */}
            {activeModal === 'career' && (
              <form noValidate onSubmit={handleSaveCareerProfile}>
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Career profile
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Add details about your current and preferred job profile.
                    This helps us personalise your job recommendations.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 1. Current industry * */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Current industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={careerDraft.currentIndustry}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          currentIndustry: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Department * */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={careerDraft.department}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          department: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Role category * */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Role category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={careerDraft.roleCategory}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          roleCategory: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select role category</option>
                      {ROLE_CATEGORY_OPTIONS.map((rc) => (
                        <option key={rc} value={rc}>
                          {rc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Job role * */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Job role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={careerDraft.jobRole}
                      onChange={(e) =>
                        setCareerDraft({
                          ...careerDraft,
                          jobRole: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select job role</option>
                      {JOB_ROLE_OPTIONS.map((jr) => (
                        <option key={jr} value={jr}>
                          {jr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Desired job type (Checkboxes: Permanent, Contractual) */}
                  <div>
                    <label className={LABEL_CLASS}>Desired job type</label>
                    <div className="flex items-center gap-12 pt-1 text-xs font-semibold text-slate-200">
                      {(['Permanent', 'Contractual'] as const).map((type) => {
                        const isChecked = (
                          careerDraft.desiredJobTypes || []
                        ).includes(type);
                        return (
                          <label
                            key={type}
                            className="flex items-center gap-2.5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current =
                                  careerDraft.desiredJobTypes || [];
                                const next = e.target.checked
                                  ? [...current, type]
                                  : current.filter((t) => t !== type);
                                setCareerDraft({
                                  ...careerDraft,
                                  desiredJobTypes: next,
                                });
                              }}
                              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                            />
                            <span>{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Desired employment type (Checkboxes: Full time, Part time) */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Desired employment type
                    </label>
                    <div className="flex items-center gap-12 pt-1 text-xs font-semibold text-slate-200">
                      {(['Full time', 'Part time'] as const).map((type) => {
                        const isChecked = (
                          careerDraft.desiredEmploymentTypes || []
                        ).includes(type);
                        return (
                          <label
                            key={type}
                            className="flex items-center gap-2.5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current =
                                  careerDraft.desiredEmploymentTypes || [];
                                const next = e.target.checked
                                  ? [...current, type]
                                  : current.filter((t) => t !== type);
                                setCareerDraft({
                                  ...careerDraft,
                                  desiredEmploymentTypes: next,
                                });
                              }}
                              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                            />
                            <span>{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7. Preferred job role (Max 3) */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Preferred job role (Max 3)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your preferred job role"
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

                  {/* 8. Preferred work location (Max 10) */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Preferred work location (Max 10)
                    </label>
                    <input
                      type="text"
                      placeholder="Tell us your location preferences to work"
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

                  {/* 9. Preferred annual salary */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Preferred annual salary
                    </label>
                    <div className="flex gap-3">
                      <select
                        value={careerDraft.preferredSalaryCurrency || '₹'}
                        onChange={(e) =>
                          setCareerDraft({
                            ...careerDraft,
                            preferredSalaryCurrency: e.target.value,
                          })
                        }
                        className="w-24 bg-slate-950/90 border border-slate-700/90 rounded-xl px-3.5 py-3.5 text-sm text-white outline-none focus:border-blue-500 cursor-pointer shrink-0"
                      >
                        <option value="₹">₹</option>
                        <option value="$">$</option>
                      </select>

                      <input
                        type="text"
                        placeholder="0"
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
                  </div>

                  {/* 10. Preferred shift (Pill buttons: Day, Night, Flexible) */}
                  <div>
                    <label className={LABEL_CLASS}>Preferred shift</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(['Day', 'Night', 'Flexible'] as const).map((shift) => (
                        <button
                          key={shift}
                          type="button"
                          onClick={() =>
                            setCareerDraft({
                              ...careerDraft,
                              preferredShift: shift,
                            })
                          }
                          className={pillButtonClass(
                            careerDraft.preferredShift === shift
                          )}
                        >
                          {shift}
                        </button>
                      ))}
                    </div>
                  </div>

                  {careerError && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                      {careerError}
                    </p>
                  )}
                </div>

                {renderModalFooter('Save')}
              </form>
            )}

            {/* ================================================================
                MODAL 11: PERSONAL DETAILS & LANGUAGE PROFICIENCY FORM
                (Matches Screenshots 2.59.29 & 2.59.35 PM)
               ================================================================ */}
            {activeModal === 'personal' && (
              <form noValidate onSubmit={handleSavePersonalDetails}>
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Personal details
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    This information is important for employers to know you
                    better
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 1. Gender (Pills: Male, Female, Transgender) */}
                  <div>
                    <label className={LABEL_CLASS}>Gender</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(['Male', 'Female', 'Transgender'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() =>
                            setPersonalDraft({ ...personalDraft, gender: g })
                          }
                          className={pillButtonClass(
                            (personalDraft.gender || '').toLowerCase() ===
                              g.toLowerCase()
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. More information */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      More information
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Companies are focusing on equal opportunities and might be
                      looking for candidates from diverse backgrounds.
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {(
                        [
                          'Single parent',
                          'Working mother',
                          'Retired (60+)',
                          'LGBTQ+',
                        ] as const
                      ).map((info) => {
                        const isSelected = (
                          personalDraft.moreInfo || []
                        ).includes(info);
                        return (
                          <button
                            key={info}
                            type="button"
                            onClick={() => {
                              const current = personalDraft.moreInfo || [];
                              const next = isSelected
                                ? current.filter((item) => item !== info)
                                : [...current, info];
                              setPersonalDraft({
                                ...personalDraft,
                                moreInfo: next,
                              });
                            }}
                            className={pillButtonClass(isSelected)}
                          >
                            {info} {isSelected ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Marital status */}
                  <div>
                    <label className={LABEL_CLASS}>Marital status</label>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {(
                        [
                          'Single/unmarried',
                          'Married',
                          'Widowed',
                          'Divorced',
                          'Separated',
                          'Other',
                        ] as const
                      ).map((ms) => (
                        <button
                          key={ms}
                          type="button"
                          onClick={() =>
                            setPersonalDraft({
                              ...personalDraft,
                              maritalStatus: ms,
                            })
                          }
                          className={pillButtonClass(
                            (
                              personalDraft.maritalStatus || ''
                            ).toLowerCase() === ms.toLowerCase()
                          )}
                        >
                          {ms}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Date of birth (DD / MM / YYYY) */}
                  <div>
                    <label className={LABEL_CLASS}>Date of birth</label>
                    <div className="grid grid-cols-3 gap-4">
                      <select
                        value={personalDraft.dobDay || ''}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            dobDay: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">DD</option>
                        {DAYS_LIST.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      <select
                        value={personalDraft.dobMonth || ''}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            dobMonth: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">MM</option>
                        {MONTHS_LIST.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>

                      <select
                        value={personalDraft.dobYear || ''}
                        onChange={(e) =>
                          setPersonalDraft({
                            ...personalDraft,
                            dobYear: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} cursor-pointer`}
                      >
                        <option value="">YYYY</option>
                        {DOB_YEARS_LIST.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 5. Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Category
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Companies welcome people from various categories to bring
                      equality among all citizens
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {(
                        [
                          'General',
                          'Scheduled Caste (SC)',
                          'Scheduled Tribe (ST)',
                          'OBC - Creamy',
                          'OBC - Non creamy',
                          'Other',
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setPersonalDraft({
                              ...personalDraft,
                              category: cat,
                            })
                          }
                          className={pillButtonClass(
                            personalDraft.category === cat
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6. Work permit for USA */}
                  <div>
                    <label className={LABEL_CLASS}>Work permit for USA</label>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {(
                        [
                          'Have US H1 Visa',
                          'Need US H1 Visa',
                          'US TN Permit Holder',
                          'US Green Card Holder',
                          'US Citizen',
                          'Authorized to work in US',
                        ] as const
                      ).map((usaOption) => (
                        <button
                          key={usaOption}
                          type="button"
                          onClick={() =>
                            setPersonalDraft({
                              ...personalDraft,
                              workPermitUsa:
                                personalDraft.workPermitUsa === usaOption
                                  ? ''
                                  : usaOption,
                            })
                          }
                          className={pillButtonClass(
                            personalDraft.workPermitUsa === usaOption
                          )}
                        >
                          {usaOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. Work permit for other countries (Max 3) */}
                  <div>
                    <label className={LABEL_CLASS}>
                      Work permit for other countries
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (!selected) return;
                        const current =
                          personalDraft.workPermitCountries || [];
                        if (
                          !current.includes(selected) &&
                          current.length < 3
                        ) {
                          setPersonalDraft({
                            ...personalDraft,
                            workPermitCountries: [...current, selected],
                          });
                        }
                      }}
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      <option value="">Select countries</option>
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      You can choose 3 countries at max
                    </p>

                    {(personalDraft.workPermitCountries || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {(personalDraft.workPermitCountries || []).map((c) => (
                          <span
                            key={c}
                            className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center gap-2"
                          >
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setPersonalDraft({
                                  ...personalDraft,
                                  workPermitCountries: (
                                    personalDraft.workPermitCountries || []
                                  ).filter((item) => item !== c),
                                })
                              }
                              className="text-slate-400 hover:text-red-400 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 8. Permanent address */}
                  <div>
                    <label className={LABEL_CLASS}>Permanent address</label>
                    <input
                      type="text"
                      placeholder="Enter your permanent address"
                      value={personalDraft.address}
                      onChange={(e) =>
                        setPersonalDraft({
                          ...personalDraft,
                          address: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* 9. Hometown */}
                  <div>
                    <label className={LABEL_CLASS}>Hometown</label>
                    <input
                      type="text"
                      placeholder="Enter your hometown"
                      value={personalDraft.hometown || ''}
                      onChange={(e) =>
                        setPersonalDraft({
                          ...personalDraft,
                          hometown: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* 10. Pincode */}
                  <div>
                    <label className={LABEL_CLASS}>Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter your Pincode"
                      value={personalDraft.pincode || ''}
                      onChange={(e) =>
                        setPersonalDraft({
                          ...personalDraft,
                          pincode: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* 11. Language proficiency section */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-base font-extrabold text-white">
                      Language proficiency
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 mb-5">
                      Strengthen your resume by letting recruiters know you can
                      communicate in multiple languages
                    </p>

                    <div className="space-y-6">
                      {languagesDraft.map((langRow, idx) => (
                        <div
                          key={langRow.id}
                          className="space-y-3 pb-4 border-b border-slate-800/60 last:border-b-0"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL_CLASS}>
                                Language <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={langRow.language}
                                onChange={(e) => {
                                  const next = [...languagesDraft];
                                  next[idx] = {
                                    ...next[idx],
                                    language: e.target.value,
                                  };
                                  setLanguagesDraft(next);
                                }}
                                className={`${INPUT_CLASS} cursor-pointer`}
                              >
                                <option value="">Select language</option>
                                {LANGUAGE_OPTIONS.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className={LABEL_CLASS}>
                                Proficiency{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={langRow.proficiency}
                                onChange={(e) => {
                                  const next = [...languagesDraft];
                                  next[idx] = {
                                    ...next[idx],
                                    proficiency: e.target.value,
                                  };
                                  setLanguagesDraft(next);
                                }}
                                className={`${INPUT_CLASS} cursor-pointer`}
                              >
                                <option value="">Select proficiency</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Proficient">Proficient</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-8 text-xs font-semibold text-slate-300">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={langRow.read}
                                  onChange={(e) => {
                                    const next = [...languagesDraft];
                                    next[idx] = {
                                      ...next[idx],
                                      read: e.target.checked,
                                    };
                                    setLanguagesDraft(next);
                                  }}
                                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                />
                                <span>Read</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={langRow.write}
                                  onChange={(e) => {
                                    const next = [...languagesDraft];
                                    next[idx] = {
                                      ...next[idx],
                                      write: e.target.checked,
                                    };
                                    setLanguagesDraft(next);
                                  }}
                                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                />
                                <span>Write</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={langRow.speak}
                                  onChange={(e) => {
                                    const next = [...languagesDraft];
                                    next[idx] = {
                                      ...next[idx],
                                      speak: e.target.checked,
                                    };
                                    setLanguagesDraft(next);
                                  }}
                                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                />
                                <span>Speak</span>
                              </label>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (languagesDraft.length === 1) {
                                  setLanguagesDraft([
                                    {
                                      id: String(Date.now()),
                                      language: '',
                                      proficiency: '',
                                      read: false,
                                      write: false,
                                      speak: false,
                                    },
                                  ]);
                                } else {
                                  setLanguagesDraft(
                                    languagesDraft.filter(
                                      (_, itemIdx) => itemIdx !== idx
                                    )
                                  );
                                }
                              }}
                              className="text-xs font-extrabold text-blue-400 hover:text-red-400 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setLanguagesDraft([
                          ...languagesDraft,
                          {
                            id: String(Date.now() + Math.random()),
                            language: '',
                            proficiency: '',
                            read: false,
                            write: false,
                            speak: false,
                          },
                        ])
                      }
                      className="mt-4 text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      Add another language
                    </button>
                  </div>
                </div>

                {renderModalFooter('Save')}
              </form>
            )}

            {/* ================================================================
                MODAL 12: DIVERSITY & INCLUSION FORM (Matches Screenshot 2.59.57 PM)
               ================================================================ */}
            {activeModal === 'diversity' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToDatabase(
                    { ...profile, diversity: diversityDraft },
                    {},
                    'Diversity & inclusion updated!'
                  );
                }}
              >
                <div className="pb-5 mb-7 border-b border-slate-800 pr-12">
                  <h3 className="text-xl font-extrabold text-white">
                    Diversity &amp; inclusion
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Share details to attract recruiters who value people from
                    different backgrounds
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 1. Disability status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Disability status
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Share your status to get jobs that match your needs
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(
                        ['Have disability', 'Do not have disability'] as const
                      ).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setDiversityDraft({
                              ...diversityDraft,
                              disabilityStatus: status,
                            })
                          }
                          className={pillButtonClass(
                            diversityDraft.disabilityStatus === status
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Military experience */}
                  <div>
                    <label className={LABEL_CLASS}>Military experience</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(
                        [
                          'Currently serving',
                          'Previously served',
                          'Never served',
                        ] as const
                      ).map((mil) => (
                        <button
                          key={mil}
                          type="button"
                          onClick={() =>
                            setDiversityDraft({
                              ...diversityDraft,
                              militaryExperience: mil,
                            })
                          }
                          className={pillButtonClass(
                            diversityDraft.militaryExperience === mil
                          )}
                        >
                          {mil}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Career break */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Career break
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Help recruiters understand your unique path
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(['Have taken', 'Have not taken'] as const).map((cb) => (
                        <button
                          key={cb}
                          type="button"
                          onClick={() =>
                            setDiversityDraft({
                              ...diversityDraft,
                              careerBreak: cb,
                            })
                          }
                          className={pillButtonClass(
                            diversityDraft.careerBreak === cb
                          )}
                        >
                          {cb}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {renderModalFooter('Save')}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}