'use client';
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import { uploadFiles } from '../../../utils/uploadthing';

export default function CandidateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  // Added projects and profileSummary to prevent TypeScript errors!
  const [profile, setProfile] = useState({
    name: '', email: '', role: '', location: '', phone: '', avatar: '', 
    resumeUrl: '', resumeHeadline: '', keySkills: [] as string[], employment: [], education: [],
    projects: [], profileSummary: ''
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  
  const [newSkill, setNewSkill] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!newSkill.trim() || newSkill.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsFetchingSuggestions(true);
      
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(newSkill)}&limit=10&namespace=0&format=json&origin=*`);
        const data = await res.json();
        
        if (data && data[1]) {
          const currentSkills = tempData.keySkills || [];
          const filtered = data[1].filter((s: string) => !currentSkills.some((cs: string) => cs.toLowerCase() === s.toLowerCase()));
          setSuggestions(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions");
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [newSkill, tempData.keySkills]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setProfile(prev => ({ ...prev, email: parsed.email, name: parsed.name }));

      fetch(`/api/profile?email=${parsed.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setProfile(prev => ({
              ...prev, 
              name: data.name || parsed.name, 
              email: data.email, 
              role: data.role || '', 
              location: data.location || '', 
              phone: data.phone || parsed.mobile || '', 
              avatar: data.avatar || '', 
              resumeUrl: data.resumeUrl || data.resume_url || '', 
              resumeHeadline: data.resumeHeadline || data.resume_headline || '', 
              keySkills: data.keySkills || data.key_skills || []
            }));
          }
          setLoading(false);
        }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = async (section: string) => {
    if (!profile.email) return;
    const updatedName = tempData.name?.trim() || profile.name;
    const updatedProfile = { ...profile, ...tempData, name: updatedName };
    setProfile(updatedProfile);
    setEditing(null);
    try { 
      await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) }); 
    } catch (err) {}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.email) {
      setIsUploading(true);
      
      if (profile.avatar) {
        try { await fetch('/api/delete-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: profile.avatar }) }); } catch (e) {}
      }

      try {
        const res = await uploadFiles("imageUploader", { files: [file] });
        if (res && res.length > 0) {
          const updatedProfile = { ...profile, avatar: res[0].url };
          setProfile(updatedProfile);
          await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
        }
      } catch (error) { } finally { setIsUploading(false); }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.email) {
      setIsUploadingResume(true);
      
      if (profile.resumeUrl) {
        try { await fetch('/api/delete-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: profile.resumeUrl }) }); } catch (e) {}
      }

      try {
        const res = await uploadFiles("resumeUploader", { files: [file] });
        if (res && res.length > 0) {
          const updatedProfile = { ...profile, resumeUrl: res[0].url };
          setProfile(updatedProfile); 
          await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
        }
      } catch (error) { } finally { setIsUploadingResume(false); }
    }
  };

  const handleDeleteResume = async () => {
    if (profile.resumeUrl) {
      try { await fetch('/api/delete-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: profile.resumeUrl }) }); } catch (e) {}
    }
    
    const updatedProfile = { ...profile, resumeUrl: '' };
    setProfile(updatedProfile);
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
  };

  const handleAddSkill = (skill: string) => {
    const currentSkills = tempData.keySkills || [];
    if (currentSkills.length >= 18) {
      alert("You can add a maximum of 18 skills.");
      return;
    }
    if (!currentSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase())) {
      setTempData({ ...tempData, keySkills: [...currentSkills, skill] });
    }
    setNewSkill('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      handleAddSkill(newSkill.trim());
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTempData({ ...tempData, keySkills: tempData.keySkills.filter((s: string) => s !== skillToRemove) });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-500">
      Loading Profile Data...
    </div>
  );

  const sidebarLinks = [
    { name: 'Resume', isCompleted: !!profile.resumeUrl },
    { name: 'Resume headline', isCompleted: !!profile.resumeHeadline },
    { name: 'Key skills', isCompleted: profile.keySkills?.length > 0 },
    { name: 'Employment', isCompleted: profile.employment?.length > 0 },
    { name: 'Education', isCompleted: profile.education?.length > 0 },
    { name: 'IT skills', isCompleted: false },
    { name: 'Projects', isCompleted: profile.projects?.length > 0 || false },
    { name: 'Profile summary', isCompleted: !!profile.profileSummary },
    { name: 'Accomplishments', isCompleted: false },
    { name: 'Career profile', isCompleted: false },
    { name: 'Personal details', isCompleted: !!(profile.location && profile.phone) }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col relative">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20"><Navbar /></div>

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 md:px-8 pb-20 relative z-10 flex flex-col">
        
        {/* ================= HEADER ================= */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            <div className="relative shrink-0 group cursor-pointer w-[140px] h-[140px] flex items-center justify-center" onClick={() => !isUploading && fileInputRef.current?.click()}>
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="67" fill="none" stroke="#1e293b" strokeWidth="4" />
                <circle cx="70" cy="70" r="67" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="420" strokeDashoffset="0" className="transition-all duration-1000" />
              </svg>
              <div className="w-[124px] h-[124px] rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-4xl relative z-10 shadow-inner border border-emerald-500/50">
                {profile.avatar && !isUploading ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 group-hover:text-blue-400 transition-colors">👤</span>
                )}
                {isUploading ? (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="text-white text-[9px] font-bold uppercase tracking-wider">Update</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-emerald-600 text-[11px] font-extrabold px-3 py-0.5 rounded-full z-30 shadow-md">100%</div>
            </div>

            <div className="flex-1 w-full mt-2 md:mt-0 md:pl-4">
              {editing === 'basic' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase">Full Name</label>
                      <input type="text" value={tempData.name ?? profile.name} onChange={e => setTempData({...tempData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase">Current Role</label>
                      <input type="text" placeholder="e.g. Software Engineer" value={tempData.role ?? profile.role} onChange={e => setTempData({...tempData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase">Location</label>
                      <input type="text" placeholder="e.g. Bengaluru, India" value={tempData.location ?? profile.location} onChange={e => setTempData({...tempData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase">Phone Number</label>
                      <input type="tel" placeholder="+91" value={tempData.phone ?? profile.phone} onChange={e => setTempData({...tempData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleSave('basic')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-6 rounded-lg transition-colors">Save Details</button>
                    <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-xs py-2 px-4 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        {profile.name} 
                        <button onClick={() => { setEditing('basic'); setTempData({ name: profile.name, role: profile.role, location: profile.location, phone: profile.phone }); }} className="text-slate-500 hover:text-blue-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </button>
                      </h1>
                      <p className="text-sm font-medium text-slate-300 mt-1">{profile.role || 'Add your current role'}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-slate-700/50 my-5"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-300">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">📍 {profile.location ? profile.location : <button onClick={() => { setEditing('basic'); setTempData({...profile}); }} className="text-blue-400 hover:text-blue-300 italic transition-colors text-[13px]">Location not added</button>}</div>
                      <div className="flex items-center gap-3">💼 <span className="text-slate-500 italic text-[13px]">Experience not added</span></div>
                      <div className="flex items-center gap-3">💰 <span className="text-slate-500 italic text-[13px]">Salary not added</span></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">📞 {profile.phone ? profile.phone : <button onClick={() => { setEditing('basic'); setTempData({...profile}); }} className="text-blue-400 hover:text-blue-300 italic transition-colors text-[13px]">Phone not added</button>}</div>
                      <div className="flex items-center gap-3">✉️ <span className="truncate max-w-[200px]">{profile.email}</span></div>
                      <div className="flex items-center gap-3">🗓️ <span className="text-slate-500 italic text-[13px]">Notice period not added</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= 2-COLUMN LAYOUT ================= */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-8">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-white font-bold mb-4 px-2">Quick links</h3>
              <ul className="space-y-1">
                {sidebarLinks.map((link, idx) => (
                  <li key={idx}>
                    <a href={`#${link.name.replace(/\s+/g, '-').toLowerCase()}`} className="flex justify-between items-center px-2 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer group">
                      <span className={link.isCompleted ? 'text-slate-200 font-medium' : ''}>{link.name}</span>
                      {link.isCompleted && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                          <svg className="w-3 h-3 text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,113,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 space-y-6 w-full">
            
            {/* ================= RESUME SECTION ================= */}
            <div id="resume" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6">Resume</h2>
              
              {profile.resumeUrl && (
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">
                      {decodeURIComponent(profile.resumeUrl.split('/').pop() || 'Uploaded_Resume.pdf')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </a>
                    <button onClick={handleDeleteResume} className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-blue-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-900/50">
                <input type="file" ref={resumeInputRef} className="hidden" accept=".doc,.docx,.rtf,.pdf" onChange={handleResumeUpload} />
                <button onClick={() => !isUploadingResume && resumeInputRef.current?.click()} className="text-blue-400 font-bold text-sm border border-blue-500 hover:bg-blue-500/10 px-6 py-2 rounded-full transition-colors mb-2 flex items-center gap-2 shadow-sm">
                  {isUploadingResume ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg> 
                      Uploading...
                    </>
                  ) : 'Update resume'}
                </button>
                <p className="text-xs text-slate-500">Supported Formats: doc, docx, rtf, pdf, upto 2 MB</p>
              </div>
            </div>

            {/* ================= PENCIL ICONS ADDED BELOW ================= */}

            {/* RESUME HEADLINE */}
            <div id="resume-headline" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Resume headline</h2>
                <button onClick={() => setEditing('resumeHeadline')} className="focus:outline-none group mt-0.5" title="Edit Resume headline">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className={`text-sm leading-relaxed ${profile.resumeHeadline ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                {profile.resumeHeadline || 'Add a summary of your experience and career goals to grab recruiter attention.'}
              </p>
            </div>

            {/* KEY SKILLS */}
            <div id="key-skills" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-white">Key skills</h2>
                <button onClick={() => { setEditing('keySkills'); setTempData({...profile}); }} className="focus:outline-none group mt-0.5" title="Edit Key skills">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profile.keySkills.length > 0 ? (
                  profile.keySkills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-1.5 border border-slate-600 text-slate-300 text-sm rounded-full cursor-default hover:border-slate-500 transition-colors">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No skills added yet.</p>
                )}
              </div>
            </div>

            {/* EMPLOYMENT */}
            <div id="employment" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Employment</h2>
                <button onClick={() => setEditing('employment')} className="focus:outline-none group mt-0.5" title="Edit Employment">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Please add your employment details.</p>
            </div>

            {/* EDUCATION */}
            <div id="education" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Education</h2>
                <button onClick={() => setEditing('education')} className="focus:outline-none group mt-0.5" title="Edit Education">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Please add your educational qualification.</p>
            </div>

            {/* IT SKILLS */}
            <div id="it-skills" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">IT skills</h2>
                <button onClick={() => setEditing('itSkills')} className="focus:outline-none group mt-0.5" title="Edit IT skills">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Add your IT skills.</p>
            </div>

            {/* PROJECTS */}
            <div id="projects" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Projects</h2>
                <button onClick={() => setEditing('projects')} className="focus:outline-none group mt-0.5" title="Edit Projects">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Add projects you have worked on.</p>
            </div>

            {/* PROFILE SUMMARY */}
            <div id="profile-summary" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Profile summary</h2>
                <button onClick={() => setEditing('profileSummary')} className="focus:outline-none group mt-0.5" title="Edit Profile summary">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Add a brief summary of your overall career highlights and core competencies.</p>
            </div>

            {/* ACCOMPLISHMENTS */}
            <div id="accomplishments" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Accomplishments</h2>
                <button onClick={() => setEditing('accomplishments')} className="focus:outline-none group mt-0.5" title="Edit Accomplishments">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Add certifications, publications, awards, or patents.</p>
            </div>

            {/* CAREER PROFILE */}
            <div id="career-profile" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Career profile</h2>
                <button onClick={() => setEditing('careerProfile')} className="focus:outline-none group mt-0.5" title="Edit Career profile">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 italic">Add desired career profile, preferred industry, and job type.</p>
            </div>

            {/* PERSONAL DETAILS */}
            <div id="personal-details" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Personal details</h2>
                <button onClick={() => { setEditing('basic'); setTempData({ name: profile.name, role: profile.role, location: profile.location, phone: profile.phone }); }} className="focus:outline-none group mt-0.5" title="Edit Personal details">
                  <svg className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-300">
                <div><span className="text-slate-500 font-bold uppercase text-[11px] block mb-1">Location</span>{profile.location || <span className="italic text-slate-600">Not added</span>}</div>
                <div><span className="text-slate-500 font-bold uppercase text-[11px] block mb-1">Phone</span>{profile.phone || <span className="italic text-slate-600">Not added</span>}</div>
                <div className="col-span-1 sm:col-span-2"><span className="text-slate-500 font-bold uppercase text-[11px] block mb-1">Email</span>{profile.email}</div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ================= LIVE AUTO-SUGGEST MODAL ================= */}
      {editing === 'keySkills' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowDropdown(false)}>
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col border border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b border-slate-700/50">
              <div>
                <h2 className="text-xl font-bold text-white">Key skills</h2>
                <p className="text-sm text-slate-400 mt-1">Add skills that best define your expertise, for e.g, Direct Marketing, Oracle, Java, etc. (Minimum 1)</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6 min-h-[350px]">
              <div>
                <label className="text-sm font-bold text-white mb-3 block">Skills</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tempData.keySkills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-4 py-1.5 bg-slate-700/50 border border-slate-600 text-slate-200 text-sm rounded-full flex items-center gap-2 hover:border-slate-400 transition-colors">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your skill"
                  value={newSkill}
                  onChange={e => {
                    setNewSkill(e.target.value);
                    if (e.target.value.length >= 2) setShowDropdown(true);
                    else setShowDropdown(false);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if(newSkill.length >= 2) setShowDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)} 
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
                {showDropdown && newSkill.length >= 2 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[220px] overflow-y-auto">
                    {isFetchingSuggestions ? (
                      <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                         <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg> Searching...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <ul className="py-1">
                        {suggestions.map((skill, idx) => (
                          <li key={idx}>
                            <button 
                              onClick={() => handleAddSkill(skill)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                            >
                              {skill}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-400">
                        Press Enter to add "{newSkill}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-700/50 flex justify-end gap-4 bg-slate-800/50 rounded-b-2xl">
              <button onClick={() => setEditing(null)} className="text-blue-400 hover:text-blue-300 font-bold text-sm px-4 py-2 transition-colors">Cancel</button>
              <button onClick={() => handleSave('keySkills')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2 px-6 rounded-full transition-colors shadow-md">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}