'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function CandidateProfilePage() {
  // 1. DYNAMIC STATE MANAGEMENT (Ready for Database Integration)
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    location: '',
    phone: '',
    salary: '',
    noticePeriod: '',
    resumeHeadline: '',
    keySkills: [] as string[],
    employment: [],
    education: []
  });

  // Edit Mode Trackers
  const [editing, setEditing] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  const [newSkill, setNewSkill] = useState('');

  // 2. FETCH LOGGED-IN USER ON LOAD
  useEffect(() => {
    // In production, this fetches from your Neon DB: fetch('/api/profile')
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setProfile(prev => ({ ...prev, name: parsed.name || 'New User', email: parsed.email || '' }));
    }
    setLoading(false);
  }, []);

  // 3. SAVE HANDLERS
  const handleSave = async (section: string) => {
    // Here you will make the API call to Neon DB: await fetch('/api/profile/update', {...})
    setProfile(prev => ({ ...prev, ...tempData }));
    setEditing(null);
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      setTempData({ ...tempData, keySkills: [...(tempData.keySkills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTempData({ ...tempData, keySkills: tempData.keySkills.filter((s: string) => s !== skillToRemove) });
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-fuchsia-500">Loading Profile...</div>;

  const sidebarLinks = ['Resume', 'Resume headline', 'Key skills', 'Employment', 'Education', 'IT skills', 'Projects'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 relative z-20">
        <Navbar />
      </div>

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 md:px-8 pb-20 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-8">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-bold mb-4 px-2">Quick links</h3>
            <ul className="space-y-1">
              {sidebarLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={`#${link.replace(/\s+/g, '-').toLowerCase()}`} className="flex justify-between items-center px-2 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer group">
                    <span>{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 space-y-6 w-full">
          
          {/* 1. HEADER / BASIC DETAILS */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-32 h-32 shrink-0 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-4xl shadow-inner">
                👤
              </div>

              <div className="flex-1 w-full">
                {editing === 'basic' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-500 font-bold uppercase">Full Name</label><input type="text" value={tempData.name || ''} onChange={e => setTempData({...tempData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                      <div><label className="text-xs text-slate-500 font-bold uppercase">Current Role</label><input type="text" placeholder="e.g. Software Engineer" value={tempData.role || ''} onChange={e => setTempData({...tempData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                      <div><label className="text-xs text-slate-500 font-bold uppercase">Location</label><input type="text" placeholder="e.g. Bengaluru, India" value={tempData.location || ''} onChange={e => setTempData({...tempData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
                      <div><label className="text-xs text-slate-500 font-bold uppercase">Phone Number</label><input type="tel" placeholder="+91" value={tempData.phone || ''} onChange={e => setTempData({...tempData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mt-1 text-sm text-white focus:border-fuchsia-500 outline-none" /></div>
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
                          {profile.name} 
                          <button onClick={() => { setEditing('basic'); setTempData({ name: profile.name, role: profile.role, location: profile.location, phone: profile.phone }); }} className="text-slate-500 hover:text-fuchsia-400 transition-colors">✏️</button>
                        </h1>
                        <p className="text-sm font-medium text-slate-400 mt-1">{profile.role || 'Add your current role'}</p>
                      </div>
                    </div>
                    <div className="w-full h-px bg-slate-700/50 my-5"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-300">
                      <div className="flex items-center gap-3"><span className="text-slate-500">📍</span> {profile.location || <span className="text-slate-600 italic">Location not added</span>}</div>
                      <div className="flex items-center gap-3"><span className="text-slate-500">📞</span> {profile.phone || <span className="text-slate-600 italic">Phone not added</span>}</div>
                      <div className="flex items-center gap-3"><span className="text-slate-500">✉️</span> {profile.email}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. RESUME HEADLINE */}
          <div id="resume-headline" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Resume headline</h2>
              {editing !== 'headline' && (
                <button onClick={() => { setEditing('headline'); setTempData({ resumeHeadline: profile.resumeHeadline }); }} className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors">
                  {profile.resumeHeadline ? 'Edit' : 'Add Headline'}
                </button>
              )}
            </div>

            {editing === 'headline' ? (
              <div className="space-y-4">
                <textarea 
                  rows={4} 
                  placeholder="e.g. Lead Consultant seeking roles in Test Management, Automation Framework..." 
                  value={tempData.resumeHeadline || ''} 
                  onChange={e => setTempData({...tempData, resumeHeadline: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-fuchsia-500 outline-none resize-none"
                ></textarea>
                <div className="flex gap-3">
                  <button onClick={() => handleSave('headline')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs py-2 px-6 rounded-lg transition-colors">Save</button>
                  <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-xs py-2 px-4 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <p className={`text-sm leading-relaxed ${profile.resumeHeadline ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                {profile.resumeHeadline || 'Add a summary of your experience and career goals to grab recruiter attention.'}
              </p>
            )}
          </div>

          {/* 3. KEY SKILLS */}
          <div id="key-skills" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Key skills</h2>
              {editing !== 'skills' && (
                <button onClick={() => { setEditing('skills'); setTempData({ keySkills: profile.keySkills }); }} className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors">
                  {profile.keySkills.length > 0 ? 'Edit' : 'Add Skills'}
                </button>
              )}
            </div>

            {editing === 'skills' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tempData.keySkills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-slate-900 border border-fuchsia-500/50 text-white text-xs font-medium rounded-full flex items-center gap-2">
                      {skill} <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Type a skill and press Enter" 
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={addSkill}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-fuchsia-500 outline-none"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleSave('skills')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs py-2 px-6 rounded-lg transition-colors">Save</button>
                  <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-xs py-2 px-4 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                {profile.keySkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.keySkills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium rounded-full cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 italic">No skills added yet. Add skills to get more relevant job recommendations.</p>
                )}
              </div>
            )}
          </div>

          {/* 4. EMPTY STATE TEMPLATE: EMPLOYMENT */}
          <div id="employment" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Employment</h2>
            </div>
            
            {profile.employment.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                <span className="text-4xl mb-3">💼</span>
                <p className="text-sm text-slate-400 mb-4">Add your employment history to highlight your professional journey.</p>
                <button className="text-fuchsia-400 font-bold text-sm border border-fuchsia-400/50 hover:bg-fuchsia-500/10 px-6 py-2 rounded-full transition-colors">
                  Add Employment
                </button>
              </div>
            ) : (
              <div>{/* Render saved employment records here */}</div>
            )}
          </div>

          {/* 5. EMPTY STATE TEMPLATE: EDUCATION */}
          <div id="education" className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Education</h2>
            </div>
            
            {profile.education.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                <span className="text-4xl mb-3">🎓</span>
                <p className="text-sm text-slate-400 mb-4">Add your educational background.</p>
                <button className="text-fuchsia-400 font-bold text-sm border border-fuchsia-400/50 hover:bg-fuchsia-500/10 px-6 py-2 rounded-full transition-colors">
                  Add Education
                </button>
              </div>
            ) : (
              <div>{/* Render saved education records here */}</div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}