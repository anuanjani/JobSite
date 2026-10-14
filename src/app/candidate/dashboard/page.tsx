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
  
  const [profile, setProfile] = useState({
    name: '', email: '', role: '', location: '', phone: '', avatar: '', resumeUrl: '', resumeHeadline: '', keySkills: [] as string[], employment: [], education: []
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  const [newSkill, setNewSkill] = useState('');

  // 1. FETCH FROM DATABASE ON LOAD
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      
      // Ensure we immediately set the email so POST requests don't fail
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
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 2. TEXT SAVER - ONLY SAVE IF EMAIL EXISTS
  const handleSave = async (section: string) => {
    if (!profile.email) {
      alert("Error: User email missing. Please log in again.");
      return;
    }
    
    // Ensure we don't save empty names
    const updatedName = tempData.name?.trim() || profile.name;
    const updatedProfile = { ...profile, ...tempData, name: updatedName };
    
    setProfile(updatedProfile);
    setEditing(null);
    
    try {
      const res = await fetch('/api/profile', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(updatedProfile) 
      });
      const data = await res.json();
      if (data.error) { console.error("Save Error:", data.error); alert("Failed to save data to database: " + data.error); }
    } catch (err) {
      console.error("Network Error:", err);
    }
  };

  // 3. AVATAR UPLOADER
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.email) {
      setIsUploading(true);
      try {
        const res = await uploadFiles("imageUploader", { files: [file] });
        if (res && res.length > 0) {
          const updatedProfile = { ...profile, avatar: res[0].url };
          setProfile(updatedProfile);
          await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
        }
      } catch (error) { console.error("Upload Error:", error); } finally { setIsUploading(false); }
    }
  };

  // 4. RESUME UPLOADER 
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.email) {
      setIsUploadingResume(true);
      try {
        const res = await uploadFiles("resumeUploader", { files: [file] });
        if (res && res.length > 0) {
          const updatedProfile = { ...profile, resumeUrl: res[0].url };
          setProfile(updatedProfile); 
          await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
        }
      } catch (error) { console.error("Upload Error:", error); } finally { setIsUploadingResume(false); }
    }
  };

  const handleDeleteResume = async () => {
    const updatedProfile = { ...profile, resumeUrl: '' };
    setProfile(updatedProfile);
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
  };

  const addSkill = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      setTempData({ ...tempData, keySkills: [...(tempData.keySkills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTempData({ ...tempData, keySkills: tempData.keySkills.filter((s: string) => s !== skillToRemove) });
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-fuchsia-500">Loading Profile Data...</div>;

  const sidebarLinks = ['Resume', 'Resume headline', 'Key skills', 'Employment', 'Education', 'IT skills', 'Projects'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20"><Navbar /></div>

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 md:px-8 pb-20 relative z-10 flex flex-col">
        
        {/* ================= HEADER ================= */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            <div className="relative shrink-0 group cursor-pointer w-[140px] h-[140px] flex items-center justify-center" onClick={() => !isUploading && fileInputRef.current?.click()}>
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="67" fill="none" stroke="#1e293b" strokeWidth="4" />
                <circle cx="70" cy="70" r="67" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="420" strokeDashoffset="0" className="transition-all duration-1000" />
              </svg>
              <div className="w-[124px] h-[124px] rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-4xl relative z-10 shadow-inner">
                {profile.avatar && !isUploading ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 group-hover:text-fuchsia-400 transition-colors">👤</span>
                )}
                {isUploading ? (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <svg className="w-8 h-8 animate-spin text-fuchsia-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                    {/* CRITICAL FIX: Value uses tempData OR falls back to profile data so it is never empty */}
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Full Name</label><input type="text" value={tempData.name ?? profile.name} onChange={e => setTempData({...tempData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Current Role</label><input type="text" placeholder="e.g. Software Engineer" value={tempData.role ?? profile.role} onChange={e => setTempData({...tempData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Location</label><input type="text" placeholder="e.g. Bengaluru, India" value={tempData.location ?? profile.location} onChange={e => setTempData({...tempData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Phone Number</label><input type="tel" placeholder="+91" value={tempData.phone ?? profile.phone} onChange={e => setTempData({...tempData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleSave('basic')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs py-2 px-6 rounded-lg transition-colors">Save Details</button>
                    <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-xs py-2 px-4 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        {profile.name} <button onClick={() => { setEditing('basic'); setTempData({ name: profile.name, role: profile.role, location: profile.location, phone: profile.phone }); }} className="text-slate-500 hover:text-fuchsia-400 transition-colors">✏️</button>
                      </h1>
                      <p className="text-sm font-medium text-slate-300 mt-1">{profile.role || 'Add your current role'}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-slate-700/50 my-5"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-300">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">📍 {profile.location ? profile.location : <button onClick={() => { setEditing('basic'); setTempData({...profile}); }} className="text-fuchsia-400 hover:text-fuchsia-300 italic transition-colors text-[13px]">Location not added</button>}</div>
                      <div className="flex items-center gap-3">💼 <span className="text-slate-500 italic text-[13px]">Experience not added</span></div>
                      <div className="flex items-center gap-3">💰 <span className="text-slate-500 italic text-[13px]">Salary not added</span></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">📞 {profile.phone ? profile.phone : <button onClick={() => { setEditing('basic'); setTempData({...profile}); }} className="text-fuchsia-400 hover:text-fuchsia-300 italic transition-colors text-[13px]">Phone not added</button>}</div>
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
                  <li key={idx}><a href={`#${link.replace(/\s+/g, '-').toLowerCase()}`} className="flex justify-between items-center px-2 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer group"><span>{link}</span></a></li>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </a>
                    <button onClick={handleDeleteResume} className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-blue-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-900/50">
                <input type="file" ref={resumeInputRef} className="hidden" accept=".doc,.docx,.rtf,.pdf" onChange={handleResumeUpload} />
                
                <button onClick={() => !isUploadingResume && resumeInputRef.current?.click()} className="text-blue-400 font-bold text-sm border border-blue-500 hover:bg-blue-500/10 px-6 py-2 rounded-full transition-colors mb-2 flex items-center gap-2 shadow-sm">
                  {isUploadingResume ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Uploading...</>
                  ) : 'Update resume'}
                </button>
                <p className="text-xs text-slate-500">Supported Formats: doc, docx, rtf, pdf, upto 2 MB</p>
              </div>
            </div>

            {/* ================= RESUME HEADLINE ================= */}
            <div id="resume-headline" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">Resume headline</h2>
                {editing !== 'headline' && <button onClick={() => { setEditing('headline'); setTempData({ resumeHeadline: profile.resumeHeadline }); }} className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors">{profile.resumeHeadline ? 'Edit' : 'Add Headline'}</button>}
              </div>
              {editing === 'headline' ? (
                <div className="space-y-4">
                  <textarea rows={4} placeholder="e.g. Lead Consultant seeking roles in Test Management..." value={tempData.resumeHeadline ?? profile.resumeHeadline} onChange={e => setTempData({...tempData, resumeHeadline: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-fuchsia-500 outline-none resize-none"></textarea>
                  <div className="flex gap-3">
                    <button onClick={() => handleSave('headline')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs py-2 px-6 rounded-lg transition-colors">Save</button>
                    <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-xs py-2 px-4 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className={`text-sm leading-relaxed ${profile.resumeHeadline ? 'text-slate-300' : 'text-slate-600 italic'}`}>{profile.resumeHeadline || 'Add a summary of your experience and career goals to grab recruiter attention.'}</p>
              )}
            </div>

            {/* ================= KEY SKILLS ================= */}
            <div id="key-skills" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">Key skills</h2>
                {editing !== 'skills' && <button onClick={() => { setEditing('skills'); setTempData({ keySkills: profile.keySkills }); }} className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors">{profile.keySkills.length > 0 ? 'Edit' : 'Add Skills'}</button>}
              </div>
              {editing === 'skills' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tempData.keySkills?.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-slate-900 border border-fuchsia-500/50 text-white text-xs font-medium rounded-full flex items-center gap-2">{skill} <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-400">×</button></span>
                    ))}
                  </div>
                  <input type="text" placeholder="Type a skill and press Enter" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={addSkill} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-fuchsia-500 outline-none" />
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleSave('skills')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs py-2 px-6 rounded-lg transition-colors">Save</button>
                    <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-xs py-2 px-4 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  {profile.keySkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">{profile.keySkills.map((skill, idx) => (<span key={idx} className="px-4 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium rounded-full cursor-default">{skill}</span>))}</div>
                  ) : (<p className="text-sm text-slate-600 italic">No skills added yet. Add skills to get more relevant job recommendations.</p>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}